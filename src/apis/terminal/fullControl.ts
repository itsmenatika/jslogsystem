import { PassThrough } from "stream";
import { internalInterupHandlerSIGINT, interrupReasonType } from "../../interrup.js";
import { logNode } from "../../log.js";
import { connectedToSpecificTerminal, getTerminalOPJ, getTerminalOPJTYPE, mouseEventReportingType, mouseReportingFormat, mouseStackEntry, terminalSession } from "../../programdata.js";
import { ansiEscape, clearEntireBuffer, clearScrenDownCODE, cursorAbs } from "../../texttools.js";
import { clearConsole } from "../../tools/clearConsole.js";
import { consoleShortHand } from "../../tools/consoleShortHand.js";
import { listenersTable, logSystemError, streamWrapper, StreamWrapperProxyOut, withWriteFunc } from "../../ultrabasic.js";
import { screenWrite } from "../../out.js";
import { addEntryToStack, defaultMouseConfiguration, mouseStackPop, setMouseModeAccordingToTopOfTheStack } from "../commands/osApis/mouse.js";
import { setTimeout } from "timers";




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

interface internalListenersObjectFullControler{
    beforePrepare: Array<() => void>,
    beforeEnd: Array<() => void>,
    afterPrepare: Array<() => void>,
    afterEnd: Array<() => void>,
    error: Array<(error: any) => void>
}

type ListenerMap = {
    internal: keyof internalListenersObjectFullControler
    in: string
    out: string
    fileout: string
}


interface fullControlModeSettings{
    expectedRawMode?: boolean | null
    throwErrors?: boolean,

}

type fulControlModeSettingsDone = Required<fullControlModeSettings>;

/**
 * @highlevel
 * 
 * High level controller used to gain the full control over the terminal
 * 
 * Use it, especially if you need a full control over stdin or stdout
 */
class fullControler extends connectedToSpecificTerminal{
    // store any data of listeners
    #lis: streamToSetupTableSaved = {in: [], out: [], fileout: []}; 
    #setLis: streamToSetupTable = {in: [], out: [], fileout: []};
    #internalListeners: internalListenersObjectFullControler = {
        beforeEnd: [],
        beforePrepare: [],
        afterEnd: [],
        afterPrepare: [],
        error: []
    };


    #startFlag: boolean = false;
    #wasEndedSomewhereElse: boolean = false;
    #dontCloseResolve: ((value: void | PromiseLike<void>) => void) | void = void 0;


    #consoleShortHand: void | consoleShortHand = void 0;


    // #expectedRawMode: boolean | null = null;
    #rawModeTemp: boolean | void = false;


    #inListener: void | Array<[string, CallableFunction]> = void 0;
    #inListenerToList: Array<PassThrough> = [];
    #catchingSpecials: boolean = true;

    // #outListener: boolean = false;
    #outListenerToList: Array<StreamWrapperProxyOut> = [];

    // #fileoutListener: boolean = false;
    #fileoutListenerToList: Array<PassThrough> = [];

    #settings: fulControlModeSettingsDone;


    #stackMouse: undefined | mouseStackEntry = undefined;
    
    constructor(
        session: getTerminalOPJTYPE,
        settings: fullControlModeSettings = {}
    ){
        super(session);

        this.#settings = {
            expectedRawMode: null,
            throwErrors: true
        };

        Object.assign(this.#settings, settings);
    }


    /**
     * if it's still in execute mode
     */
    get stillExecuting(){
        return this.#startFlag;
    }

    giveTimeToOthers(): Promise<void> {
        return new Promise(resolve => {
            setImmediate(resolve);
        });
    }



    // /**
    //  * await for every cleanup
    //  **/
    // waitForOthersCleanUp(): Promise<void>{
    //     return new Promise((resolve) => {
    //         setImmediate(resolve);
    //     })
    // }

    /**
     * allows to set raw mode in the execution mode
     * 
     * @param to new raw mode
     * @returns current raw mode
     */
    rawMode(to?: boolean | null): boolean | null{
        // if it's already executing, then change it
        if(this.#startFlag){
            if(to !== this.#settings.expectedRawMode && to != null){
                const s = this.session;

                s.in.rawMode(to);
            }
        }

        // change internal data
        if(to !== undefined){
            this.#settings.expectedRawMode = to;
        }

        // return current mode
        return this.#settings.expectedRawMode;

    }

    /**
     * 
     * dont close immediately
     * 
     * @returns A promise that will only resolve if there's nothing left (it has left an execution mode)
     */
    dontClose(): Promise<void>{
        return new Promise(
            (resolve, reject) => {
                this.#dontCloseResolve = resolve;
            }
        );
    }

    /**
     * it just handles resolves like dont close lol
     */
    #handleResolves(){
        if(this.#dontCloseResolve){
            this.#dontCloseResolve();
        }

        this.#dontCloseResolve = void 0;
    }

    /**
     * 
     * allows to quickly match data
     * 
     * @param text from
     * @param what by
     * @param exact if exact
     * @returns 
     */
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

    /**
     * 
     * allows to quickly match data
     * 
     * @param text from
     * @param what by
     * @param exact if exact
     * @returns 
     */
    static codeMatch(text: string | Buffer, what: codeMatchWhat, exact: boolean = false){
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

    /**
     * 
     * allerts internalInterupHandlerSIGINT that normally activates when user clicks ctrlC
     * 
     * @param author the author of this
     */
    ctrlC(author: logNode | string = "fullControler", dontAfter: boolean = false){
        const ses = this.session;

        if(!dontAfter) this.#after();

        internalInterupHandlerSIGINT({
            session: ses,
            sessionName: ses.sessionName,
            reason: interrupReasonType.ctrlc,
            author: author,
            forceDefault: false
        });
    }


    /** 
     * adds a listener that activates during a full control mode
     * @param type type of listener: in | out | fileout | internal
     * @param name 
     * @param func 
     */
    addListener<T extends keyof ListenerMap>(
        type: T,
        name: ListenerMap[T],
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

        else if(type === "internal"){
            if(!Object.hasOwn(this.#internalListeners, name)){
                throw new ReferenceError(`${name} is not a recognized internal listener`);
            }

             const internalName = name as keyof internalListenersObjectFullControler;

            // TODO: fix type error
            // @ts-expect-error
            this.#internalListeners[internalName].push(func);
        }
    }

    /** 
     * removes a listener that activates during a full control mode
     * @param type type of listener: in | out | fileout | internal
     * @param name 
     * @param func 
     */
    removeListener<T extends keyof ListenerMap>(
        type: T,
        name: ListenerMap[T],
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
        else if(type === "internal"){
            if(!Object.hasOwn(this.#internalListeners, name)){
                throw new ReferenceError(`${name} is not a recognized internal listener`);
            }

             const internalName = name as keyof internalListenersObjectFullControler;

            // TODO: fix type error
            // @ts-expect-error
            this.#internalListeners[internalName] = this.#internalListeners[internalName].filter(
                (toTest) => toTest !== func
            )
        }
    }

    /**
     * setups control mode listeners
     * @param ses session
     */
    #setupListeners(ses: terminalSession){
        ses.out.addListenersFromSavedList(this.#setLis.out);
        // @ts-expect-error
        ses.in.addListenersFromSavedList(this.#setLis.in);
        ses.fileout.addListenersFromSavedList(this.#setLis.fileout);

    }


    /**
     * removes previous listeners and saves them
     * @param ses session
     */
    #removeListenersAndSaveThem(ses: terminalSession){
        this.#lis.out = ses.out.getAttachedListenersFromWrapper();
        ses.out.removeAllListeners();

        this.#lis.in = ses.in.getAttachedListenersFromWrapper();
        ses.in.removeAllListeners();

        this.#lis.fileout = ses.fileout.getAttachedListenersFromWrapper();
        ses.fileout.removeAllListeners();
    }

    /**
     * restores previous listeners
     * @param ses session
     */
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

    /**
     * prepares everything before start
     */
    #prepare(){
        // if it was already started, then just return
        if(this.#startFlag) return;

        // set startflag to true
        this.#startFlag = true;

        // listeners
        for(const one of this.#internalListeners.beforePrepare){
            one();
        }

        // prepare listeners
        const ses = this.session;

        this.#removeListenersAndSaveThem(ses);
        this.#setupListeners(ses);


        // set raw mode
        this.#rawModeTemp = ses.in.rawMode() as boolean;

        if(this.#settings.expectedRawMode !== null){
            ses.in.rawMode(this.#settings.expectedRawMode);
        }

        // set mouse mode
        this.#mouseModesEnter();

        // ensure that in stream is ready to go
        const strm = ses.in.getStream();
        if(strm){
            strm.pause();
            strm.resume();
            strm.pause();
        }

        ses.out.getStream()?.cork();
        ses.out.getStream()?.uncork();

        // listeners
        for(const one of this.#internalListeners.afterPrepare){
            one();
        }
    }

    /** cleanup process after being done with a full control code */
    #after(){
        // if it was not started, then just return 
        if(!this.#startFlag) return;

        // removes a flag
        this.#startFlag = false;

        // listeners
        for(const one of this.#internalListeners.beforeEnd){
            one();
        }

        // this.repairInput();

        // restore listeners
        const ses = this.session;

        this.#restoreListeners(ses);

        if(this.alternateScreenStatus()){
            this.alternateScreenExit();
        }

        // handle resolves
        this.#handleResolves();

        // raw mode
        if(this.#rawModeTemp !== void 0){
            ses.in.rawMode(this.#rawModeTemp);
            this.#rawModeTemp = void 0;
        }

        // set mouse mode
        this.#mouseModesLeave();

        // resume streams, just in case
        const strm = ses.in.getStream();
        if(strm){
            strm.pause();
            strm.resume();
        }        

        // listeners
        for(const one of this.#internalListeners.afterEnd){
            one();
        }
    }

    // prepare parameters for a function
    #prepareParms(): parmsType{
        return [] as any as parmsType;
    }

    /**
     * runs a function in a controlled full access mode environment
     * @param codeFunc function
     * @returns the result of that function
     */
    code<T>(
        codeFunc: syncCodeSection<T>
    ): T{
        // prepare
        let ret: void | T =  void 0;

        this.#prepare();

        // run
        try {
            codeFunc(...this.#prepareParms());
            this.#after();
        } catch (error) {
            this.#after();

            for(const one of this.#internalListeners.error){
                one(error);
            }

            if(this.#settings.throwErrors)
            throw error;
        }


        return ret as T;
    }

    /**
     * runs an async function in a controlled full access mode environment
     * @param codeFunc function
     * @returns the result of that function
     */
    async codeAsync<T>(
        codeFunc: asyncCodeSection<T>
    ): Promise<T>{
        // prepare
        let ret: void | T =  void 0;

        this.#prepare();
        
        // run
        try {
            ret = await codeFunc(...this.#prepareParms());
            this.#after();
        } catch (error) {
            this.#after();
            
            for(const one of this.#internalListeners.error){
                one(error);
            }

            if(this.#settings.throwErrors)
            throw error;
        }


        return ret as T;
    }


    /**
     * turns on a controlled mode manually
     */
    start(){
        if(this.#startFlag){
            throw new SyntaxError("You can't prepare a control without it being taken away");
        }

        this.#prepare();
    }

    /**
     * turns off a controlled mode manually
     */
    end(){
        if(!this.#startFlag){
            throw new SyntaxError("You can't take away control without it being given");
        }

        this.#after();
    }


    /**
     * enters an alternate screen
     */
    alternateScreen(){
        const ses = this.session;

        if(ses.out.alternateBuffer(undefined)){
            throw new Error("Alternate buffer was already intiated");
        }

        ses.out.alternateBuffer(true);
    }

    /**
     * leaves an alternate screen
     */
    alternateScreenExit(){
        const ses = this.session;

        if(!ses.out.alternateBuffer(undefined)){
            throw new Error("Alternate buffer was not already intiated");
        }

        ses.out.alternateBuffer(false);
    }

    /**
     * returns a status of the alternate screen (whether it was entered)
     * @returns the status
     */
    alternateScreenStatus(): boolean{
        const ses = this.session;

        return ses.out.alternateBuffer(undefined);
    }

    /**
     * runs an async function in a controlled full access mode environment with the alternate screen
     * @param codeFunc function
     * @returns the result of that function
     */
    codeAlt<T>(
        codeFunc: syncCodeSection<T>
    ): T{
        // prepare
        let ret: T | void = void 0;

        this.#prepare();
        this.alternateScreen();

        // run
        try {
            ret = codeFunc(...this.#prepareParms());
            if(this.alternateScreenStatus()) this.alternateScreenExit();
            this.#after();
        } catch (error) {
            if(this.alternateScreenStatus()) this.alternateScreenExit();
            this.#after();

            for(const one of this.#internalListeners.error){
                one(error);
            }

            if(this.#settings.throwErrors)
            throw error;
        }


        return ret as T;
    }

    /**
     * runs an async function in a controlled full access mode environment with the alternate screen
     * @param codeFunc function
     * @returns the result of that function
     */
    async codeAsyncAlt<T>(
        codeFunc: asyncCodeSection<T>
    ): Promise<T>{
        // prepare
        let ret: T | void = void 0;

        this.#prepare();
        this.alternateScreen();

        // run
        try {
            ret = await codeFunc(...this.#prepareParms());
            if(this.alternateScreenStatus()) this.alternateScreenExit();
            this.#after();
        } catch (error) {
            if(this.alternateScreenStatus()) this.alternateScreenExit();
            this.#after();

            for(const one of this.#internalListeners.error){
                one(error);
            }

            if(this.#settings.throwErrors)
            throw error;
        }


        return ret as T;
    }




    /**
     * 
     */
    get consoleShortHand(): consoleShortHand{
        if(!this.#consoleShortHand || !this.#consoleShortHand.valid){
            this.#consoleShortHand = new consoleShortHand(this.session);
        }

        return this.#consoleShortHand;
    }


    /**
     * clears a screen
     * @param clearBuf whether clean an entire buffer
     */
    clearScreen(clearBuf: boolean = true){
        return clearConsole(this.sessionName, clearBuf);
    }


    /**
     * ensures in listeners for some stuff
     */
    #ensureInListener(){
        if(!this.#inListener){
            const dataListener = (data: any) => {
                    // TODO
                    if(this.#catchingSpecials){
                        
                    }

                    for(const stream of this.#inListenerToList){
                        stream.write(data);
                    }
                };

            const endListener = () => {
                    for(const stream of this.#inListenerToList){
                        stream.end();
                    }
                };

            // attach them    
            this.addListener("in", "data", dataListener);
            this.addListener("in", "end", endListener);
            
            // save listeners
            this.#inListener = [
                ["data", dataListener],
                ["end", endListener]
            ];

            this.session.in.getStream()?.resume();
        }
    }

    /**
     * checks whether that controller has attached its own listeners on input
     * @returns 
     */
    hasAttachedInternalListenersOnInput(): boolean{
        return !!this.#inListener;
    }

    /**
     * detaches all that listeners that has controller attached itself
     */
    detachInternalListenersFromInput(errorIfNone: boolean = false){
        if(!this.#inListener){
            if(errorIfNone){
                throw new Error("There's no attached internal listeners");
            }

            return;
        }

        for(const [lisName, lisFunc] of this.#inListener){
            this.removeListener("in", lisName, lisFunc);
        }
        
    }


    /**
     * creates a new stream dedicated for stuff like readline interfaces
     * 
     * It should also be used for npm packages like inquirer
     * 
     * You can create as many as you want, but remember to close them using removeNewListener_in_raw(thatOne)
     * 
     * 
     * NOTE: It attaches its own listeners on input by using:
     * addListener('in', 'data')
     * addListener('in', 'end')
     * 
     * @returns a new stream
     */
    getNewListener_in_raw(): PassThrough{
        // create listeners if they're not there
        this.#ensureInListener();

        const toRet = new PassThrough();

        this.#inListenerToList.push(
            toRet
        );

        return toRet;
    }

    /**
     * removes a raw stream created from getNewListener_in_raw()
     * @param thatOne 
     * @returns if that was successful
     */
    removeNewListener_in_raw(thatOne: PassThrough): boolean{
        const tmp = this.#inListenerToList.length;

        this.#inListenerToList = this.#inListenerToList.filter((one) => {
            one !== thatOne
        });

        thatOne.destroy();
    
        return tmp !== this.#inListenerToList.length;
    }

    /**
     * @notready
     * 
     * @param to 
     * @returns 
     */
    catchSpecialsIn(to?: boolean): boolean{
        if(to !== undefined){
            this.#catchingSpecials = to;
        }


        return this.#catchingSpecials;
    }


    /**
     * creates a new stream dedicated for stuff like readline interfaces
     * 
     * It should also be used for npm packages like inquirer
     * 
     * You can create as many as you want, but remember to close them using removeNewListener_out_raw(thatOne)
     * 
     * NOTE: it's still in beta phase. Readline interface sometimes don't like "fake" streams
     * 
     * @returns a new stream
     */
    getNewListener_out_raw(): StreamWrapperProxyOut{
        const toRet = new StreamWrapperProxyOut(this.session.out);

        this.#outListenerToList.push(
            toRet
        );

        // toRet.on("data", (data: any) => {
        //     this.session.out.write(data);
        // });

        return toRet;
    }


    /**
     * removes a raw stream created from getNewListener_out_raw()
     * @param thatOne 
     * @returns if that was successful
     */
    removeNewListener_out_raw(thatOne: StreamWrapperProxyOut): boolean{
        const tmp = this.#outListenerToList.length;

        this.#outListenerToList = this.#outListenerToList.filter((one) => {
            one !== thatOne
        });

        thatOne.destroy();

        return tmp !== this.#outListenerToList.length;
    }

    /**
     * creates a new stream dedicated for stuff like readline interfaces
     * 
     * It should also be used for npm packages like inquirer
     * 
     * You can create as many as you want, but remember to close them using removeNewListener_fileout_raw(thatOne)
     * 
     * @returns a new stream
     */
    getNewListener_fileout_raw(): PassThrough{
        const toRet = new PassThrough();

        this.#fileoutListenerToList.push(
            toRet
        );

        toRet.on("data", (data: any, callback: any, buffer: any) => {
            this.session.fileout.write(data, callback, buffer)
        });

        return toRet;
    }

    
    /**
     * removes a raw stream created from getNewListener_fileout_raw()
     * @param thatOne 
     * @returns if that was successful
     */
    removeNewListener_fileout_raw(thatOne: PassThrough): boolean{
        const tmp = this.#fileoutListenerToList.length;

        this.#fileoutListenerToList = this.#fileoutListenerToList.filter((one) => {
            one !== thatOne
        });

        thatOne.destroy();

        return tmp !== this.#fileoutListenerToList.length;
    }

    /**
     * @notready @dontuse
     */
    repairInput(){
        const ses = this.session;

        const stream = ses.in.getStream();

        if(stream){
            stream.destroy();
        }

    }


    mouseStatus(): boolean{
        return this.#stackMouse !== undefined;
    }

    mouseNoControl(){
        this.#stackMouse = undefined;
        if(this.#startFlag){
            mouseStackPop(this.sessionName);
        }

    }

    #mouseEnsureObject(){
        if(!this.#stackMouse){
            this.#stackMouse = structuredClone(defaultMouseConfiguration);

            if(this.#startFlag)
            addEntryToStack(this.#stackMouse, this.sessionName, false);
        }
    }

    mouseSetEncoding(encoding: mouseReportingFormat){
        this.#mouseEnsureObject();
        (this.#stackMouse as mouseStackEntry).encoding = encoding;


        if(this.#startFlag){
            setMouseModeAccordingToTopOfTheStack(this.sessionName);
        }
    }

    mouseSetReporting(reporting: mouseEventReportingType){
        this.#mouseEnsureObject();
        (this.#stackMouse as mouseStackEntry).mouseEventReporting = reporting;

        if(this.#startFlag){
            setMouseModeAccordingToTopOfTheStack(this.sessionName);
        }
    }

    #mouseModesEnter(){
        if(this.#stackMouse){
            addEntryToStack(this.#stackMouse, this.sessionName, true);
            // while(true);
        }
    }

    #mouseModesLeave(){
        if(this.#stackMouse){
            mouseStackPop(this.sessionName);
        }
    }


    wait(mili: number): Promise<void>{
        return new Promise((resolve) => setTimeout(resolve, mili));
    }
}


/**
 * gets a new fullcontroller
 * @param terminalLike something like a terminal
 * @returns a fullcontroller
 */
function askForFullControl(terminalLike: getTerminalOPJTYPE): fullControler{
    const ses = getTerminalOPJ(terminalLike);

    if(!ses){
        throw new logSystemError("It was not possible to get that terminal session!");
    }


    const ctron = new fullControler(ses);


    return ctron;
}

export {fullControler, askForFullControl, codeMatchWhat}