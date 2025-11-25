import { join } from "path";
import { commandContext } from "../types";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../../programdata.js";

function cd(context: getTerminalOPJTYPE, parts: string[]): string{
    const ses = getTerminalOPJ(context);

    if(parts.length > 0){
        let path = join(ses.cwd, ...parts);
    
        if(ses.procLinked){
            ses.procLinked.chdir(path);
        }
    
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