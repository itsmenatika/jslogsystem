import { readFileSync } from "fs";
import { textboxVisibility } from "../apis/allApis.js";
import { crash, logNode } from "../log.js";
import { getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSessionObjSaved } from "../programdata.js";

/**
 * crash the program (not only the message like newConsole.crash())
 * @param message meessage
 * @param who by who
 * @param exitCode exit code
 */
function actualCrash(
    message: string, 
    who?: string | logNode, 
    exitCode?: any,
    terminal: getTerminalOPJTYPE = "main",
){
    const terminalData = getTerminalOPJ(terminal);

    crash(message, who, terminalData).then(() => {
        textboxVisibility(false, terminalData);
        if(terminalData.procLinked){
            terminalData.procLinked.exit(exitCode);
        }
    });


    // for(const trm of Object.keys(terminalSessionObjSaved)){
    //     const trmD = getTerminal(trm);

    //     if(!trmD) continue;

    //     const d = readFileSync(trmD.config.$cache$latestLogTempPath);

    //     const dObj = new Date(Number(d));

    //     terminalData.config.saveTheLatest(dObj, trmD.config.$cache$latestLogPath, trmD.config);
    // }

    

}

export {actualCrash}