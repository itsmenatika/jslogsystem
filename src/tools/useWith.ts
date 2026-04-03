import { connectedToSpecificLogNode, log, logNode, LogType } from "../log.js";
import { connectedToSpecificTerminal, getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";
import { formatTaskError } from "../texttools.js";

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
 * @param silent Defaults to false. Allows you for the removal of logs. NULL will print only if an error is present
 * @param terminal the terminal name
 * @returns the func result or an error object
 */
function useWith(
    message: string, func: CallableFunction, 
    who: string | logNode = "core", 
    silent: boolean | null = false,
    terminal: getTerminalOPJTYPE = "main",
): any | Error{
    // get terminal
    const terminalData = getTerminalOPJ(terminal);

    // print info
    if(silent === true)
    log(LogType.INFO, message, who, terminalData);
    try {
        let funcRes = func();

        if(silent === true)
        log(LogType.SUCCESS, message, who, terminalData);

        return funcRes;
    } catch (error) {
        if(silent === null || !silent)
        log(LogType.ERROR, formatTaskError(message, error), who, terminalData);

        return error;
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
 * @param silent Defaults to false. Allows you for the removal of logs. NULL will print only if an error is present
 * @param terminal the terminal name
 * @returns the func result or an error object
 */
async function useWithAsync(
    message: string, func: (...args: any) => Promise<any>, 
    who: string | logNode = "core", 
    silent: boolean | null = false,
    terminal: getTerminalOPJTYPE = "main",
): Promise<any | Error>{
    // get terminal
    const terminalData = getTerminalOPJ(terminal);

    // print info
    if(silent === true)
    log(LogType.INFO, message, who, terminalData);
    try {
        let funcRes = await func();

        if(silent === true)
        log(LogType.SUCCESS, message, who, terminalData);

        return funcRes;
    } catch (error) {
        if(silent === null || !silent)
        log(LogType.ERROR, formatTaskError(message, error), who, terminalData);

        return error;
    }
}


class useWithObj extends connectedToSpecificLogNode{
    #silent: boolean | null | undefined = undefined;

    constructor(from: getTerminalOPJTYPE = "main"){
        super(from);
    }
    

    silent(data: boolean | null | undefined): useWithObj{
        this.#silent = data;
        return this;
    }

    useWith(
        message: string, func: CallableFunction, 
        who?: string | logNode | undefined,
        silent?: boolean | null
    ): ReturnType<typeof useWith>{
        const newWho = who === undefined ? this.who : who;
        const newSilent = silent === undefined ? this.#silent : silent;


        return useWith(message, func, newWho, newSilent, this.sessionName);
    }

    useWithAsync(
        message: string, func: (...args: any) => Promise<any>, 
        who?: string | logNode | undefined,
        silent?: boolean | null
    ): ReturnType<typeof useWithAsync>{
        const newWho = who === undefined ? this.who : who;
        const newSilent = silent === undefined ? this.#silent : silent;


        return useWith(message, func, newWho, newSilent, this.sessionName);
    }
}

function getCommonUseWith(from: getTerminalOPJTYPE = "main", who?: string | logNode, silent?: boolean | null): useWithObj{
    const toRet = new useWithObj(from);

    if(who !== undefined){
        toRet.as(who);
    }

    if(silent !== undefined){
        toRet.silent(silent);
    }

    return toRet;
}

export {useWith, useWithAsync, useWithObj, getCommonUseWith, getCommonUseWith as gcuw}