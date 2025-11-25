import Stream, { Writable } from "stream";
import { stripVTControlCharacters } from "util";
import { clearEntireLineCODE, consoleColorRGB, consoleColors, consoleColorsMulti, printViewTextbox } from "./texttools.js";
import { logSystemError, streamWrapper, withWriteFunc } from "./ultrabasic.js";
import { getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "./programdata.js";
import { printTextBox } from "./formatingSessionDependent.js";

/**
 * IT'S A VERY LOW LEVEL. CONSIDER USING consoleWrite instead 
 * (or consoleMultiWrite or multiDisplayer if you want to have more abstraction)
 * 
 * it just prints (or also writes to a file) as it says.
 * it will not care about displayed anything. It won't check for anything.
 * Use it on your own risk!
 * 
 * it requires by default disabling the textbox visibility and then turning it on!
 * (something that consoleWrite does itself!)
 * 
 * it does not print a new line!
 * 
 * It can cause a lot of undesired and unexpected behaviour with the cause without the caution
 *
 * 
 * @param textToWrite the raw text to print
 * @param fileToWrite what to print to a file log. a string will be printed directly. The booleans will cause a special behaviour, where false means no writting to a file and true means copying the first argument
 * @param out out stream
 * @param fileStream fileStream
 */
function consoleUltraRawWrite(
    textToWrite: string, 
    fileToWrite: string | boolean = true,
    out: Writable | streamWrapper<withWriteFunc>,
    fileStream?: Writable | streamWrapper<withWriteFunc>
){
    // ts doesnt understand my intent?
    // it has worked in other places and im sure thats its safe
    // @ts-ignore
    out.write(textToWrite);

    if(fileToWrite === true && fileStream){
        // appendFileSync(finalLatest, textToWrite);
            // @ts-ignore
        fileStream.write(textToWrite);
    }
    else if(fileToWrite !== false){
        // appendFileSync(finalLatest, fileToWrite);
            // @ts-ignore
        fileStream?.write(fileToWrite);
    }
}


type streamArray = [Writable, Writable];

/**
 * writes a raw text to the console. Allows you to not use log format
 * 
 * if you want even more low level and faster api use consoleUltraRawWrite()
 * 
 * @param textToWrite the text to write
 * @param WithColor color (optional). Defaults to consoleColors.Reset
 * @param writeToFile whether it should be written to the file. defaults to true
 * @param end the end symbol. defaults to \n
 * @param terminal the terminal name, terminal session, command context or another object that is able to be converted to a terminal
 */
function consoleWrite(
    textToWrite: string, 
    WithColor: consoleColors | consoleColors[] | consoleColorRGB = consoleColors.Reset, 
    writeToFile: boolean = true,
    end: string = "\n",
    terminal: getTerminalOPJTYPE = "main"
){
    // // get that terminal
    // let getFrom: string = "";
    // if(typeof terminalName === "string"){
    //     getFrom = terminalName;
    // }
    // else getFrom = "main";
    
    const d = getTerminalOPJ(terminal) as terminalSession;


    // get one color code
    if(Array.isArray(WithColor)) WithColor = WithColor.reduce((prev, next) => (prev+next) as consoleColors) as any as consoleColors;

    if(d.viewTextbox){
        // process.stdout.clearLine(0);
        // process.stdout.write("\r");
        d.out.write(clearEntireLineCODE + "\r");
    }

    // write to normal output
    d.out.write(WithColor+textToWrite+"\x1b[0m"+end);

    // writting to file
    if(writeToFile){
        d.fileout.write(
            stripVTControlCharacters(textToWrite)
        );
    }
    // if(writeToFile) appendFileSync(finalLatest, stripVTControlCharacters(textToWrite)+end);

    // print the textbox again
    if(d.viewTextbox){
        // printViewTextbox(d.text, d.out);
        printTextBox(d);
    }
}

/**
 * allows you to write double input (with colors and without to not mess with logs files)
 * @param withoutColors 
 * @param withColors 
 * @param terminal the terminal name
 */
function consolePairWrite(
    withoutColors: string, 
    withColors: string,
    terminal: getTerminalOPJTYPE = "main"
){
    const d = getTerminalOPJ(terminal) as terminalSession;

    // if(d.viewTextBox){
    //     process.stdout.clearLine(0);
    //     process.stdout.write("\r");
    //     process.stdout.write(consoleColors.Reset);
    // }

    // if there was a view textbox
    if(d.viewTextbox){
        d.out.write(clearEntireLineCODE + "\r");
    }

    d.out.write(withColors); // console

    d.fileout.write(withoutColors); // file
    
    // appendFileSync(finalLatest, withoutColors);

    // restore viewTextbox
    if(d.viewTextbox){
        // printViewTextbox(d.text, d.out);
        printTextBox(d);
    }
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
 * @param terminal the terminal name
 * @param writeToFile whether to write it to file or only to console
 * @param end the end symbol. It defaults to \n
 */
function consoleMultiWrite(
    texts: string[], 
    colors: Array<consoleColors | consoleColorsMulti>, 
    terminal: getTerminalOPJTYPE = "main",
    writeToFile: boolean = true, 
    end: string = "",
){
    // get the terminal data
    const d = getTerminalOPJ(terminal) as terminalSession;

    // check the texts and colors for mismatch
    if(texts.length !== colors.length){
        throw new logSystemError("Text array length and colors array length dont match! + \n"
            + texts.toString() + " vs " + colors.toString()
        );
    }

    let toWrite: string = "";
    let toDisplay: string = "";

    // generate to display
    for(let index in texts){
        toWrite += texts[index];
        toDisplay += colors[index] + texts[index] + consoleColors.Reset;
    }

    // remove view textbox if exists
    if(d.viewTextbox){
       d.out.write(clearEntireLineCODE + "\r" + consoleColors.Reset);
    }

    d.out.write(toDisplay+end); // console
    
    // if(writeToFile) appendFileSync(finalLatest, toWrite+end);
    if(writeToFile) d.fileout.write(toWrite+end); // file

    if(d.viewTextbox){
        // printViewTextbox(d.text, d.out);
        printTextBox(d);
        
    }
}

/**
 * @deprecated
 * 
 * USE consoleWrite with hideCursorCODE instead!
 * 
 */
function hideCursor(session: getTerminalOPJTYPE = "main"){
    const s = getTerminalOPJ(session);

    s.out.write("\x1b[?25l");
}

/**
 * @deprecated
 * 
 * USE consoleWrite with showCursorCODE instead!
 * 
 */
function showCursor(session: getTerminalOPJTYPE = "main"){
    const s = getTerminalOPJ(session);

    s.out.write("\x1b[?25h");
}

export {
    consoleUltraRawWrite,
    streamArray,
    consoleWrite,
    consolePairWrite,
    consoleMultiWrite,
    hideCursor,
    showCursor
}