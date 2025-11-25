import { crash } from "../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";

/**
 * crash the program (not only the message like newConsole.crash())
 * @param message meessage
 * @param who by who
 * @param exitCode exit code
 */
function actualCrash(
    message: string, 
    who?: string, 
    exitCode?: any,
    terminal: getTerminalOPJTYPE = "main",
){
    const terminalData = getTerminalOPJ(terminal);

    crash(message, who, terminalData);

    if(terminalData.procLinked){
        terminalData.procLinked.exit(exitCode);
    }
}

export {actualCrash}