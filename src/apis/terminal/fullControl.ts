import { internalInterupHandlerSIGINT, interrupReasonType } from "../../interrup.js";
import { logNode } from "../../log.js";
import { connectedToSpecificTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { ansiEscape, clearEntireBuffer, clearScrenDownCODE, cursorAbs } from "../../texttools.js";
import { clearConsole } from "../../tools/clearConsole.js";
import { consoleShortHand } from "../../tools/consoleShortHand.js";
import { listenersTable, logSystemError, streamWrapper, withWriteFunc } from "../../ultrabasic.js";




interface streams{

}

type parmsType = [streams];
type syncCodeSection<T> = (streams: streams) => T;
type asyncCodeSection<T> = (streams: streams) => Promise<T>;



interface streamToSetupTable{
    in: listenersTable<withWriteFunc>
    out: listenersTable<withWriteFunc>,
    fileout: listenersTable<withWriteFunc>
}

interface streamToSetupTableSaved{
    in: Readonly<listenersTable<withWriteFunc>>
    out: Readonly<listenersTable<withWriteFunc>>,
    fileout: Readonly<listenersTable<withWriteFunc>>
}

enum codeMatchWhat{
    ctrlc = "\u0003",
    escape = "\u001B",
    arrowUp = "\u001B[A",
    arrowDown = "\u001B[B",
    arrowRight = "\u001B[C",
    arrowLeft = "\u001B[D",

}


class fullControler extends connectedToSpecificTerminal{
    // store any data of listeners
    #lis: streamToSetupTableSaved = {in: [], out: [], fileout: []}; 
    #setLis: streamToSetupTable = {in: [], out: [], fileout: []};


    #startFlag: boolean = false;
    #wasEndedSomewhereElse: boolean = false;
    #dontCloseResolve: ((value: void | PromiseLike<void>) => void) | void = void 0;


    #consoleShortHand: void | consoleShortHand = void 0;


    #expectedRawMode: boolean | null = null;
    #rawModeTemp: boolean | void = false;

    constructor(
        session: getTerminalOPJTYPE
    ){
        super(session);
    }


    get stillExecuting(){
        return this.#startFlag;
    }



    waitForOthersCleanUp(): Promise<void>{
        return new Promise((resolve) => {
            setImmediate(resolve);
        })
    }

    rawMode(to?: boolean | null): boolean | null{
        if(this.#startFlag){
            if(to !== this.#expectedRawMode && to != null){
                const s = this.session;

                s.in.rawMode(to);
            }
        }

        if(to !== undefined){
            this.#expectedRawMode = to;
        }

        


        return this.#expectedRawMode;

    }

    dontClose(): Promise<void>{
        return new Promise(
            (resolve, reject) => {
                this.#dontCloseResolve = resolve;
            }
        );
    }

    #handleResolves(){
        if(this.#dontCloseResolve){
            this.#dontCloseResolve();
        }

        this.#dontCloseResolve = void 0;
    }

    codeMatch(text: string | Buffer, what: codeMatchWhat, exact: boolean = false){
        // switch(what){
        //     case codeMatchWhat.ctrlc:
        //         return exact ? text === '\u0003' : text.includes(`\u0003`);
        //     case codeMatchWhat.escape:
        //         return exact ? text === '\u001B' : text.includes("\u001B");
        //     case codeMatchWhat.arrowUp:
        //         return exact ? text === '\u001B[A' : text.includes('\u001B[A');
        //     case codeMatchWhat.arrowDown:
        //         return exact ? text === '\u001B[B' : text.includes('\u001B[B');
        //     case codeMatchWhat.arrowRight:
        //         return exact ? text === '\u001B[C' : text.includes('\u001B[C');
        //     case codeMatchWhat.arrowLeft:
        //         return exact ? text === '\u001B[D' : text.includes('\u001B[D');
        // }


        if(exact){
            return text === what;
        }
        else{
            return text.includes(what);
        }
    }


    ctrlC(author: logNode | string = "fullControler"){
        const ses = this.session;

        this.#after();

        internalInterupHandlerSIGINT({
            session: ses,
            sessionName: ses.sessionName,
            reason: interrupReasonType.ctrlc,
            author: author,
            forceDefault: false
        });
    }


    addListener(
        type: 'in' | 'out' | 'fileout' | 'internal',
        name: string,
        func: CallableFunction
    ){
        
        if(['in', 'out', 'fileout'].includes(type)){
            this.#setLis[type as 'in' | 'out' | 'fileout'].push(
                // i'll deal with types later
                // @ts-expect-error
                [name, func]
            );

            if(this.#startFlag){
                const ses = this.session;

                // @ts-expect-error
                ses[type as 'in' | 'out' | 'fileout'].addListener(name, func);
            }
        }
    }


    removeListener(
        type: 'in' | 'out' | 'fileout' | 'internal',
        name: string,
        func: CallableFunction
    ){
        if(['in', 'out', 'fileout'].includes(type)){
            this.#setLis[type as 'in' | 'out' | 'fileout'].filter(
                (d) => {
                    return d[0] !== name && d[1] !== func;
                }
            )

            if(this.#startFlag){
                const ses = this.session;

                // @ts-expect-error
                ses[type as 'in' | 'out' | 'fileout'].removeListener(name, func);
            }

        }
    }

    #setupInterrupts(ses: terminalSession){
        ses.out.addListenersFromSavedList(this.#setLis.out);
        // @ts-expect-error
        ses.in.addListenersFromSavedList(this.#setLis.in);
        ses.fileout.addListenersFromSavedList(this.#setLis.fileout);

    }

    #removeListenersAndSaveThem(ses: terminalSession){
        this.#lis.out = ses.out.getAttachedListenersFromWrapper();
        ses.out.removeAllListeners();

        this.#lis.in = ses.in.getAttachedListenersFromWrapper();
        ses.in.removeAllListeners();

        this.#lis.fileout = ses.fileout.getAttachedListenersFromWrapper();
        ses.fileout.removeAllListeners();
    }

    #restoreListeners(ses: terminalSession){
        ses.out.setListenersFromSavedList(this.#lis.out);
        this.#lis.out = [];

        // @ts-expect-error
        ses.in.setListenersFromSavedList(this.#lis.in);
        this.#lis.in = [];

        ses.in.getStream()?.resume();

        ses.fileout.setListenersFromSavedList(this.#lis.fileout);
        this.#lis.fileout = [];
    }

    #prepare(){
        if(this.#startFlag) return;

        this.#startFlag = true;

        const ses = this.session;

        this.#removeListenersAndSaveThem(ses);
        this.#setupInterrupts(ses);


        this.#rawModeTemp = ses.in.rawMode() as boolean;

        if(this.#expectedRawMode !== null){
            ses.in.rawMode(this.#expectedRawMode);
        }
    }

    #after(){
        if(!this.#startFlag) return;

        this.#startFlag = false;

        // this.repairInput();

        const ses = this.session;

        this.#restoreListeners(ses);

        if(this.alternateScreenStatus()){
            this.alternateScreenExit();
        }

        this.#handleResolves();

        if(this.#rawModeTemp !== void 0){
            ses.in.rawMode(this.#rawModeTemp);
            this.#rawModeTemp = void 0;
        }
    }

    #prepareParms(): parmsType{
        return [] as any as parmsType;
    }

    code<T>(
        codeFunc: syncCodeSection<T>
    ): T{
        let ret: void | T =  void 0;

        this.#prepare();

        try {
            codeFunc(...this.#prepareParms());
        } catch (error) {
            this.#after();
            throw error;
        }

        this.#after();

        return ret as T;
    }

    async codeAsync<T>(
        codeFunc: asyncCodeSection<T>
    ): Promise<T>{
        let ret: void | T =  void 0;

        this.#prepare();

        try {
            ret = await codeFunc(...this.#prepareParms());
        } catch (error) {
            this.#after();
            throw error;
        }

        this.#after();

        return ret as T;
    }


    start(){
        if(this.#startFlag){
            throw new SyntaxError("You can't prepare a control without it being taken away");
        }

        this.#prepare();
    }

    end(){
        if(!this.#startFlag){
            throw new SyntaxError("You can't take away control without it being given");
        }

        this.#after();
    }


    alternateScreen(){
        const ses = this.session;

        if(ses.out.alternateBuffer(undefined)){
            throw new Error("Alternate buffer was already intiated");
        }

        ses.out.alternateBuffer(true);
    }

    alternateScreenExit(){
        const ses = this.session;

        if(!ses.out.alternateBuffer(undefined)){
            throw new Error("Alternate buffer was not already intiated");
        }

        ses.out.alternateBuffer(false);
    }

    alternateScreenStatus(): boolean{
        const ses = this.session;

        return ses.out.alternateBuffer(undefined);
    }


    codeAlt<T>(
        codeFunc: syncCodeSection<T>
    ): T{
        let ret: T | void = void 0;

        this.#prepare();
        this.alternateScreen();

        try {
            ret = codeFunc(...this.#prepareParms());
        } catch (error) {
            this.#after();
            throw error;
        }

        if(this.alternateScreenStatus()) this.alternateScreenExit();
        this.#after();

        return ret as T;
    }

    async codeAsyncAlt<T>(
        codeFunc: asyncCodeSection<T>
    ): Promise<T>{
        let ret: T | void = void 0;

        this.#prepare();
        this.alternateScreen();

        try {
            ret = await codeFunc(...this.#prepareParms());
        } catch (error) {
            this.#after();
            throw error;
        }

        if(this.alternateScreenStatus()) this.alternateScreenExit();
        this.#after();

        return ret as T;
    }




    get consoleShortHand(): consoleShortHand{
        if(!this.#consoleShortHand || !this.#consoleShortHand.valid){
            this.#consoleShortHand = new consoleShortHand(this.session);
        }

        return this.#consoleShortHand;
    }


    clearScreen(clearBuf: boolean = true){
        return clearConsole(this.sessionName, clearBuf);
    }


    repairInput(){
        const ses = this.session;

        const stream = ses.in.getStream();

        if(stream){
            stream.destroy();
        }

    }
    
}


function askForFullControl(terminalLike: getTerminalOPJTYPE): fullControler{
    const ses = getTerminalOPJ(terminalLike);

    if(!ses){
        throw new logSystemError("It was not possible to get that terminal session!");
    }


    const ctron = new fullControler(ses);


    return ctron;
}

export {fullControler, askForFullControl, codeMatchWhat}