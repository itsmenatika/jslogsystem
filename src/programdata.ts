import { createWriteStream } from "fs";
import { Writable } from "stream";
import { logSystemError, pseudoStreamWriteAble, streamWrapper, withWriteFunc } from "./ultrabasic.js";
import { configData, configDataProvide, constructConfig, logsReceiveType } from "./config.js";
import { inspect, InspectOptions, InspectOptionsStylized } from "util";
import { consoleColors } from "./texttools.js";
import type { commandContext } from "./apis/commands/types.js";
import type { terminalApi } from "./apis/terminal/terminalApi.js";

// let commandHistory: string[] = []; // user command history history
// let indexCommandHistory: null | number = null; // the index of current selected
const logSystemVer: string = "1.3"; // current version of the log system
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

    const v = s.logSystemVer ? s.logSystemVer : logSystemVer;

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

interface terminalSession{
    sessionName: string,
    config: configData,

    text: string,
    commandHistory: string[],
    indexCommandHistory: number | null,
    relativeTextboxPos: number,

    logSystemVer: string,
    currentUpTime: number,
    currentGroupString: string,
    logGroups: string[],
    timers: Record<string, number>,
    out: streamWrapper<withWriteFunc | undefined>,
    in: streamWrapper<typeof process.stdin | undefined>,
    fileout: streamWrapper<withWriteFunc | undefined>,
    viewTextbox: boolean,
    logsReceive: logsReceiveType,
    counterTable: Record<string, number>,
    procLinked?: typeof process,

    bindTable: bindData,

    cwd: string,

    uptime: number,


    inHandlerFuncPrev?: Function,

    flags: Record<string, any>,

    cache: Record<string, any>
    
    [Symbol.toStringTag]: () => string;
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string;
//    (): string;
}

interface terminalCreateData{
    fileout?: Writable | streamWrapper<Writable | typeof process.stdout> | null,
    out?: Writable | streamWrapper<Writable | typeof process.stdout> | null,
    in?: typeof process.stdin | streamWrapper<typeof process.stdin> | null,
    config?: configDataProvide,
    process?: typeof process | null
}

function createNewTerminalData(
    name: string,
    data: terminalCreateData
): terminalSession{
    const config = constructConfig(data.config);
    const procToUse = data.process ? data.process : process;

    let dout: void | streamWrapper<any> = void 0;
    let din: void | streamWrapper<any> = void 0;
    let dfileout: void | streamWrapper<any> = void 0;

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

        flags: {},

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

function createNewTerminal(name: string, data: terminalCreateData = {}){
    const dataT = createNewTerminalData(name, data);
    saveterminalSessionObj(name, dataT);
    return getTerminal(name);
}

const terminalSessionObjSaved: Record<string, terminalSession> = {};

function saveterminalSessionObj(name: string, data: terminalSession){
    terminalSessionObjSaved[name] = data;
}

function getTerminal(name: string): terminalSession | undefined{
    return terminalSessionObjSaved[name];
}

type getTerminalOPJTYPE = string | terminalSession | commandContext | terminalApi;

function isGetTerminalOPJTYPE(val: any): val is getTerminalOPJTYPE{
    console.log(typeof val);

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

function getTerminalOPJ(d: getTerminalOPJTYPE): terminalSession{
    // return typeof d === "string" ? getTerminal(d) as terminalSession : d;

    if(typeof d === "string") return getTerminal(d) as terminalSession;
    if("_terminalSession" in d) return d._terminalSession;
    if("terminalName" in d && typeof d.terminalName == "string") 
        return getTerminal(d.terminalName) as terminalSession;
    if("type" in d) return d.session;


    return d;

}

function removeTerminal(name: string, causeError: boolean = true): boolean{
    if(!Object.hasOwn(terminalSessionObjSaved, name)){
        if(causeError){
            throw new logSystemError(`Terminal with name '${name}' doesn't exist!`);
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
            throw new TypeError("It is not a compatible type like string, sessionData, commandContext or terminalApi.");
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