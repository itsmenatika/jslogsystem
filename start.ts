import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as config from "./config.js";
import { join } from "path";
import { logSystemError } from "./ultrabasic.js";
// import { combineColors, log, multiDisplayer } from "./logSystem.js";
import {log, LogType} from './log.js';

let __iSJSLOGSYSTEMON: boolean = false;

/**
 * starts the log system
 */
function startJSLOGSYSTEM(){
    if(__iSJSLOGSYSTEMON){
        throw new Error("it's already on!");
    }
    
    __iSJSLOGSYSTEMON = true;

    // working directory
    if(!existsSync(config.workingDirectory)){
        mkdirSync(config.workingDirectory);
    }

    if(config.workingDirectory)
    process.chdir(config.workingDirectory);


    // configure the stdin
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");

    if(!existsSync(config.LOGDIRECTORY)){
    // make it if it doesn't exist
    mkdirSync(config.LOGDIRECTORY, {recursive: true});
    }

    handlePrevious();
}

/**
 * stops the log system
 */
function stopJSLOGSYSTEM(){
    if(!__iSJSLOGSYSTEMON){
        throw new Error("it's already off!");
    }

    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.setEncoding("utf-8");
}

function iSJSLOGSYSTEMON(): boolean{
    return __iSJSLOGSYSTEMON;
}

function handlePrevious(){
    // get the TEMP FILE containing metadata of the previous log
    // const tempFinal: string = join(config.LOGDIRECTORY, "temp"); // the path to previous temp file log

    // check whether the previous log exist
    if(existsSync(config.finalLatest)){
        // if the latest log does exist, then temp shall too!
        if(!existsSync(config.tempFinal)){
            throw new logSystemError("Error with moving the previous log!");
        }

        // get the data from the temp
        const data = readFileSync(config.tempFinal).toString(); // get the data of the previous log (temp data)

        // splits the data into pieces
        const piecesOfData: string[] = data.split("\n"); // split it into lines

        // get the date of the last log
        const date = new Date(Number(String(piecesOfData[0]))); // the first line is the date line

        // calling the callback to do stuff with previous one
        config.saveTheLatest(date, config.finalLatest);

        // removing temp
        unlinkSync(config.tempFinal);
    }

    // create new temp file
    writeFileSync(config.tempFinal, `${Date.now()}\n`);

    // create a new latest log file
    writeFileSync(config.finalLatest, config.getMoreStartInformation());

    appendFileSync(config.finalLatest, "----------------\n");
}

function hello(){
    if(config.quickHello){
        log(LogType.INIT, `log system v${logSystemVer} by Naticzka was properly loaded!`);
    }
    else
    {
        const s = new multiDisplayer();

        s.push("Log system has been properly loaded!\n", consoleColors.FgGreen);
        s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
        s.push("\n\n");
        s.push(`Welcome to the log system v${logSystemVer} `, consoleColors.FgCyan);
        s.push("by Naticzka\n", combineColors(consoleColors.FgMagenta, consoleColors.Blink));
        s.push("\n")
        s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
        s.push("\n");
        s.push("start using it by writting 'help' or '?'\n")
        s.useConsoleWrite(false);
    }

}

export {startJSLOGSYSTEM, stopJSLOGSYSTEM, iSJSLOGSYSTEMON}