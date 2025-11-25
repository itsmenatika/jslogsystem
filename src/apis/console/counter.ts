import { logNode, LogType, log } from "../../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";

/**
 * counts the counter
 * @param name the name of the counter
 * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
 * @param increaseBy the increment value. Defaults to 1
 * @param who the executioner (for the logs). Defaults to "core"
 * @returns the current name on the counter.
 */
function counterCountLegacy(name: string, startFrom: number = 1, increaseBy: number = 1, who?: string | logNode): number{
    return counterCount(name, who, increaseBy, undefined, startFrom);
}

/**
 * counts the counter
 * @param name the name of the counter. Optional
 * @param who the executioner (for the logs). Defaults to "core"
 * @param increaseBy the increment value. Defaults to 1
 * @param terminalName the name of the terminal
 * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
 * @returns the current name on the counter.
*/
function counterCount(
    name: string = "default", 
    who?: string | logNode,
    increaseBy: number = 1, 
    terminal: string | getTerminalOPJTYPE = "main",
    startFrom: number = 1, 
): number{
    // get that terminal
    const terminalData = getTerminalOPJ(terminal);

    // increase or create
    if(!Object.hasOwn(terminalData.counterTable, name)){
        terminalData.counterTable[name] = startFrom;
    }
    else{
        terminalData.counterTable[name] += increaseBy;
    }

    // log it
    log(LogType.COUNTER, `${name} -> ${terminalData.counterTable[name]}`, who, terminalData);

    // return the current value
    return terminalData.counterTable[name];
}


/**
 * removes (resets) the couter
 * @param name the counter name. Optional
 * @param terminal the name of the terminal
 * @returns whether there was a counter with that name
 */
function counterCountReset(name: string = "DEFAULT", terminal: getTerminalOPJTYPE = "main"){
    // get that terminal
    const terminalData = getTerminalOPJ(terminal);

    if(Object.hasOwn(terminalData.counterTable, name)){
        delete terminalData.counterTable[name];
        return true;
    }

    return false;
}

/**
 * returns the number register on the counter
 * @param name the name of the counter
 * @returns undefined if doesnt exist or the number if exist
 */
function getCounter(name: string, terminal: getTerminalOPJTYPE = "main"): undefined | number{
    // get that terminal
    const terminalData = getTerminalOPJ(terminal);

    return terminalData.counterTable[name] ? terminalData.counterTable[name] : undefined;
}

export {
    counterCount,
    counterCountLegacy,
    counterCountReset,
    getCounter
}