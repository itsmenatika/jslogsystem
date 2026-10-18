import { isAbsolute, join, relative } from "path";
import { commandContext } from "../types.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../../programdata.js";
import { logSystemError } from "../../../ultrabasic.js";
import { accessSync } from "fs";
import { access } from "fs/promises";

function cd(context: getTerminalOPJTYPE, parts: string[] | string): string{
    if(!Array.isArray(parts)) parts = [parts];

    // get terminal
    const ses = getTerminalOPJ(context);

    if(parts.length > 0){
        // resolve the path
        let path = join(ses.cwd, ...parts);

        // block going outside if needed
        if(ses.config.blockGoingOutsideWorkingDirectory){

            if(
                !path.startsWith(ses.config.workingDirectory)
            ){
                throw new logSystemError(`The path tried to exit the working directory`);
            }
        }


        // change directory
        if(ses.procLinked){
            ses.procLinked.chdir(path);
        }
    
        // save it
        ses.cwd = ses.cwd = path;
    }

    return ses.cwd;
}

interface logInfo {
    logDirectory: string,
    latest: string,
    temp: string
}

function logLocs(context: getTerminalOPJTYPE): logInfo{
    const trm = getTerminalOPJ(context);

    const config = trm.config;
    return {
        logDirectory: config.$cache$LogDirectoryPath,
        latest: config.$cache$latestLogPath,
        temp: config.$cache$latestLogTempPath
    };
}


function getCwdToShowFromString(context: getTerminalOPJTYPE, thatOne: string): string{
    const trm = getTerminalOPJ(context);

    if(trm.config.useIsolatedCwd){
        const toRet = relative(trm.config.workingDirectory, thatOne);

        if(toRet === ""){
            return ".";
        }
        // else if(toRet.startsWith("..")){
        //     return toRet;
        // }
        else{
            return toRet;
        }
    }
    else return trm.cwd;  
}

function getCwdToShow(context: getTerminalOPJTYPE): string{
    const trm = getTerminalOPJ(context);

    return getCwdToShowFromString(trm, trm.cwd);
}

function cdDummy(context: getTerminalOPJTYPE, parts: string[] | string): string{
    if(!Array.isArray(parts)) parts = [parts];

    // get terminal
    const ses = getTerminalOPJ(context);

    if(parts.length > 0){
        // resolve the path
        let path = join(ses.cwd, ...parts);

        // block going outside if needed
        if(ses.config.blockGoingOutsideWorkingDirectory){

            if(
                !path.startsWith(ses.config.workingDirectory)
            ){
                throw new logSystemError(`The path tried to exit the working directory`);
            }
        }

        return path;

    }

    return ses.cwd;
}

function isSafe(context: getTerminalOPJTYPE, path: string): boolean{
    // get terminal
    const ses = getTerminalOPJ(context);

    if(ses.config.blockGoingOutsideWorkingDirectory){
        return path.startsWith(ses.config.workingDirectory);
    }

    return true;
}

function isAccessPossibleSync(context: getTerminalOPJTYPE, parts: string[] | string, mode?: number){
    const toGo: string = cdDummy(context, parts);

    return accessSync(toGo, mode);
}

async function isAccessPossible(context: getTerminalOPJTYPE, parts: string[] | string, mode?: number){
    const toGo: string = cdDummy(context, parts);
    // console.log(toGo);

    return access(toGo, mode);
}



export {cd, logLocs, getCwdToShow, getCwdToShowFromString, cdDummy, isAccessPossible, isAccessPossibleSync, isSafe}