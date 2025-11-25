import { Writable } from "node:stream";
import { streamWrapper, withWriteFunc } from "./ultrabasic";

const ansiEscape = '\x1b';

/**
 * allows you to easily create multilined strings without bad readability in code
 * @param data the data
 * @returns joined data with \n
 */
function multiLineConstructor(...data: string[]): string{
    return data.join("\n");
}

type consoleColor = string;
type consoleColorsMulti = string;
type consoleColorRGB = string;

/**
 * generate a new ansi Color with rgb
 * @param red 
 * @param green 
 * @param blue 
 * @returns the ansi color
 */
function generateAnsiColor(red: number, green: number, blue: number): consoleColorRGB {
  return `${ansiEscape}[38;2;${red};${green};${blue}m`;
}

/**
 * colors
 */
enum consoleColors{
    Reset = ansiEscape + "[0m",
    Bright = ansiEscape + "[1m",
    Dim = ansiEscape + "[2m",
    Italic = ansiEscape + "[3m",
    Underscore = ansiEscape + "[4m",
    Blink = ansiEscape + "[5m",
    Reverse = ansiEscape + "[7m",
    Hidden = ansiEscape + "[8m",
    strikeThrough = ansiEscape + "[9m",
    
    FgBlack = ansiEscape + "[30m",
    FgRed = ansiEscape + "[31m",
    FgGreen = ansiEscape + "[32m",
    FgYellow = ansiEscape + "[33m",
    FgBlue = ansiEscape + "[34m",
    FgMagenta = ansiEscape + "[35m",
    FgCyan = ansiEscape + "[36m",
    FgWhite = ansiEscape + "[37m",
    FgGray = ansiEscape + "[90m",
    
    BgBlack = ansiEscape + "[40m",
    BgRed = ansiEscape + "[41m",
    BgGreen = ansiEscape + "[42m",
    BgYellow = ansiEscape + "[43m",
    BgBlue = ansiEscape + "[44m",
    BgMagenta = ansiEscape + "[45m",
    BgCyan = ansiEscape + "[46m",
    BgWhite = ansiEscape + "[47m",
    BgGray = ansiEscape + "[100m",
}


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

const clearEntireLineCODE = ansiEscape + "[2K";
const clearScrenDownCODE = ansiEscape + "[0J";
const clearEntireBuffer = ansiEscape + "[3J";
const hideCursorCODE = ansiEscape + "[?25l";
const showCursorCODE = ansiEscape + "[?25h";


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
 * formats an error to allow the stack view
 * @param error some kind of error
 * @returns the formated string
 */
const formatError = (error: any): string => {
    return typeof error === "object" && Object.hasOwn(error, "stack") ? error.stack : error;
}

const textBoxPrefix: string = `${consoleColors.Reset}> ${consoleColors.FgYellow} `;

/**
 * @deprecated
 * 
 * USE: formatViewTextbox instead!
 * 
 * prints the viewTextbox
 */
function printViewTextbox(text: string = "", stream: Writable | streamWrapper<withWriteFunc> = process.stdout){
    // i know that it's safe. i wont write a guard closure only to find out the function on writable and streamWrapper is identical!
    // @ts-expect-error
    stream.write(textBoxPrefix + text);
}





function cursorAbs(x: number, y: number): string{
    return `${ansiEscape}[${y};${x}H`
}

function cursorRel(x: number, y: number): string{
    let s = "";

    // right
    if(x > 0){
        s += ansiEscape + "[" + x + "C";
    }
    // left
    else if(x < 0){
        s += ansiEscape + "[" + -x + "D";
    }

    // top
    if(y > 0){
        s += ansiEscape + "[" + y + "C";
    }
    // down
    else if(y < 0){
        s += ansiEscape + "[" + -y + "D";
    }

    return s
}


/**
 * the function to combine colors
 * 
 * USE IT TO ENSURE THE COMPATIBILITY WITH THE NEXT VERSION
 * 
 * IT DOESNT WORK with colors created with libraries like chalk or with generateAnsiColor
 * 
 * @param colors colors
 * @returns the combined colors
 */
function combineColors(...colors: consoleColor[]): consoleColorsMulti{
    let toReturn: consoleColorsMulti = "";

    for(let color of colors){
        toReturn += color;
    }

    return toReturn;
}




export {
    multiLineConstructor,
    consoleColor, consoleColorsMulti, consoleColorRGB,
    generateAnsiColor,
    consoleColors,
    combineColors,
    formatTaskError, formatError,
    printViewTextbox,

    textBoxPrefix,
    ansiEscape,
    clearEntireLineCODE,
    clearScrenDownCODE,
    clearEntireBuffer,
    hideCursorCODE,
    showCursorCODE,
    cursorAbs,
    cursorRel
}