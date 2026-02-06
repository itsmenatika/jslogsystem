import { Writable } from "node:stream";
import { streamWrapper, withWriteFunc } from "./ultrabasic.js";
import { Blob } from "node:buffer";

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

type allColorType = consoleColor | consoleColors | consoleColorsMulti | consoleColorRGB;

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
    NoColor = "",
    Bright = ansiEscape + "[1m",
    Dim = ansiEscape + "[2m",
    Italic = ansiEscape + "[3m",
    Underscore = ansiEscape + "[4m",
    Blink = ansiEscape + "[5m",
    Reverse = ansiEscape + "[7m",
    Hidden = ansiEscape + "[8m",
    StrikeThrough = ansiEscape + "[9m",
    
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

function cursorAbsColumn(x: number): string{
    return `${ansiEscape}[`;
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


const minecraftColorPallete: Record<string, consoleColor> = {
    "1": consoleColors.FgBlack,
    "2": consoleColors.FgBlue,
    "3": consoleColors.FgYellow,
    "4": consoleColors.FgMagenta,
    "5": consoleColors.FgRed,
    "6": consoleColors.FgGreen,
    "7": consoleColors.FgCyan,
    "8": consoleColors.FgGray,

    "9": consoleColors.Bright,
    "0": consoleColors.Dim,

    // "9": combineColors(consoleColors.FgBlack, consoleColors.Bright),
    // "0": combineColors(consoleColors.FgBlue, consoleColors.Bright),
    // "a": combineColors(consoleColors.FgYellow, consoleColors.Bright),
    // "b": combineColors(consoleColors.FgMagenta, consoleColors.Bright),
    // "c": combineColors(consoleColors.FgRed, consoleColors.Bright),
    // "d": combineColors(consoleColors.FgGreen, consoleColors.Bright),
    // "e": combineColors(consoleColors.FgCyan, consoleColors.Bright),
    // "g": combineColors(consoleColors.FgGray, consoleColors.Bright),    

    // "h": combineColors(consoleColors.FgBlack, consoleColors.Dim),
    // "i": combineColors(consoleColors.FgBlue, consoleColors.Dim),
    // "j": combineColors(consoleColors.FgYellow, consoleColors.Dim),
    // "k": combineColors(consoleColors.FgMagenta, consoleColors.Dim),
    // "l": combineColors(consoleColors.FgRed, consoleColors.Dim),
    // "m": combineColors(consoleColors.FgGreen, consoleColors.Dim),
    // "n": combineColors(consoleColors.FgCyan, consoleColors.Dim),
    // "o": combineColors(consoleColors.FgGray, consoleColors.Dim),  
    
    "a": consoleColors.BgBlack,
    "c": consoleColors.BgBlue,
    "d": consoleColors.BgYellow,
    "e": consoleColors.BgMagenta,
    "g": consoleColors.BgRed,
    "h": consoleColors.BgGreen,
    "j": consoleColors.BgCyan,
    "k": consoleColors.BgGray,

    "i": consoleColors.Italic,
    "v": consoleColors.Reverse,
    "u": consoleColors.Underscore,
    "s": consoleColors.StrikeThrough,
    "b": consoleColors.Blink,

    "f": consoleColors.FgWhite,

    "r": consoleColors.Reset
}

type varTableType = Record<string, string | object>;


/**
 * uses standard template on something
 * @param from starting string
 * @param varTable variable list
 * @returns parsed string
 */
function templateReplacer(from: string, varTable: varTableType = {}): string{
    let toRet: string[] = [];

    for(let i = 0; i < from.length; i++){
        const char = from[i];

        switch(char){
            case "§":
                i++;
                if(i < from.length){
                    const charToGetFromPallete = from[i];

                    if(!charToGetFromPallete){
                        toRet.push("§");
                        break;
                    }

                    if(!Object.hasOwn(minecraftColorPallete, charToGetFromPallete)){
                        toRet.push("§" + charToGetFromPallete);
                        break;
                    }

                    toRet.push(minecraftColorPallete[charToGetFromPallete]);
                    break;
                }

                toRet.push("§");
                break;
            case "{":
                i++;

                let startI: number = i;
                let cur: string | object = varTable;
                while(
                    i < from.length
                ){
                    if(from[i] === "." || from[i] === "}"){
                        const nameToTraverse: string = from.slice(startI, i).trim();

                        startI = i + 1;

                        cur = cur[nameToTraverse as keyof typeof cur];

                        if(cur === undefined || cur === null){
                            throw new ReferenceError("Unknown reference to " + nameToTraverse);
                        }
                    }

                    if(from[i] === "}") break;

                    i++;
                }

                if(typeof cur === "object" && !Buffer.isBuffer(cur)){
                    throw new ReferenceError("You can't reference anything else than strings, buffers, numbers or booleans");
                }

                toRet.push(String(cur));

                
                if(
                    !(i < from.length) ||
                    from[i] != "}"
                ){
                    throw new SyntaxError("} is missing");
                }

                break;

            case "$":
                i++;

                const numChar = from[i];
                if(!numChar){
                     throw new SyntaxError("a number is missing");
                }
                
                if(numChar == "$"){
                    toRet.push("§");
                    break;
                }
                
                if(!Object.hasOwn(varTable, numChar)){
                    throw new ReferenceError("Unknown reference to " + numChar);
                }

                toRet.push(String(varTable[numChar]));
                break;
            case "\\":
                i++;

                const specialChar = from[i];

                if(!specialChar){
                    toRet.push("\\");
                    break;
                }

                switch(specialChar){
                    case "b":
                        toRet.push("\b");
                        break;
                    case "r":
                        toRet.push("\r");
                        break;
                    case "f":
                        toRet.push("\f");
                        break;
                    case "v":
                        toRet.push("\v");
                        break;
                    case "0":
                        toRet.push("\0");
                        break;
                    case "n":
                        toRet.push("\n");
                        break;
                    case "t":
                        toRet.push("\t");
                        break;
                    case "a":
                        toRet.push(ansiEscape);
                        break;
                    case "x":
                        i++;
                        const firstChar = from[i];

                        if(!firstChar){
                            toRet.push("\\x");
                            break;
                        }

                        i++;
                        const secondChar = from[i];

                        if(!secondChar){
                            toRet.push("\\x"); toRet.push(firstChar);
                            break;
                        }

                        const toAdd = String.fromCharCode(
                            Number.parseInt(firstChar, 16) * 16
                            +
                            Number.parseInt(secondChar, 16)
                        );

                        toRet.push(toAdd);
                        break;
                    case "c":
                        i++;
                        if(i < from.length){
                            const charToGetFromPallete = from[i];

                            if(!charToGetFromPallete){
                                toRet.push("\\c");
                                break;
                            }

                            if(!Object.hasOwn(minecraftColorPallete, charToGetFromPallete)){
                                toRet.push("\\c"); toRet.push(charToGetFromPallete);
                                break;
                            }

                            toRet.push(minecraftColorPallete[charToGetFromPallete]);
                            break;
                        }

                        toRet.push("\\c");
                        
                        break;
                    default:
                        toRet.push(specialChar);
                        break;
                }
                break;
            default:
                toRet.push(char);
        }
    }


    return toRet.join("");
}

// function capitalize(text: string): string{
//     const data: string[] = [];

//     for(let i = 0; i < text.length; i++){
//         if(i === 0 || text[i - 1] === " ") data.push(text[i].toUpperCase());
//         else data.push(text[i]);
//     }

//     return data.join("");
// }

function capitalize(text: string): string{
    return text.replace(/\b\w/g, c => c.toUpperCase());
}

export {
    multiLineConstructor,
    consoleColor, consoleColorsMulti, consoleColorRGB, allColorType,
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
    cursorRel,

    minecraftColorPallete,
    templateReplacer,

    capitalize
}