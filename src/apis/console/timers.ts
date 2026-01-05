import { log, LogType } from "../../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";
import { logSystemError } from "../../ultrabasic.js";
import { logSettings } from "./logstyles.js";

/**
 * creates a new timer with specified name
 * @param label the timer name
 * @param info configuration information
 * @returns the start time
 */
function logTimeStart(
    label: string = "DEFAULT", 
    info: Omit<logSettings, "error"> = {}
): number{
    // get terminal
    const d = getTerminalOPJ(info.terminal || "main");

    // get current time
    const time = Date.now();

    d.timers[label] = time;

    if(!("messageVisible" in info) || info.messageVisible){
        const whoS = info.messageWho ? info.messageWho : undefined;
        log(LogType.TIMER, `timer '${label}' started`, whoS, d);
    }

    // return start time
    return time;
}

/**
 * stops a timer with specified name
 * 
 * if info.error set to true, it causes an error if there's no timer with that name, otherwise it just ignores it
 * 
 * @param label the timer name
 * @param info configuration information
 * @returns elapsed time
 */
function logTimeEnd(
    label: string = "DEFAULT", 
    info: logSettings = {}): number{
    // get terminal
    const d = getTerminalOPJ(info.terminal || "main");

    // check if there's a timer
    if(!(label in d.timers) && "error" in info && info.error){
        throw new logSystemError("there's no timer with that name");
    }

    const elapsed = Date.now() - d.timers[label]; // get how much time has passed

    // print it
    if(!("messageVisible" in info) || info.messageVisible){
        const whoS = info.messageWho ? info.messageWho : undefined;
        if(!(label in d.timers)){
            log(LogType.WARNING, `no timer named '${label}'`, whoS, d);
        }
        else{
            log(LogType.GROUP, `timer '${label}' ended. ${elapsed}ms`, whoS, d);
        }

    }

    delete d.timers[label]; // delete that timer

    // return it
    return elapsed;
}

/**
 * returns the current time of the timer
 * @param label the timer name
 * @param info configuration information
 * @returns the current time
 */
function logTimeStamp(label: string = "DEFAULT", info: logSettings = {}): number{
    // get terminal
    const d = getTerminalOPJ(info.terminal || "main");   

    // check if there's that timer
    if(!(label in d.timers) && "error" in info && info.error){
        throw new logSystemError("there's no timer with that name");
    }

    const elapsed = Date.now() - d.timers[label]; // get elapsed time

    // print it
    if(!("messageVisible" in info) || info.messageVisible){
        const whoS = info.messageWho ? info.messageWho : undefined;
        if(!(label in d.timers)){
            log(LogType.WARNING, `no timer named '${label}'`, whoS, d);
        }
        else{
            log(LogType.GROUP, `timer '${label}' stamp: ${elapsed}ms`, whoS, d);
        }
    }

    // return it
    return elapsed;
}

/**
 * check whether the log time timer do exist
 * @param label the label
 * @param terminal terminal
 * @returns if it exist
 */
function logTimeExist(label: string, terminal: getTerminalOPJTYPE = "main"){
    // get terminal
    const d = getTerminalOPJ(terminal);
    
    // get the result
    return Object.hasOwn(d.timers, label);
}

function timerList(terminal: getTerminalOPJTYPE = "main"): Readonly<Record<string, number>>{
    // get terminal
    const d = getTerminalOPJ(terminal);

    return Object.freeze({...d.timers})
}

export {
    logTimeStart,
    logTimeEnd,
    logTimeStamp,
    logTimeExist,
    timerList
}