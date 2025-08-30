// LOG SYSTEM
// created by naticzka ;3
// github: https://github.com/itsmenatika/jslogsystem
// version: 1.1

import { BlobOptions } from "node:buffer";
import { ChildProcess, exec, execSync, fork, spawn, spawnSync } from "node:child_process";
import { appendFileSync, createReadStream, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import os, { version } from "node:os";
import { join, resolve } from "node:path";
import { cwd } from "node:process";

// CONFIG
// USE JOIN for paths
const LOGDIRECTORY: string = join("dev", "logs");
const LATESTLOGNAME: string = "latest.txt";

// TO EDIT COLORS SEARCH FOR consoleColorTable!

// callback to write information on the "ver" command
let getversionInfoData = (): string => {
    return "";
}

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

let commandHistory: string[] = [];
let indexCommandHistory: null | number = null;
const logSystemVer: string = "1.1"; // current version of the log system
const currentUpTime = Date.now();


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

// relative cursor change
let relativePos: number = 0;

const allowedKeysToWrite: string = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]" + " " + "!@#$%^&*=~`'";

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
            textboxVisibility(false);
            actualCrash("The execution was manually stopped by CTRL + C!", "core", -1);
            // process.exit();
        }

        // reappearing of the textbox
        if(!viewTextBox){
            viewTextBox = true;
            process.stdout.write("\x1b[0m> \x1b[35m");
        }

 
        // backspace
        if(key.includes("\b")){
            if(relativePos !== 0){
                if(relativePos * -1 >= text.length) return;
                text = text.slice(0, text.length + relativePos - 1) + text.slice(text.length + relativePos , text.length);


                hideCursor();
                process.stdout.clearLine(0);
                process.stdout.write("\r");
                printViewTextbox();
                process.stdout.moveCursor(relativePos, 0);
                showCursor();


                return;
            }

            if(text.length > 0){
                process.stdout.write("\b \b"); 
            }
            text = text.slice(0, -1);
        }
        // enter
        else if(key.includes("\r")){
            relativePos = 0;

            indexCommandHistory = null;
            process.stdout.write("\n");
            appendFileSync(finalLatest, "> "+text+"\n");
            let tempText: string = text;
            text = "";
            process.stdout.write("\x1b[0m");
			handleEnter(tempText)
            // if(!handleEnter(tempText) && viewTextBox){
                // process.stdout.write("> \x1b[35m");
            // }
        }

        // up key
        else if (key == '\u001B\u005B\u0041') {
            relativePos = 0;

            if(indexCommandHistory === null){
                indexCommandHistory = commandHistory.length - 1;
            }
            else{
                indexCommandHistory--;
                if(indexCommandHistory < 0) indexCommandHistory = 0;
            }
            text = commandHistory[indexCommandHistory];
            hideCursor();
            process.stdout.clearLine(0);
            process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
            showCursor();
        }

        // down
        else if (key == '\u001B\u005B\u0042') {
            relativePos = 0;

            if(indexCommandHistory !== null){
                indexCommandHistory++;
                if(indexCommandHistory >= commandHistory.length) 
                    indexCommandHistory = null;


                if(indexCommandHistory !== null)
                    text = commandHistory[indexCommandHistory];
                else
                    text = ""
                
                hideCursor();
                process.stdout.clearLine(0);
                process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
                showCursor();

            }
        }
        // left
        else if(key === '\u001B\u005B\u0044'){
            if(relativePos * -1 >= text.length) return;

            process.stdout.moveCursor(-1, 0);
            relativePos--;
        }

        // right
        else if(key === '\u001B\u005B\u0043'){
            if(relativePos >= 0) return;

            process.stdout.moveCursor(1, 0);
            relativePos++;
        }
        
        // adding keys
        else if(allowedKeysToWrite.includes(key)){
            if(relativePos !== 0){
                text = text.slice(0, relativePos) + key + text.slice(relativePos);
                hideCursor();
                process.stdout.write("\r");
                printViewTextbox();
                process.stdout.moveCursor(relativePos, 0);
                showCursor();

                return;
            }

            text += key;
            process.stdout.write(key); 
        }



    }
}
);

function hideCursor(){
    process.stdout.write("\x1b[?25l");
}

function showCursor(){
    process.stdout.write("\x1b[?25h");
}

// type for typescript
type cmdcallback = (args: string[]) => boolean;

/**
 * blank callback, that can be used for testing purposes
 */
const blankCallback = (args: string[]) => false;

interface commandData{
    "usageinfo"?: string
    "desc"?: string,
    "longdesc"?: string,
    "hidden"?: boolean,
    "changeable"?: boolean,
    "isAlias"?: boolean,
    "aliasName"?: string,
    "callback"?: cmdcallback
}

// interface commandData extends commandDataSeter{
//     "usageinfo": string
//     "desc": string,
//     "longdesc": string,
//     "hidden": boolean,
//     "changeable": boolean,
//     "isAlias": boolean,
//     "aliasName"?: string,
//     "callback": cmdcallback
// }

// the list of commands
let commands: Record<string, commandData> = {
    exit: {
        usageinfo: "exit <exit code...>",
        desc: "allows you to stop the process",
        longdesc: "It will execute process.exit(exitcode) that will cause the whole process to cease to exist. Your work may be lost. But sometimes it's the only easy way to close your program. If you want to safe close, consider using safeexit/sexit (though it requires setting the handler by the app before!).",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let exitCode = args.slice(1).join(" ").trim() !== "" ? args.slice(1).join(" ").trim() : 0;
            // log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: "+ exitCode);
            // process.stdout.write("\x1b[0m");
            // process.exit(exitCode);
            textboxVisibility(false);
            actualCrash("The execution was manually stopped by EXIT COMMAND with code: "+ exitCode, "core", -1);
            return false;
        }
    },
    crash: {
        isAlias: true,
        aliasName: "exit",
        hidden: true,
        changeable: false
    },
    clear: {
        usageinfo: "clear",
        desc: "clears the whole screen",
        longdesc: "It clears the whole screen using clearConsole(). Aliases: cls",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            clearConsole();
            return true;
        }
    },
    cls: {
        isAlias: true,
        aliasName: "clear",
        hidden: true,
        changeable: false
    },
    echo: {
        usageinfo: "echo",
        desc: "allows you to print on the screen",
        longdesc: "It clears the whole screen using clearConsole()",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let theString: string = args.slice(1).join(" ");

            consoleWrite(theString + "\n", consoleColors.FgWhite);

            return false;
        }        
    },
    ech: {
        isAlias: true,
        aliasName: "clear",
        hidden: true,
        changeable: false
    },
    hide: {
        usageinfo: "hide",
        desc: "hides the textbox that allows you to write",
        longdesc: "hides the textbox that is used to write. It will appear again when you start typing.",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            consoleWrite("The textbox was hidden. Start writting to make it appear again!\n");
            textboxVisibility(false);
            return false;
        }                
    },
    h: {
        isAlias: true,
        aliasName: "hide",
        hidden: true,
        changeable: false
    },
    eval: {
        usageinfo: "eval <code...>",
        desc: "allows you to execute javascript",
        longdesc: "it executes javascript using globalEval which means that the context is global",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let code = args.slice(1).join(" ").trim();
            let evalParent = new logNode("eval");
            // @ts-ignore
            newConsole.useWith("using eval", () => {
                let g = globalEval(code);
                log(LogType.INFO, `eval returned with: ${g}`, evalParent);
            }, evalParent as any as string);

            return false;
            // }
        }                
    },
    e: {
        isAlias: true,
        aliasName: "eval",
        hidden: true,
        changeable: false
    },    
    //         let code = parts.slice(1).join(" ").trim();
    //         let evalParent = new logNode("eval");
    //         // @ts-ignore
    //         newConsole.useWith("using eval", () => {
    //             let g = globalEval(code);
    //             log(LogType.INFO, `eval returned with: ${g}`, evalParent);
    //         }, evalParent as any as string);
    //         // }
    //         break;
    //     case "ver":
    //     case "version": 
    //         let prev = textboxVisibility();
    //         textboxVisibility(false);
    //         consoleWrite("logSystemVer: ");
    //         consoleWrite(logSystemVer, consoleColors.BgCyan);
    //         consoleWrite("\n");
    //         consoleWrite(getversionInfoData(), consoleColors.BgGray);
    //         consoleWrite("\n");
    //         textboxVisibility(prev);
    //         break;
        

    //     case "cmd":
    //     case "c":
    //         let codeC = parts.slice(1).join(" ").trim();
    //         let evalParentC = new logNode("cmd");
    //         // @ts-ignore
    //         newConsole.useWith("using cmd", () => {
    //             let g = execSync(codeC);
    //             log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
    //         }, evalParentC as any as string);
    //         break;

    //     case "reload":
    //     case "r":
    //         log(LogType.INFO, "restarting the process...");
    //         processRestart();
    //         break;


    //     case "uptime":
    //         let current = Date.now() - currentUpTime;
    //         let mili = current % 1000;
    //         let seconds = Math.floor((current / 1000) % 60);
    //         let minutes = Math.floor((current / 1000 / 60) % 60);
    //         let hours = Math.floor((current / 1000 / 60 / 60) % 24);
    //         let days = Math.floor((current / 1000 / 60 / 60 / 24));

    //         newConsole.log(`current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}m (exmili: ${current})`);
    //         break;
    version: {
        usageinfo: "version",
        desc: "shows the version information",
        longdesc: "it shows the current version information",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let prev = textboxVisibility();
            textboxVisibility(false);
            consoleWrite("logSystemVer: ");
            consoleWrite(logSystemVer, consoleColors.BgCyan);
            consoleWrite(" by naticzka", [consoleColors.FgMagenta, consoleColors.Blink])
            consoleWrite("\n");
            consoleWrite(getversionInfoData(), consoleColors.BgGray);
            consoleWrite("\n");
            textboxVisibility(prev);
            return false;
            // }
        }                
    },
    "ver": {
        isAlias: true,
        aliasName: "version",
        hidden: true,
        changeable: false
    },
    "cmd": {
        usageinfo: "cmd <code...>",
        desc: "executes system commands",
        longdesc: "It allows you to execute system command using execSync()",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let codeC = args.slice(1).join(" ").trim();
            let evalParentC = new logNode("cmd");
            // @ts-ignore
            newConsole.useWith("using cmd", () => {
                let g = execSync(codeC);
                log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
            }, evalParentC as any as string);
            return false;

            // }
        }                
    },
    "cmd.exe": {
        isAlias: true,
        aliasName: "cmd",
        hidden: true,
        changeable: false
    },
    "sys": {
        isAlias: true,
        aliasName: "cmd",
        hidden: true,
        changeable: false
    },
    "uptime": {
        usageinfo: "uptime",
        desc: "shows the time since the program start",
        longdesc: "shows the time since the program start",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let current = Date.now() - currentUpTime;
            let mili = current % 1000;
            let seconds = Math.floor((current / 1000) % 60);
            let minutes = Math.floor((current / 1000 / 60) % 60);
            let hours = Math.floor((current / 1000 / 60 / 60) % 24);
            let days = Math.floor((current / 1000 / 60 / 60 / 24));

            newConsole.log(`current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}ms (exmili: ${current})`);
            return false;

            // }
        }                
    },
    "reload": {
        usageinfo: "reload",
        desc: "restarts the process (It doesnt work properly)",
        longdesc: `restarts the process (It doesnt work properly) using processRestart() (fork(join(__dirname, __filename), {stdio: "overlapped"});)`,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            log(LogType.INFO, "restarting the process...");
            processRestart();
            return false;

            // }
        }                
    },
    "r": {
        isAlias: true,
        aliasName: "reload",
        hidden: true,
        changeable: false
    },
    "up": {
        isAlias: true,
        aliasName: "uptime",
        hidden: true,
    },
    "upt": {
        isAlias: true,
        aliasName: "help",
        hidden: true,
        changeable: false
    },
    "meow": {
        usageinfo: "meow <?>",
        desc: "meows",
        longdesc: `it really just meows~~`,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let g = new multiDisplayer();

            g.push("  /\\_/\\  (\n");
            g.push(" ( ^.^ ) _)\n");
            g.push("   \\\"/  (        ");
            g.push("MEOW!\n", consoleColors.Blink);
            g.push(" ( | | )\n");
            g.push("(__d b__)\n");

            g.useConsoleWrite();

            return false;

            // }
        }                
    },    
    "meow~": {
        isAlias: true,
        aliasName: "meow",
        hidden: true,
        changeable: false
    },
    "miau~": {
        isAlias: true,
        aliasName: "meow",
        hidden: true,
        changeable: false
    },
    "miau": {
        isAlias: true,
        aliasName: "meow",
        hidden: true,
        changeable: false
    },
    "?": {
        isAlias: true,
        aliasName: "help",
        hidden: true,
        changeable: false
    },
    help: {
        usageinfo: "help [<about>]",
        desc: "shows the list of commands or describes the command usage",
        longdesc: "Provides the long description and command usage of provided command and if not specified shows the list of commands.",
        hidden: false,
        changeable: false,
        callback: (args: string[]): boolean => {
            // if there was no arguments (the first is called command name)
            if(args.length === 1){

                let toDisplay: string[] = [];
                let colors: consoleColor[] = [];

                for(let [commandName, commandData] of Object.entries(commands)){
                    if(commandData.hidden) continue;
                    
                    toDisplay.push("* "); colors.push(consoleColors.FgYellow);
                    toDisplay.push(commandName); colors.push(consoleColors.FgWhite);
                    toDisplay.push(" -> "); colors.push(consoleColors.FgMagenta);
                    toDisplay.push(commandData.desc + "\n"); colors.push(consoleColors.FgWhite);
                }


                consoleMultiWrite(toDisplay, colors);
            }

            else if(args.length == 2){
                let forMulti = new multiDisplayer();



                if(!(args[1] in commands)){
                    forMulti.push("There's no reference to ", consoleColors.FgRed);
                    forMulti.push(args[1], consoleColors.FgYellow);
                    forMulti.push(" in any list!\n", consoleColors.FgRed);
                }
                else{
                    let cmd = commands[args[1]];

                    let cmdTouse;
                    if(cmd.isAlias){
                        cmdTouse = commands[cmd.aliasName as string];
                    }
                    else cmdTouse = cmd;


                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n");

                    // const commandData = commands[args[1]];

                    forMulti.push(" " + cmdTouse.usageinfo + "\n\n", consoleColors.FgCyan);

                    forMulti.push("hidden: ", consoleColors.FgGray);
                    forMulti.push(String(cmdTouse.hidden) + "\n", consoleColors.FgWhite);

                    forMulti.push("changable: ", consoleColors.FgGray);
                    forMulti.push(String(cmdTouse.changeable) + "\n", consoleColors.FgWhite);

                    forMulti.push("short desc: ", consoleColors.FgGray);
                    forMulti.push(cmdTouse.desc + "\n", consoleColors.FgWhite);

                    forMulti.push("long desc: ", consoleColors.FgGray);
                    forMulti.push(cmdTouse.longdesc + "\n", consoleColors.FgWhite);

                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n")
                }

                forMulti.useConsoleWrite();

                
            }


            return false;

        }
    }
}
// let commands: Record<string, [cmdcallback, string, string, string]> = {
//     exit: [blankCallback, 
//         "exit <exit code>", 
//         "allows you to stop the process", 
//         "allows you to stop the process"],
//     info: [blankCallback, 
//         "info", 
//         "shows the information about the process", 
//         "shows the information about the process"],
//     cls: [blankCallback, 
//         "cls", 
//         "clears the console", 
//         "clears the console"],
//     hide: [blankCallback, 
//         "hide", 
//         "hides the textbox", 
//         "hides the textbox"],
//     eval: [blankCallback,
//         "eval",
//         "evaluates a javascript code",
//         "evaluates a javascript code"
//     ],
//     version: [blankCallback,
//         "version",
//         "shows version",
//         "shows version"
//     ],
//     cmd: [blankCallback,
//         "cmd",
//         "allows you to use cmd",
//         "allows you to use cmd"
//     ],
//     uptime: [blankCallback,
//         "uptime",
//         "allows you to see current uptime",
//         "allows you to see current uptime"
//     ]
// }

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
function registerCommand(name: string, data: commandData) {
    if(Object.hasOwn(commands, name)){
        throw new logSystemError(`The command '${name}' does exist!`)
    }

    if(!data.isAlias && !data.callback){
        throw new logSystemError("The callback must be set for no alias.")
    }

    if(data.isAlias){
        commands[name] = {
            usageinfo: undefined,
            desc: undefined,
            longdesc: undefined,
            hidden: typeof data.hidden === "boolean" ? data.hidden : true,
            changeable: typeof data.changeable === "boolean" ? data.changeable : true,
            isAlias: true,
            callback: undefined
        }

        return;
    }

    commands[name] = {
        usageinfo: data.usageinfo ? data.usageinfo : `${name} [<arguments...>] ~(usage not specified)`,
        desc: data.desc ? data.desc : "no description",
        longdesc: data.longdesc ? data.longdesc : "no long description",
        hidden: typeof data.hidden === "boolean" ? data.hidden : false,
        changeable: typeof data.changeable === "boolean" ? data.changeable : true,
        isAlias: false,
        callback: data.callback
    };

    // commands[name] = [
    //     callback, usage, desc, longdesc
    // ];
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
    log(LogType.INFO, `This command has been executed: '${text}'`, "console");

    if(commandHistory.length > 50) 
        commandHistory = commandHistory.slice(commandHistory.length - 50, commandHistory.length);
    commandHistory.push(text);

    let parts = text.split(" ");

    if(Object.hasOwn(commands, parts[0])){
        try {
            const cmdData = commands[parts[0]];

            if(cmdData.isAlias){
                const orginalCmd = commands[cmdData.aliasName as string];

                if(!orginalCmd){
                    throw new logSystemError("invalid alias");
                }

                return (orginalCmd.callback as cmdcallback)(parts);
            }
            else{
                return (cmdData.callback as cmdcallback)(parts);
            }


            // return commands[parts[0]].callback(parts);
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the command execution:\n" + formatError(error), "console");
            return false;
        }
    }
    else{
        log(LogType.ERROR, "unknown command", "console");
        return true;  
    }

    // switch(parts[0]){
    //     case "?":
    //     case "help": 
    //         let helps: string = "";
            
    //         for(let cmd of newConsole.commandInterface.commandList()){
    //             helps += ` * ${cmd} -> ${commands[cmd][2]}\n`
    //         }

    //         consoleWrite(`------\nCommands:\n\n`+ helps+"\n");
    //         break;

    //     case "exit": {
    //         let exitCode = parts.slice(1).join(" ").trim() !== "" ? parts.slice(1).join(" ").trim() : 0;
    //         // log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: "+ exitCode);
    //         // process.stdout.write("\x1b[0m");
    //         // process.exit(exitCode);
    //         textboxVisibility(false);
    //         actualCrash("The execution was manually stopped by EXIT COMMAND with code: "+ exitCode, "core", -1);
    //         return false;
    //     }
    //     case "cls":
    //     case "clear":
    //         clearConsole();
    //         return true;

    //     case "h":
    //     case "hide":
    //         consoleWrite("The textbox was hidden. Start writting to make it appear again!\n");
    //         textboxVisibility(false);
    //         return false;
    //     case "info": {
    //         let mus = process.memoryUsage();

    //         consoleWrite(`------\nprocess info:\n\n`+
    //             `\tarchitecture: ${os.arch}\n`+
    //             `\thost name: ${os.hostname}\n`+
    //             `\tplatform: ${os.platform}\n`+
    //             `\tkernel version: ${os.version}\n`+
    //             `\tprocess priority: ${os.getPriority()}\n`+
    //             `\tmachine: ${os.machine}\n`+
    //             `\tcwd: ${process.cwd()}\n`+
    //             `\theap total: ${Math.round(mus.heapTotal/100000)/10}mb\n`+
    //             `\theap used: ${Math.round(mus.heapUsed/100000)/10}mb\n`+
    //             `\tcpu usage (1m, 5m, 15m): ${os.loadavg().map(num => `${num * 100}%`)}\n`);

            

    //         break;
    //     }

    //     case "e":
    //     case "eval": 
    //         let code = parts.slice(1).join(" ").trim();
    //         let evalParent = new logNode("eval");
    //         // @ts-ignore
    //         newConsole.useWith("using eval", () => {
    //             let g = globalEval(code);
    //             log(LogType.INFO, `eval returned with: ${g}`, evalParent);
    //         }, evalParent as any as string);
    //         // }
    //         break;
        

    //     case "ver":
    //     case "version": 
    //         let prev = textboxVisibility();
    //         textboxVisibility(false);
    //         consoleWrite("logSystemVer: ");
    //         consoleWrite(logSystemVer, consoleColors.BgCyan);
    //         consoleWrite("\n");
    //         consoleWrite(getversionInfoData(), consoleColors.BgGray);
    //         consoleWrite("\n");
    //         textboxVisibility(prev);
    //         break;
        

    //     case "cmd":
    //     case "c":
    //         let codeC = parts.slice(1).join(" ").trim();
    //         let evalParentC = new logNode("cmd");
    //         // @ts-ignore
    //         newConsole.useWith("using cmd", () => {
    //             let g = execSync(codeC);
    //             log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
    //         }, evalParentC as any as string);
    //         break;

    //     case "reload":
    //     case "r":
    //         log(LogType.INFO, "restarting the process...");
    //         processRestart();
    //         break;


    //     case "uptime":
    //         let current = Date.now() - currentUpTime;
    //         let mili = current % 1000;
    //         let seconds = Math.floor((current / 1000) % 60);
    //         let minutes = Math.floor((current / 1000 / 60) % 60);
    //         let hours = Math.floor((current / 1000 / 60 / 60) % 24);
    //         let days = Math.floor((current / 1000 / 60 / 60 / 24));

    //         newConsole.log(`current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}m (exmili: ${current})`);
    //         break;

    //     default: {
    //         if(Object.hasOwn(commands, parts[0])){
    //             return commands[parts[0]][0](parts);
    //         }
    //         else{
    //             log(LogType.ERROR, "unknown command", "console");
    //             return true;  
    //         }
    //     }
    // }
}


/**
 * allows you to run eval on global context
 * @param code the code to be run
 * @returns 
 */
function globalEval(code: string){
    return globalThis.eval.apply(globalThis, [code]);
}


/**
 * converts a provided logType to the belonging logType string
 * @param type logType
 * @returns string of that logtype
 */
function resolveLogType(type: LogType): string {
    switch(type){
        case LogType.SUCCESS:
            return "SUCCESS";
        case LogType.ERROR:
            return "ERROR";
        case LogType.INFO:
            return "INFO";
        case LogType.WARNING:
            return "WARNING";
        case LogType.COUNTER: 
            return "COUNTER";
        case LogType.INIT:
            return "INIT";
        case LogType.CRASH:
            return "CRASH";
        default: return "UNKNOWN";
    }
}

/**
 * converts a provided logType to the belonging logType color
 * @param type logType
 * @returns color
 */
function resolveLogColor(type: LogType): consoleColor {
    switch(type){
        case LogType.SUCCESS:
            return colorTable.success;
        case LogType.ERROR:
            return colorTable.error;
        case LogType.INFO:
            return colorTable.info;
        case LogType.WARNING:
            return colorTable.warning;
        case LogType.COUNTER: 
            return colorTable.counter;
        case LogType.INIT:
            return colorTable.init;
        case LogType.CRASH:
            return colorTable.crash;
        default: return consoleColors.Reset;
    }
}

/**
 * allows you to write raw logs
 * @param type the type of the log
 * @param message the message
 * @param who the executioner (for the logs). Defaults to "core"
 */
function log(type: LogType, message: string, who: string | logNode = "core") {
    if(blockLogsVar) return;

    // if that's the parentNode, then get its string
    if(typeof who === "object") who = who.toString();
    
    

    const currentDate: Date = new Date();
    const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;

    const logTypeString: string = resolveLogType(type);
    const logColor: consoleColor = resolveLogColor(type);
    
    const toWrite: string = `${formattedDate} ${logTypeString} ${who}: ${message}\n`;
    const toDisplay: string = `${colorTable.date}${formattedDate}${consoleColors.Reset} ${logTypeString} ${colorTable.who}${who}${consoleColors.Reset}: ${logColor}${message}${consoleColors.Reset}\n`;

    if(viewTextBox){
        process.stdout.clearLine(0);
        process.stdout.write(consoleColors.Reset + "\r");
    }

    process.stdout.write(toDisplay);

    appendFileSync(finalLatest, toWrite);

    if(viewTextBox)
        process.stdout.write("\r\x1b[0m> \x1b[35m"+text);


    // const printWho = `${consoleColors.FgMagenta}${who}`;
    // switch(type){
    //     case LogType.INFO: {
    //         toWrite = `${formattedDate} INFO ${printWho}${consoleColors.Reset}: ${message}\n`;
    //         break;
    //     }
    //     case LogType.ERROR: {
    //         toWrite = `${formattedDate} ERROR ${printWho}${consoleColors.Reset}: ${consoleColors.FgRed}${message}\n`;
    //         break;
    //     }
    //     case LogType.SUCCESS: {
    //         toWrite = `${formattedDate} SUCCESS ${printWho}${consoleColors.Reset}: ${consoleColors.FgGreen}${message}\n`;
    //         break;
    //     }
    //     case LogType.INIT: {
    //         toWrite = `${formattedDate} INIT ${printWho}${consoleColors.Reset}: ${message}\n`;
    //         break;
    //     }
    //     case LogType.WARNING: {
    //         toWrite = `${formattedDate} WARNING ${printWho}${consoleColors.Reset}: ${consoleColors.FgYellow}${message}\n`;
    //         break;
    //     }
    //     case LogType.CRASH: {
    //         toWrite = `${formattedDate} CRASH ${printWho}${consoleColors.Reset}: ${consoleColors.FgRed}${message}\n`;
    //         break;
    //     }
	// 	case LogType.COUNTER: {
    //         toWrite = `${formattedDate} COUNTER ${printWho}${consoleColors.Reset}: ${message}\n`;
    //         break;
    //     }
    //     default: {
    //         throw new logSystemError("???");
    //     }
    // }

    // appendFileSync(finalLatest, toWrite);


    // if(blockLogsVar) return;



    // process.stdout.clearLine(0);
    // process.stdout.write("\r\x1b[0m");

    // process.stdout.write(toWrite);

    // if(viewTextBox)
    // process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
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
        process.stdout.write("\x1b[0m> \x1b[35m"+text);
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

    log(LogType.COUNTER, `${name} -> ${ counterTable[name]}`, who);

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


function printViewTextbox(){
    process.stdout.write("\x1b[0m> \x1b[35m"+text);
}

/**
 * writes a raw text to the console. Equivalent to process.stdout.write()
 * @param text the raw text
 */
function consoleWrite(textToWrite: string, WithColor: consoleColors | consoleColors[] = consoleColors.Reset, writeToFile: boolean = true){
    if(Array.isArray(WithColor)) WithColor = WithColor.reduce((prev, next) => (prev+next) as consoleColors) as any as consoleColors;

    if(viewTextBox){
        process.stdout.clearLine(0);
        process.stdout.write("\r");
    }

    process.stdout.write(WithColor+textToWrite+"\x1b[0m");

    if(writeToFile) appendFileSync(finalLatest, textToWrite);

    if(viewTextBox){printViewTextbox()}
}

// TODO
function consoleMultiWrite(texts: string[], colors: Array<consoleColors | consoleColorsMulti>, writeToFile: boolean = true){
    if(texts.length !== colors.length){
        throw new logSystemError("Text array length and colors array length dont match!");
    }


    let toWrite: string = "";
    let toDisplay: string = "";

    for(let index in texts){
        toWrite += texts[index];
        toDisplay += colors[index] + texts[index] + consoleColors.Reset;
    }


    if(viewTextBox){
        process.stdout.clearLine(0);
        process.stdout.write("\r");
        process.stdout.write(consoleColors.Reset);
    }

    process.stdout.write(toDisplay);
    
    if(writeToFile) appendFileSync(finalLatest, toWrite);

    if(viewTextBox){printViewTextbox()}
}

class multiDisplayer{
    private texts: string[] = [];
    private colors: Array<consoleColor | consoleColorsMulti> = [];
    constructor(){}

    push(text: string, colors?: consoleColor | consoleColorsMulti){
        this.texts.push(text);
        
        if(colors)
            this.colors.push(colors);
        else
            this.colors.push("");
    }

    pop(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
        return [this.texts.pop(), this.colors.pop()];
    }

    useConsoleWrite(writeToFile: boolean = true, clearObj: boolean = true){
        consoleMultiWrite(this.texts, this.colors, writeToFile);

        if(clearObj){
            this.texts = [];
            this.colors = [];
        }
    }

    clear(){
        this.texts = [];
        this.colors = [];
    }
}

type consoleColor = string;
type consoleColorsMulti = string;

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

let colorTable: Record<string, consoleColor> = {


    "info": consoleColors.FgWhite,
    "warning": consoleColors.FgYellow,
    "error": consoleColors.FgRed,
    "success": consoleColors.FgGreen,
    "counter": consoleColors.FgCyan,
    "init": consoleColors.FgWhite,
    "crash": consoleColors.FgRed,

    "date": consoleColors.FgGray,
    "who": consoleColors.FgMagenta

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
	
	if(status === false){
		process.stdout.clearLine(0);
        process.stdout.write("\r");
	}
	else{
		process.stdout.write("\x1b[0m> \x1b[35m"+text);
	}

    return viewTextBox;
}

/**
 * returns unified formated error
 * @param taskName the name of the task
 * @param error the error
 * @returns `The error with the task: '${taskName}'. The error message:\n${formatError(error)}\n`
 */
function formatTaskError(taskName: string, error: any): string{
    return `The error with the task: '${taskName}'. The error message:\n${formatError(error)}\n`;
}

/**
 * allows you to easily use log without retypping task info
 * 
 * example:
 * useWith("bulding core data...", () => {
 *     let s = connectToApi();
 *     s.build();
 * }, "userAccounter")
 * 
 * @param message the task description
 * @param func function that runs task (it will invoke it without any parameters)
 * @param who who is responsible
 */
function useWith(message: string, func: CallableFunction, who: string | logNode = "core"){
    log(LogType.INFO, message, who);
    try {
        func();
        log(LogType.SUCCESS, message, who);
    } catch (error) {
        log(LogType.ERROR, formatTaskError(message, error), who);
    }
}


/**
 * class used to tell the localisation of logs. That is an optional class
 * You can still pass strings instead of that!
 */
class logNode{
    // the name of that log
    name: string;

    // the parent of that parent
    private parent?: logNode;

    /**
     * 
     * @param name the name of the nod
     * @param parent the parent (optional)
     */
    constructor(name: string, parent?: logNode){
        this.name = name;
        this.parent;
    }

    /**
     * gets the node parent
     * @returns parent or undefined if no parent is present
     */
    getParent(): undefined | logNode{
        return this.parent;
    }

    /**
     * returns the formatted string using fast algorithm
     * @returns formatted string
     */
    toString(): string {
        let toReturn = ""; // create a string

        let parent: logNode | undefined = this as logNode; // get parent

        // loop till there's no more
        while(true){

            // if no parent, then return
            if(!parent){
                // toReturn = "core" + "." + toReturn;
                break;
            }

            // add parent name
            toReturn = parent.name + "." + toReturn;

            // get the next parent
            parent = parent.getParent();
        }


        // return without the last dot
        return toReturn.slice(0, toReturn.length - 1);
    }
}


/**
 * crash the program (not only the message like newConsole.crash())
 * @param message meessage
 * @param who by who
 * @param exitCode exit code
 */
function actualCrash(message: string, who?: string, exitCode?: any){
    newConsole.crash(message, who);
    process.exit(exitCode);
}

/**
 * set information displayed at versionInfo
 * @param callback versionInfoData
 * @returns versionInfoData
 */
function versionInfo(callback?: () => string): string {
    if(callback !== undefined) getversionInfoData = callback;

    return getversionInfoData();
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
    info: (message: string, who: string | logNode = "core") => log(LogType.INFO, message, who),
    error: (message: string, who: string | logNode = "core") => log(LogType.ERROR, message, who),
    crash: (message: string, who: string | logNode = "core") => log(LogType.CRASH, message, who),
    warn: (message: string, who: string | logNode = "core") => log(LogType.WARNING, message, who),
    warning: (message: string, who: string | logNode = "core") => log(LogType.WARNING, message, who),
    init: (message: string, who: string | logNode = "core") => log(LogType.INIT, message, who),
    success: (message: string, who: string | logNode = "core") => log(LogType.SUCCESS, message, who),
    assert: assertConsole,
    clear: clearConsole,
    counters: counterTable,
    count: counterCount,
    countReset: counterCountReset,
    getCounter,
    colors: consoleColors,
    blockLogs,
    textboxVisibility,
    useWith,
    formatTaskError,
    actualCrash,
    ace: actualCrash,
    acrash: actualCrash,
    versionInfo,
    showCursor,
    hideCursor,

}   


process.addListener("exit", () => {
    viewTextBox = false;
    consoleWrite("", consoleColors.Reset, false);
});

process.addListener("uncaughtException", (err) => {
    newConsole.crash("process uncaughtException: " + formatError(err));
    process.exit(-1);
});

process.addListener("message", (message: unknown) => {
    newConsole.log("The main process has received a message: " + message);
});

process.addListener("warning", (warn: unknown) => {
    newConsole.warn("process warning: " + formatError(warn));
    process.exit(-1);
});

/**
 * allows you to replace old console with fairly new
 */
function replaceConsole(){
    Object.assign(globalThis, {console: newConsole, orginalConsole: globalThis.console});
}


/**
 * allows you to create a fake loop to keep the process alive. It was used mostly for testing
 */
function keepProcessAlive(){
    (async () => {
        while(true){
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
    })();
}


/**
 * in theory it should allow you to restart the current process
 * 
 * But i couldn't get it into forking
 * 
 * TODO
 */
function processRestart(){
    newConsole.warn("It may not work!");
    fork(join(__dirname, __filename), {stdio: "overlapped"});
    process.kill(0);
//  const subprocess = spawn(process.argv[0], process.argv.slice(1), {detached: true, stdio: "inherit"});

//     subprocess.unref();
//     process.exit(0);

}

// exports
export {LogType, log, formatError,
    clearConsole, consoleWrite, assertConsole,  consoleColors,
    blockLogs,
    registerCommand, removeCommand, commandList, isCommandRegistered,
    counterCount, counterCountReset,
    newConsole as console,
    newConsole,
    blankCallback, logSystemError, commands,
    useWith, useWith as uw,
    formatTaskError as fte, formatTaskError,
    logNode,
    actualCrash,
    globalEval,
    replaceConsole,
    keepProcessAlive,
    showCursor,
    hideCursor,
    consoleColorsMulti,
    consoleColor,
    consoleMultiWrite,
    multiDisplayer
}
