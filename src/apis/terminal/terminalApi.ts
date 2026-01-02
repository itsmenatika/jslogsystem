import { join } from "path";
import { inHandler, setupInHandlerListener } from "../../in.js";
import { log, LogType } from "../../log.js";
import { connectedToSpecificTerminal, createNewTerminal, getTerminal, getTerminalOPJ, getTerminalOPJTYPE, removeTerminal, terminalCreateData, terminalSession, terminalSessionObjSaved } from "../../programdata.js";
import { clearEntireBuffer, clearScrenDownCODE, cursorAbs } from "../../texttools.js";
import { welcome } from "../../tools/welcome.js";
import { logSystemError } from "../../ultrabasic.js";
import { commandInternalExec } from "../commands/commandExecute.js";
import { commandExecParamsProvide } from "../commands/common.js";
import { printTextBox } from "../../formatingSessionDependent.js";
import { consoleWrite } from "../../out.js";
import { cache } from "./cache.js";
import { configData } from "../../config.js";


interface forkOptionsProvide{
    inheritStreams?: boolean,
    inheritOutHistory?: boolean
}

type forkOptions = Required<forkOptionsProvide>;

const default_forkOptions: forkOptions = {
    inheritStreams: false,
    inheritOutHistory: true
}

/**
 * High-Level api for managing terminal and terminal sessions
 */
class terminalApi extends connectedToSpecificTerminal{
    type: Readonly<string> = "terminalApi";

    /**
     * 
     * @param from some way of getting a terminal session
     */
    constructor(from: getTerminalOPJTYPE){
        super(from);
        // // try to get that session
        // try {
        //     const term = getTerminalOPJ(from);

        //     this.terminalName = term.terminalName;

        //     this.valid = true;
        // // otherwise just mark it as an invalid api
        // } catch (error) {
        //     this.terminalName = "";
        //     this.valid = false;
        // }
    }

    /**
     * allows you to execute a command
     * @param text the command
     * @param options command execution options
     * 
     * @returns the last result of that command
     */
    exec(
        text: string, 
        options: Omit<commandExecParamsProvide, "terminal">
    ){
        return commandInternalExec(text, {
            terminal: this.sessionName,
            ...options
        });
    }

    // /**
    //  * checks whether the terminal was properly connected to a session
    //  * 
    //  * @params updateValidity whether to try to connect to a session again (Check it if you suspect that something another could delete a session)
    //  * 
    //  * @returns vadility
    //  */
    // isValid(updateValidity: boolean = false): Readonly<boolean>{
    //     if(updateValidity){
    //         this.updateValidity()
    //     }

    //     return this.valid;
    // }

    // /**
    //  * 
    //  * try to get a session again
    //  * 
    //  * @returns the new validity
    //  */
    // updateValidity(): Readonly<boolean>{
    //     try {
    //         this.getSession();
    //         this.valid = true;
    //     } catch (error) {
    //         this.valid = false;
    //     }

    //     return this.valid;
    // }

    // /**
    //  * returns a session object
    //  * @returns the session
    //  */
    // getSession(): terminalSession{
    //     const term = getTerminal(this.terminalName);

    //     if(!term){
    //         throw new logSystemError(`Terminal of the name '${this.terminalName}' doesnt exist anymore or can't be accessed!`);
    //     }

    //     return term;
    // }

    
    /**
     * returns a command history data
     * @returns data
     */
    commandHistory(): Readonly<string[]>{
        return this.session.commandHistory;
    }

    /**
     * returns the time when the session was started.
     * @returns that time
     */
    uptime(): Readonly<number>{
        return this.session.uptime;
    }

    /**
     * manages the user textbox
     * @param to the new text. Leave it undefined if you don't want to change it
     * @returns the current text
     */
    text(to?: string): Readonly<string>{
        if(to !== undefined){
            this.session.text = to;
        }

        return this.session.text;
    }

    /**
     * gets the out stream history (sesdat.out.getHistory())
     * @returns 
     */
    outStreamHistory(): Readonly<any[]>{
        return this.session.out.getHistory();
    }
    

    /**
     * allows you to quickly change the streams with each other
     * 
     * fileout streams will be left unchanged.
     * 
     * allows you to defacto switch the terminal that is displayed on the screen
     * 
     * @param another the another terminalApi
     */
    switchStreamsWith(another: terminalApi){
        // get both sessions
        const termAnother = another.session;
        const termMy = this.session;

        // get the streams
        const streamOrginal = termMy.out.getStream();
        const streamAnother = termAnother.out.getStream();

        const streamOrginalIn = termMy.in.getStream();
        const streamAnotherIn = termAnother.in.getStream();

        // set streams 
        termMy.out.setStream(streamAnother);
        termAnother.out.setStream(streamOrginal);

        termMy.in.setStream(streamAnotherIn);
        termAnother.in.setStream(streamOrginalIn);      

        // fix in streams on sessions
        let _t;
        _t = termMy.in.getStream();
        if(_t){
            // @ts-ignore
            termMy.in.removeAllListeners();

            // termMy.in.addListener("data", (data) => inHandler(data, termMy));
            setupInHandlerListener(termMy);
        }

        _t = termAnother.in.getStream();
        if(_t){
            // @ts-ignore
            termAnother.in.removeAllListeners();

            setupInHandlerListener(termAnother);
            // termAnother.in.addListener("data", (data) => inHandler(data, termAnother));
        }

        // rewrite a history on new different streams
        let _tt;
        _tt = termMy.out.getStream();
        if(_tt){
            _tt.write(
                clearEntireBuffer +
                cursorAbs(0,0)
                +
                clearScrenDownCODE
            );
            // console.log('meow');
            termMy.out.rewrite();
            log(LogType.SUCCESS, `${this.sessionName} was switched with ${another.sessionName}!`, "console."+this.sessionName, termMy);
        }        


        _tt = termAnother.out.getStream();
        if(_tt){
            _tt.write(
                clearEntireBuffer +
                cursorAbs(0,0)
                +
                clearScrenDownCODE
            );
            // console.log('meow2');
            termAnother.out.rewrite();
            log(LogType.SUCCESS, `${this.sessionName} was switched with ${another.sessionName}!`, "console."+this.sessionName, termAnother);
        }      

        


        // console.log('1', termMy.out.getStream());
        // console.log('2', termAnother.out.getStream());

            // [
            //     termAnother.out, termAnother.in, termAnother.fileout,
            //     termMy.out, termMy.in, termMy.fileout,
            // ]
            // =
            // [
            //     termMy.out, termMy.in, termMy.fileout,
            //     termAnother.out, termAnother.in, termAnother.fileout
            // ];
            
            // [
            //     termMy.in.session,
            //     termAnother.in.session
            // ] 
            // =
            // [
            //     termAnother.in.session,
            //     termMy.in.session
            // ];


            // if(termMy.in){
            //     // @ts-ignore
            //     termMy.in.removeAllListeners();
            // }

            // if(termAnother.in){
            //     // @ts-ignore
            //     termAnother.in.removeAllListeners();

            //     termAnother.in.addListener("data", (data) => inHandler(data, termAnother));
            // }


            // if(termAnother.out){
            //     termAnother
            // }


            // if(termMy.in){
            //     // typescript...
            //     // @ts-ignore
            //     termMy.in.removeAllListeners();

            //     termMy.in.addListener("data", (data) => inHandler(data, termMy));
                
            // }

            // if(termAnother.in){
            //     // typescript...
            //     // @ts-ignore
            //     termAnother.in.removeAllListeners();

            //     termAnother.in.addListener("data", (data) => inHandler(data, termAnother));
            // }     
            
            // const s = termMy.out.getStream();
            // if(s){
            //     s.write(
            //         cursorAbs(0,0)
            //         +
            //         clearScrenDownCODE
            //     );
            // }
            // termMy.out.rewrite();
            // console.log(termMy.out.getHistory());


    }

    /**
     * allows you to return all terminal names
     * @returns the all terminal names
     */
    terminalNamesList(): Readonly<string[]>{
        return terminalApi.terminalNamesList();
    }

    /**
     * allows you to return all terminal names
     * @returns the all terminal names
     */
    static terminalNamesList(): Readonly<string[]>{
        return Object.freeze(Object.keys(terminalSessionObjSaved));
    }


    /**
     * allows you to fork the current terminal
     * @param name the new name of that terminal
     * @param inheritStreams whether to inherit streams
     * @returns 
     */
    fork(name: string, options: forkOptionsProvide = {}){
        // create options
        const op = {...default_forkOptions};
        Object.assign(op, options);

        // get a current session
        const ses = this.session;

        // check whether that name is not claimed
        const termOfThatName = getTerminal(name);

        if(termOfThatName){
            throw new logSystemError("Terminal with that name already do exist!");
        }
        

        // create a new terminal Data
        // const newTermData: terminalSession = {...ses};

        // Object.assign(newTermData, {
        //     terminalName: name,
        // });

        // create a new terminal
        const sesN = createNewTerminal(name, {
            fileout: op.inheritStreams ? ses.fileout.getStream() : null,
            out: op.inheritStreams ? ses.out.getStream() : null,
            // @ts-ignore
            in: op.inheritStreams ? ses.in.getStream() : null,
            config: ses.config,
            process: ses.procLinked

        });

        // rewrite the history
        if(op.inheritOutHistory){
            getTerminal(name)?.out.setHistory(
                ses.out.getHistory(true)
            );
        }
            // const toRet = getTerminal(name);

        // return the terminal api with that terminal
        return new terminalApi(name);
    }

    /**
     * 
     * HIGH LEVEL
     * 
     * 
     * it is designed to create additional sessions and not the main one.
     * 
     * YOU MAY BE LOOKING FOR: QuickSetup (recommended) or mid level createTerminalQuick() function
     * those functions are not as tedious as that one in setting up the starting point
     * 
     * but you can still do it that way. It's just more tedious as you need to specify streams manually
     * 
     * to setup main:
     *      set name to main
     *      set fileout, in, out in data to undefined
     *      leave setupListener to true
     * 
     * 
     * 
     * allows you to create a terminal data
     * 
     * it by default 
     * 
     * @param name the name of a new terminal
     * @param data the data of that terminal
     * @param hello whether to print a hello message
     * @param setupListener whether to automatically setup a listener on provided in
     * @returns 
     */
    static create(
        name: string,
        data: terminalCreateData = {}, 
        hello: boolean = true,
        setupListener: boolean = true
        ){
        // create a data
        const d = {
            in: null,
            fileout: null,
            out: null
        };

        Object.assign(d, data);

        // check whether there is a terminal with that name
        const s = getTerminal(name);
        if(s){
            throw new logSystemError(`terminal with the name '${name}' already do exist!`);
        }
        
        // create terminal
        const ses = createNewTerminal(
            name, d
        );

        // if that was not possible        
        if(!ses){
            throw new logSystemError("UNKOWN EXCEPTION. NO VALID SESSION COULD BE CREATED");
        }
        
        // send a hello message
        if(hello)
        welcome(ses);

        // setup listener
        if(ses.in.getStream() && setupListener){
            setupInHandlerListener(ses);
        }

        // return a terminalApi with that session
        return new terminalApi(ses);
    }


    /**
     * allows you to create a terminal data
     * @param name the name of a new terminal
     * @param data the data of that terminal
     * @param hello whether to print a hello message
     * @returns 
     */
    create(name: string, data: terminalCreateData = {}, hello: boolean = true){
        const api =  terminalApi.create(name, data, hello);

        // adding to global space
        if(api.config.useAddToGlobalAs){
            const toAdd: Record<string, any> = {};

            for(const name of api.config.addToGlobalAs){
                toAdd[name] = api;
            }

            Object.assign(globalThis, toAdd);
        }

        return api;
    }


    /**
     * destroy that terminal
     * @param causeError whether to cause an error in the case something went wrong
     * @returns whether the removal was successful
     */
    destroy(causeError: boolean = true){
        const res = removeTerminal(this.sessionName, causeError);

        this.session = undefined;

        return res;
    }


    cd(
        path?: string, 
        resync: boolean = false,
        priority: "PROC" | "SES" = "SES",
    ): Readonly<string>{
        const ses = this.session;

        let got = priority == "SES" ? ses.cwd : ses.procLinked?.cwd();

        if(!got){
            throw new logSystemError("Can't get an access to a cwd.");
        }

        let cur;
        if(path !== undefined){
            cur = join(got, path);
        }
        else{
            cur = got;
        }

        if(cur !== got || resync){
            ses.cwd = cur;
            ses.procLinked?.chdir(cur);
        }


        if(ses.viewTextbox){
            printTextBox(ses);
        }

        return cur;
    }

    write(data: string){
        const ses = this.session;

        consoleWrite(data, undefined, undefined, undefined, ses);
    }

    get config(): Readonly<configData>{
        const ses = this.session;
        return ses.config;
    }

    set config(val: configData){
        if(
            !val ||
            typeof val !== "object"
        ){
            throw new TypeError("It is not a config");
        }

        const ses = this.session;

        ses.config = Object.freeze(val);

    }


    /**
     * allows you to ensure the existence of in handlers
     * 
     * NOTE: all other handlers will be removed from in handlers
     * 
     */
    calibrateFixHandlers(){
        const ses = this.session;

        // why typescript
        // @ts-ignore        
        ses.in.removeAllListeners();
        setupInHandlerListener(ses);
    }

}

/**
 * asks for the api
 * @param from from what data
 * @returns terminalApi
 */
function askForTerminalApi(from: getTerminalOPJTYPE){
    return new terminalApi(from);
}

export {askForTerminalApi, terminalApi}