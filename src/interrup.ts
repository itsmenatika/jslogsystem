import { textboxVisibility } from "./apis/allApis.js";
import { log, LogType } from "./log.js";
import { consoleWrite } from "./out.js";
import { getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "./programdata.js";
import { consoleColors, formatError } from "./texttools.js";
import { actualCrash } from "./tools/exit.js";

enum interrupType{
    sigint
}

enum interrupReasonType{
    ctrlc,
    processSignal
}


interface InterupData{
    reason: interrupReasonType,
    session: terminalSession,
    sessionName: string,
    author: string,
    forceDefault: boolean
}

function internalInterupHandlerSIGINT(
    data: InterupData
){
    let mes: string = "";
    switch(data.reason){
        case interrupReasonType.ctrlc: {
            mes = "CTRL + C";
            break;
        }
        case interrupReasonType.processSignal: {
            mes = "SIGNAL";
            break;
        }
        
    }

    textboxVisibility(false, data.session);
    actualCrash(`The execution was manually stopped by ${mes}!`, data.author, -1);
}


type singleCallback = [string, (...args: any) => void];

function setUpInterrupsForProcess(session: getTerminalOPJTYPE): singleCallback[]{
    const ses = getTerminalOPJ(session);

    const toRet: singleCallback[] = [];

    if(ses.procLinked){
        const sigIntFunc = () => {
                internalInterupHandlerSIGINT({
                    session: ses,
                    sessionName: ses.sessionName,
                    reason: interrupReasonType.processSignal,
                    author: "core",
                    forceDefault: true
                });
            };

        ses.procLinked.addListener("SIGINT", sigIntFunc);
        toRet.push(["SIGINT", sigIntFunc]);

        const exitFunc = () => {
            textboxVisibility(false);
            consoleWrite("", consoleColors.Reset, false);
        }
   
        ses.procLinked.addListener("exit", exitFunc);
        toRet.push(["exit", exitFunc]);


        const uncaughtExceptionFunc = (err: any) => {
            actualCrash("process uncaughtException: " + formatError(err));
        }

        ses.procLinked.addListener("uncaughtException", uncaughtExceptionFunc);
        toRet.push(["uncaughtException", uncaughtExceptionFunc]);

        const messageFunc = (message: unknown) => {
            log(LogType.SIGNAL, "message: " + message, undefined, ses);
        }

        ses.procLinked.addListener("message", messageFunc);
        toRet.push(["message", messageFunc]);

        const warningFunc = (warn: unknown) => {
            log(LogType.SIGNAL, "warning: " + warn, undefined, ses);
        }

        ses.procLinked.addListener("warning", warningFunc);
        toRet.push(["warning", warningFunc]);

    }

    return toRet;
}

function unregisterInterrups(proc: typeof process, data: singleCallback[]){
    for(const [name, func] of data){
        proc.removeListener(name, func);
    }
}


export {interrupType, interrupReasonType, InterupData, internalInterupHandlerSIGINT, setUpInterrupsForProcess, unregisterInterrups}