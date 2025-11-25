import { log, logNode, LogType } from "./log.js";
import { consoleMultiWrite } from "./out.js";
import { getLogSystemDataObj, getLogSystemDataObjOPJ, getLogSystemDataObjOPJTYPE } from "./programdata.js";
import { clearScrenDownCODE, consoleColor, consoleColorsMulti, cursorAbs, formatTaskError, printViewTextbox } from "./texttools.js";

/**
 * clears the console. Equivalent to vannilia JS console.clear()
 * 
 * @param terminal the name of terminal
 */
function clearConsole(terminal: getLogSystemDataObjOPJTYPE = "main"){
    // get that terminal
    const terminalData = getLogSystemDataObjOPJ(terminal);

    terminalData?.out.write(
        cursorAbs(0,0)
        +
        clearScrenDownCODE
    );
    // process.stdout.cursorTo(0,0);
    // process.stdout.clearScreenDown();

    if(terminalData?.viewTextbox){
        printViewTextbox(terminalData.text);
    }
}


class multiDisplayer{
    private texts: string[] = [];
    private colors: Array<consoleColor | consoleColorsMulti> = [];

    constructor(){}

    // static fromReadyString(text: string){
    //     const toReturn = new multiDisplayer();

    //     const codes = [];

    //     const ansiRegex = /\u001b\[[0-9;]*m/g;

    //     toReturn.colors = text.match(ansiRegex) || [];

    //     toReturn.texts = text.split(ansiRegex).filter(s => s);

    //     return toReturn;
    // }

    /**
     * adds the new characters (and) colors to displayer
     * 
     * for adding at the beginning, check: unshift()
     * 
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    push(text: string, colors?: consoleColor | consoleColorsMulti){
        this.texts.push(text);

        if(colors)
            this.colors.push(colors);
        else
            this.colors.push("");
    }

    /**
     * adds the new characters (and) colors to displayer at the beginning
     * 
     * for adding at the last place, check: push()
     * 
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    unshift(text: string, colors?: consoleColor | consoleColorsMulti){
        this.texts.unshift(text);

        if(colors)
            this.colors.unshift(colors);
        else
            this.colors.unshift("");
    }

    /**
     * pops the last element and returns it
     * @returns the popped element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    pop(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
        return [this.texts.pop(), this.colors.pop()];
    }

    /**
     * shifts the first element and returns it
     * @returns the shifted element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    shift(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
        return [this.texts.shift(), this.colors.shift()];
    }

    /**
     * returns the string without color table
     * @returns the raw string
     */
    toRawString(): string {
        return this.texts.join("");
    }

    /**
     * allows you to use finally consoleWrite. It's required because js has no constructors
     * @param writeToFile parameter to be passed to consoleWrite. Leave it as undefined to leave it as default
     * @param clearObj whether to clear the arrays on that objects. Defaults to true
     */
    useConsoleWrite(
        writeToFile: boolean | undefined = true, 
        clearObj: boolean = true,
        terminal: getLogSystemDataObjOPJTYPE
    ){
        // default of writeToFile
        if(writeToFile === undefined) writeToFile = true;

        // use consoleMultiWrite
        consoleMultiWrite(this.texts, this.colors, terminal, writeToFile);

        // clear objs
        if(clearObj){
            this.texts = [];
            this.colors = [];
        }
    }

    /**
     * clears the whole array
     */
    clear(){
        this.texts = [];
        this.colors = [];
    }
}

/**
 * allows you to easily use log without retypping task info
 * 
 * example:
 * useWith("bulding core data...", () => {
 *     let s = connectToApi();
 *     s.build();
 * }, "userAccounter")
 * 
 * @param message the task description
 * @param func function that runs task (it will invoke it without any parameters)
 * @param who who is responsible
 * @param silent Defaults to false. Allows you for the removal of logs
 * @param terminal the terminal name
 * @returns the func result or an error object
 */
function useWith(
    message: string, func: CallableFunction, 
    who: string | logNode = "core", 
    silent: boolean = false,
    terminal: getLogSystemDataObjOPJTYPE = "main",
): any | Error{
    // get terminal
    const terminalData = getLogSystemDataObjOPJ(terminal);

    // print info
    log(LogType.INFO, message, who, terminalData);
    try {
        let funcRes = func();

        if(!silent)
        log(LogType.SUCCESS, message, who, terminalData);

        return funcRes;
    } catch (error) {

        if(!silent)
        log(LogType.ERROR, formatTaskError(message, error), who, terminalData);

        return error;
    }
}

export {
    clearConsole,
    multiDisplayer,
    useWith
}