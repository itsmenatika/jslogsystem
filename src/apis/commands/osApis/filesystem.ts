import { isAbsolute, join, relative } from "path";
import { commandContext } from "../types.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../../programdata.js";
import { logSystemError } from "../../../ultrabasic.js";

function cd(context: getTerminalOPJTYPE, parts: string[]): string{
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

function logLocs(context: commandContext): logInfo{
    const config = context._terminalSession.config;
    return {
        logDirectory: config.$cache$LogDirectoryPath,
        latest: config.$cache$latestLogPath,
        temp: config.$cache$latestLogTempPath
    };
}

export {cd, logLocs}