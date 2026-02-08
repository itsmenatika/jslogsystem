import { logsReceiveType } from "./config.js";
import { printClearMessage, printTextBox } from "./formatingSessionDependent.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "./programdata.js";
import { colorTable, terminalStyles } from "./styles/common.js";
import {clearEntireLineCODE, consoleColor, consoleColors, textBoxPrefix} from "./texttools.js";
import { templateReplacer } from "./texttools.js";

/**
 * the type of log
 */
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
    COUNTER = 6,
    GROUP = 7,
    TIMER = 8,
    SIGNAL = 9
}


function resolveLogData(type: LogType, data: terminalStyles){
    const name = resolveLogType(type);
    const nameL = name.toLowerCase();
    
    return{
        name,
        color: data.colors[nameL as keyof typeof data.colors],
        colorSecondary: data.colors[(nameL + "_secondary") as keyof typeof data.colors],
        displayed: data[nameL as keyof typeof data.colors],
        displayedSecond:  data[(nameL + "_secondary") as keyof typeof data.colors]
    }
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
        case LogType.GROUP:
            return "GROUP";
        case LogType.TIMER:
            return "TIMER";
        case LogType.SIGNAL:
            return "SIGNAL";
        default: return "UNKNOWN";
    }
}

/**
 * converts a provided logType to the belonging logType color
 * @param type logType
 * @returns color
 */
function resolveLogColor(type: LogType, table: colorTable): consoleColor {
    switch(type){
        case LogType.SUCCESS:
            return table.success;
        case LogType.ERROR:
            return table.error;
        case LogType.INFO:
            return table.info;
        case LogType.WARNING:
            return table.warning;
        case LogType.COUNTER: 
            return table.counter;
        case LogType.INIT:
            return table.init;
        case LogType.CRASH:
            return table.crash;
        case LogType.GROUP:
            return table.group;
        case LogType.TIMER:
            return table.timer;
        default: return consoleColors.Reset;
    }
}

// LOG HELPERS

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
    constructor(name: string, parent?: logNode | undefined | string){
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

        let parent: logNode | undefined | string = this as logNode; // get parent

        // loop till there's no more
        while(true){

            // if no parent, then return
            if(!parent){
                // toReturn = "core" + "." + toReturn;
                break;
            }

            // if parent is a string
            if(typeof parent === "string"){
                // add parent name
                toReturn = parent + "." + toReturn;
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


// LOG FUNCTIONS


/**
 * allows you to write raw logs
 * @param type the type of the log
 * @param message the message
 * @param who the executioner (for the logs). Defaults to "core"
 * @param terminal the name of the terminal
 */
function log(
    type: LogType, 
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
) {
    // get that terminal
    const terminalData = getTerminalOPJ(terminal);
    // const terminalData = typeof terminal === "string" ?
    // getLogSystemDataObj(terminal) as logSystemData : terminal;

    // if it's blocking logs, then just return
    if(terminalData.logsReceive === logsReceiveType.block) return;

    // if that's the parentNode, then get its string
    if(typeof who === "object") who = who.toString();
    
    
    // get date
    const currentDate: Date = new Date();
    const formattedDate = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}:${currentDate.getMilliseconds()}`;

    // get color hooker
    const ct = terminalData.config.styles.colors;

    // get that log type info
    // const logTypeString: string = resolveLogType(type);
    // const logColor: consoleColor = resolveLogColor(type, ct);


    const logD = resolveLogData(type, terminalData.config.styles);
    
    // create strings to write
    // const toWrite: string = `${formattedDate} ${logTypeString} ${who}: ${terminalData?.currentGroupString}${message}\n`;


    const varTable: Record<string, string | object> = {
        color: consoleColors,
        colors: terminalData.config.styles.colors,
        formattedDate,
        logTypeString: logD.displayed,
        logTypeStringSecondary: logD.displayedSecond,
        who,
        logColor: logD.color,
        logColor_secondary: logD.colorSecondary,
        currentGroupString: String(terminalData?.currentGroupString),
        message
    }

    const toDisplay = templateReplacer(
        terminalData.config.styles.logDisplayed,
        varTable
    );

    const toWrite = templateReplacer(
        terminalData.config.styles.logWritten,
        varTable
    );

    // const toDisplay: string = `${ct.date}${formattedDate}${consoleColors.Reset} ${logTypeString} ${ct.who}${who}${consoleColors.Reset}: ${consoleColors.FgGray}${terminalData?.currentGroupString}${consoleColors.Reset}${logColor}${message}${consoleColors.Reset}\n`;

    // remove the view textbox if there was
    if(terminalData.viewTextbox){
        printClearMessage(terminalData);
    }

    terminalData.out.write(toDisplay); // terminal
    
    terminalData.fileout.write(toWrite); // file

    // appendFileSync(finalLatest, toWrite);

    // if there was a textbox, then get it back
    if(terminalData.viewTextbox){
        // terminalData.out.write(textBoxPrefix + terminalData.text);
        printTextBox(terminalData);
        // process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
    }
}

/**
 * logs an error if the provided condition was not met. Nothing happens if it wasn't
 * It uses logType.ERROR
 * @param condition the condition
 * @param message the message to print
 * @param who the executioner (for the logs). Defaults to "core"
 * @param terminal the name of the terminal
 * @returns True if not met, false if met
 */
function assertConsole(
    condition: boolean, 
    message: string, 
    who: string | logNode = "core.assert",
    terminal: getTerminalOPJTYPE = "main"
){
    if(!condition){
        log(LogType.ERROR, message, who, terminal);
        return true;
    }
    else return false;
}

function info(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.INFO, message, who, terminal);
}

function error(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.ERROR, message, who, terminal);
}

function init(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.INIT, message, who, terminal);
}

function warning(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.WARNING, message, who, terminal);
}


function success(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.SUCCESS, message, who, terminal);
}

function group(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.GROUP, message, who, terminal);
}

function crash(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.CRASH, message, who, terminal);
}

function timer(
    message: string, 
    who: string | logNode = "core",
    terminal: getTerminalOPJTYPE = "main"
){
    log(LogType.TIMER, message, who, terminal);
}




export {
    LogType, logNode, log, 
    
    assertConsole,

    info, error, init, warning, warning as warn,
    timer, group, crash, success

}