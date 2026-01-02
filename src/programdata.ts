import { createWriteStream, existsSync, writeFileSync } from "fs";
import { Writable } from "stream";
import { logSystemError, pseudoStreamWriteAble, streamWrapper, withWriteFunc } from "./ultrabasic.js";
import { configData, configDataProvide, constructConfig, logsReceiveType } from "./config.js";
import { inspect, InspectOptions, InspectOptionsStylized } from "util";
import { consoleColors } from "./texttools.js";
import type { commandContext } from "./apis/commands/types.js";
import type { terminalApi } from "./apis/terminal/terminalApi.js";

// let commandHistory: string[] = []; // user command history history
// let indexCommandHistory: null | number = null; // the index of current selected
const logSystemVer: string = "1.31"; // current version of the log system
const currentUpTime = Date.now(); // uptime start date
// let currentGroupString: string = ""; // the current string for groups to make it run faster (you can name it cache, i guess?)
// let logGroups: string[] = []; // groups for console.group()
// const timers: Record<string, number> = {}; // the list of timers used with console.time()

/**
 * returns the current version of log system
 * 
 * example:
 * 
 * let w = getCurrentVersionOfLogSystem("string");
 * 
 * @param as string or number 
 * @returns log system version in type depending of selected
 */
function getCurrentVersionOfLogSystem(as: "string", session: getTerminalOPJTYPE): string;
function getCurrentVersionOfLogSystem(as: "number", session: getTerminalOPJTYPE): number;

function getCurrentVersionOfLogSystem(as: "number" | "string" = "string", session: getTerminalOPJTYPE = "main"): string | number {
    const s = getTerminalOPJ(session);

    const v = s.config.logSystemVersion ? s.config.logSystemVersion : logSystemVer;

    if(as === "string") return String(v);
    else if(as === "number") return Number(v);
    else return -1;
}

// let viewTextBox: boolean = config.viewTextBox; // whether text box is visible
// let blockLogsVar: boolean = config.blockLogsVar;

interface bindDetail{
    name: string,
    command: string,
    executor: string
}


type bindData = Record<string, bindDetail>;

/**
 * a structure containing all session information
 */
interface terminalSession{
    /**
     * the name of the session that is used to recall the session
     */
    sessionName: string,

    /**
     * a link to config data consisting of static config that was used to create specific session.
     * 
     * Config is not guranteed to be unique to a single session
     */
    config: configData,

    /**
     * a timestamp on which that session was started
     */
    uptime: number,

    /**
     * text currently stored in inputbox
     */
    text: string,
    
    /**
     * history of sent commands on the session
     */
    commandHistory: string[],

    /**
     * an index used to retrieving the specific entry in the command history
     */
    indexCommandHistory: number | null,

    /**
     * input writting offset
     */
    relativeTextboxPos: number,

    /**
     * whether the inputbox is expected to be rendered. It's recommended to use an api or a tool instead of changing it manually!
     */
    viewTextbox: boolean,


    /**
     * the current pre-calculated group string (a kind of cache)
     */
    currentGroupString: string,

    /**
     * list of log groups created
     */
    logGroups: string[],

    /**
     * internal session timers
     */
    timers: Record<string, number>,
    /**
     * internal session counters
     */
    counterTable: Record<string, number>,

    /**
     * a link to streamWrapper intented to serve as stdout
     */
    out: streamWrapper<withWriteFunc | undefined>,

    /**
     * a table of user binds
     */
    bindTable: bindData,

    /**
     * a link to streamWrapper intented to serve as stdin
     */
    in: streamWrapper<typeof process.stdin | undefined>,

    /**
     * a link to streamWrapper intented to serve as stdout::file
     */
    fileout: streamWrapper<withWriteFunc | undefined>,

    /**
     * DOESNT WORK PROPERLY YET. MAY BE REMOVED IN THE FUTURE
     */
    logsReceive: logsReceiveType,


    /**
     * process that is used as a main process of that session
     */
    procLinked?: typeof process,


    /**
     * current working directory
     */
    cwd: string,



    /**
     * an internal link to previous in function (don't relay on setting it manually there)
     */
    inHandlerFuncPrev?: Function,

    /**
     * internal flags changing the behaviour of the terminal. Flags should not be a complicated objects and are mostly used internally. Use environment for more advanced stuff as it has a lot better api
     */
    flags: Record<string, any>,

    /**
     * a cache of the terminal that is managed by itself. It should not been managed manually. You can use apis to add (-set) stuff to cache, but you should never remove something from it.
     */
    cache: Record<string, any>,

    /**
     * environment serving the same role as a default system environment variable table
     */
    env: Record<string | number | symbol, any>,
    
    [Symbol.toStringTag]: () => string;
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string;
//    (): string;
}

interface terminalCreateData{

    /**
     * stdout::file
     */
    fileout?: Writable | streamWrapper<Writable | typeof process.stdout> | null,

    /**
     * stdout
     */
    out?: Writable | streamWrapper<Writable | typeof process.stdout> | null,

    /**
     * stdin
     */
    in?: typeof process.stdin | streamWrapper<typeof process.stdin> | null,

    /**
     * detailed config data
     */
    config?: configDataProvide,
    /**
     * the main process of the session. Defaults to node js process
     */
    process?: typeof process | null,


    /**
     * NOTE IT DOESNT WORK IN LOW LEVEL APIS. IT WORKS ONLY IN THE MIDDLE AND HIGHER ONES!
     */
    setupProcessInterrups?: boolean,
    /**
     * NOTE IT DOESNT WORK IN LOW LEVEL APIS. IT WORKS ONLY IN THE MIDDLE AND HIGHER ONES!
     */
    chwdToSelectedCwd?: boolean,

    /**
     * whether the object should skip fixing the config and filling out gaps
     */
    trustConfig?: boolean   
}

/**
 * ULTRA LOW LEVEL API
 * 
 * LOW LEVEL: createNewTerminal
 * MIDDLE LEVEL: createNewTerminalQuick
 * HIGH LEVEL: terminalApi
 * 
 * It only creates internal data for terminal. It doesn't even save it. Don't use it please. It's only useful for internal use and certain very low level commands.
 * 
 * I expose that, to not limit users.
 * 
 * @param name terminal name
 * @param data data
 * @returns 
 */
function createNewTerminalData(
    name: string,
    data: terminalCreateData
): terminalSession{
    // create config (or just get that config if you trust it :p)
    const config = data.trustConfig ? data.config as configData : constructConfig(data.config);

    // determine what process will be the main one
    const procToUse = data.process ? data.process : process;

    // get all wrappers
    let dout: void | streamWrapper<any> = void 0;
    let din: void | streamWrapper<any> = void 0;
    let dfileout: void | streamWrapper<any> = void 0;

    let stf: boolean = data.out !== null;

    if(data.out === null){
        dout = new streamWrapper();
    }
    else if(!data.out){
        dout = new streamWrapper<Writable>(procToUse.stdout);
    }
    else if(data.out instanceof streamWrapper){
        // nothing so far
        dout = data.out;
    }
    else{
        dout = new streamWrapper<Writable>(data.out);
    }

    if(data.fileout === null){
        dfileout = new streamWrapper();
    }
    else if(!data.fileout){
        // ensure that latest log is existent

        dfileout = new streamWrapper(
            createWriteStream(config.$cache$latestLogPath, {flags: "a"})
        );
    }
    else if(data.fileout instanceof streamWrapper){
        // nothing so far
        dfileout = data.fileout;
    }
    else{
        dfileout = new streamWrapper<Writable>(data.fileout);
    }

    // console.log(data.fileout, dout);

    if(data.in === null){
        din = new streamWrapper();
    }
    else if(!data.in){
        din = new streamWrapper(procToUse.stdin);
    }
    else if(data.in instanceof streamWrapper){
        // nothing so far
        din = data.in;
    }
    else{
        din = new streamWrapper(data.in);
    }


    // if(!data.in){
    //     data.in = new streamWrapper<typeof process.stdin>(procToUse.stdin);
    // }


    // if(!data.fileout) data.fileout = new streamWrapper();
    // if(!data.out) data.out = new pseudoStreamWriteAble();
    // @ts-ignore
    // if(!data.in) data.in = new pseudoStreamWriteAble();
    if(!data.in){
        if(procToUse){
            data.in = new streamWrapper(procToUse.stdin);
        }
    }
  
    // create data
    const d = {
        sessionName: name,
        config: config,

        text: "",
        commandHistory: [],
        indexCommandHistory: 0,
        relativeTextboxPos: 0,


        logSystemVer,
        currentUpTime,
        currentGroupString: "",
        logGroups: [],
        timers: {},
        out: dout as streamWrapper<withWriteFunc | undefined>,
        in: din as streamWrapper<typeof process.stdin | undefined>,
        fileout: dfileout as streamWrapper<withWriteFunc | undefined>,
        viewTextbox: config.viewTextBoxStart,
        logsReceive: config.logsReceiveStart,
        counterTable: {},
        procLinked: procToUse,

        bindTable: {},

        cwd: config.workingDirectory,
        uptime: Date.now(),


        inHandlerFuncPrev: undefined,

        flags: {stf},
        
        env: config.addProcessEnvToSessionEnv ? {...process.env} : {},

        cache: {},

        [Symbol.toStringTag](){
            return this.sessionName;
        },
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string){
            if(options.colors){
                return `${consoleColors.FgGray}terminalSession${consoleColors.Reset}(${consoleColors.FgCyan}${name}${consoleColors.Reset})`;
            }
            return `terminalSession(${name})`;
        }
    };

    return d;
}

/**
 * LOW LEVEL
 * 
 * MIDDLE LEVEL: createNewTerminalQuick
 * HIGH LEVEL: terminalApi
 * 
 * It creates a new terminal. It almost only a plain object 
 * 
 * It's recommended to use at least middle api!
 * 
 * Use it only if you're certain about what you're doing
 * 
 * 
 * @param name name
 * @param data data
 * @returns session or undefined
 */
function createNewTerminal(name: string, data: terminalCreateData = {}): undefined | terminalSession{
    const dataT = createNewTerminalData(name, data);
    saveterminalSessionObj(name, dataT);

    const t = getTerminal(name);

    if(!t) return undefined;

    return t;
}

const terminalSessionObjSaved: Record<string, terminalSession> = {};

/**
 * ULTRA LOW LEVEL APi
 * 
 * it saves forcefully the session after given name
 * 
 * @param name the name
 * @param data the session
 */
function saveterminalSessionObj(name: string, data: terminalSession){
    terminalSessionObjSaved[name] = data;
}

/**
 * LOW LEVEL API
 * 
 * IT IS SAFE TO USE THAT LOW LEVEL API THO!
 * 
 * tries to get a session from the name
 * @param name the name
 * @returns session of undefined
 */
function getTerminal(name: string): terminalSession | undefined{
    return terminalSessionObjSaved[name];
}

type getTerminalOPJTYPE = string | terminalSession | commandContext | terminalApi;

/**
 * 
 * checks whether a value may qualify to be used in getTerminalOPJ()
 * 
 * @param val value
 * @returns info
 */
function isGetTerminalOPJTYPE(val: any): val is getTerminalOPJTYPE{
    // console.log(typeof val);

    if(typeof val === "string") return true;
    if(typeof val === "object"){
        if((
            val.sessionName && typeof val.sessionName === "string"
        ) || (
            val.terminalName && typeof val.terminalName === "string"
        ) || (
            val._terminalSession && val._terminalSession.sessionName &&
            typeof val._terminalSession.sessionName === "string"
        )) return true;

        const s = val.session;
        if(!s) return false;
        if(s.sessionName && typeof s.sessionName === "string") return true;
    }

    return false;
}

/**
 * LOW LEVEL API
 * 
 * Tries to get a terminal session from provided object
 * 
 * it assumes that you know for sure that it has it
 * 
 * It can be used with: terminalApi, consoleShortHand, commandContext, string, session 
 * 
 * 
 * @param d object
 * @returns terminalSession
 */
function getTerminalOPJ(d: getTerminalOPJTYPE): terminalSession{
    // return typeof d === "string" ? getTerminal(d) as terminalSession : d;

    if(typeof d === "string") return getTerminal(d) as terminalSession;
    if("_terminalSession" in d) return d._terminalSession;
    if("terminalName" in d && typeof d.terminalName == "string") 
        return getTerminal(d.terminalName) as terminalSession;
    if("type" in d) return d.session;


    return d;

}

/**
 * LOW LEVEL API
 * 
 * It's recommended to use middle level api instead! (removeTerminalQuick)
 * 
 * It will not handle saving the latest file and more!
 * 
 * @param name the name of a terminal
 * @param causeError if it should cause error if there was no terminal. It defaults to true
 * @returns if it was successful
 */
function removeTerminal(name: string, causeError: boolean = true): boolean{
    if(!Object.hasOwn(terminalSessionObjSaved, name)){
        if(causeError){
            throw new logSystemError(`Terminal with the name '${name}' doesn't exist!`);
        }

        return false;
    }


    delete terminalSessionObjSaved[name];

    return true;
}

// /**
//  * function to use to block incoming logs
//  * @param status allows you to block incoming logs. Defaults to undefined, which does nothing
//  * @returns current status
//  */
// function blockLogs(status?: boolean, sessionName: string = "main"): boolean{
//     const data = getTerminal(sessionName);

//     if(!data){
//         throw new logSystemError("no terminal with that name: " + sessionName);
//     }
    
//     if(typeof status === "boolean") data.blockLogsVar = status;

//     return data.blockLogsVar;
// }


class connectedToSpecificTerminal{
    #sessionName: string;
    #valid: boolean;
    constructor(from: getTerminalOPJTYPE){
        try {
            const s = this.#tryToGetASessionFromThat(from);

            this.#sessionName = s.sessionName;
            this.#valid = true;
        } catch (error) {
            this.#sessionName = "";
            this.#valid = false;
        }
    }

    #tryToGetASessionFromThat(from: getTerminalOPJTYPE): terminalSession{
        const s = getTerminalOPJ(from);

        if(!s){
            throw new logSystemError("It was impossible to recover a session from provided type!");
        }

        return s;
    }

    invalidSession(){
        this.#valid = false;
    }

    set sessionName(val: string){
        const s = getTerminal(val);
        this.#valid = !!s;
        this.#sessionName = val;
    }

    get sessionName(){
        return this.#sessionName;
    }

    get session(): terminalSession{

        const s = getTerminal(this.#sessionName);

        if(!s){
            throw new logSystemError(`The terminal of the name '${this.#sessionName}' couldn't be received!`);
        }

        return s;
    }

    set session(from: getTerminalOPJTYPE | undefined){
        if(!from){
            this.#sessionName = "";
            this.#valid = false;

            return;
        }

        if(!isGetTerminalOPJTYPE(from)){
            throw new TypeError("It is not a compatible type like a string, sessionData, commandContext or terminalApi.");
            return;
        }

        try {
            const s = this.#tryToGetASessionFromThat(from);

            if(!s || !s.sessionName || typeof s.sessionName !== "string"){
                throw new logSystemError("There was an issue with getting a session info. It is an internal error and should not happen");
                return;
            }
            
            this.#sessionName = s.sessionName;
            this.#valid = true;
        } catch (error) {
            this.#sessionName = "";
            this.#valid = false;
        }
    }

    get valid(): boolean{
        if(!this.#valid){
            return false;
        }

        const s = getTerminal(this.#sessionName);

        if(!s) return false;
        return true;
    }
}


export {getTerminal, saveterminalSessionObj, createNewTerminal, removeTerminal, getTerminalOPJ, terminalSessionObjSaved, connectedToSpecificTerminal, getCurrentVersionOfLogSystem}
export type {terminalSession, getTerminalOPJTYPE, bindData, terminalCreateData}