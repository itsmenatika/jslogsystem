// LOG SYSTEM
// created by naticzka ;3

import { appendFileSync, createReadStream, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { cwd } from "node:process";

// CONFIG
// USE JOIN for paths
const LOGDIRECTORY: string = join("dev", "logs");
const LATESTLOGNAME: string = "latest.txt";

// callback to write information on the top
const getMoreStartInformation = (): string => {
	const dateObj = new Date();
    return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n`;
}

// callback which is used to what to do with the previous log file
const saveTheLatest = (date: Date, previousFilePath: string): void => {
    renameSync(
        previousFilePath, 
        join(cwd(), LOGDIRECTORY, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()} ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
    );
}

let viewTextBox: boolean = true; // if the textbox should be visible at the start
let blockLogsVar: boolean = false; // if the logs should be displayed

// CODE
// ___________________________________________
enum LogType {
    INFO = 0,
    INFORMATION = 0,
    ERROR = 1,
    ERR = 1,
    WARNING = 2,
    WAR = 2,
    SUCCESS = 3,
    SUCC = 3,
    SUC = 3,
    INITIALIZATION = 4,
    INIT = 4,
    INT = 4,
    CRASH = 5,
    COUNTER = 6
}

class logSystemError extends Error{};

// settings
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8")

// check for the log directory
if(!existsSync(join(cwd(), LOGDIRECTORY))){
    mkdirSync(join(cwd(), LOGDIRECTORY), {recursive: true});
}

const finalLatest: string = join(cwd(), LOGDIRECTORY, LATESTLOGNAME);
const tempFinal: string = join(cwd(), LOGDIRECTORY, "temp");

if(existsSync(finalLatest)){
    if(!existsSync(tempFinal)){
        throw new logSystemError("Error with moving the previous log!");
    }

    const data = readFileSync(tempFinal).toString();
    const piecesOfData: string[] = data.split("\n");

    const date = new Date(Number(String(piecesOfData[0])));

	// calling the callback to do stuff with previous one
	saveTheLatest(date, finalLatest);

    // moving latest
    // renameSync(
    //    finalLatest, 
    //    join(cwd(), LOGDIRECTORY, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()} ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
    //);

    // removing temp
    unlinkSync(tempFinal);
}

// create new temp file
writeFileSync(tempFinal, `${Date.now()}\n`);

// create a new latest log file
writeFileSync(finalLatest, getMoreStartInformation());

appendFileSync(finalLatest, "----------------\n");

// vars to store info
let text: string = "";

const allowedKeysToWrite: string = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]";

// display the textbox at the start
if(viewTextBox){
   process.stdout.write("> \x1b[35m"+text);	
}

// watching user typing
process.stdin.on('data', async (key: string) => {
    if(key){
        // escape ctrl + c key
        if(key === '\u0003'){
            process.stdout.write("\x1b[0m");
            viewTextBox = false;
            log(LogType.CRASH, "The execution was manually stopped by CTRL + C!");
            process.exit();
        }

        // reappearing of the textbox
        if(!viewTextBox){
            viewTextBox = true;
            process.stdout.write("> \x1b[35m");
        }

 
        // backspace
        if(key.includes("\b")){
            if(text.length > 0){
                process.stdout.write("\b \b"); 
            }
            text = text.slice(0, -1);
        }
        // enter
        else if(key.includes("\r")){
            process.stdout.write("\n");
            appendFileSync(finalLatest, "> "+text+"\n");
            let tempText: string = text;
            text = "";
            process.stdout.write("\x1b[0m");
            if(!handleEnter(tempText) && viewTextBox){
                // process.stdout.write("> \x1b[35m");
            }
        }
        // adding keys
        else if(allowedKeysToWrite.includes(key)){
            text += key;
            process.stdout.write(key); 
        }



    }
}
);

// type for typescript
type cmdcallback = (args: string[]) => boolean;

/**
 * blank callback, that can be used for testing purposes
 */
const blankCallback = (args: string[]) => false;

// the list of commands
let commands: Record<string, [cmdcallback, string, string, string]> = {
    exit: [blankCallback, 
        "exit <exit code>", 
        "allows you to stop the process", 
        "allows you to stop the process"],
    info: [blankCallback, 
        "info", 
        "shows the information about the process", 
        "shows the information about the process"],
    cls: [blankCallback, 
        "cls", 
        "clears the console", 
        "clears the console"],
    hide: [blankCallback, 
        "hide", 
        "hides the textbox", 
        "hides the textbox"]
}

/**
 * check if the command was registered
 * @param name the name of the command
 * @returns the status. Boolean
 */
function isCommandRegistered(name: string): boolean {
    return Object.hasOwn(commands, name);
}

/**
 *  returns the list of commands that were registered
 * */ 
function commandList(): string[] {
    return Object.keys(commands);
}

/**
 * allows you to remove the command.
 * it throws logSystemError if the command doesnt exist
 * @param name the name of the command
 */
function removeCommand(name: string){
    if(!Object.hasOwn(commands, name)){
        throw new logSystemError(`The command '${name}' doesn't exist!`)
    }

    delete commands[name];
}

/**
 * allows you to register a command
 * @param name the name of command
 * @param usage a string that describes the usage of the command
 * @param desc a string that describes the command (shortly)
 * @param longdesc a string that describes  the command
 * @param callback callback to use when that command is invoked
 */
function registerCommand(name: string, usage: string, desc: string, longdesc: string, callback: cmdcallback) {
    if(Object.hasOwn(commands, name)){
        throw new logSystemError(`The command '${name}' does exist!`)
    }

    commands[name] = [
        callback, usage, desc, longdesc
    ];
}

/**
 * interface to allow easily manipulation of the list of commands
 */
const commandInterface = {
    isCommandRegistered,
    commandList,
    removeCommand,
    registerCommand
};

// that functions handles commands. It's for internal usage
function handleEnter(text: string): boolean | void{
    log(LogType.INFO, `This command has been executed ${text}`, "console");
    let parts = text.split(" ");

    switch(parts[0]){
        case "?":
        case "help": 
            let helps: string = "";
            
            for(let cmd of newConsole.commandInterface.commandList()){
                helps += ` * ${cmd} -> ${commands[cmd][2]}\n`
            }

            consoleWrite(`------\nCommands:\n\n`+ helps+"\n");
            break;

        case "exit": {
            let exitCode = parts.slice(1).join(" ").trim() !== "" ? parts.slice(1).join(" ").trim() : 0;
            log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: "+ exitCode);
            process.stdout.write("\x1b[0m");
            process.exit(exitCode);
            return false;
        }
        case "cls":
        case "clear":
            clearConsole();
            return true;

        case "h":
        case "hide":
            consoleWrite("The textbox was hidden. Start writting to make it appear again!\n");
            textboxVisibility(false);
            return false;
        case "info": {
            let mus = process.memoryUsage();

            consoleWrite(`------\nprocess info:\n\n`+
                `\tarchitecture: ${os.arch}\n`+
                `\thost name: ${os.hostname}\n`+
                `\tplatform: ${os.platform}\n`+
                `\tkernel version: ${os.version}\n`+
                `\tprocess priority: ${os.getPriority()}\n`+
                `\tmachine: ${os.machine}\n`+
                `\tcwd: ${process.cwd()}\n`+
                `\theap total: ${Math.round(mus.heapTotal/100000)/10}mb\n`+
                `\theap used: ${Math.round(mus.heapUsed/100000)/10}mb\n`+
                `\tcpu usage (1m, 5m, 15m): ${os.loadavg().map(num => `${num * 100}%`)}\n`);

            

            break;
        }
        default: {
            if(Object.hasOwn(commands, parts[0])){
                return commands[parts[0]][0](parts);
            }
            else{
                log(LogType.ERROR, "unknown command", "console");
                return true;  
            }
        }
    }
}


/**
 * allows you to write raw logs
 * @param type the type of the log
 * @param message the message
 * @param who the executioner (for the logs). Defaults to "core"
 */
function log(type: LogType, message: string, who: string = "core") {


    const currentDate: Date = new Date();
    const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;

    let toWrite: string;
    switch(type){
        case LogType.INFO: {
            toWrite = `${formattedDate} INFO ${who}: ${message}\n`;
            break;
        }
        case LogType.ERROR: {
            toWrite = `${formattedDate} ERROR ${who}: ${message}\n`;
            break;
        }
        case LogType.SUCCESS: {
            toWrite = `${formattedDate} SUCCESS ${who}: ${message}\n`;
            break;
        }
        case LogType.INIT: {
            toWrite = `${formattedDate} INIT ${who}: ${message}\n`;
            break;
        }
        case LogType.WARNING: {
            toWrite = `${formattedDate} WARNING ${who}: ${message}\n`;
            break;
        }
        case LogType.CRASH: {
            toWrite = `${formattedDate} CRASH ${who}: ${message}\n`;
            break;
        }
		case LogType.COUNTER: {
            toWrite = `${formattedDate} C ${who}: ${message}\n`;
            break;
        }
        default: {
            throw new logSystemError("???");
        }
    }

    appendFileSync(finalLatest, toWrite);


    if(blockLogsVar) return;



    process.stdout.clearLine(0);
    process.stdout.write("\r\x1b[0m");

    process.stdout.write(toWrite);

    if(viewTextBox)
    process.stdout.write("> \x1b[35m"+text);
}


/**
 * formats an error to allow the stack view
 * @param error some kind of error
 * @returns the formated string
 */
const formatError = (error: any): string => {
    return typeof error === "object" && Object.hasOwn(error, "stack") ? error.stack : error;
}


/**
 * logs an error if the provided condition was not met. Nothing happens if it wasn't
 * It uses logType.ERROR
 * @param condition the condition
 * @param message the message to print
 * @param who the executioner (for the logs). Defaults to "core"
 */
function assertConsole(condition: boolean, message: string, who: string = "core"){
    if(!condition) log(LogType.ERROR, message, who)
}

/**
 * clears the console. Equivalent to vannilia JS console.clear()
 */
function clearConsole(){
    process.stdout.cursorTo(0,0);
    process.stdout.clearScreenDown();

    if(viewTextBox){
        process.stdout.write("> \x1b[35m"+text);
    }
}

/**
 * stores the counters
 */
const counterTable: Record<string, number> = {

};

/**
 * counts the counter
 * @param name the name of the counter
 * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
 * @param increaseBy the increment value. Defaults to 1
 * @param who the executioner (for the logs). Defaults to "core"
 * @returns the current name on the counter.
 */
function counterCount(name: string, startFrom: number = 1, increaseBy: number = 1, who?: string): number{
    if(!Object.hasOwn(counterTable, name)){
        counterTable[name] = startFrom;
    }
    else{
        counterTable[name] += increaseBy;
    }

    log(LogType.COUNTER, `${name}: ${ counterTable[name]}`, who);

    return counterTable[name];
}


/**
 * removes (resets) the couter
 * @param name the counter name
 */
function counterCountReset(name: string){
    if(Object.hasOwn(counterTable, name)){
        delete counterTable[name];
    }
}

/**
 * returns the number register on the counter
 * @param name the name of the counter
 * @returns undefined if doesnt exist or the number if exist
 */
function getCounter(name: string): undefined | number{
    return counterTable[name] ? counterTable[name] : undefined;
}


/**
 * writes a raw text to the console. Equivalent to process.stdout.write()
 * @param text the raw text
 */
function consoleWrite(textToWrite: string, WithColor: consoleColors = consoleColors.Reset, writeToFile: boolean = true){
    if(viewTextBox){
        process.stdout.clearLine(0);
        process.stdout.write("\r");
    }

    process.stdout.write(WithColor+textToWrite+"\x1b[0m");
    if(writeToFile) appendFileSync(finalLatest, textToWrite);

    if(viewTextBox){
        process.stdout.write("\x1b[0m> \x1b[35m"+text);
    }
}

/**
 * colors
 */
enum consoleColors{
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",
    
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    FgGray = "\x1b[90m",
    
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
    BgGray = "\x1b[100m",
}

/**
 * function to use to block incoming logs
 * @param status allows you to block incoming logs. Defaults to undefined, which does nothing
 * @returns current status
 */
function blockLogs(status?: boolean): boolean{
    if(typeof status === "boolean") blockLogsVar = status;

    return blockLogsVar;
}

/**
 * function to use to hide textbox to write texts
 * @param status allows to change the status
 * @returns current status
 */
function textboxVisibility(status?: boolean): boolean{
    if(typeof status === "boolean") viewTextBox = status;

    return viewTextBox;
}

/**
 * Simple interface for the fast use of console utilities
 */
const newConsole = {
    log: (...messages: string[]) => log(LogType.INFO, messages.join(" ")),
    debug: (...messages: string[]) => log(LogType.INFO, messages.join(" ")),
    formatError,
    commandInterface,
    commands: commandInterface,
    LogType,
    logThis: log,
    print: log,
    write: consoleWrite,
    writeRaw: consoleWrite,
    info: (message: string, who: string = "core") => log(LogType.INFO, message, who),
    error: (message: string, who: string = "core") => log(LogType.ERROR, message, who),
    crash: (message: string, who: string = "core") => log(LogType.CRASH, message, who),
    warn: (message: string, who: string = "core") => log(LogType.WARNING, message, who),
    warning: (message: string, who: string = "core") => log(LogType.WARNING, message, who),
    init: (message: string, who: string = "core") => log(LogType.INIT, message, who),
    success: (message: string, who: string = "core") => log(LogType.SUCCESS, message, who),
    assert: assertConsole,
    clear: clearConsole,
    counters: counterTable,
    count: counterCount,
    countReset: counterCountReset,
    getCounter,
    colors: consoleColors,
    blockLogs,
    textboxVisibility

}   



// exports
export {LogType, log, formatError,
    clearConsole, consoleWrite, assertConsole,  consoleColors,
    blockLogs,
    registerCommand, removeCommand, commandList, isCommandRegistered,
    counterCount, counterCountReset,
    newConsole as console,
    newConsole,
    blankCallback, logSystemError, commands
}
