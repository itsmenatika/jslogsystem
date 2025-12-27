import { log, logNode, LogType } from "../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";
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

export {useWith, useWithAsync}