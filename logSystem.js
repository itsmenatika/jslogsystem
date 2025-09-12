"use strict";
// LOG SYSTEM
// created by naticzka ;3
// github: https://github.com/itsmenatika/jslogsystem
// version: 1.15
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiDisplayer = exports.logNode = exports.commands = exports.logSystemError = exports.blankCallback = exports.newConsole = exports.console = exports.consoleColors = exports.formatError = exports.LogType = void 0;
exports.log = log;
exports.clearConsole = clearConsole;
exports.consoleWrite = consoleWrite;
exports.assertConsole = assertConsole;
exports.blockLogs = blockLogs;
exports.registerCommand = registerCommand;
exports.removeCommand = removeCommand;
exports.commandList = commandList;
exports.isCommandRegistered = isCommandRegistered;
exports.counterCount = counterCount;
exports.counterCountReset = counterCountReset;
exports.useWith = useWith;
exports.uw = useWith;
exports.fte = formatTaskError;
exports.formatTaskError = formatTaskError;
exports.actualCrash = actualCrash;
exports.globalEval = globalEval;
exports.replaceConsole = replaceConsole;
exports.keepProcessAlive = keepProcessAlive;
exports.showCursor = showCursor;
exports.hideCursor = hideCursor;
exports.consoleMultiWrite = consoleMultiWrite;
exports.getCurrentVersionOfLogSystem = getCurrentVersionOfLogSystem;
exports.registerCommandLegacy = registerCommandLegacy;
exports.registerCommandLegacyForceUse = registerCommandLegacyForceUse;
exports.multiCommandRegister = multiCommandRegister;
exports.registerCommandShort = registerCommandShort;
exports.combineColors = combineColors;
exports.validateLegacyProperty = validateLegacyProperty;
exports.setLegacyInformation = setLegacyInformation;
exports.getLegacyInformation = getLegacyInformation;
exports.group = logGroup;
exports.logGroup = logGroup;
exports.groupCollapsed = logGroup;
exports.groupEnd = logGroupEnd;
exports.logGroupEnd = logGroupEnd;
exports.time = logTimeStart;
exports.logTimeStart = logTimeStart;
exports.timeEnd = logTimeEnd;
exports.logTimeEnd = logTimeEnd;
exports.timeStamp = logTimeStamp;
exports.logTimeStamp = logTimeStamp;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = require("node:path");
const node_process_1 = require("node:process");
// CONFIG
// USE JOIN for paths
const LOGDIRECTORY = (0, node_path_1.join)("dev", "logs");
const LATESTLOGNAME = "latest.txt";
// TO EDIT COLORS SEARCH FOR consoleColorTable!
// callback to write information on the "ver" command
let getversionInfoData = () => {
    return "";
};
// callback to write information on the top
const getMoreStartInformation = () => {
    const dateObj = new Date();
    return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n`;
};
// callback which is used to what to do with the previous log file
const saveTheLatest = (date, previousFilePath) => {
    (0, node_fs_1.renameSync)(previousFilePath, (0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()} ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`));
};
let viewTextBox = true; // if the textbox should be visible at the start
let blockLogsVar = false; // if the logs should be displayed
let singleLogGroupText = "┄┅"; // the indicator used to indicate a single log group
let lastLogGroupText = "░"; // the string that gets added to the last group. It only gets added if there's at least log grpoup
const useAddToGlobalAs = false; // whether to newConsole as a global automatically. It defaults to false
const addToGlobalAs = ["newConsole"]; // addsnewConsole as listed keys to globalThis. Works only with useAddToGlobalAs enabled.
// ___________________________________________
//
// CODE
//
// DONT TOUCH IT!
//
// ___________________________________________
/**
 * the type of log
 */
var LogType;
(function (LogType) {
    LogType[LogType["INFO"] = 0] = "INFO";
    LogType[LogType["INFORMATION"] = 0] = "INFORMATION";
    LogType[LogType["ERROR"] = 1] = "ERROR";
    LogType[LogType["ERR"] = 1] = "ERR";
    LogType[LogType["WARNING"] = 2] = "WARNING";
    LogType[LogType["WAR"] = 2] = "WAR";
    LogType[LogType["SUCCESS"] = 3] = "SUCCESS";
    LogType[LogType["SUCC"] = 3] = "SUCC";
    LogType[LogType["SUC"] = 3] = "SUC";
    LogType[LogType["INITIALIZATION"] = 4] = "INITIALIZATION";
    LogType[LogType["INIT"] = 4] = "INIT";
    LogType[LogType["INT"] = 4] = "INT";
    LogType[LogType["CRASH"] = 5] = "CRASH";
    LogType[LogType["COUNTER"] = 6] = "COUNTER";
    LogType[LogType["GROUP"] = 7] = "GROUP";
})(LogType || (exports.LogType = LogType = {}));
let commandHistory = []; // user command history history
let indexCommandHistory = null; // the index of current selected
const logSystemVer = "1.15"; // current version of the log system
const currentUpTime = Date.now(); // uptime start date
let currentGroupString = ""; // the current string for groups to make it run faster (you can name it cache, i guess?)
let logGroups = []; // groups for console.group()
const timers = {}; // the list of timers used with console.time()
class logSystemError extends Error {
}
exports.logSystemError = logSystemError;
; // the easy error wrapper to log errors
// settings that are to provide to process stdin
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8");
// check for the log directory
if (!(0, node_fs_1.existsSync)((0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY))) {
    // make it if it doesn't exist
    (0, node_fs_1.mkdirSync)((0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY), { recursive: true });
}
const finalLatest = (0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY, LATESTLOGNAME); // the path to the previous log
const tempFinal = (0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY, "temp"); // the path to previous temp file log
// check whether the previous log exist
if ((0, node_fs_1.existsSync)(finalLatest)) {
    // if the latest log does exist, then temp shall too!
    if (!(0, node_fs_1.existsSync)(tempFinal)) {
        throw new logSystemError("Error with moving the previous log!");
    }
    const data = (0, node_fs_1.readFileSync)(tempFinal).toString(); // get the data of the previous log (temp data)
    const piecesOfData = data.split("\n"); // split it into lines
    const date = new Date(Number(String(piecesOfData[0]))); // the first line is the date line
    // calling the callback to do stuff with previous one
    saveTheLatest(date, finalLatest);
    // removing temp
    (0, node_fs_1.unlinkSync)(tempFinal);
}
// create new temp file
(0, node_fs_1.writeFileSync)(tempFinal, `${Date.now()}\n`);
// create a new latest log file
(0, node_fs_1.writeFileSync)(finalLatest, getMoreStartInformation());
(0, node_fs_1.appendFileSync)(finalLatest, "----------------\n");
// vars to store info
let text = "";
// relative cursor change
let relativePos = 0;
const allowedKeysToWrite = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]" + " " + "!@#$%^&*=~`'/";
// display the textbox at the start
if (viewTextBox) {
    process.stdout.write("> \x1b[35m" + text);
}
// watching user typing
process.stdin.on('data', async (key) => {
    if (key) {
        // escape ctrl + c key
        if (key === '\u0003') {
            process.stdout.write("\x1b[0m");
            textboxVisibility(false);
            actualCrash("The execution was manually stopped by CTRL + C!", "core", -1);
            // process.exit();
        }
        // reappearing of the textbox
        if (!viewTextBox) {
            viewTextBox = true;
            process.stdout.write("\x1b[0m> \x1b[35m");
        }
        // backspace
        if (key.includes("\b")) {
            if (relativePos !== 0) {
                if (relativePos * -1 >= text.length)
                    return;
                text = text.slice(0, text.length + relativePos - 1) + text.slice(text.length + relativePos, text.length);
                hideCursor();
                process.stdout.clearLine(0);
                process.stdout.write("\r");
                printViewTextbox();
                process.stdout.moveCursor(relativePos, 0);
                showCursor();
                return;
            }
            if (text.length > 0) {
                process.stdout.write("\b \b");
            }
            text = text.slice(0, -1);
        }
        // enter
        else if (key.includes("\r")) {
            relativePos = 0;
            indexCommandHistory = null;
            process.stdout.write("\n");
            (0, node_fs_1.appendFileSync)(finalLatest, "> " + text + "\n");
            let tempText = text;
            text = "";
            process.stdout.write("\x1b[0m");
            handleEnter(tempText);
            // if(!handleEnter(tempText) && viewTextBox){
            // process.stdout.write("> \x1b[35m");
            // }
        }
        // up key
        else if (key == '\u001B\u005B\u0041') {
            relativePos = 0;
            if (indexCommandHistory === null) {
                indexCommandHistory = commandHistory.length - 1;
            }
            else {
                indexCommandHistory--;
                if (indexCommandHistory < 0)
                    indexCommandHistory = 0;
            }
            text = commandHistory[indexCommandHistory];
            hideCursor();
            process.stdout.clearLine(0);
            process.stdout.write("\r\x1b[0m> \x1b[35m" + text);
            showCursor();
        }
        // down
        else if (key == '\u001B\u005B\u0042') {
            relativePos = 0;
            if (indexCommandHistory !== null) {
                indexCommandHistory++;
                if (indexCommandHistory >= commandHistory.length)
                    indexCommandHistory = null;
                if (indexCommandHistory !== null)
                    text = commandHistory[indexCommandHistory];
                else
                    text = "";
                hideCursor();
                process.stdout.clearLine(0);
                process.stdout.write("\r\x1b[0m> \x1b[35m" + text);
                showCursor();
            }
        }
        // left
        else if (key === '\u001B\u005B\u0044') {
            if (relativePos * -1 >= text.length)
                return;
            process.stdout.moveCursor(-1, 0);
            relativePos--;
        }
        // right
        else if (key === '\u001B\u005B\u0043') {
            if (relativePos >= 0)
                return;
            process.stdout.moveCursor(1, 0);
            relativePos++;
        }
        // adding keys
        else if (allowedKeysToWrite.includes(key)) {
            if (relativePos !== 0) {
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
});
function hideCursor() {
    process.stdout.write("\x1b[?25l");
}
function showCursor() {
    process.stdout.write("\x1b[?25h");
}
/**
 * blank callback, that can be used for testing purposes
 */
const blankCallback = (args) => false;
exports.blankCallback = blankCallback;
let bindInfo = {};
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
const numberLookUp = (char) => {
    return char == "1" || char == "2" || char == "3" || char == "4" || char == "5" || char == "6" || char == "7" || char == "8" || char == "9" || char == "0";
};
// the list of commands
let commands = {
    exit: {
        usageinfo: "exit <exit code...>",
        desc: "allows you to stop the process",
        longdesc: "It will execute process.exit(exitcode) that will cause the whole process to cease to exist. Your work may be lost. But sometimes it's the only easy way to close your program. If you want to safe close, consider using safeexit/sexit (though it requires setting the handler by the app before!).",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args) => {
            let exitCode = args.slice(1).join(" ").trim() !== "" ? args.slice(1).join(" ").trim() : 0;
            // log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: "+ exitCode);
            // process.stdout.write("\x1b[0m");
            // process.exit(exitCode);
            textboxVisibility(false);
            actualCrash("The execution was manually stopped by EXIT COMMAND with code: " + exitCode, "core", -1);
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
        callback: (args) => {
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
    write: {
        usageinfo: "write <data>",
        desc: "allows you to print raw characters on the screen",
        longdesc: "It prints the characters into the screen",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args) => {
            let theString = args.slice(1).join(" ");
            consoleWrite(theString + "\n", consoleColors.FgWhite);
            return false;
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
        callback: (args) => {
            let theString = args.slice(1).join(" ");
            theString = theString.replaceAll("\\\\", "%SLASH%").replaceAll("\\n", "\n").replaceAll("%SLASH%", "\\");
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
        longdesc: "It hides the textbox that shows what you are writting. It also displays the message about what has happened.\nThe message is as follows: \n\nThe textbox was hidden. Start writting to make it appear again!\n\nuse: `hide -h` to remove the message",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args) => {
            let vis = true;
            if (args.includes("-h")) {
                vis = false;
            }
            if (vis) {
                consoleWrite("The textbox was hidden. Start writting to make it appear again!\n");
            }
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
        callback: (args) => {
            let code = args.slice(1).join(" ").trim();
            let evalParent = new logNode("eval");
            // @ts-ignore
            newConsole.useWith("using eval", () => {
                let g = globalEval(code);
                log(LogType.INFO, `eval returned with: ${g}`, evalParent);
            }, evalParent);
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
    version: {
        usageinfo: "version",
        desc: "shows the version information",
        longdesc: "it shows the current version information",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args) => {
            let prev = textboxVisibility();
            textboxVisibility(false);
            consoleWrite("logSystemVer: ");
            consoleWrite(logSystemVer, consoleColors.BgCyan);
            consoleWrite(" by naticzka", [consoleColors.FgMagenta, consoleColors.Blink]);
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
        callback: (args) => {
            let codeC = args.slice(1).join(" ").trim();
            let evalParentC = new logNode("cmd");
            // @ts-ignore
            newConsole.useWith("using cmd", () => {
                let g = (0, node_child_process_1.execSync)(codeC);
                log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
            }, evalParentC);
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
        callback: (args) => {
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
        callback: (args) => {
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
    "bind": {
        usageinfo: `bind [\`<executor>\`:\`<commands...;>\`]`,
        desc: "allows you to set binds or list them",
        longdesc: `If it's used without parameters, then it will print the list of binds.\n\nUsing parameters will result in changing those binds\n\nTo add a new bind use: 'bind \`<executor>\`:\`<commands...;>\`'.\nThe example: 'bind \`meow\`:\`echo meow!\`'\n\nIt's also possible to set more than one command using ; as the seperator.\n\nTo remove bind use: 'bind \`<executor>\`:\`\``,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback: (args) => {
            if (args.length === 1) {
                let s = new multiDisplayer();
                s.push("bind list", combineColors(consoleColors.BgMagenta, consoleColors.FgBlack));
                s.push("\n");
                for (const [name, commandD] of Object.entries(bindInfo)) {
                    s.push("* ", consoleColors.FgYellow);
                    s.push(commandD.executor, consoleColors.FgRed);
                    s.push(" -> ", consoleColors.FgGray);
                    s.push(commandD.commands.toString() + "\n", consoleColors.FgBlue);
                }
                s.useConsoleWrite();
                return false;
            }
            const data = args.slice(1).join(" ");
            if (data[0] != "`") {
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return false;
            }
            let it = 2;
            while (true) {
                let char = data[it];
                if (!char || char == "`")
                    break;
                it++;
            }
            let executor = data.slice(1, it);
            if (executor.length === 0) {
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return false;
            }
            if (data[it] != "`") {
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return false;
            }
            if (data[it + 1] != ":") {
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return false;
            }
            if (data[it + 2] != "`") {
                log(LogType.ERROR, "invalid syntax", "console.bind");
                return false;
            }
            let name = executor.split(" ")[0];
            let it2 = it + 4;
            while (true) {
                let char = data[it2];
                if (!char || char == "`")
                    break;
                it2++;
            }
            if (it + 4 === it2) {
                delete bindInfo[name];
                log(LogType.SUCCESS, "the bind was removed!", "console.bind");
                return false;
            }
            let commandData = data.slice(it + 3, it2);
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
            if (commandData.length === 0) {
                delete bindInfo[name];
                log(LogType.SUCCESS, "the bind was removed!", "console.bind");
                return false;
            }
            let commandListToExecute = commandData.split(";").map((val) => val.trim());
            bindInfo[name] = {
                name,
                commands: commandListToExecute,
                executor
            };
            log(LogType.SUCCESS, "the bind was set!", "console.bind");
            return false;
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
        callback: (args) => {
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
        callback: (args) => {
            const builder = new multiDisplayer();
            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");
            let mus = process.memoryUsage();
            let pairs = [
                ["architecture", node_os_1.default.arch],
                ["host name", node_os_1.default.hostname],
                ["platform", node_os_1.default.platform],
                ["kernel version", node_os_1.default.version],
                ["process priority", node_os_1.default.getPriority()],
                ["machine", node_os_1.default.machine],
                ["cwd", process.cwd()],
                ["heap total", Math.round(mus.heapTotal / 100000) / 10 + "mb"],
                ["heap used", Math.round(mus.heapUsed / 100000) / 10 + "mb"],
                ["cpu usage (1m, 5m, 15m)", `${node_os_1.default.loadavg().map(num => `${num * 100}%`)}`]
            ];
            let cpus = node_os_1.default.cpus();
            let i = 0;
            for (let cpu of cpus) {
                pairs.push([
                    `cpu ${i}`,
                    `${cpu.model} (speed: ${cpu.speed})`
                ]);
                i++;
            }
            for (let pair of pairs) {
                builder.push("\t" + pair[0] + ": ", consoleColors.FgGray);
                builder.push(pair[1], consoleColors.BgRed);
                builder.push("\n");
            }
            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");
            builder.useConsoleWrite();
            return false;
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
        callback: (args) => {
            // if there was no arguments (the first is called command name)
            if (args.length === 1) {
                let toDisplay = [];
                let colors = [];
                for (let [commandName, commandData] of Object.entries(commands)) {
                    if (commandData.hidden)
                        continue;
                    toDisplay.push("* ");
                    colors.push(consoleColors.FgYellow);
                    toDisplay.push(commandName);
                    colors.push(consoleColors.FgWhite);
                    toDisplay.push(" -> ");
                    colors.push(consoleColors.FgMagenta);
                    toDisplay.push(commandData.desc + "\n");
                    colors.push(consoleColors.FgWhite);
                }
                consoleMultiWrite(toDisplay, colors);
            }
            else if (args.length == 2) {
                let forMulti = new multiDisplayer();
                if (!(args[1] in commands)) {
                    forMulti.push("There's no reference to ", consoleColors.FgRed);
                    forMulti.push(args[1], consoleColors.FgYellow);
                    forMulti.push(" in any list!\n", consoleColors.FgRed);
                }
                else {
                    let cmd = commands[args[1]];
                    let cmdTouse;
                    if (cmd.isAlias) {
                        cmdTouse = commands[cmd.aliasName];
                    }
                    else
                        cmdTouse = cmd;
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
                    forMulti.push("\n");
                }
                forMulti.useConsoleWrite();
            }
            return false;
        }
    }
};
exports.commands = commands;
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
function isCommandRegistered(name) {
    return Object.hasOwn(commands, name);
}
/**
 *  returns the list of commands that were registered
 * */
function commandList() {
    return Object.keys(commands);
}
/**
 * allows you to remove the command.
 * it throws logSystemError if the command doesnt exist
 * @param name the name of the command
 */
function removeCommand(name) {
    if (!Object.hasOwn(commands, name)) {
        throw new logSystemError(`The command '${name}' doesn't exist!`);
    }
    delete commands[name];
}
/**
 * register a command using an object
 *
 * NOTE: IT DOESNT WORK IN LEGACY register MODE!
 *
 * @param cmdCom command Compound
 * @param edit whether it is in edit mode
 */
function registerCommandShort(cmdCom, edit = false) {
    if (legacyData.registerMode <= 1.13) {
        throw new logSystemError("Legacy: registerMode has to be at least 1.14");
    }
    registerCommand(cmdCom.name, cmdCom.data, edit);
}
/**
 * allows you to quickly regiser commands
 * @param data an array of commands compounds
 * @param edit whether it is in edit mode
 */
function multiCommandRegister(data, edit = false) {
    if (legacyData.registerMode <= 1.13) {
        throw new logSystemError("Legacy: registerMode has to be at least 1.14");
    }
    for (const oneD of data) {
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
function registerCommand(name, data, edit = false) {
    if (Object.hasOwn(commands, name)) {
        if (!edit) {
            throw new logSystemError(`The command '${name}' does exist!`);
        }
        if (!(commands[name].changeable)) {
            throw new logSystemError(`The command '${name}' is not changeable!`);
        }
    }
    if (!data.isAlias && !data.callback) {
        throw new logSystemError("The callback must be set for no alias.");
    }
    if (data.isAlias) {
        commands[name] = {
            usageinfo: undefined,
            desc: undefined,
            longdesc: undefined,
            hidden: typeof data.hidden === "boolean" ? data.hidden : true,
            changeable: typeof data.changeable === "boolean" ? data.changeable : true,
            isAlias: true,
            callback: undefined
        };
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
const __registerCommand = registerCommand;
/** the legacy Data */
const legacyData = {
    initialized: false,
    currentVersion: getCurrentVersionOfLogSystem("number"),
    registerMode: getCurrentVersionOfLogSystem("number")
};
/** allows you to get legacyInformation */
function getLegacyInformation() {
    return { ...legacyData };
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
function validateLegacyProperty(propertyName, value) {
    switch (propertyName) {
        case "intialized":
            return false;
        case "currentVersion":
            return false;
        case "registerMode":
            return typeof value === "number";
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
function setLegacyInformation(propertyName, value, bypassSafety = false) {
    if (legacyData.initialized && !bypassSafety) {
        throw new logSystemError("Legacy: you can't change legacy data after intialization!");
    }
    if (!Object.hasOwn(legacyData, propertyName)) {
        throw new logSystemError("Legacy: that property name does not exist!");
    }
    if (!validateLegacyProperty(propertyName, value)) {
        throw new logSystemError("Legacy: You can't set that value to that property!");
    }
    // @ts-ignore
    legacyData[propertyName] = value;
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
function registerCommandLegacy(name, usage, shortdesc, longdesc, callback) {
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
function registerCommandLegacyForceUse() {
    if (legacyData.registerMode == 1.0) {
        throw new logSystemError("The system already use it");
    }
    // @ts-ignore
    exports.registerCommand = registerCommand = registerCommandLegacy;
    legacyData.registerMode = 1.0;
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
    multiCommandRegister
};
// that functions handles commands. It's for internal usage
function handleEnter(text, silent = false) {
    // handle command history
    if (commandHistory.length > 50)
        commandHistory = commandHistory.slice(commandHistory.length - 50, commandHistory.length);
    commandHistory.push(text);
    // get parts
    let parts = text.split(" ");
    // try to execute it
    if (Object.hasOwn(commands, parts[0])) {
        // print the info as log about that cmd
        if (!silent)
            log(LogType.INFO, `This command has been executed: '${text}'`, "console");
        try {
            const cmdData = commands[parts[0]];
            if (cmdData.isAlias) {
                const orginalCmd = commands[cmdData.aliasName];
                if (!orginalCmd) {
                    throw new logSystemError("invalid alias");
                }
                return orginalCmd.callback(parts);
            }
            else {
                return cmdData.callback(parts);
            }
            // return commands[parts[0]].callback(parts);
            // catch errors
        }
        catch (error) {
            log(LogType.ERROR, "The error has occured during the command execution:\n" + formatError(error), "console");
            return false;
        }
    }
    else if (parts[0] in bindInfo) {
        // print the info as log about that bind
        if (!silent)
            log(LogType.INFO, `This bind has been executed: '${text}'`, "console");
        let bindD = bindInfo[parts[0]];
        try {
            for (const command of bindD.commands) {
                handleEnter(command, true);
            }
        }
        catch (error) {
            log(LogType.ERROR, "The error has occured during the bind execution:\n" + formatError(error), "console");
            return false;
        }
    }
    // catch unkown command
    else {
        if (!silent)
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
function globalEval(code) {
    return globalThis.eval.apply(globalThis, [code]);
}
/**
 * converts a provided logType to the belonging logType string
 * @param type logType
 * @returns string of that logtype
 */
function resolveLogType(type) {
    switch (type) {
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
        case LogType.GROUP:
            return "GROUP";
        default: return "UNKNOWN";
    }
}
/**
 * converts a provided logType to the belonging logType color
 * @param type logType
 * @returns color
 */
function resolveLogColor(type) {
    switch (type) {
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
        case LogType.GROUP:
            return colorTable.group;
        default: return consoleColors.Reset;
    }
}
/**
 * allows you to write raw logs
 * @param type the type of the log
 * @param message the message
 * @param who the executioner (for the logs). Defaults to "core"
 */
function log(type, message, who = "core") {
    if (blockLogsVar)
        return;
    // if that's the parentNode, then get its string
    if (typeof who === "object")
        who = who.toString();
    const currentDate = new Date();
    const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;
    const logTypeString = resolveLogType(type);
    const logColor = resolveLogColor(type);
    const toWrite = `${formattedDate} ${logTypeString} ${who}: ${currentGroupString}${message}\n`;
    const toDisplay = `${colorTable.date}${formattedDate}${consoleColors.Reset} ${logTypeString} ${colorTable.who}${who}${consoleColors.Reset}: ${consoleColors.FgGray}${currentGroupString}${consoleColors.Reset}${logColor}${message}${consoleColors.Reset}\n`;
    if (viewTextBox) {
        process.stdout.clearLine(0);
        process.stdout.write(consoleColors.Reset + "\r");
    }
    process.stdout.write(toDisplay);
    (0, node_fs_1.appendFileSync)(finalLatest, toWrite);
    if (viewTextBox)
        process.stdout.write("\r\x1b[0m> \x1b[35m" + text);
}
/**
 * formats an error to allow the stack view
 * @param error some kind of error
 * @returns the formated string
 */
const formatError = (error) => {
    return typeof error === "object" && Object.hasOwn(error, "stack") ? error.stack : error;
};
exports.formatError = formatError;
/**
 * logs an error if the provided condition was not met. Nothing happens if it wasn't
 * It uses logType.ERROR
 * @param condition the condition
 * @param message the message to print
 * @param who the executioner (for the logs). Defaults to "core"
 */
function assertConsole(condition, message, who = "core") {
    if (!condition)
        log(LogType.ERROR, message, who);
}
/**
 * clears the console. Equivalent to vannilia JS console.clear()
 */
function clearConsole() {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    if (viewTextBox) {
        process.stdout.write("\x1b[0m> \x1b[35m" + text);
    }
}
/**
 * stores the counters
 */
const counterTable = {};
/**
 * counts the counter
 * @param name the name of the counter
 * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
 * @param increaseBy the increment value. Defaults to 1
 * @param who the executioner (for the logs). Defaults to "core"
 * @returns the current name on the counter.
 */
function counterCount(name, startFrom = 1, increaseBy = 1, who) {
    if (!Object.hasOwn(counterTable, name)) {
        counterTable[name] = startFrom;
    }
    else {
        counterTable[name] += increaseBy;
    }
    log(LogType.COUNTER, `${name} -> ${counterTable[name]}`, who);
    return counterTable[name];
}
/**
 * removes (resets) the couter
 * @param name the counter name
 */
function counterCountReset(name) {
    if (Object.hasOwn(counterTable, name)) {
        delete counterTable[name];
    }
}
/**
 * returns the number register on the counter
 * @param name the name of the counter
 * @returns undefined if doesnt exist or the number if exist
 */
function getCounter(name) {
    return counterTable[name] ? counterTable[name] : undefined;
}
function printViewTextbox() {
    process.stdout.write("\x1b[0m> \x1b[35m" + text);
}
/**
 * writes a raw text to the console. Equivalent to process.stdout.write()
 * @param text the raw text
 */
function consoleWrite(textToWrite, WithColor = consoleColors.Reset, writeToFile = true) {
    if (Array.isArray(WithColor))
        WithColor = WithColor.reduce((prev, next) => (prev + next));
    if (viewTextBox) {
        process.stdout.clearLine(0);
        process.stdout.write("\r");
    }
    process.stdout.write(WithColor + textToWrite + "\x1b[0m");
    if (writeToFile)
        (0, node_fs_1.appendFileSync)(finalLatest, textToWrite);
    if (viewTextBox) {
        printViewTextbox();
    }
}
/**
 * the function to combine colors
 *
 * USE IT TO ENSURE THE COMPATIBILITY WITH THE NEXT VERSION
 *
 * @param colors colors
 * @returns the combined colors
 */
function combineColors(...colors) {
    let toReturn = "";
    for (let color of colors) {
        toReturn += color;
    }
    return toReturn;
}
/**
 * allows you to write multi colors to the console in the single command
 *
 * the length of texts array and colors array have to be the exact match!
 *
 * example:
 *
 * consoleMultiWrite(["MEOW", " :3s"], [consoleColors.fgRed, consoleColors.fgBlue]);
 *
 * you can also use multiple colors
 *
 *
 * @param texts the array of texts
 * @param colors the array of colors
 * @param writeToFile whether to write it to file or only to console
 */
function consoleMultiWrite(texts, colors, writeToFile = true) {
    if (texts.length !== colors.length) {
        throw new logSystemError("Text array length and colors array length dont match!");
    }
    let toWrite = "";
    let toDisplay = "";
    for (let index in texts) {
        toWrite += texts[index];
        toDisplay += colors[index] + texts[index] + consoleColors.Reset;
    }
    if (viewTextBox) {
        process.stdout.clearLine(0);
        process.stdout.write("\r");
        process.stdout.write(consoleColors.Reset);
    }
    process.stdout.write(toDisplay);
    if (writeToFile)
        (0, node_fs_1.appendFileSync)(finalLatest, toWrite);
    if (viewTextBox) {
        printViewTextbox();
    }
}
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
class multiDisplayer {
    texts = [];
    colors = [];
    constructor() { }
    /**
     * adds the new characters (and) colors to displayer
     *
     * for adding at the beginning, check: unshift()
     *
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    push(text, colors) {
        this.texts.push(text);
        if (colors)
            this.colors.push(colors);
        else
            this.colors.push("");
    }
    /**
     * adds the new characters (and) colors to displayer at the beginning
     *
     * for adding at the last place, check: push()
     *
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    unshift(text, colors) {
        this.texts.unshift(text);
        if (colors)
            this.colors.unshift(colors);
        else
            this.colors.unshift("");
    }
    /**
     * pops the last element and returns it
     * @returns the popped element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    pop() {
        return [this.texts.pop(), this.colors.pop()];
    }
    /**
     * shifts the first element and returns it
     * @returns the shifted element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    shift() {
        return [this.texts.shift(), this.colors.shift()];
    }
    /**
     * allows you to use finally consoleWrite. It's required because js has no constructors
     * @param writeToFile parameter to be passed to consoleWrite. Leave it as undefined to leave it as default
     * @param clearObj whether to clear the arrays on that objects. Defaults to true
     */
    useConsoleWrite(writeToFile = true, clearObj = true) {
        // default of writeToFile
        if (writeToFile === undefined)
            writeToFile = true;
        // use consoleMultiWrite
        consoleMultiWrite(this.texts, this.colors, writeToFile);
        // clear objs
        if (clearObj) {
            this.texts = [];
            this.colors = [];
        }
    }
    /**
     * clears the whole array
     */
    clear() {
        this.texts = [];
        this.colors = [];
    }
}
exports.multiDisplayer = multiDisplayer;
/**
 * colors
 */
var consoleColors;
(function (consoleColors) {
    consoleColors["Reset"] = "\u001B[0m";
    consoleColors["Bright"] = "\u001B[1m";
    consoleColors["Dim"] = "\u001B[2m";
    consoleColors["Underscore"] = "\u001B[4m";
    consoleColors["Blink"] = "\u001B[5m";
    consoleColors["Reverse"] = "\u001B[7m";
    consoleColors["Hidden"] = "\u001B[8m";
    consoleColors["FgBlack"] = "\u001B[30m";
    consoleColors["FgRed"] = "\u001B[31m";
    consoleColors["FgGreen"] = "\u001B[32m";
    consoleColors["FgYellow"] = "\u001B[33m";
    consoleColors["FgBlue"] = "\u001B[34m";
    consoleColors["FgMagenta"] = "\u001B[35m";
    consoleColors["FgCyan"] = "\u001B[36m";
    consoleColors["FgWhite"] = "\u001B[37m";
    consoleColors["FgGray"] = "\u001B[90m";
    consoleColors["BgBlack"] = "\u001B[40m";
    consoleColors["BgRed"] = "\u001B[41m";
    consoleColors["BgGreen"] = "\u001B[42m";
    consoleColors["BgYellow"] = "\u001B[43m";
    consoleColors["BgBlue"] = "\u001B[44m";
    consoleColors["BgMagenta"] = "\u001B[45m";
    consoleColors["BgCyan"] = "\u001B[46m";
    consoleColors["BgWhite"] = "\u001B[47m";
    consoleColors["BgGray"] = "\u001B[100m";
})(consoleColors || (exports.consoleColors = consoleColors = {}));
let colorTable = {
    "info": consoleColors.FgWhite,
    "warning": consoleColors.FgYellow,
    "error": consoleColors.FgRed,
    "success": consoleColors.FgGreen,
    "counter": consoleColors.FgCyan,
    "init": consoleColors.FgWhite,
    "crash": consoleColors.FgRed,
    "group": consoleColors.FgGray,
    "date": consoleColors.FgGray,
    "who": consoleColors.FgMagenta
};
/**
 * function to use to block incoming logs
 * @param status allows you to block incoming logs. Defaults to undefined, which does nothing
 * @returns current status
 */
function blockLogs(status) {
    if (typeof status === "boolean")
        blockLogsVar = status;
    return blockLogsVar;
}
/**
 * function to use to hide textbox to write texts
 * @param status allows to change the status
 * @returns current status
 */
function textboxVisibility(status) {
    if (typeof status === "boolean")
        viewTextBox = status;
    if (status === false) {
        process.stdout.clearLine(0);
        process.stdout.write("\r");
    }
    else {
        process.stdout.write("\x1b[0m> \x1b[35m" + text);
    }
    return viewTextBox;
}
/**
 * returns unified formated error
 * @param taskName the name of the task
 * @param error the error
 * @returns `The error with the task: '${taskName}'. The error message:\n${formatError(error)}\n`
 */
function formatTaskError(taskName, error) {
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
function useWith(message, func, who = "core") {
    log(LogType.INFO, message, who);
    try {
        func();
        log(LogType.SUCCESS, message, who);
    }
    catch (error) {
        log(LogType.ERROR, formatTaskError(message, error), who);
    }
}
/**
 * class used to tell the localisation of logs. That is an optional class
 * You can still pass strings instead of that!
 */
class logNode {
    // the name of that log
    name;
    // the parent of that parent
    parent;
    /**
     *
     * @param name the name of the nod
     * @param parent the parent (optional)
     */
    constructor(name, parent) {
        this.name = name;
        this.parent;
    }
    /**
     * gets the node parent
     * @returns parent or undefined if no parent is present
     */
    getParent() {
        return this.parent;
    }
    /**
     * returns the formatted string using fast algorithm
     * @returns formatted string
     */
    toString() {
        let toReturn = ""; // create a string
        let parent = this; // get parent
        // loop till there's no more
        while (true) {
            // if no parent, then return
            if (!parent) {
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
exports.logNode = logNode;
/**
 * crash the program (not only the message like newConsole.crash())
 * @param message meessage
 * @param who by who
 * @param exitCode exit code
 */
function actualCrash(message, who, exitCode) {
    newConsole.crash(message, who);
    process.exit(exitCode);
}
/**
 * set information displayed at versionInfo
 * @param callback versionInfoData
 * @returns versionInfoData
 */
function versionInfo(callback) {
    if (callback !== undefined)
        getversionInfoData = callback;
    return getversionInfoData();
}
/**
 * returns the current version of log system
 *
 * example:
 *
 * let w = getCurrentVersionOfLogSystem("string");
 *
 * @param as string or number
 * @returns log system version in type depending of selected
 */
function getCurrentVersionOfLogSystem(as = "string") {
    if (as === "string")
        return String(logSystemVer);
    else if (as === "number")
        return Number(logSystemVer);
    else
        return -1;
}
/**
 * creates (joins) a new group for that log
 * @param name the group name
 * @returns the new current group string
 */
function logGroup(name, info = {}) {
    if (!("messageVisible" in info) || info.messageVisible) {
        const whoS = info.messageWho ? info.messageWho : undefined;
        log(LogType.GROUP, name, whoS);
    }
    logGroups.push(name);
    // return currentGroupString = currentGroupString.slice(0, currentGroupString.indexOf(lastLogGroupText)) + singleLogGroupText + lastLogGroupText;
    return reconstructLogGroup();
}
/**
 * leaves the group created with logGroup / group
 * @returns the new current group group string
 */
function logGroupEnd(info = {}) {
    // currentGroupString = currentGroupString.slice(0, currentGroupString.lastIndexOf(singleLogGroupText)) + lastLogGroupText;
    // // TODO: MAYBE IN THE FUTURE? better group ending
    // return currentGroupString;
    if (logGroups.length === 0) {
        if ("error" in info && info.error) {
            throw new logSystemError("there's no group");
        }
        return currentGroupString;
    }
    logGroups.pop();
    return reconstructLogGroup();
}
function reconstructLogGroup() {
    currentGroupString = "";
    for (let i = 0; i < logGroups.length; i++) {
        currentGroupString += singleLogGroupText;
    }
    if (logGroups.length !== 0)
        currentGroupString += lastLogGroupText + " ";
    return currentGroupString;
}
/**
 * creates a new timer with specified name
 * @param label the timer name
 * @param info configuration information
 * @returns the start time
 */
function logTimeStart(label, info = {}) {
    const time = Date.now();
    timers[label] = time;
    if (!("messageVisible" in info) || info.messageVisible) {
        const whoS = info.messageWho ? info.messageWho : undefined;
        log(LogType.GROUP, `timer '${label}' started`, whoS);
    }
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
function logTimeEnd(label, info = {}) {
    if (!(label in timers) && "error" in info && info.error) {
        throw new logSystemError("there's no timer with that name");
    }
    const elapsed = Date.now() - timers[label];
    delete timers[label];
    if (!("messageVisible" in info) || info.messageVisible) {
        const whoS = info.messageWho ? info.messageWho : undefined;
        log(LogType.GROUP, `timer '${label}' ended. ${elapsed}ms`, whoS);
    }
    return elapsed;
}
/**
 * returns the current time of the timer
 * @param label the timer name
 * @param info configuration information
 * @returns the current time
 */
function logTimeStamp(label, info = {}) {
    if (!(label in timers) && "error" in info && info.error) {
        throw new logSystemError("there's no timer with that name");
    }
    const elapsed = Date.now() - timers[label];
    if (!("messageVisible" in info) || info.messageVisible) {
        const whoS = info.messageWho ? info.messageWho : undefined;
        log(LogType.GROUP, `timer '${label}' stamp: ${elapsed}ms`, whoS);
    }
    return elapsed;
}
/**
 * Simple interface for the fast use of console utilities
 */
const newConsole = {
    log: (...messages) => log(LogType.INFO, messages.join(" ")),
    debug: (...messages) => log(LogType.INFO, messages.join(" ")),
    formatError,
    commandInterface,
    commands: commandInterface,
    LogType,
    logThis: log,
    print: log,
    write: consoleWrite,
    writeRaw: consoleWrite,
    info: (message, who = "core") => log(LogType.INFO, message, who),
    error: (message, who = "core") => log(LogType.ERROR, message, who),
    crash: (message, who = "core") => log(LogType.CRASH, message, who),
    warn: (message, who = "core") => log(LogType.WARNING, message, who),
    warning: (message, who = "core") => log(LogType.WARNING, message, who),
    init: (message, who = "core") => log(LogType.INIT, message, who),
    success: (message, who = "core") => log(LogType.SUCCESS, message, who),
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
};
exports.console = newConsole;
exports.newConsole = newConsole;
if (useAddToGlobalAs) {
    const obj = {};
    for (const part of addToGlobalAs) {
        obj[part] = newConsole;
    }
    Object.assign(globalThis, obj);
}
process.addListener("exit", () => {
    viewTextBox = false;
    consoleWrite("", consoleColors.Reset, false);
});
process.addListener("uncaughtException", (err) => {
    newConsole.crash("process uncaughtException: " + formatError(err));
    process.exit(-1);
});
process.addListener("message", (message) => {
    newConsole.log("The main process has received a message: " + message);
});
process.addListener("warning", (warn) => {
    newConsole.warn("process warning: " + formatError(warn));
    process.exit(-1);
});
/**
 * allows you to replace old console with fairly new
 */
function replaceConsole() {
    Object.assign(globalThis, { console: newConsole, orginalConsole: globalThis.console, newConsole });
}
/**
 * allows you to create a fake loop to keep the process alive. It was used mostly for testing
 */
function keepProcessAlive() {
    (async () => {
        while (true) {
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
function processRestart() {
    newConsole.warn("It may not work!");
    (0, node_child_process_1.fork)((0, node_path_1.join)(__dirname, __filename), { stdio: "overlapped" });
    process.kill(0);
    //  const subprocess = spawn(process.argv[0], process.argv.slice(1), {detached: true, stdio: "inherit"});
    //     subprocess.unref();
    //     process.exit(0);
}
