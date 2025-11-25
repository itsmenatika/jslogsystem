// OLD VERSION REFERENCE FOR ADDING COMPATIBILITY. IT SHOULD NOT BE USED!


// LOG SYSTEM
// created by naticzka ;3
// github: https://github.com/itsmenatika/jslogsystem
// version: 1.2

import { ChildProcess, exec, execSync, fork, spawn, spawnSync } from "node:child_process";
import { appendFileSync, createReadStream, existsSync, mkdirSync, readdir, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import os, { version } from "node:os";
import { join } from "node:path";
import { cwd } from "node:process";
import { inspect, InspectOptions, InspectOptionsStylized, stripVTControlCharacters, toUSVString } from "node:util";

import * as config from "./config.js";
import { logSystemError } from "./ultrabasic.js";
// ___________________________________________
//
// CODE
//
// DONT TOUCH IT!
//
// ___________________________________________

let viewTextBox: boolean = config.viewTextBox; // whether text box is visible
let blockLogsVar: boolean = config.blockLogsVar;


// /**
//  * the type of log
//  */
// enum LogType {
//     INFO = 0,
//     INFORMATION = 0,
//     ERROR = 1,
//     ERR = 1,
//     WARNING = 2,
//     WAR = 2,
//     SUCCESS = 3,
//     SUCC = 3,
//     SUC = 3,
//     INITIALIZATION = 4,
//     INIT = 4,
//     INT = 4,
//     CRASH = 5,
//     COUNTER = 6,
//     GROUP = 7
// }

// let commandHistory: string[] = []; // user command history history
// let indexCommandHistory: null | number = null; // the index of current selected
// const logSystemVer: string = "1.2"; // current version of the log system
// const currentUpTime = Date.now(); // uptime start date
// let currentGroupString: string = ""; // the current string for groups to make it run faster (you can name it cache, i guess?)
// let logGroups: string[] = []; // groups for console.group()
// const timers: Record<string, number> = {}; // the list of timers used with console.time()



// settings that are to provide to process stdin
// process.stdin.setRawMode(true);
// process.stdin.resume();
// process.stdin.setEncoding("utf-8")

// check for the log directory
// if(!existsSync(config.LOGDIRECTORY)){
//     // make it if it doesn't exist
//     mkdirSync(config.LOGDIRECTORY, {recursive: true});
// }

    const finalLatest = config.finalLatest;
    const tempFinal = config.tempFinal;
// const finalLatest: string = join(config.LOGDIRECTORY, config.LATESTLOGNAME); // the path to the previous log
// // const tempFinal: string = join(config.LOGDIRECTORY, "temp"); // the path to previous temp file log

// // check whether the previous log exist
// if(existsSync(finalLatest)){
//     // if the latest log does exist, then temp shall too!
//     if(!existsSync(tempFinal)){
//         throw new logSystemError("Error with moving the previous log!");
//     }

//     const data = readFileSync(tempFinal).toString(); // get the data of the previous log (temp data)

//     const piecesOfData: string[] = data.split("\n"); // split it into lines

//     const date = new Date(Number(String(piecesOfData[0]))); // the first line is the date line

// 	// calling the callback to do stuff with previous one
// 	config.saveTheLatest(date, finalLatest);

//     // removing temp
//     unlinkSync(tempFinal);
// }

// // create new temp file
// writeFileSync(tempFinal, `${Date.now()}\n`);

// // create a new latest log file
// writeFileSync(finalLatest, config.getMoreStartInformation());

// appendFileSync(finalLatest, "----------------\n");

// vars to store info
let text: string = "";

// relative cursor change
let relativePos: number = 0;

const allowedKeysToWrite: string = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]" + " " + "!@#$%^&*=~`'/";

// display the textbox at the start
if(viewTextBox){
   process.stdout.write("> \x1b[35m"+text);	
}

// // watching user typing
// process.stdin.on('data', async (key: string) => {
//     if(key){
//         // escape ctrl + c key
//         if(key === '\u0003'){
//             interupHandler("CTRL + C");
//             // process.exit();
//         }

//         // reappearing of the textbox
//         if(!viewTextBox){
//             viewTextBox = true;
//             process.stdout.write("\x1b[0m> \x1b[35m");
//         }

 
//         // backspace
//         if(key.includes("\b")){
//             if(relativePos !== 0){
//                 if(relativePos * -1 >= text.length) return;
//                 text = text.slice(0, text.length + relativePos - 1) + text.slice(text.length + relativePos , text.length);


//                 hideCursor();
//                 process.stdout.clearLine(0);
//                 process.stdout.write("\r");
//                 printViewTextbox();
//                 process.stdout.moveCursor(relativePos, 0);
//                 showCursor();


//                 return;
//             }

//             if(text.length > 0){
//                 process.stdout.write("\b \b"); 
//             }
//             text = text.slice(0, -1);
//         }
//         // enter
//         else if(key.includes("\r")){
//             relativePos = 0;

//             indexCommandHistory = null;
//             process.stdout.write("\n");
//             appendFileSync(finalLatest, "> "+text+"\n");
//             let tempText: string = text;
//             text = "";
//             process.stdout.write("\x1b[0m");
// 			handleEnter(tempText)
//             // if(!handleEnter(tempText) && viewTextBox){
//                 // process.stdout.write("> \x1b[35m");
//             // }
//         }

//         // up key
//         else if (key == '\u001B\u005B\u0041') {
//             relativePos = 0;

//             if(indexCommandHistory === null){
//                 indexCommandHistory = commandHistory.length - 1;
//             }
//             else{
//                 indexCommandHistory--;
//                 if(indexCommandHistory < 0) indexCommandHistory = 0;
//             }

//             if(commandHistory.length > 0){
//                 text = commandHistory[indexCommandHistory];
//                 hideCursor();
//                 process.stdout.clearLine(0);
//                 process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
//                 showCursor();
//             }
//         }

//         // down
//         else if (key == '\u001B\u005B\u0042') {
//             relativePos = 0;

//             if(indexCommandHistory !== null){
//                 indexCommandHistory++;
//                 if(indexCommandHistory >= commandHistory.length) 
//                     indexCommandHistory = null;


//                 if(indexCommandHistory !== null)
//                     text = commandHistory[indexCommandHistory];
//                 else
//                     text = ""
                
//                 hideCursor();
//                 process.stdout.clearLine(0);
//                 process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
//                 showCursor();

//             }
//         }
//         // left
//         else if(key === '\u001B\u005B\u0044'){
//             if(relativePos * -1 >= text.length) return;

//             process.stdout.moveCursor(-1, 0);
//             relativePos--;
//         }

//         // right
//         else if(key === '\u001B\u005B\u0043'){
//             if(relativePos >= 0) return;

//             process.stdout.moveCursor(1, 0);
//             relativePos++;
//         }
        
//         // adding keys
//         else if(allowedKeysToWrite.includes(key)){
//             if(relativePos !== 0){
//                 text = text.slice(0, relativePos) + key + text.slice(relativePos);
//                 hideCursor();
//                 process.stdout.write("\r");
//                 printViewTextbox();
//                 process.stdout.moveCursor(relativePos, 0);
//                 showCursor();

//                 return;
//             }

//             text += key;
//             process.stdout.write(key); 
//         }



//     }
// }
// );

// function hideCursor(){
//     process.stdout.write("\x1b[?25l");
// }

// function showCursor(){
//     process.stdout.write("\x1b[?25h");
// }

// type for typescript
type cmdCallbackResponse = void | boolean | number | string | undefined | null | Object;

type cmdcallback = ((args: string[]) => cmdCallbackResponse);
type cmdCallbackAsync = ((args: string[]) => Promise<cmdCallbackResponse>);

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
    "callback"?: cmdcallback | cmdCallbackAsync,
    "async"?: boolean
}

interface commandDataAsync extends commandData{
    isAlias?: false,
    aliasName?: undefined,
    "async": true,
    "callback": cmdCallbackAsync,
}

// interface commandDataAsyncInMemory extends Pick<commandDataAsync, "desc"

interface commandDataRegular extends commandData{
    isAlias?: false,
    aliasName?: undefined,
    "async"?: false,
    "callback": cmdcallback
}

interface commandAlias extends commandData {
    usageInfo?: undefined,
    desc?: undefined,
    longDesc?: undefined,
    callback?: undefined,
    async?: undefined,
    isAlias: true
    aliasName: string
}

type unifiedCommandTypes = commandDataRegular | commandDataAsync | commandAlias;

function isCommandAlias(command: commandData): command is commandAlias{
    return typeof command === "object" && command.isAlias == true && typeof command.aliasName === "string";
}


interface bindDetail{
    name: string,
    command: string,
    executor: string
}


type bindData = Record<string, bindDetail>;

let bindInfo: bindData = {};
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

// NOT USED ANYMORE
// const numberLookUp = (char: string): boolean => {
//     return char == "1" || char == "2" || char == "3" || char == "4" || char == "5" || char == "6" || char == "7" || char == "8" || char == "9" || char == "0"
// }

// the list of commands
let commands: Record<string, unifiedCommandTypes> = {
    exit: {
        usageinfo: "exit <exit code...>",
        desc: "allows you to stop the process",
        longdesc: "It will execute process.exit(exitcode) that will cause the whole process to cease to exist. Your work may be lost. But sometimes it's the only easy way to close your program. If you want to safe close, consider using safeexit/sexit (though it requires setting the handler by the app before!).",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): boolean => {
            let exitCode: any = args.slice(1).filter(s => {
                return s != "-t";
            })
            .join(" ").trim();
            
            exitCode = exitCode ? exitCode : 0;
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
    stop: {
        isAlias: true,
        aliasName: "exit",
        hidden: true,
        changeable: false
    },
    halt: {
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
        callback: (args: string[]): onlyIfRedirected => {
            clearConsole();
            return onlyToRedirect(true);
        }
    },
    cls: {
        isAlias: true,
        aliasName: "clear",
        hidden: true,
        changeable: false
    },
    write: {
        usageinfo: "write <data>",
        desc: "allows you to print raw characters on the screen",
        longdesc: "It prints the characters into the screen",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): string => {
            let toPrint: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-t") continue;

                toPrint += cur + " ";
            }

            let theString = toPrint.slice(0, -1);

            // let theString: string = args.slice(1).join(" ");

            // consoleWrite(theString + "\n", consoleColors.FgWhite);

            return theString;
        }        
    },
    wrt: {
        isAlias: true,
        aliasName: "write",
        hidden: true,
        changeable: false
    },
    echo: {
        usageinfo: "echo <data>",
        desc: "allows you to print on the screen with special characters",
        longdesc: "It prints the characters into the screen. It supports \\n\n\nThe alternative command is `write` that does not support special characters",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): string => {
            let toPrint: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-t") continue;

                toPrint += cur + " ";
            }

            let theString = toPrint.slice(0, -1);

            theString = theString.replaceAll("\\\\", "%SLASH%").replaceAll("\\n", "\n").replaceAll("%SLASH%", "\\");

            // consoleWrite(theString + "\n", consoleColors.FgWhite);

            return theString;
        }        
    },
    ech: {
        isAlias: true,
        aliasName: "echo",
        hidden: true,
        changeable: false
    },
    directory: {
        usageinfo: "directory <data>",
        desc: "changes the working directory",
        longdesc: "It prints the characters into the screen. It supports \\n\n\nThe alternative command is `write` that does not support special characters",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): string => {
            let toPrint: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-t") continue;

                toPrint += cur + " ";
            }

            let theString = toPrint.slice(0, -1);

            if(theString == ""){
                return process.cwd();
            }

            const newDir = join(process.cwd(), theString);

            process.chdir(newDir);
            // consoleWrite(theString + "\n", consoleColors.FgWhite);

            // return `new working directory: ${newDir}`;
            return newDir;
        }        
    },
    cd: {
        isAlias: true,
        aliasName: "directory",
        hidden: true,
        changeable: false
    },
    cwd: {
        isAlias: true,
        aliasName: "directory",
        hidden: true,
        changeable: false
    },
    pwd: {
        isAlias: true,
        aliasName: "directory",
        hidden: true,
        changeable: false
    },
    hide: {
        usageinfo: "hide",
        desc: "hides the textbox that allows you to write",
        longdesc: "It hides the textbox that shows what you are writting. It also displays the message about what has happened.\nThe message is as follows: \n\nThe textbox was hidden. Start writting to make it appear again!\n\nuse: `hide -h` to remove the message",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): onlyIfRedirected => {
            let vis: boolean = true;

            if(args.includes("-h")){
                vis = false;
            }

            if(vis){
                consoleWrite("The textbox was hidden. Start writting to make it appear again!\n", undefined, undefined, "");
            }
            textboxVisibility(false);

            return onlyToRedirect(true);
        }                
    },
    h: {
        isAlias: true,
        aliasName: "hide",
        hidden: true,
        changeable: false
    },
    // tojson: {
    //    usageinfo: "inspect <structure>",
    //     desc: "allows you to inspect a javascript structure (DEPRECATED)",
    //     longdesc: "it uses internal node.js inspect and JSON parser to allow you to inspect the structure (all objects, are now inspected by default)",
    //     hidden: false,
    //     changeable: false,
    //     isAlias: false,
    //     callback: (preArgs: string[]): string => {
    // },
    // json: {
    //     isAlias: true,
    //     aliasName: "obj",
    //     hidden: true,
    //     changeable: false
    // },
    logs: {
        usageinfo: "logs [<-d [...names]|-a>]",
        desc: "allows you to manage logs",
        longdesc: "It allows you to delete or view the list of logs.\n\nUse 'logs' to list all the logs.\nUse 'logs -d name...name...name' to delete certain logs.\nUse 'logs -d -a' to delete all logs.\nUse 'logs name' to view the content of that log.",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (preArgs: string[]): any => {
            const args = smartArgs(preArgs);
            const g = new multiDisplayer();

            if(args.length === 0){
                const f = readdirSync(config.LOGDIRECTORY);
    
                for(let file of f){
                    if(file === "temp") continue;
                    g.push("* ", consoleColors.FgYellow);
    
                    if(file.endsWith(".txt")) file = file.slice(0, -4);
                    g.push(file, consoleColors.FgWhite);
                    g.push("\n");
                }
            }
            else if(args.length === 1){
                const path = join(config.LOGDIRECTORY, args.args[0]);

                let res;
                if(existsSync(path)){
                    res = readFileSync(path);
                    
                    if(args.isEnding){
                        g.push("CONTENT OF " + path, combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                        g.push("\n");
                    }
                    g.push(String(res));
                    
                    if(args.isEnding){
                        g.push("CONTENT OF " + path, combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                        g.push("\n");
                    }
                }
                else if(existsSync(path + ".txt")){
                    res = readFileSync(path + ".txt");
                    if(args.isEnding){
                        g.push("CONTENT OF " + path + ".txt", combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                        g.push("\n");
                    }
                    g.push(String(res));
                    
                    if(args.isEnding){
                        g.push("CONTENT OF " + path + ".txt", combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                        g.push("\n");
                    }
                }
                else{
                    g.push(path, consoleColors.FgWhite);
                    g.push(" NOT FOUND", consoleColors.FgRed);
                    if(args.isEnding)
                    g.push("\n");
                }
            }
            else if(args.args.includes("-d") && args.args.includes("-a")){
                const f = readdirSync(config.LOGDIRECTORY).filter(
                    (s) => s !== "latest.txt" && s !== "temp"
                );

                for(const file of f){
                    g.push("* ", consoleColors.FgYellow);
                    g.push(file, consoleColors.FgWhite);
                    unlinkSync(join(config.LOGDIRECTORY, file));
                    g.push(" DELETED \n");
                }

                g.push("\n");
                g.push(`${f.length}/${f.length+1} DELETED`, consoleColors.BgMagenta);
                g.push("\n");
            }
            else if(args.args.includes("-d")){
                const whatToDelete = args.args.filter(
                    (s) => s !== "-d"
                );

                let c = 0;
                for(let del of whatToDelete){
                    let where = join(config.LOGDIRECTORY, del);

                    if(existsSync(where)){
                        unlinkSync(where);
                        g.push("* ", consoleColors.FgYellow);
                        g.push(where, consoleColors.FgWhite);
                        g.push(" DELETED \n");
                        c++;
                    }
                    else if(existsSync(where+".txt")){
                        unlinkSync(where+".txt");
                        g.push("* ", consoleColors.FgYellow);
                        g.push(where, consoleColors.FgWhite);
                        g.push(" DELETED \n");
                        c++;
                    }
                    else{
                        g.push("* ", consoleColors.FgYellow);
                        g.push(where, consoleColors.FgWhite);
                        g.push(" NOT FOUND \n");
                    }

                    g.push("\n");
                    g.push(`${c}/${whatToDelete.length} DELETED`, consoleColors.BgMagenta);
                    g.push("\n");
                }
            }


            if(args.isEnding)
            g.useConsoleWrite();

            return onlyToRedirect(g.toRawString());
        },
    },
    inspect: {
        usageinfo: "inspect <structure>",
        desc: "allows you to inspect a javascript structure (DEPRECATED?)",
        longdesc: "it uses internal node.js inspect and JSON parser to allow you to inspect the structure (all objects at the end of the command chain, are now inspected by default and that's why it's deprecated(?). COMMAND MAY BE REMOVED IN THE FUTURE AS IT NOW SERVES NO PURPOSE OTHER THAN FORCING THAT IN THE CHAIN WITH -t!). It can be used to convert JSON strings to objects (it's recommended to use toJSON though!).",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (preArgs: string[]): string => {

            const args = smartArgs(preArgs);

            // let toFormat = args.args.join(" ");



            // let reCreateObject = JSON.parse(toFormat);

            let obj = undefined;

            const afterargs = args.args.map(
                (arg) => {
                    if(typeof arg === "string"){
                        try {
                            return JSON.parse(arg);
                        } catch (error) {
                            return arg;
                        }
                    }
                    else return arg;
                }
            );

            if(afterargs.length === 0){
                obj = undefined;
            }
            else if(afterargs.length === 1){
                obj = afterargs[0];
            }
            else{
                obj = afterargs;
            }

            if(args.length === 1){
                if(typeof args.args[0] === "string"){

                    let jsConvert;
                    try {
                        jsConvert = JSON.parse(args.args[0]);
                    } catch (error) {
                        obj = args.args[0];
                    }
                } 
                else{
                    obj = args.args[0];
                }
            }
            else{
                obj = args.args;
            }


            let formatedAnswer = inspect(obj, true, null, args.isEnding);

            // console.log(obj, formatedAnswer, args.isEnding);

            // log(LogType.INFO, `${formatedAnswer}`, "console.inspect");

            return formatedAnswer;
            // }
        }                
    },
    insp: {
        isAlias: true,
        aliasName: "inspect",
        hidden: true,
        changeable: false
    }, 
    arguments: {
        usageinfo: "arguments",
        desc: "allows you to see all arguments that got passed into that command",
        longdesc: "allows you to see all arguments that got passed into that command",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): string[] => {
            return args;
            // }
        }                
    }, 
    args: {
        isAlias: true,
        aliasName: "arguments",
        hidden: true,
        changeable: false
    },   
    argumentslength: {
        usageinfo: "arguments",
        desc: "allows you to see the number of arguments that got passed into that command",
        longdesc: "allows you to see the number of arguments that got passed into that command",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): number => {
            return args.length;
            // }
        }                
    }, 
    argslen: {
        isAlias: true,
        aliasName: "argumentslength",
        hidden: true,
        changeable: false
    }, 
    arglen: {
        isAlias: true,
        aliasName: "argumentslength",
        hidden: true,
        changeable: false
    }, 
    string: {
        usageinfo: "string <data>",
        desc: "forces the input to become a string if possible",
        longdesc: "uses javascript String() or toString() on provided things and returns it. It Ignores internal arguments like -t",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (PreArgs: string[]): any[] | undefined => {
            const args = smartArgs(PreArgs);
            const toReturn: any[] = [];


            for(const obj of args){
                toReturn.push(String(obj));
            }

            // console.log(args.args, args.length, toReturn, PreArgs);

            if(toReturn.length === 0) return undefined;
            return toReturn.length === 1 ? toReturn[0] : toReturn;


            // }
        }                
    }, 
    str: {
        isAlias: true,
        aliasName: "string",
        hidden: true,
        changeable: false
    }, 
    eval: {
        usageinfo: "eval <code...>",
        desc: "allows you to execute javascript",
        longdesc: "it executes javascript using globalEval which means that the context is global. $newConsole exposes newConsole api regardles of the config!",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): any => {
            let toUse: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-t") continue;

                toUse += cur + " ";
            }

            let code = toUse.trim();
            let evalParent = new logNode("eval");
            // @ts-ignore
            let answer;
            newConsole.useWith("using eval", () => {
                // @ts-expect-error
                let prev = globalThis.$newConsole;
                // @ts-expect-error
                globalThis.$newConsole = newConsole;

                answer = globalEval(code);
                
                // @ts-expect-error
                globalThis.$newConsole = prev;
                // let formatedAnswer = inspect(answer, true, null, true);

                // log(LogType.INFO, `eval returned with: ${formatedAnswer}`, evalParent);
            }, evalParent as any as string);

            return answer;
            // }
        }                
    },
    e: {
        isAlias: true,
        aliasName: "eval",
        hidden: true,
        changeable: false
    },    
    js: {
        isAlias: true,
        aliasName: "eval",
        hidden: true,
        changeable: false
    }, 
    javascript: {
        isAlias: true,
        aliasName: "eval",
        hidden: true,
        changeable: false
    },   
    version: {
        usageinfo: "version [-i] [-s] [-u]",
        desc: "shows the version information",
        longdesc: multiLineConstructor("shows the version information",
            "",
            "use -i to get int version",
            "use -s to get string version",
            "use -u to get user set version data",
            "",
            "if piped it uses 'version -i' by default"
            ),
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (preArgs: any[]): any => {
            const args = smartArgs(preArgs);

            const toReturn: Record<string, number | string> = {};

            if(args.dashCombined.includes("i")){
                toReturn['int'] = getCurrentVersionOfLogSystem("number");
            }
    
            if(args.dashCombined.includes("s")){
                toReturn['str'] = getCurrentVersionOfLogSystem("string");
            }

            if(args.dashCombined.includes("u")){
                toReturn['user'] = config.getversionInfoData();
            }

            let len = Object.keys(toReturn).length;

            if(len === 1){
                return toReturn[Object.keys(toReturn)[0]];
            }
            else if(len > 1){
                return toReturn;
            }

            if(args.isEnding){
                let prev = textboxVisibility();
                textboxVisibility(false);
                consoleWrite("logSystemVer: ", undefined, undefined, "");
                consoleWrite(logSystemVer, consoleColors.BgCyan, undefined, "");
                consoleWrite(" by naticzka", [consoleColors.FgMagenta, consoleColors.Blink]);
                consoleWrite(config.getversionInfoData(), consoleColors.BgGray);
                textboxVisibility(prev);
                return undefined;
            }

            return onlyToRedirect(getCurrentVersionOfLogSystem("number"));
            // }
        }                
    },
    "ver": {
        isAlias: true,
        aliasName: "version",
        hidden: true,
        changeable: false
    },
    "v": {
        isAlias: true,
        aliasName: "version",
        hidden: true,
        changeable: true
    },
    "cmd": {
        usageinfo: "cmd <code...>",
        desc: "executes system commands",
        longdesc: "It allows you to execute system command using execSync()",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): any => {
            let toUse: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-t") continue;

                toUse += cur + " ";
            }

            let codeC = toUse.trim();

            let evalParentC = new logNode("cmd");
            // @ts-ignore
            let answer;

            const isWindows = process.platform === "win32";

            const toExecCmd = isWindows ?
            "chcp 65001 > nul && " + codeC : codeC;

            newConsole.useWith("using cmd", () => {
                answer = execSync(toExecCmd, {shell: isWindows ? "cmd.exe" : "/bin/bash"});

                // log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
            }, evalParentC as any as string);

            return answer;

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
    "execute": {
        isAlias: true,
        aliasName: "cmd",
        hidden: true,
        changeable: false
    },
    "uptime": {
        usageinfo: "uptime",
        desc: "shows the time since the program start.",
        longdesc: multiLineConstructor("shows the time since the program start.", 
            "", "",
            "use -e to get miliseconds since epoch",
            "use -x to extract miliseconds (max 1000)",
            "use -s to extract seconds (max 60)",
            "use -m to extract minutes (max 60)",
            "use -h to extract hours (max 24)",
            "use -d to extract days",
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (preArgs: string[]): string | number | Record<string, number> => {
            const args = smartArgs(preArgs);

            let current = Date.now() - currentUpTime;
            let mili = current % 1000;
            let seconds = Math.floor((current / 1000) % 60);
            let minutes = Math.floor((current / 1000 / 60) % 60);
            let hours = Math.floor((current / 1000 / 60 / 60) % 24);
            let days = Math.floor((current / 1000 / 60 / 60 / 24));

            let toReturn: Record<string, any> = {};

            if(args.dashCombined.includes("e")){
                toReturn["sinceEpoch"] = current;
            }

            if(args.dashCombined.includes("x")){
                toReturn["miliseconds"] = mili;
            }

            if(args.dashCombined.includes("m")){
                toReturn["minutes"] = minutes;
            }

            if(args.dashCombined.includes("s")){
                toReturn["seconds"] = seconds;
            }

            if(args.dashCombined.includes("h")){
                toReturn["hours"] = hours;
            }

            if(args.dashCombined.includes("d")){
                toReturn["days"] = days;
            }

            if(args.dashCombined.length != 0){
                let len = Object.keys(toReturn).length;

                if(len === 1){
                    return toReturn[Object.keys(toReturn)[0]];
                }
                else if(len > 1){
                    return toReturn;
                }
            }




            let toShow: string = `current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}ms (since epoch: ${current})`;

            // newConsole.log(`current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}ms (exmili: ${current})`);
            return toShow;

            // }
        }                
    },
    "reload": {
        usageinfo: "reload",
        desc: "restarts the process (It doesnt work properly)",
        longdesc: `restarts the process (It doesnt work properly) using processRestart() (fork(join(import.meta.dirname, __filename), {stdio: "overlapped"});)`,
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
        aliasName: "uptime",
        hidden: true,
        changeable: false
    },
    "bind": {
        usageinfo: `bind [\`<executor>\`:\`<commands...;>\`]`,
        desc: "allows you to set binds or list them",
        longdesc: `If it's used without parameters, then it will print the list of binds.\n\nUsing parameters will result in changing those binds\n\nTo add a new bind use: 'bind \`<executor>\`:\`<commands...;>\`'.\nThe example: 'bind \`meow\`:\`echo meow!\`'\n\nIt's also possible to set more than one command using ; as the seperator.\n\nTo remove bind use: 'bind \`<executor>\`:\`\``,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (argsB: string[]): onlyIfRedirected => {
            const args = removeInternalArguments(argsB);
            const isT = argsB.includes("-t");

            if(args.length === 1
            ){
                let s = new multiDisplayer();

                if(isT){
                    s.push("bind list", combineColors(consoleColors.BgMagenta, consoleColors.FgBlack));
                    s.push("\n");
                }
                for(const [name, commandD] of Object.entries(bindInfo)){
                    s.push("* ", consoleColors.FgYellow);
                    s.push(commandD.executor, consoleColors.FgRed);
                    s.push(" -> ", consoleColors.FgGray);
                    s.push(commandD.command.toString() + "\n", consoleColors.FgBlue);
                }

                if(isT)        
                s.useConsoleWrite();

                return onlyToRedirect(Object.entries(bindInfo));
            }

            const data = args.slice(1).join(" ");

            if(data[0] != "`"){
                let bindName = data;

                if(bindName in bindInfo){
                    let s = new multiDisplayer();

                    if(isT){
                        s.push(`bind '${bindName}'`, combineColors(consoleColors.BgMagenta, consoleColors.FgBlack));

                        s.push("\n");
                    }

                    s.push(`\`${bindInfo[bindName].executor}\`:\`${bindInfo[bindName].command.toString()}\``);
                    
                    if(isT){
                        s.push("\n");
    
                        s.useConsoleWrite();
                    }

                    return onlyToRedirect(s.toRawString());
                }

                log(LogType.ERROR, "invalid syntax", "console.bind");
                return onlyToRedirect(false);
            }

            let it = 2;
            while(true){
                let char = data[it];
                if(!char || char == "`") break;
                it++;
            }

            let executor: string = data.slice(1, it);


            if(executor.length === 0){
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return onlyToRedirect(false);
            }

            if(data[it] != "`"){
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return onlyToRedirect(false);
            }

            if(data[it+1] != ":"){
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return onlyToRedirect(false);
            }     

            if(data[it+2] != "`"){
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return onlyToRedirect(false);
            }

            let name = executor.split(" ")[0];

            let it2 = it + 4;
            while(true){
                let char = data[it2];
                if(!char || char == "`") break;
                it2++;
            }

            if(it + 4 === it2){
                delete bindInfo[name];
                log(LogType.SUCCESS, "the bind has been removed!", "console.bind");
                return onlyToRedirect(false);
            }

            let commandData: string = data.slice(it + 3, it2);


            // let toRegex: string = "";

            // let i = 0;
            // while(i < commandData.length){
            //     let x = commandData.indexOf("%", i);

            //     let num: number | void = void 0;

            //     let prev = x;
            //     while(x < commandData.length){
            //         if(!numberLookUp(commandData[x])) break;

            //         x++;
            //     }

            //     let numStr = commandData.slice(prev);

            //     toRegex += "(<"
            // }

            //  log(LogType.INFO, commandData.split(";").toString());

            if(commandData.length === 0){
                delete bindInfo[name];
                log(LogType.SUCCESS, "the bind was removed!", "console.bind");
                return onlyToRedirect(false);
            }

            // let commandListToExecute = commandData.split(";").map(
            //     (val: string) => val.trim()
            // );

            bindInfo[name] = {
                name,
                command: commandData.trim(),
                executor
            } as bindDetail;

            log(LogType.SUCCESS, "the bind was set: " + `\`${bindInfo[name].executor}\`:\`${bindInfo[name].command.toString()}\``, "console.bind");
            return onlyToRedirect(true);
        }

    },
    "b": {
        isAlias: true,
        aliasName: "bind",
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
        callback: (args: string[]): onlyIfRedirected => {
            let g = new multiDisplayer();

            g.push("  /\\_/\\  (\n");
            g.push(" ( ^.^ ) _)\n");
            g.push("   \\\"/  (        ");
            g.push("MEOW!\n", consoleColors.Blink);
            g.push(" ( | | )\n");
            g.push("(__d b__)\n");

            if(args.includes("-t") || !legacyData.pipes){
                g.useConsoleWrite(undefined, false);
            }

            return onlyToRedirect(g.toRawString());

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
    "info": {
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
        usageinfo: "info",
        desc: "prints information about the system",
        longdesc: `it really just prints information about the system!`,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args: string[]): onlyIfRedirected => {

            const builder = new multiDisplayer();

            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");


            let mus = process.memoryUsage();
            let pairs = [
                ["architecture", os.arch],
                ["host name", os.hostname],
                ["platform", os.platform],
                ["kernel version", os.version],
                ["process priority", os.getPriority()],
                ["machine", os.machine],
                ["cwd", process.cwd()],
                ["heap total",  Math.round(mus.heapTotal/100000)/10 + "mb"],
                ["heap used",  Math.round(mus.heapUsed/100000)/10 + "mb"],
                ["cpu usage (1m, 5m, 15m)", `${os.loadavg().map(num => `${num * 100}%`)}`]
            ];

            let cpus = os.cpus();

            let i = 0;
            for(let cpu of cpus){
                pairs.push([
                    `cpu ${i}`,
                    `${cpu.model} (speed: ${cpu.speed})`
                ]);
                i++;
            }

            for(let pair of pairs){
                builder.push("\t" + pair[0] + ": ", consoleColors.FgGray);
                builder.push(pair[1] as string, consoleColors.BgRed);
                builder.push("\n");
            }


            

            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");

            builder.useConsoleWrite();

            return onlyToRedirect(builder.toRawString());
        }

    },
    "sysinfo": {
        isAlias: true,
        aliasName: "info",
        hidden: true,
        changeable: false
    },
    "sysinf": {
        isAlias: true,
        aliasName: "info",
        hidden: true,
        changeable: false
    },
    "inf": {
        isAlias: true,
        aliasName: "info",
        hidden: true,
        changeable: false
    },
    "nil": {
        usageinfo: "nil",
        desc: "it outputs literally nothing (eats the whole input and does nothing)",
        longdesc: "it outputs literally nothing (eats the whole input and does nothing. It can be useful if you want to block the result from showing up on unsupported commands",
        hidden: false,
        changeable: false,
        callback: (preArgs: string[]): any => {
            return undefined;
        }
    },
    "true": {
        usageinfo: "true",
        desc: "outputs true",
        longdesc: "outputs true",
        hidden: false,
        changeable: false,
        callback: (preArgs: string[]): any => {
            return true;
        }
    },
    "True": {
        isAlias: true,
        aliasName: "true",
        hidden: true,
        changeable: false
    },
    "false": {
        usageinfo: "true",
        desc: "outputs false",
        longdesc: "outputs false",
        hidden: false,
        changeable: false,
        callback: (preArgs: string[]): any => {
            return false;
        }
    },
    "False": {
        isAlias: true,
        aliasName: "false",
        hidden: true,
        changeable: false
    },
    "number": {
        usageinfo: "num [...<number>]",
        desc: "creates a number",
        longdesc: "creates a number from provided numbers. If multiple ones are provided, all of them are summed. It supports negative numbers with ! or - as prefix. ",
        hidden: false,
        changeable: false,
        callback: (preArgs: string[]): any => {
            const s = smartArgs(preArgs);

            let sum = 0;
            for(const som of s.args){
                if(som[0] === "!"){
                    sum += -Number(som.slice(1))
                }
                else{

                    sum += Number(som);
                }
            }

            return sum;
        }
    },
    "num": {
        isAlias: true,
        aliasName: "number",
        hidden: true,
        changeable: false
    },
    "sum": {
        isAlias: true,
        aliasName: "number",
        hidden: true,
        changeable: false
    },
    "exists": {
        usageinfo: "exists [-b/-c] <command|bind>",
        desc: "checks whether the bind or command exist",
        longdesc: "checks whether a bind or a command exist\n\n* exists -c <command> - checks for a command\n* exists -b <bind> - checks for a bind\n* exists -b -c <command|bind> - checks for either bind or command.\n\nYou can combine arguments into a single -, writting '-bc'/'-cb' instead of '-b -c'",
        hidden: false,
        changeable: false,
        callback: (preArgs: string[]): any => {
            const args = smartArgs(preArgs);

            if(args.argsWithoutDash.length != 1){
                return explicitUndefined();
            }

            let toReturn = false;

            // console.log(args.dashed);

            if(args.dashCombined.includes("b")){
                toReturn ||= Object.hasOwn(bindInfo, args.argsWithoutDash[0]);
            }

            if(args.dashCombined.includes("c")){
                toReturn ||= Object.hasOwn(commands, args.argsWithoutDash[0]);
            }

            return toReturn;

        }
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
        callback: (preArgs: string[]): any => {
            const args = smartArgs(preArgs);
            // return args;

            // if there was no arguments (the first is called command name)
            if(
                args.length === 0
            ){

                let toDisplay: string[] = [];
                let colors: consoleColor[] = [];

                for(let [commandName, commandData] of Object.entries(commands)){
                    if(commandData.hidden) continue;


                    
                    toDisplay.push("* "); colors.push(consoleColors.FgYellow);
                    toDisplay.push(commandName); colors.push(consoleColors.FgWhite);
                    toDisplay.push(" -> "); colors.push(consoleColors.FgMagenta);

                    if(isCommandAlias(commandData)){
                        toDisplay.push(`alias for ${commandData.aliasName}\n`);
                        colors.push(consoleColors.FgGray); 
                    }
                    else{
                        const description = commandData.desc ? commandData.desc + "\n" : "no description specified" + "\n";

                        toDisplay.push(description); 
                        colors.push(consoleColors.FgWhite);
                    }
                }

                if(args.isEnding)
                consoleMultiWrite(toDisplay, colors);

                return onlyToRedirect(toDisplay.join(""));
            }

            else if(args.length == 1){
                let forMulti = new multiDisplayer();

                let cmdToCheck: string = args.args[0];

                if(!(cmdToCheck in commands)){
                    forMulti.push("There's no reference to ", consoleColors.FgRed);
                    forMulti.push(cmdToCheck, consoleColors.FgYellow);
                    forMulti.push(" in any list!\n", consoleColors.FgRed);
                }
                else{
                    let cmd = commands[cmdToCheck];

                    let cmdTouse;
                    let cmdTouseName;
                    if(cmd.isAlias){
                        cmdTouseName = cmd.aliasName;
                        cmdTouse = commands[cmd.aliasName as string];
                    }
                    else{
                        cmdTouse = cmd;
                        cmdTouseName = cmdToCheck;
                    } 


                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n");

                    // const commandData = commands[args[1]];

                    forMulti.push(" " + cmdTouse.usageinfo + "\n\n", consoleColors.FgCyan);


                    forMulti.push("aliases: ", consoleColors.FgGray);
                    forMulti.push(getAliases(cmdTouseName).join(", ") + "\n", consoleColors.FgWhite);

                    forMulti.push("hidden: ", consoleColors.FgGray);
                    forMulti.push(String(cmdTouse.hidden) + "\n", consoleColors.FgWhite);

                    forMulti.push("changable: ", consoleColors.FgGray);
                    forMulti.push(String(cmdTouse.changeable) + "\n", consoleColors.FgWhite);

                    forMulti.push("short desc: ", consoleColors.FgGray);

                    const description = "desc" in cmdTouse ? cmdTouse.desc : "no description specified";

                    forMulti.push(description + "\n", consoleColors.FgWhite);

                    forMulti.push("long desc: ", consoleColors.FgGray);
                    forMulti.push(cmdTouse.longdesc + "\n", consoleColors.FgWhite);

                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n")
                }

                if(args.isEnding)
                forMulti.useConsoleWrite();

                return onlyToRedirect(forMulti.toRawString());

                
            }


            return onlyToRedirect(false);

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

interface commandCompound{
    name: string,
    data: unifiedCommandTypes
}

/**
 * register a command using an object
 * 
 * NOTE: IT DOESNT WORK IN LEGACY register MODE!
 * 
 * @param cmdCom command Compound
 * @param edit whether it is in edit mode
 */
function registerCommandShort(cmdCom: commandCompound, edit: boolean = false){
    if(legacyData.registerMode <= 1.13){
        throw new logSystemError("Legacy: registerMode has to be at least 1.14");
    }

    registerCommand(cmdCom.name, cmdCom.data, edit);
}

/**
 * allows you to quickly regiser commands
 * @param data an array of commands compounds
 * @param edit whether it is in edit mode
 */
function multiCommandRegister(data: Array<commandCompound>,
    edit: boolean = false
){
    if(legacyData.registerMode <= 1.13){
        throw new logSystemError("Legacy: registerMode has to be at least 1.14");
    }

    for(const oneD of data){
        registerCommand(oneD.name, oneD.data, edit);
    }
}

/**
 * allows you to register command
 * @param name the command name
 * @param data the command data
 * @param edit whether it is in edit mode
 * @returns 
 */
function registerCommand(name: string, data: unifiedCommandTypes, edit: boolean = false) {
    if(Object.hasOwn(commands, name)){
        if(!edit){
            throw new logSystemError(`The command '${name}' does exist!`);
        }

        if(!(commands[name].changeable)){
            throw new logSystemError(`The command '${name}' is not changeable!`);
        }
    }

    if(!data.isAlias && !data.callback){
        throw new logSystemError("The callback must be set for no alias.")
    }

    // delete alias cache
    delete aliasCache[name];
    if(data.aliasName) delete aliasCache[data.aliasName];

    if(data.isAlias){
        commands[name] = {
            usageinfo: undefined,
            desc: undefined,
            longdesc: undefined,
            hidden: typeof data.hidden === "boolean" ? data.hidden : true,
            changeable: typeof data.changeable === "boolean" ? data.changeable : true,
            isAlias: true,
            aliasName: data.aliasName as string,
            callback: undefined,
            async: undefined
        }

        return;
    }

    // it will WORK, i wont waste 5 hours to try convince typescript
    // @ts-ignore
    commands[name] = {
        usageinfo: data.usageinfo ? data.usageinfo : `${name} [<arguments...>] ~(usage not specified)`,
        desc: data.desc ? data.desc : "no description",
        longdesc: data.longdesc ? data.longdesc : "no long description",
        hidden: typeof data.hidden === "boolean" ? data.hidden : false,
        changeable: typeof data.changeable === "boolean" ? data.changeable : true,
        isAlias: false,
        aliasName: undefined,
        callback: data.callback,
        async: typeof data.async === "boolean" ? data.async : false
    };

    // remove cache
    // delete aliasCache[name];
    // // @ts-ignore
    // console.log(aliasCache[commands[name]]);
    // if(commands[name].aliasName) delete aliasCache[commands[name].aliasName];
    // // @ts-ignore
    // console.log(aliasCache[commands[name]]);
    // commands[name] = [
    //     callback, usage, desc, longdesc
    // ];
}

const __registerCommand = registerCommand;

/** the legacy Data Type */
interface legacyDataType{
    initialized: boolean,
    currentVersion: number,
    registerMode: number,
    noSpecialArguments: boolean,
    pipes: boolean
}

/** the legacy Data */
const legacyData: legacyDataType = {
    initialized: false,
    currentVersion: getCurrentVersionOfLogSystem("number") as number,
    registerMode: getCurrentVersionOfLogSystem("number") as number,
    noSpecialArguments: false,
    pipes: true
}

/** allows you to get legacyInformation */
function getLegacyInformation(): legacyDataType{
    return {...legacyData};
}

/**
 * check possibility of setting the value to that property
 * 
 * it refers to the legacy modes!
 * 
 * @param propertyName the name of property
 * @param value the value that you is needed to be set
 * @returns whether it's legal to do so
 */
function validateLegacyProperty(propertyName: keyof legacyDataType, value: any): boolean{
    switch(propertyName){
        case "initialized":
            return false;
        case "currentVersion":
            return false;
        case "registerMode":
            return typeof value === "number";
        case "noSpecialArguments":
            return typeof value === "boolean";
        case "pipes":
            return typeof value === "boolean"

        default:
            throw new Error("not existing property!");
    }
}

/**
 * allows you to set manually legacy information 
 * 
 * NOTE: some behaviour won't be changed
 * it only changes the behaviour of commands! Not their parameters
 * 
 * If you want to get the previous command register api, use: 
registerCommandLegacyForceUse() 
 * 
 * @param propertyName the name of property
 * @param value the new value
 * @param bypassSafety whether to bypass safety mechanism
 */
function setLegacyInformation<property extends keyof legacyDataType>(propertyName: property, value: legacyDataType[property], bypassSafety: boolean = false){
    if(legacyData.initialized && !bypassSafety){
        throw new logSystemError("Legacy: you can't change legacy data after intialization!");
    }

    if(!Object.hasOwn(legacyData, propertyName)){
        throw new logSystemError("Legacy: that property name does not exist!");
    }

    if(!validateLegacyProperty(propertyName, value)){
        throw new logSystemError("Legacy: You can't set that value to that property!");
    }

    log(LogType.INFO, `'${propertyName}' was changed to '${value}'!`, "legacy");
    legacyCheckForWarningAndErrors(propertyName, value);

    // @ts-ignore
    legacyData[propertyName] = value;
}

function legacyCheckForWarningAndErrors<property extends keyof legacyDataType>(propertyName: property, value: legacyDataType[property]){
    switch(propertyName){
        case 'noSpecialArguments': {
            log(LogType.WARNING, `NOTE: noSpecialArguments may cause other commands to not work correctly as they may depend on -t to render better view and not check for legacy settings! Some internal commands may also see errors. Pipping may be drastically affected. Disable that setting unless you necessarly need that. Consider disabling pipes by settings them to false instead of that option or with that option!`, "legacy")
        }
    }
}

// legacyData.usedOldRegisterSystem = true;

/**
 * legacy register command
 * 
 * DONT USE IN NEW PROJECTS
 * 
 * it doesnt allow you to edit command afterwards by default, due to compatibility reasons!
 * 
 * @param name the command name
 * @param usage the command usage
 * @param shortdesc short description
 * @param longdesc long description
 * @param callback callback
 */
function registerCommandLegacy(
    name: string,
    usage: string,
    shortdesc: string,
    longdesc: string,
    callback: cmdcallback
){
    __registerCommand(name, {
        usageinfo: usage,
        desc: shortdesc,
        longdesc: longdesc,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: callback
    });
}

/**
 * forces registerCommand() to behave like registerCommandLegacy()
 * 
 * DONT USE IF YOU DONT HAVE TO!
 * 
 * ITS NOT TYPESCRIPT AND JAVASCRIPT SAFE
 */
function registerCommandLegacyForceUse(){
    if(legacyData.registerMode == 1.0){
        throw new logSystemError("The system already use it");
    }

    // @ts-ignore
    registerCommand = registerCommandLegacy;
    legacyData.registerMode = 1.0
}

interface commandExecOptions{
    silent?: boolean,
    logNode?: logNode | string
}

async function commandExec(command: string, options: commandExecOptions = {}) {
    // handleCommandInternal(command.split(" "), options.silent, options.logNode);
    commandInternalExec(command, options.silent, options.logNode);
}

/**
 * interface to allow easily manipulation of the list of commands
 */
const commandInterface = {
    isCommandRegistered,
    commandList,
    removeCommand,
    registerCommand,
    registerCommandLegacy,
    registerCommandLegacyForceUse,
    registerCommandShort,
    multiCommandRegister,
    commandExec,
    exec: commandExec
};

function handleEnter(text: string, silent: boolean = false){
    if(text.trim() == ""){
        // textboxVisibility(false);
        // textboxVisibility(true);
        if(textboxVisibility()) printViewTextbox();
        return;
    }

    if(commandHistory.length > 50) 
        commandHistory = commandHistory.slice(commandHistory.length - 50, commandHistory.length);
    commandHistory.push(text);

    // handleCommandInternal(text, silent);
    commandInternalExec(text);
}

// interface commandLauncherOptions{
//     silent?: boolean,
//     logNogde?: string | logNode
// }

enum specialTypes{
    null,
    redirection,
    unkownCmd,
    pipeExecutorHalt,
    explicitUndefined
}

interface controlTypes{
    __$special: specialTypes,
    val?: any
}

interface onlyIfRedirected extends controlTypes{
    __$special: specialTypes.redirection,
    val: any
}

interface pipeExecutorHalt{
    __$special: specialTypes.pipeExecutorHalt
} 

interface pipeExplicitUndefined{
    __$special: specialTypes.explicitUndefined
} 


function onlyToRedirect(val: any): onlyIfRedirected{
    return {__$special: specialTypes.redirection, val};
}

function isControlType(val: any): val is controlTypes{
    return typeof val === "object" && "__$special" in val;
}

function isOnlyToRedirect(val: any): val is onlyIfRedirected{
    return typeof val === "object" &&
    "__$special" in val &&
    val.__$special === specialTypes.redirection;
}

function isPipeHalt(val: any): val is pipeExecutorHalt{
    return typeof val === "object" && "__$special" in val &&
    val.__$special === specialTypes.pipeExecutorHalt;
}

function pipeHalt(): pipeExecutorHalt{
    return {__$special: specialTypes.pipeExecutorHalt};
}

function explicitUndefined(): pipeExplicitUndefined{
    return {__$special: specialTypes.explicitUndefined};
}

function isExplicitUndefined(val: any): val is pipeExplicitUndefined{
    return typeof val === "object" && "__$special" in val &&
    val.__$special === specialTypes.explicitUndefined;
}

function removeInternalArguments(ar: any[]): any[]{
    return ar.filter(
        (val) => {
            return typeof val != "string" || !internalArgsList.includes(val);
        }
    );
}

interface smartArgumentList{
    name: string,
    commandName: string,
    args: string[],
    array: string[],
    orginal: string[],
    orginalLength: number,
    internalArgs: string[],
    internal: string[],
    isEnding: boolean,
    length: number,
    dashed: string[],
    argsWithDash: string[],
    dashCombined: string,
    argsWithoutDash: string[],
    [Symbol.iterator](): any,
    [Symbol.toStringTag](): string
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string
}

const internalArgsList = ["-t"];

function smartArgs(preargs: any[]): smartArgumentList{
    const commandName = preargs[0];
    const argsWithoutOne = preargs.slice(1);
    // console.log(argsWithoutOne, preargs);
    
    const argsFiltered: string[] = [];
    const argsWithDash: string[] = [];
    const argsWithoutDash: string[] = [];

    const internalArgs = [];
    let isEnding: boolean = !legacyData.pipes;

    for(const arg of argsWithoutOne){
        // console.log(typeof arg, arg, arg === "-t", arg == "-t", arg in internalar);
        if(typeof arg === "string"){
            if(internalArgsList.includes(arg)){
                internalArgs.push(arg);
    
                // console.log(arg, arg === "-t")
                if(arg === "-t") isEnding ||= true;
            }
            else{
                argsFiltered.push(arg);
            }
            
            if(arg.length > 0 && arg[0] === "-"){
                argsWithDash.push(arg.slice(1));
            }
            else{
                argsWithoutDash.push(arg);
            }
        }
        else{
            argsFiltered.push(arg);
            argsWithDash.push(arg);
        }



        
    }

    const dashCombined = argsWithDash.join("");

    return {
        name: commandName,
        commandName,
        args: argsFiltered,
        array: preargs,
        orginal: preargs,
        orginalLength: preargs.length,
        internalArgs,
        internal: internalArgs,
        isEnding,
        length: argsFiltered.length,
        dashed: argsWithDash,
        argsWithDash,
        dashCombined,
        argsWithoutDash,
        [Symbol.iterator](){
            let i = 0;
            return {
                next(){
                    // console.log(i,  argsFiltered.length);
                    if(i < argsFiltered.length){
                        return {value: argsFiltered[i++], done: false}
                    }
                    else{
                        return {done: true}
                    }
                }
            }
        },
        [Symbol.toStringTag](){
            return `smartArgs{${commandName}(\`${argsWithoutOne.join(" ")}\`)}`;
        },
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string) {
            return `smartArgs{${commandName}(\`${inspect(argsWithoutOne, options as InspectOptionsStylized)}\`)}`;
        }
    };

}

// function smartArgs(args: string[]): smartArgumentList{
//     const commandName = args[0];

//     const argsWithoutOne = args.slice(1);

//     const internalArgs = argsWithoutOne.filter(
//         (s) => s === "-t"
//     );

//     const isEnding = argsWithoutOne.includes("-t") || !legacyData.pipes;

//     const argsFiltered = removeInternalArguments(argsWithoutOne);

//     const argumentsWithDash = argsWithoutOne.filter(
//         (s) => {
//             // console.log(s, typeof s === "string", s.length > 1, s[0] == "-");
//             return typeof s === "string" && s.length > 1 && s[0] == "-"
//         }
//     ).map((s) => s.slice(1));

//     const dashCombined = argumentsWithDash.join("");

//     const argsWithoutDashed = argsWithoutOne.filter(
//         (s) => {
//             return typeof s !== "string" || s[0] != "-"
//         }
//     );

//     // console.log(argsWithoutDashed);

//     return {
//         name: commandName,
//         commandName,
//         args: argsFiltered,
//         array: args,
//         orginal: args,
//         orginalLength: args.length,
//         internalArgs,
//         internal: internalArgs,
//         isEnding,
//         length: argsFiltered.length,
//         dashed: argumentsWithDash,
//         dashCombined,
//         argsWithoutDashed,
//         [Symbol.iterator](){
//             let i = 0;
//             return {
//                 next(){
//                     // console.log(i,  argsFiltered.length);
//                     if(i < argsFiltered.length){
//                         return {value: argsFiltered[i++], done: false}
//                     }
//                     else{
//                         return {done: true}
//                     }
//                 }
//             }
//         }
//     };
// }


function commandInternalExec(text: string, silent: boolean = false, logNode: string | logNode = "console", onlyReturn: boolean = false){
    if(!silent)
    log(LogType.INFO, `This command has been executed: '${text}'`, logNode);

    let res;
    if(legacyData.pipes){
        const pipeTree = commandDividerInternal(text);
        res = pipeExecutor(pipeTree, {silent, logNode});
    }
    else{
        const parts = text.split(" ");

        let partsToUse;
        if(legacyData.noSpecialArguments){
            partsToUse = parts;
        }
        else{
            partsToUse = [parts[0], "-t" , ...parts.slice(1)];
        }

        res = handleCommandInternal(partsToUse, silent, logNode);
    }
    

    if(onlyReturn){
        return res;
    }

    if(isExplicitUndefined(res)){
        consoleWrite("undefined", undefined, undefined);
    }
    else if(res != undefined){
        if(isOnlyToRedirect(res)) return;

        const toW = tryToGetAsStringToPrint(res, true);

        consoleWrite(toW, undefined, undefined, "");

        // consolePairWrite(
        //     tryToGetAsStringToPrint(res, false),
        //     tryToGetAsStringToPrint(res, true)
        // );

        // consoleWrite(tryToGetAsStringToPrint(res, true));
        // s.useConsoleWrite();

        // consoleWrite(
        //     inspect(res, true, null, true) + "\n", 
        //     consoleColors.FgWhite
        // );
    }
}

function tryToGetAsStringToPrint(val: any, canUseColors: boolean = false): string {
    let toPrint: string;
    // toPrint = inspect(val, true, null, canUseColors); 
    switch(typeof val){
        case "string": {
            toPrint = val;
            break;
        }
        case "object":
        default:
            if(isOnlyToRedirect(val)){
                toPrint = val.val;
                break;
            }

            toPrint = inspect(val, true, null, canUseColors); 
    }

    toPrint += "\n";

    return toPrint;
}

enum pipeType{
    unkown,
    fileFrom,
    command,
    fileSet,
    fileAppend,
    and,
    or,
    pipe,
    dataClear
}

interface commandPipe{
    type: pipeType,
    val: any
}

const specialChars = [">", "<"];
const commandParsingStop = ["|", "&", ";"];

function commandDividerInternal(text: string){
    if(text.length == 0) return [];

    let commandPipe: Array<commandPipe> = [];
    let i: number = 0;
    while(i < text.length){
        // console.log(text[i], ' wda');
        const [theNewI, commandData] = pipeDividerInternal(text, i);

        commandPipe.push(...commandData);
        i = theNewI;

        while(text.length > i && text[i] == " ") i++;
        if(!(i < text.length)) return commandPipe;


        switch(text[i]){
            case "|":
                i++;

                if(i < text.length && text[i] === "|"){
                    commandPipe.push({
                        type: pipeType.or,
                        val: undefined
                    });
                    
                    i++;
                    break;
                }

                commandPipe.push({
                    type: pipeType.pipe,
                    val: undefined
                });
                break;
            case ";": {
                i++;
                commandPipe.push({
                    type: pipeType.dataClear,
                    val: undefined
                });
                break;
            }
            case "&":
                i++;

                if(i < text.length && text[i] === "&"){
                    commandPipe.push({
                        type: pipeType.and,
                        val: undefined
                    });

                    i++;
                    break;
                }
            default:
                throw new Error("unexpected token: " + text[i]);
        }
    }

    return commandPipe;
}

function getFileDesc(i: number, text: string): [number, string]{
    let cmdDesc: string = "";

    while(i < text.length && text[i] != " " && 
        !specialChars.includes(text[i])
        &&
        !commandParsingStop.includes(text[i])
    ){
        cmdDesc += text[i];
        i++;
    }
    return [i, cmdDesc];
}

function pipeDividerInternal(text: string, startingPoint: number): [number, Array<commandPipe>]{
    let toReturn: Array<commandPipe> = [];

    let cmd: string = "";
    let i: number = startingPoint;

    for(; i < text.length; i++){
        if(text[i] == "\\" && 
            [...specialChars, ...commandParsingStop].includes(text[i + 1])
        ){
            i++;
            if(!(i < text.length)) break;
            cmd += text[i];
            continue;
        }
        
        if(specialChars.includes(text[i]) || commandParsingStop.includes(text[i])) break;
        cmd += text[i];
    }

    cmd = cmd.trim();

    toReturn.push({
        type: pipeType.command,
        val: cmd
    });

    if(!(i < text.length)) return [i, toReturn];

    if(!specialChars.includes(text[i]) || commandParsingStop.includes(text[i])){
        return [i, toReturn];
    }

    let loopAllowed = true;
    while(i < text.length && loopAllowed){
        // console.log(text[i]);
        while(i < text.length && text[i] == " ") i++;

        let cmdDesc = "";
        i++;
        switch(text[i-1]){
            case "<":
                // while(i < text.length && text[i] != " " && 
                //     !specialChars.includes(text[i])){
                //     cmdDesc += text[i];
                //     i++;
                // }

                [i, cmdDesc] = getFileDesc(i, text);

                toReturn.push({
                    type: pipeType.fileFrom,
                    val: cmdDesc
                });
                break;
            case ">":
                let isAppend = text[i] == ">";
                if(isAppend) i++;

                // while(i < text.length && text[i] != " " && 
                //     !specialChars.includes(text[i])){
                //     cmdDesc += text[i];
                //     i++;
                // }

                [i, cmdDesc] = getFileDesc(i, text);

                toReturn.push({
                    type: isAppend ? pipeType.fileAppend : pipeType.fileSet,
                    val: cmdDesc
                });
                break;
            default:
                i--;
                loopAllowed = false;
                break;
            }
    }
   

    toReturn = toReturn.sort(
       (a: commandPipe, b: commandPipe): number => {
            return a.type - b.type;
       }
    );

    return [i, toReturn];
}

interface executorConfig{
    silent?: boolean,
    logNode?: string | logNode
}

interface executorConfigFin extends Required<executorConfig>{

}

/**
 * tests the object to determine whether it should be treated as a positive result of a command
 * it's required because javascript tends for example to treat empty strings as false
 * 
 * @param obj any object to test
 * @returns the result (boolean)
 */
function internalIsTrue(obj: any): boolean{
    switch(typeof obj){
        case "boolean":
            return obj;

        case "bigint":
            return true;
        
        case "function":
            return true;

        case "number":
            return true;

        case "object":
            return true;
        
        case "string":
            return true;
        
        case "symbol":
            return true;

        case "undefined":
            return false;


        default:
            return false;
    }
}

function pipeExecutor(pipeTree: commandPipe[], config: executorConfig = {}){
    const conf: executorConfigFin = {
        silent: false,
        logNode: "console"
    };

    Object.assign(conf, config);

    let pipeHaltCalled: boolean = false;
    let result: any = void 0;


    // console.log(pipeTree);
    for(let i = 0; i < pipeTree.length; i++){
        const pipe = pipeTree[i];

        // console.log(pipe, result);

        if(pipeHaltCalled){
            while(i < pipeTree.length && pipeTree[i].type !== pipeType.dataClear) i++;

            pipeHaltCalled = false;

            if(!(i < pipeTree.length))
                return undefined;
        }

        switch(pipe.type){
            case pipeType.fileFrom: {


                let f = readFileSync(join(process.cwd(), pipe.val as string));

                result = f;
                break;
            }

            case pipeType.fileAppend: {
                let m = result;
                if(Array.isArray(m) && m.length === 1){
                    m = m[0];
                }
                
                if(typeof m !== "string" && !(
                    m instanceof Uint8Array
                )){
                    m = Buffer.of(m);
                }

                appendFileSync(join(process.cwd(), pipe.val as string), m);
                break;
            }

            case pipeType.fileSet: {
                let m = result;
                if(Array.isArray(m) && m.length === 1){
                    m = m[0];
                }
                
                if(typeof m !== "string" && !(
                    m instanceof Uint8Array
                )){
                    m = Buffer.of(m);
                }

                writeFileSync(join(process.cwd(), pipe.val as string), m);
                break;
            }
            case pipeType.dataClear: {
                result = undefined;
                pipeHaltCalled = false;
                break;
            }

            case pipeType.command: {
                const commandExec = pipe.val as string;
                const commandExecParts = commandExec.split(" ");

                const commandPartsToUse = [commandExecParts[0]];

                // console.log("meow ", i, pipeTree.length);
                if(
                    !legacyData.noSpecialArguments &&(
                        i === pipeTree.length - 1
                        ||
                        (
                            i + 1 < pipeTree.length &&
                            pipeTree[i + 1].type === pipeType.dataClear
                        )
                    )
                ){
                    commandPartsToUse.push("-t");
                }
                // console.log(commandPartsToUse);

                commandPartsToUse.push(...commandExecParts.slice(1));


                if(Array.isArray(result)){
                    commandPartsToUse.push(...result);
                }
                else if(result !== undefined){
                    commandPartsToUse.push(result);
                }

                // console.log('dadad ', commandPartsToUse);
                const cmdRes = handleCommandInternal(
                    commandPartsToUse, conf.silent, conf.logNode
                );

                // console.log(cmdRes);s

                if(isControlType(cmdRes)){
                    if(isOnlyToRedirect(cmdRes) && i !== pipeTree.length - 1){
                        result = cmdRes.val;
                    }
                    else if(isPipeHalt(cmdRes)){
                        pipeHaltCalled = true;
                    }
                    else if(isExplicitUndefined(cmdRes)){
                        result = cmdRes;
                    }
                    else return undefined;
                }
                else{
                    result = cmdRes;
                }

                break;
            }
            case pipeType.pipe: {
                // NO NEED TO IMPLEMENT CAUSE IT ACTUALLY ALREADY WORKING!
                break;
            }

            case pipeType.and: {
                if(!internalIsTrue(result)){
                    return result;
                }

                break;
            }

            case pipeType.or: {
                if(internalIsTrue(result)){
                    return result;
                }

                break;
            }
        }
    }

    return result;
}



// that functions handles commands. It's for internal usage
function handleCommandInternal(parts: any[], silent: boolean = false, logNode: string | logNode = "console"): cmdCallbackResponse | void{
    // get parts

    // try to execute it
    if(Object.hasOwn(commands, parts[0])){
        // print the info as log about that cmd
        // if(!silent)
        // log(LogType.INFO, `This command has been executed: '${text}'`, logNode);

        try {
            const cmdData = commands[parts[0]];

            // get the orginal command if that is an alias
            let orginalCmd;
            if(cmdData.isAlias){
                orginalCmd = commands[cmdData.aliasName as string] as commandDataAsync | commandDataRegular;

                if(!orginalCmd){
                    throw new logSystemError("invalid alias");
                }

                if(orginalCmd.async){

                }
                else
                return (orginalCmd.callback as cmdcallback)(parts);
            }
            else orginalCmd = cmdData;

            const cmdToUse = orginalCmd as commandDataRegular | commandDataAsync;

            // execute it
            if(orginalCmd.async){
                (cmdToUse.callback as cmdCallbackAsync)(parts);
                return true;
            }
            else{
                return (cmdToUse.callback as cmdcallback)(parts);
            }


            // return commands[parts[0]].callback(parts);
        
        // catch errors
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the command execution:\n" + formatError(error), logNode);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    else if(parts[0] in bindInfo){
        // print the info as log about that bind
        // if(!silent)
        // log(LogType.INFO, `This bind has been executed: '${text}'`, logNode);

        let bindD = bindInfo[parts[0]];
        try {
            // for(const command of bindD.commands){
            //     commandInternalExec(command, true);
            // }
            return commandInternalExec(bindD.command, true, logNode, true);
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the bind execution:\n" + formatError(error), logNode);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    // catch unkown command
    else{
        if(!silent)
        log(LogType.ERROR, `unknown command '${parts[0]}'` , logNode);

        if(!legacyData.pipes) return undefined;

        return {__$special: specialTypes.pipeExecutorHalt}; 
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


// /**
//  * converts a provided logType to the belonging logType string
//  * @param type logType
//  * @returns string of that logtype
//  */
// function resolveLogType(type: LogType): string {
//     switch(type){
//         case LogType.SUCCESS:
//             return "SUCCESS";
//         case LogType.ERROR:
//             return "ERROR";
//         case LogType.INFO:
//             return "INFO";
//         case LogType.WARNING:
//             return "WARNING";
//         case LogType.COUNTER: 
//             return "COUNTER";
//         case LogType.INIT:
//             return "INIT";
//         case LogType.CRASH:
//             return "CRASH";
//         case LogType.GROUP:
//             return "GROUP";
//         default: return "UNKNOWN";
//     }
// }

// /**
//  * converts a provided logType to the belonging logType color
//  * @param type logType
//  * @returns color
//  */
// function resolveLogColor(type: LogType): consoleColor {
//     switch(type){
//         case LogType.SUCCESS:
//             return colorTable.success;
//         case LogType.ERROR:
//             return colorTable.error;
//         case LogType.INFO:
//             return colorTable.info;
//         case LogType.WARNING:
//             return colorTable.warning;
//         case LogType.COUNTER: 
//             return colorTable.counter;
//         case LogType.INIT:
//             return colorTable.init;
//         case LogType.CRASH:
//             return colorTable.crash;
//         case LogType.GROUP:
//             return colorTable.group;
//         default: return consoleColors.Reset;
//     }
// }

// /**
//  * allows you to write raw logs
//  * @param type the type of the log
//  * @param message the message
//  * @param who the executioner (for the logs). Defaults to "core"
//  */
// function log(type: LogType, message: string, who: string | logNode = "core") {
//     if(blockLogsVar) return;

//     // if that's the parentNode, then get its string
//     if(typeof who === "object") who = who.toString();
    
    

//     const currentDate: Date = new Date();
//     const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;

//     const logTypeString: string = resolveLogType(type);
//     const logColor: consoleColor = resolveLogColor(type);
    
//     const toWrite: string = `${formattedDate} ${logTypeString} ${who}: ${currentGroupString}${message}\n`;
//     const toDisplay: string = `${colorTable.date}${formattedDate}${consoleColors.Reset} ${logTypeString} ${colorTable.who}${who}${consoleColors.Reset}: ${consoleColors.FgGray}${currentGroupString}${consoleColors.Reset}${logColor}${message}${consoleColors.Reset}\n`;

//     if(viewTextBox){
//         process.stdout.clearLine(0);
//         process.stdout.write(consoleColors.Reset + "\r");
//     }

//     process.stdout.write(toDisplay);

//     appendFileSync(finalLatest, toWrite);

//     if(viewTextBox)
//         process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
// }


// /**
//  * formats an error to allow the stack view
//  * @param error some kind of error
//  * @returns the formated string
//  */
// const formatError = (error: any): string => {
//     return typeof error === "object" && Object.hasOwn(error, "stack") ? error.stack : error;
// }


// /**
//  * logs an error if the provided condition was not met. Nothing happens if it wasn't
//  * It uses logType.ERROR
//  * @param condition the condition
//  * @param message the message to print
//  * @param who the executioner (for the logs). Defaults to "core"
//  */
// function assertConsole(condition: boolean, message: string, who: string | logNode = "core"){
//     if(!condition) log(LogType.ERROR, message, who)
// }

// /**
//  * clears the console. Equivalent to vannilia JS console.clear()
//  */
// function clearConsole(){
//     process.stdout.cursorTo(0,0);
//     process.stdout.clearScreenDown();

//     if(viewTextBox){
//         process.stdout.write("\x1b[0m> \x1b[35m"+text);
//     }
// }

// /**
//  * stores the counters
//  */
// const counterTable: Record<string, number> = {

// };

// /**
//  * counts the counter
//  * @param name the name of the counter
//  * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
//  * @param increaseBy the increment value. Defaults to 1
//  * @param who the executioner (for the logs). Defaults to "core"
//  * @returns the current name on the counter.
//  */
// function counterCount(name: string, startFrom: number = 1, increaseBy: number = 1, who?: string | logNode): number{
//     if(!Object.hasOwn(counterTable, name)){
//         counterTable[name] = startFrom;
//     }
//     else{
//         counterTable[name] += increaseBy;
//     }

//     log(LogType.COUNTER, `${name} -> ${ counterTable[name]}`, who);

//     return counterTable[name];
// }


// /**
//  * removes (resets) the couter
//  * @param name the counter name
//  */
// function counterCountReset(name: string){
//     if(Object.hasOwn(counterTable, name)){
//         delete counterTable[name];
//     }
// }

// /**
//  * returns the number register on the counter
//  * @param name the name of the counter
//  * @returns undefined if doesnt exist or the number if exist
//  */
// function getCounter(name: string): undefined | number{
//     return counterTable[name] ? counterTable[name] : undefined;
// }


// /**
//  * prints the viewTextbox
//  */
// function printViewTextbox(){
//     process.stdout.write("\x1b[0m> \x1b[35m"+text);
// }


// /**
//  * IT'S A VERY LOW LEVEL. CONSIDER USING consoleWrite instead 
//  * (or consoleMultiWrite or multiDisplayer if you want to have more abstraction)
//  * 
//  * it just prints (or also writes to a file) as it says.
//  * it will not care about displayed anything. It won't check for anything.
//  * Use it on your own risk!
//  * 
//  * it requires by default disabling the textbox visibility and then turning it on!
//  * (something that consoleWrite does itself!)
//  * 
//  * it does not print a new line!
//  * 
//  * It can cause a lot of undesired and unexpected behaviour with the cause without the caution
//  *
//  * 
//  * @param textToWrite the raw text to print
//  * @param fileToWrite what to print to a file log. a string will be printed directly. The booleans will cause a special behaviour, where false means no writting to a file and true means copying the first argument
//  */
// function consoleUltraRawWrite(
//     textToWrite: string, 
//     fileToWrite: string | boolean = true
// ){
//     process.stdout.write(textToWrite);

//     if(fileToWrite === true){
//         appendFileSync(finalLatest, textToWrite);
//     }
//     else if(fileToWrite !== false){
//         appendFileSync(finalLatest, fileToWrite);
//     }
// }

// /**
//  * writes a raw text to the console. Allows you to not use log format
//  * 
//  * if you want even more low level api use consoleUltraRawWrite()
//  * 
//  * @param textToWrite the text to write
//  * @param WithColor color (optional). Defaults to consoleColors.Reset
//  * @param writeToFile whether it should be written to the file. defaults to true
//  * @param end the end symbol. defaults to \n
//  */
// function consoleWrite(
//     textToWrite: string, 
//     WithColor: consoleColors | consoleColors[] | consoleColorRGB = consoleColors.Reset, 
//     writeToFile: boolean = true,
//     end: string = "\n"
// ){
//     if(Array.isArray(WithColor)) WithColor = WithColor.reduce((prev, next) => (prev+next) as consoleColors) as any as consoleColors;

//     if(viewTextBox){
//         process.stdout.clearLine(0);
//         process.stdout.write("\r");
//     }

//     process.stdout.write(WithColor+textToWrite+"\x1b[0m"+end);

//     if(writeToFile) appendFileSync(finalLatest, stripVTControlCharacters(textToWrite)+end);

//     if(viewTextBox){printViewTextbox()}
// }

// /**
//  * the function to combine colors
//  * 
//  * USE IT TO ENSURE THE COMPATIBILITY WITH THE NEXT VERSION
//  * 
//  * IT DOESNT WORK with colors created with libraries like chalk or with generateAnsiColor
//  * 
//  * @param colors colors
//  * @returns the combined colors
//  */
// function combineColors(...colors: consoleColor[]): consoleColorsMulti{
//     let toReturn: consoleColorsMulti = "";

//     for(let color of colors){
//         toReturn += color;
//     }

//     return toReturn;
// }

// /**
//  * allows you to write double input (with colors and without to not mess with logs files)
//  * @param withoutColors 
//  * @param withColors 
//  */
// function consolePairWrite(withoutColors: string, withColors: string){
//     if(viewTextBox){
//         process.stdout.clearLine(0);
//         process.stdout.write("\r");
//         process.stdout.write(consoleColors.Reset);
//     }

//     process.stdout.write(withColors);
    
//     appendFileSync(finalLatest, withoutColors);

//     if(viewTextBox){printViewTextbox()}
// }

// /**
//  * allows you to write multi colors to the console in the single command
//  * 
//  * the length of texts array and colors array have to be the exact match!
//  * 
//  * example:
//  * 
//  * consoleMultiWrite(["MEOW", " :3s"], [consoleColors.fgRed, consoleColors.fgBlue]);
//  * 
//  * you can also use multiple colors
//  * 
//  * 
//  * @param texts the array of texts
//  * @param colors the array of colors
//  * @param writeToFile whether to write it to file or only to console
//  * @param end the end symbol. It defaults to \n
//  */
// function consoleMultiWrite(texts: string[], colors: Array<consoleColors | consoleColorsMulti>, writeToFile: boolean = true, end: string = ""){
//     if(texts.length !== colors.length){
//         throw new logSystemError("Text array length and colors array length dont match!"
//             + texts.toString() + " vs " + colors.toString()
//         );
//     }


//     let toWrite: string = "";
//     let toDisplay: string = "";

//     for(let index in texts){
//         toWrite += texts[index];
//         toDisplay += colors[index] + texts[index] + consoleColors.Reset;
//     }


//     if(viewTextBox){
//         process.stdout.clearLine(0);
//         process.stdout.write("\r");
//         process.stdout.write(consoleColors.Reset);
//     }

//     process.stdout.write(toDisplay+end);
    
//     if(writeToFile) appendFileSync(finalLatest, toWrite+end);

//     if(viewTextBox){printViewTextbox()}
// }

/**
 * the class that offers abstraction to consoleMultiWrite.
 * 
 * it works like an array
 * 
 * example:
 * 
 * 
 * let g = new multiDisplayer();
 * 
 * g.push("\n");
 * g.push("meoww!", consoleColors.fgRed);
 * g.push(" :3", consoleColors.fgBlue);
 * g.push("\n");
 * g.useConsoleWrite()
 * 
 * would be equal to:
 * consoleMultiWrite(["\n", "meoww!", " :3", "\n"], ["", consoleColors.fgRed, consoleColors.fgBlue, ""]);
 */

type multiPairDisplayer = [string, string];

function multiPairDisplayerCreate(withoutColors: string, withColors: string): multiPairDisplayer{
    return [withoutColors, withColors];
}

// class multiDisplayer{
//     private texts: string[] = [];
//     private colors: Array<consoleColor | consoleColorsMulti> = [];

//     constructor(){}

//     // static fromReadyString(text: string){
//     //     const toReturn = new multiDisplayer();

//     //     const codes = [];

//     //     const ansiRegex = /\u001b\[[0-9;]*m/g;

//     //     toReturn.colors = text.match(ansiRegex) || [];

//     //     toReturn.texts = text.split(ansiRegex).filter(s => s);

//     //     return toReturn;
//     // }

//     /**
//      * adds the new characters (and) colors to displayer
//      * 
//      * for adding at the beginning, check: unshift()
//      * 
//      * @param text the text to be added
//      * @param colors colors|color of that text
//      */
//     push(text: string, colors?: consoleColor | consoleColorsMulti){
//         this.texts.push(text);

//         if(colors)
//             this.colors.push(colors);
//         else
//             this.colors.push("");
//     }

//     /**
//      * adds the new characters (and) colors to displayer at the beginning
//      * 
//      * for adding at the last place, check: push()
//      * 
//      * @param text the text to be added
//      * @param colors colors|color of that text
//      */
//     unshift(text: string, colors?: consoleColor | consoleColorsMulti){
//         this.texts.unshift(text);

//         if(colors)
//             this.colors.unshift(colors);
//         else
//             this.colors.unshift("");
//     }

//     /**
//      * pops the last element and returns it
//      * @returns the popped element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
//      */
//     pop(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
//         return [this.texts.pop(), this.colors.pop()];
//     }

//     /**
//      * shifts the first element and returns it
//      * @returns the shifted element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
//      */
//     shift(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
//         return [this.texts.shift(), this.colors.shift()];
//     }

//     /**
//      * returns the string without color table
//      * @returns the raw string
//      */
//     toRawString(): string {
//         return this.texts.join("");
//     }

//     /**
//      * allows you to use finally consoleWrite. It's required because js has no constructors
//      * @param writeToFile parameter to be passed to consoleWrite. Leave it as undefined to leave it as default
//      * @param clearObj whether to clear the arrays on that objects. Defaults to true
//      */
//     useConsoleWrite(writeToFile: boolean | undefined = true, clearObj: boolean = true){
//         // default of writeToFile
//         if(writeToFile === undefined) writeToFile = true;

//         // use consoleMultiWrite
//         consoleMultiWrite(this.texts, this.colors, writeToFile);

//         // clear objs
//         if(clearObj){
//             this.texts = [];
//             this.colors = [];
//         }
//     }

//     /**
//      * clears the whole array
//      */
//     clear(){
//         this.texts = [];
//         this.colors = [];
//     }
// }

// types for internal typing
// type consoleColor = string;
// type consoleColorsMulti = string;
// type consoleColorRGB = string;

// /**
//  * generate a new ansi Color with rgb
//  * @param red 
//  * @param green 
//  * @param blue 
//  * @returns the ansi color
//  */
// function generateAnsiColor(red: number, green: number, blue: number): consoleColorRGB {
//   return `\u001b[38;2;${red};${green};${blue}m`;
// }

// /**
//  * colors
//  */
// enum consoleColors{
//     Reset = "\x1b[0m",
//     Bright = "\x1b[1m",
//     Dim = "\x1b[2m",
//     Underscore = "\x1b[4m",
//     Blink = "\x1b[5m",
//     Reverse = "\x1b[7m",
//     Hidden = "\x1b[8m",
    
//     FgBlack = "\x1b[30m",
//     FgRed = "\x1b[31m",
//     FgGreen = "\x1b[32m",
//     FgYellow = "\x1b[33m",
//     FgBlue = "\x1b[34m",
//     FgMagenta = "\x1b[35m",
//     FgCyan = "\x1b[36m",
//     FgWhite = "\x1b[37m",
//     FgGray = "\x1b[90m",
    
//     BgBlack = "\x1b[40m",
//     BgRed = "\x1b[41m",
//     BgGreen = "\x1b[42m",
//     BgYellow = "\x1b[43m",
//     BgBlue = "\x1b[44m",
//     BgMagenta = "\x1b[45m",
//     BgCyan = "\x1b[46m",
//     BgWhite = "\x1b[47m",
//     BgGray = "\x1b[100m",
// }

// /**
//  * quick lookup table for color groups
//  */
// let colorTable: Record<string, consoleColor> = {

//     "info": consoleColors.FgWhite,
//     "warning": consoleColors.FgYellow,
//     "error": consoleColors.FgRed,
//     "success": consoleColors.FgGreen,
//     "counter": consoleColors.FgCyan,
//     "init": consoleColors.FgWhite,
//     "crash": consoleColors.FgRed,
//     "group": consoleColors.FgGray,

//     "date": consoleColors.FgGray,
//     "who": consoleColors.FgMagenta

// }


// /**
//  * function to use to block incoming logs
//  * @param status allows you to block incoming logs. Defaults to undefined, which does nothing
//  * @returns current status
//  */
// function blockLogs(status?: boolean): boolean{
//     if(typeof status === "boolean") blockLogsVar = status;

//     return blockLogsVar;
// }


// /**
//  * function to use to hide textbox to write texts
//  * @param status allows to change the status
//  * @returns current status
//  */
// function textboxVisibility(status?: boolean): boolean{
//     if(typeof status === "boolean") viewTextBox = status;
	
// 	if(status === false){
// 		process.stdout.clearLine(0);
//         process.stdout.write("\r");
// 	}
// 	else if(status === true){
// 		process.stdout.write("\x1b[0m> \x1b[35m"+text);
// 	}

//     return viewTextBox;
// }

// /**
//  * returns unified formated error
//  * @param taskName the name of the task
//  * @param error the error
//  * @returns `The error with the task: '${taskName}'. The error message:\n${formatError(error)}\n`
//  */
// function formatTaskError(taskName: string, error: any): string{
//     return `The error with the task: '${taskName}'. The error message:\n${formatError(error)}\n`;
// }

// /**
//  * allows you to easily use log without retypping task info
//  * 
//  * example:
//  * useWith("bulding core data...", () => {
//  *     let s = connectToApi();
//  *     s.build();
//  * }, "userAccounter")
//  * 
//  * @param message the task description
//  * @param func function that runs task (it will invoke it without any parameters)
//  * @param who who is responsible
//  * @param silent Defaults to false. Allows you for the removal of logs
//  * @returns the func result or an error object
//  */
// function useWith(
//     message: string, func: CallableFunction, 
//     who: string | logNode = "core", silent: boolean = false
// ): any | Error{
//     log(LogType.INFO, message, who);
//     try {
//         let funcRes = func();

//         if(!silent)
//         log(LogType.SUCCESS, message, who);

//         return funcRes;
//     } catch (error) {

//         if(!silent)
//         log(LogType.ERROR, formatTaskError(message, error), who);

//         return error;
//     }
// }


/**
 * class used to tell the localisation of logs. That is an optional class
 * You can still pass strings instead of that!
 */
// class logNode{
//     // the name of that log
//     name: string;

//     // the parent of that parent
//     private parent?: logNode;

//     /**
//      * 
//      * @param name the name of the nod
//      * @param parent the parent (optional)
//      */
//     constructor(name: string, parent?: logNode){
//         this.name = name;
//         this.parent;
//     }

//     /**
//      * gets the node parent
//      * @returns parent or undefined if no parent is present
//      */
//     getParent(): undefined | logNode{
//         return this.parent;
//     }

//     /**
//      * returns the formatted string using fast algorithm
//      * @returns formatted string
//      */
//     toString(): string {
//         let toReturn = ""; // create a string

//         let parent: logNode | undefined = this as logNode; // get parent

//         // loop till there's no more
//         while(true){

//             // if no parent, then return
//             if(!parent){
//                 // toReturn = "core" + "." + toReturn;
//                 break;
//             }

//             // add parent name
//             toReturn = parent.name + "." + toReturn;

//             // get the next parent
//             parent = parent.getParent();
//         }


//         // return without the last dot
//         return toReturn.slice(0, toReturn.length - 1);
//     }
// }


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

// /**
//  * set information displayed at versionInfo
//  * 
//  * INFORMATION: NOT RECOMMENDED CHANGING DURING RUNTIME
//  * 
//  * @param callback versionInfoData
//  * @returns versionInfoData
//  */
// function versionInfo(callback?: () => string): string {
//     if(callback !== undefined) config.getversionInfoData = callback;

//     return config.getversionInfoData();
// }


// /**
//  * returns the current version of log system
//  * 
//  * example:
//  * 
//  * let w = getCurrentVersionOfLogSystem("string");
//  * 
//  * @param as string or number 
//  * @returns log system version in type depending of selected
//  */
// function getCurrentVersionOfLogSystem(as: "number" | "string" = "string"): string | number {
//     if(as === "string") return String(logSystemVer);
//     else if(as === "number") return Number(logSystemVer);
//     else return -1;
// }

// // group settings
// interface groupSettings{
//     messageVisible?: boolean,
//     messageWho?: string | logNode,
//     error?: boolean
// }

// /**
//  * creates (joins) a new group for that log
//  * @param name the group name
//  * @returns the new current group string
//  */
// function logGroup(name: string, info: Omit<groupSettings, "error"> = {}): string{

//     if(!("messageVisible" in info) || info.messageVisible){
//         const whoS = info.messageWho ? info.messageWho : undefined;
//         log(LogType.GROUP, name, whoS);
//     }

//     logGroups.push(name);

//     // return currentGroupString = currentGroupString.slice(0, currentGroupString.indexOf(lastLogGroupText)) + singleLogGroupText + lastLogGroupText;

//     return reconstructLogGroup();
// }

// /**
//  * leaves the group created with logGroup / group
//  * @returns the new current group group string
//  */
// function logGroupEnd(info: Omit<groupSettings, "messageVisible" | "messageWho"> = {}): string {

    
//     // currentGroupString = currentGroupString.slice(0, currentGroupString.lastIndexOf(singleLogGroupText)) + lastLogGroupText;

//     // // TODO: MAYBE IN THE FUTURE? better group ending

//     // return currentGroupString;


//     if(logGroups.length === 0){
//         if("error" in info && info.error){
//             throw new logSystemError("there's no group");
//         }

//         return currentGroupString;
//     }

//     logGroups.pop();

//     return reconstructLogGroup();
// }

// /**
//  * recreates a currentGroupString from other things
//  * @returns currentGroupString
//  */
// function reconstructLogGroup(): string{
//     currentGroupString = "";

//     for(let i = 0; i < logGroups.length; i++){
//         currentGroupString += config.singleLogGroupText;
//     }

//     if(logGroups.length !== 0)
//     currentGroupString += config.lastLogGroupText + " ";

//     return currentGroupString;
// }

// /**
//  * creates a new timer with specified name
//  * @param label the timer name
//  * @param info configuration information
//  * @returns the start time
//  */
// function logTimeStart(label: string, info: Omit<groupSettings, "error"> = {}): number{
//     const time = Date.now();

//     timers[label] = time;

//     if(!("messageVisible" in info) || info.messageVisible){
//         const whoS = info.messageWho ? info.messageWho : undefined;
//         log(LogType.GROUP, `timer '${label}' started`, whoS);
//     }

//     return time;
// }

// /**
//  * stops a timer with specified name
//  * 
//  * if info.error set to true, it causes an error if there's no timer with that name, otherwise it just ignores it
//  * 
//  * @param label the timer name
//  * @param info configuration information
//  * @returns elapsed time
//  */
// function logTimeEnd(label: string, info: groupSettings = {}): number{
//     if(!(label in timers) && "error" in info && info.error){
//         throw new logSystemError("there's no timer with that name");
//     }

//     const elapsed = Date.now() - timers[label];
//     delete timers[label];

//     if(!("messageVisible" in info) || info.messageVisible){
//         const whoS = info.messageWho ? info.messageWho : undefined;
//         log(LogType.GROUP, `timer '${label}' ended. ${elapsed}ms`, whoS);
//     }

//     return elapsed;
// }

// /**
//  * returns the current time of the timer
//  * @param label the timer name
//  * @param info configuration information
//  * @returns the current time
//  */
// function logTimeStamp(label: string, info: groupSettings = {}): number{
//     if(!(label in timers) && "error" in info && info.error){
//         throw new logSystemError("there's no timer with that name");
//     }

//     const elapsed = Date.now() - timers[label];

//     if(!("messageVisible" in info) || info.messageVisible){
//         const whoS = info.messageWho ? info.messageWho : undefined;
//         log(LogType.GROUP, `timer '${label}' stamp: ${elapsed}ms`, whoS);
//     }

//     return elapsed;
// }


// the default behaviour for inspect
const inspectDefaultBehaviourForConsole: InspectOptions = {colors: true};

/**
 * formats (inspect) data and returns it
 * 
 * NOT USED. TODO
 * 
 * @param data 
 * @returns formated data
 */
const formatMultiData = (...data: any[]) => {
    return data.map(
        (s: any) => {
            inspect(s, inspectDefaultBehaviourForConsole)
        }
    ).join(" ");
}

/**
 * api compatbile with orginal console.log() which accepts a lot more than one argument of any type
 * NOT USED. TODO
 * @param messages messages to display in log format
 */
const compatibleLog = (...messages: any[]) => {
        log(LogType.INFO, messages.join(" ")
    );
};

const aliasCache: Record<string, string[]> = {};


/**
 * creates a cache for an alias
 * @param command 
 */
function createAliasCache(command: string){
    if(!(command in commands)){
        throw new Error("that command doesnt exist!");
    }

    const newData: string[] = [];

    for(const [name, data] of Object.entries(commands)){
        // console.log(command, data.aliasName, data.isAlias, data.isAlias, data.aliasName)

        if(data.isAlias && data.aliasName === command){
            newData.push(name);
        }
    }

    aliasCache[command] = newData;
}

/**
 * allows you to generate aliases to that command
 * @param commandName the name of commands
 * @returns every alias to that command
 */
function getAliases(commandName: string): string[]{
    if(commandName in aliasCache) return aliasCache[commandName];

    createAliasCache(commandName);

    return aliasCache[commandName];
}

/**
 * Simple interface for the fast use of console utilities
 */
const newConsole = {
    log: compatibleLog,
    debug: compatibleLog,
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
    // versionInfo,
    showCursor,
    hideCursor,
    getCurrentVersionOfLogSystem,
    combineColors,
    group: logGroup,
    logGroup,
    groupEnd: logGroupEnd,
    logGroupEnd,
    groupCollapsed: logGroup,
    time: logTimeStart,
    logTimeStart,
    timeEnd: logTimeEnd,
    logTimeEnd,
    timeStamp: logTimeStamp,
    logTimeStamp
}   

// adding the console to global
if(config.useAddToGlobalAs){
    const obj: Record<string, typeof newConsole> = {};
    for(const part of config.addToGlobalAs){
        obj[part] = newConsole;
    }
    Object.assign(globalThis, obj);
}

/**
 * internal interup handler
 * @param reason the reason of the interup
 */
function interupHandler(reason: string = "INTERUP (i guess?)"){
    // process.stdout.write("\x1b[0m");
    textboxVisibility(false);
    actualCrash(`The execution was manually stopped by ${reason}!`, "core", -1);
}

process.addListener("SIGINT", () => interupHandler("INTERUP (SIGINT)"));

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
    Object.assign(globalThis, {console: newConsole, orginalConsole: globalThis.console, newConsole});
}


/**
 * allows you to create a fake loop to keep the process alive. It was used mostly for testing
 */
function keepProcessAlive(resolveTime: number = 20){
    (async () => {
        while(true){
            await new Promise((resolve) => setTimeout(resolve, resolveTime));
        }
    })();
}

// /**
//  * allows you to easily create multilined strings without bad readability in code
//  * @param data the data
//  * @returns joined data with \n
//  */
// function multiLineConstructor(...data: string[]): string{
//     return data.join("\n");
// }

/**
 * in theory it should allow you to restart the current process
 * 
 * But i couldn't get it into forking
 * 
 * TODO
 */
function processRestart(){
    newConsole.warn("It may not work!");
    fork(join(import.meta.dirname, __filename), {stdio: "overlapped"});
    process.kill(0);
//  const subprocess = spawn(process.argv[0], process.argv.slice(1), {detached: true, stdio: "inherit"});

//     subprocess.unref();
//     process.exit(0);

}

// log(LogType.INIT, "new log session completely created!");

// writting the welcome message
// if(config.quickHello){
//     log(LogType.INIT, `log system v${logSystemVer} by Naticzka was properly loaded!`);
// }
// else
// {
//     const s = new multiDisplayer();

//     s.push("Log system has been properly loaded!\n", consoleColors.FgGreen);
//     s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
//     s.push("\n\n");
//     s.push(`Welcome to the log system v${logSystemVer} `, consoleColors.FgCyan);
//     s.push("by Naticzka\n", combineColors(consoleColors.FgMagenta, consoleColors.Blink));
//     s.push("\n")
//     s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
//     s.push("\n");
//     s.push("start using it by writting 'help' or '?'\n")
//     s.useConsoleWrite(false);
// }


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
    multiDisplayer,
    getCurrentVersionOfLogSystem,
    registerCommandLegacy,
    registerCommandLegacyForceUse,
    multiCommandRegister,
    commandCompound,
    registerCommandShort,
    combineColors,
    legacyDataType,
    validateLegacyProperty,
    setLegacyInformation,
    getLegacyInformation,
    logGroup as group,
    logGroup,
    logGroupEnd as groupEnd,
    logGroupEnd,
    logGroup as groupCollapsed,
    logTimeStart as time,
    logTimeStart,
    logTimeEnd as timeEnd,
    logTimeEnd,
    logTimeStamp as timeStamp,
    logTimeStamp,
    // internalPipeDivider
    pipeDividerInternal,
    commandDividerInternal,
    pipeExecutor,
    consoleUltraRawWrite,
    multiLineConstructor,

    smartArgs,
    smartArgumentList,
    generateAnsiColor,
    consolePairWrite,
    printViewTextbox
}