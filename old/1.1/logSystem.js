"use strict";
// LOG SYSTEM
// created by naticzka ;3
// github: https://github.com/itsmenatika/jslogsystem
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logParent = exports.commands = exports.logSystemError = exports.blankCallback = exports.newConsole = exports.console = exports.consoleColors = exports.formatError = exports.LogType = void 0;
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
const node_fs_1 = require("node:fs");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = require("node:path");
const node_process_1 = require("node:process");
// CONFIG
// USE JOIN for paths
const LOGDIRECTORY = (0, node_path_1.join)("dev", "logs");
const LATESTLOGNAME = "latest.txt";
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
// CODE
// ___________________________________________
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
})(LogType || (exports.LogType = LogType = {}));
class logSystemError extends Error {
}
exports.logSystemError = logSystemError;
;
// settings
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf-8");
// check for the log directory
if (!(0, node_fs_1.existsSync)((0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY))) {
    (0, node_fs_1.mkdirSync)((0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY), { recursive: true });
}
const finalLatest = (0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY, LATESTLOGNAME);
const tempFinal = (0, node_path_1.join)((0, node_process_1.cwd)(), LOGDIRECTORY, "temp");
if ((0, node_fs_1.existsSync)(finalLatest)) {
    if (!(0, node_fs_1.existsSync)(tempFinal)) {
        throw new logSystemError("Error with moving the previous log!");
    }
    const data = (0, node_fs_1.readFileSync)(tempFinal).toString();
    const piecesOfData = data.split("\n");
    const date = new Date(Number(String(piecesOfData[0])));
    // calling the callback to do stuff with previous one
    saveTheLatest(date, finalLatest);
    // moving latest
    // renameSync(
    //    finalLatest, 
    //    join(cwd(), LOGDIRECTORY, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()} ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
    //);
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
const allowedKeysToWrite = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]" + " ";
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
            viewTextBox = false;
            log(LogType.CRASH, "The execution was manually stopped by CTRL + C!");
            process.exit();
        }
        // reappearing of the textbox
        if (!viewTextBox) {
            viewTextBox = true;
            process.stdout.write("\x1b[0m> \x1b[35m");
        }
        // backspace
        if (key.includes("\b")) {
            if (text.length > 0) {
                process.stdout.write("\b \b");
            }
            text = text.slice(0, -1);
        }
        // enter
        else if (key.includes("\r")) {
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
        // adding keys
        else if (allowedKeysToWrite.includes(key)) {
            text += key;
            process.stdout.write(key);
        }
    }
});
/**
 * blank callback, that can be used for testing purposes
 */
const blankCallback = (args) => false;
exports.blankCallback = blankCallback;
// the list of commands
let commands = {
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
};
exports.commands = commands;
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
 * allows you to register a command
 * @param name the name of command
 * @param usage a string that describes the usage of the command
 * @param desc a string that describes the command (shortly)
 * @param longdesc a string that describes  the command
 * @param callback callback to use when that command is invoked
 */
function registerCommand(name, usage, desc, longdesc, callback) {
    if (Object.hasOwn(commands, name)) {
        throw new logSystemError(`The command '${name}' does exist!`);
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
function handleEnter(text) {
    log(LogType.INFO, `This command has been executed ${text}`, "console");
    let parts = text.split(" ");
    switch (parts[0]) {
        case "?":
        case "help":
            let helps = "";
            for (let cmd of newConsole.commandInterface.commandList()) {
                helps += ` * ${cmd} -> ${commands[cmd][2]}\n`;
            }
            consoleWrite(`------\nCommands:\n\n` + helps + "\n");
            break;
        case "exit": {
            let exitCode = parts.slice(1).join(" ").trim() !== "" ? parts.slice(1).join(" ").trim() : 0;
            log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: " + exitCode);
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
            consoleWrite(`------\nprocess info:\n\n` +
                `\tarchitecture: ${node_os_1.default.arch}\n` +
                `\thost name: ${node_os_1.default.hostname}\n` +
                `\tplatform: ${node_os_1.default.platform}\n` +
                `\tkernel version: ${node_os_1.default.version}\n` +
                `\tprocess priority: ${node_os_1.default.getPriority()}\n` +
                `\tmachine: ${node_os_1.default.machine}\n` +
                `\tcwd: ${process.cwd()}\n` +
                `\theap total: ${Math.round(mus.heapTotal / 100000) / 10}mb\n` +
                `\theap used: ${Math.round(mus.heapUsed / 100000) / 10}mb\n` +
                `\tcpu usage (1m, 5m, 15m): ${node_os_1.default.loadavg().map(num => `${num * 100}%`)}\n`);
            break;
        }
        default: {
            if (Object.hasOwn(commands, parts[0])) {
                return commands[parts[0]][0](parts);
            }
            else {
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
function log(type, message, who = "core") {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;
    let toWrite;
    switch (type) {
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
            toWrite = `${formattedDate} COUNTER ${who}: ${message}\n`;
            break;
        }
        default: {
            throw new logSystemError("???");
        }
    }
    (0, node_fs_1.appendFileSync)(finalLatest, toWrite);
    if (blockLogsVar)
        return;
    process.stdout.clearLine(0);
    process.stdout.write("\r\x1b[0m");
    process.stdout.write(toWrite);
    if (viewTextBox)
        process.stdout.write("> \x1b[35m" + text);
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
/**
 * writes a raw text to the console. Equivalent to process.stdout.write()
 * @param text the raw text
 */
function consoleWrite(textToWrite, WithColor = consoleColors.Reset, writeToFile = true) {
    if (viewTextBox) {
        process.stdout.clearLine(0);
        process.stdout.write("\r");
    }
    process.stdout.write(WithColor + textToWrite + "\x1b[0m");
    if (writeToFile)
        (0, node_fs_1.appendFileSync)(finalLatest, textToWrite);
    if (viewTextBox) {
        process.stdout.write("\x1b[0m> \x1b[35m" + text);
    }
}
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
 * @returns `The error with task: '${taskName}'. The error message:\n${formatError(error)}\n`
 */
function formatTaskError(taskName, error) {
    return `The error with task: '${taskName}'. The error message:\n${formatError(error)}\n`;
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
class logParent {
    name;
    parent;
    constructor(name, parent) {
        this.name = name;
        this.parent;
    }
    getParent() {
        return this.parent;
    }
    toString() {
        let toReturn = "";
        let parent = this;
        while (true) {
            if (!parent)
                break;
            toReturn = parent.name + "." + toReturn;
            parent = parent.getParent();
        }
        return toReturn.slice(0, toReturn.length - 1);
    }
}
exports.logParent = logParent;
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
    formatTaskError
};
exports.console = newConsole;
exports.newConsole = newConsole;
