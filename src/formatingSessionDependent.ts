import { relative } from "path";
import { terminalSession } from "./programdata.js";
import { ansiEscape, clearEntireLineCODE, consoleColors, cursorRel, hideCursorCODE, showCursorCODE, templateReplacer } from "./texttools.js";
import { isTty, withWriteFunc } from "./ultrabasic.js";
import stringWidth from 'string-width';


interface printOptions{
    noCursor?: boolean
}

/**
 * generates a new apperance of input textbox for the render
 * 
 * @param text text to be there or undefined. It uses ses.text if undefined was used
 * @param ses 
 * @returns 
 */
function formatPrintTextbox(text: string | undefined, ses: terminalSession, ops: printOptions = {}){
    const ct = ses.config.styles.colors; // color table
    const loc = relative(ses.config.workingDirectory, ses.procLinked?.cwd() || ""); // get current cwd

    // const firstWords = /(^\s*|(?<!\\)(?:\||\|\||&&|&|>|>>|<)\s*)([A-Za-z]+)/g;
    // const specialCharsReg = /(?<!\\)(\||\|\||&&|&|>|>>|<)/g;

    // let stylizedText = text.replaceAll(firstWords, `$1${ct.textboxin_text_first}$2${consoleColors.Reset}`)
    // .replaceAll(specialCharsReg, `${ct.textboxin_text_direct}$1${consoleColors.Reset}`);

    // TODO: stylize text
    const textToUse: string = text || ses.text;

    // const stylizedText = textToUse.slice(0, ses.relativeTextboxPos)
    // + consoleColors.Reset + consoleColors.Reverse
    //  + (textToUse.at(ses.relativeTextboxPos) || " ") +
    //  consoleColors.Reset +
    // (ses.relativeTextboxPos != 0 ? textToUse.slice(ses.relativeTextboxPos + 1) : "");


    // const beforeSelected: string = textToUse.slice(0, 
    //     ses.relativeTextboxPos !== 0 ? ses.relativeTextboxPos : textToUse.length
    // ) || "";
    // const selected = ses.relativeTextboxPos !== 0 ? (textToUse.at(ses.relativeTextboxPos) || "") : " ";
    // const afterSelected =  ses.relativeTextboxPos !== 0 && ses.relativeTextboxPos !== 1 ? (textToUse.slice(ses.relativeTextboxPos + 1) || "") : "";

    let beforeSelected: string;
    let selected: string;
    let afterSelected: string;
    if(ops.noCursor){
        beforeSelected = textToUse;
        selected = "";
        afterSelected = "";
    }
    else if(ses.relativeTextboxPos === 0){
        beforeSelected = textToUse;
        selected = " ";
        afterSelected = "";
    }
    else if(ses.relativeTextboxPos === -1){
        beforeSelected = textToUse.slice(0, -1);
        selected = textToUse.at(-1) || " ";
        afterSelected = "";
    }
    else{
        beforeSelected = textToUse.slice(0, ses.relativeTextboxPos);
        selected = textToUse.at(ses.relativeTextboxPos) || "";
        afterSelected = textToUse.slice(ses.relativeTextboxPos + 1) || "";
    }

    // const stylizedText: string = textToUse.slice(0, ses.relativeTextboxPos)
    // +
    // consoleColors.Reset + consoleColors.Reverse +
    // (textToUse.at(ses.relativeTextboxPos) || "")
    // + consoleColors.Reset +
    // textToUse.slice(ses.relativeTextboxPos + 1);
    // const stylizedText: string = text || ses.text;

    // let stylizedText: string = ct.textboxin_text_first;
    // let isFirst: boolean = true;

    // for(const letter of text){
    //     // if(isFirst) stylizedText += ct.textboxin_text_first;

    //     switch(letter){
    //         case " ":
    //             stylizedText += consoleColors.Reset + letter;
    //             if(isFirst){
    //                 isFirst = false;
    //                 stylizedText += ct.textboxin_text_common;
    //             }
    //             break;
    //         case "|":
    //             stylizedText += ct.textboxin_text_direct;
    //             stylizedText += letter;
    //             stylizedText += consoleColors.Reset;
    //             isFirst = true;
    //             break;
    //         default:
    //             stylizedText += letter;
    //     }

    // }

    // generate varTable
    const varTable: Record<string, string | object> = {
        color: consoleColors,
        colors: ct,
        selected,
        beforeSelected,
        afterSelected,
        text: textToUse,
        cwd: loc,
        sessionName: ses.sessionName
    }

    // run template Replacer and return it
    return templateReplacer(ses.config.styles.inputTextbox, varTable);
    
    // return `${consoleColors.Reset}${loc}${consoleColors.Reset}${ct.textboxin_prefixSep}:${consoleColors.Reset}${ct.textboxin_terminalName}${ses.sessionName}${consoleColors.Reset}${ct.textboxin_infoSep} >${consoleColors.Reset} ${ct.textboxin_common}${stylizedText}${consoleColors.Reset}`;
}


function getTerminalWidth(stream: withWriteFunc){
    if(isTty(stream)){
        return stream.columns || 80;
    }
    return Infinity;
}

function getClearMessage(ses: terminalSession): string[]{
    const size = stringWidth(ses.previousInputRender);
    const outstream = ses.out.getStream();
    const terminalWidth = getTerminalWidth(outstream);


    const linesToClear = terminalWidth === Infinity ? 1 : size / terminalWidth;


    const toReturn: string[] = [];
    toReturn.push(clearEntireLineCODE + "\r");

    for(let i = 1; i < linesToClear; i++){
        toReturn.push("\x1b[1A" + clearEntireLineCODE + "\r");
    }

    

    return toReturn;
}



function printTextBox(ses: terminalSession, ops: printOptions = {}){
    const toReturn: string[] = [];

    toReturn.push(...getClearMessage(ses));

    toReturn.push(formatPrintTextbox(ses.text, ses, ops));
    
    const finalText = toReturn.join("");

    ses.previousInputRender = finalText;

    ses.out.write(finalText);
}

// /**
//  * 
//  * Cleans previous input textbox and rerenders the input textbox on the screen
//  * 
//  * NOTE: start and end will not be saved and may cause issues if you print literal characters there!
//  * 
//  * @param ses the terminal session
//  * @param end what to print at the end
//  * @param start what to print at the start
//  */
// function printTextBox(ses: terminalSession, end: string = showCursorCODE, start: string = hideCursorCODE, margin: number = 0){
//     // if there's something at the start, then write it
//     if(start.length != 0) ses.out.write(start);

//     // a default number of lines to remove
//     let linesToremove: number = 1;

//     // try to get a stream
//     const stream = ses.out.getStream();

//     let remText: string[] = [];


//     // if it is Tty
//     if(isTty(stream)){
//         // get columns from that stream
//         const columns = stream.columns as number || 80;

//         // repair cursor to the start, to rerender it properly
//         const prevWidth = stringWidth(ses.previousInputRender) + margin;
//         const prevLines = Math.max(1, Math.ceil(prevWidth / columns));
//         remText.push(ansiEscape + `[${prevLines - 1}E`);
//         remText.push(ansiEscape + `[G`);
        

//         // calculate lines using stringWidth package
//         linesToremove = ((stringWidth(ses.previousInputRender))/ columns) - 1;
//     }

//     // generate remText
//     remText.push(clearEntireLineCODE + "\r");


//     for(let i = 0; i < linesToremove; i++){
//         remText.push("\x1b[1A" + clearEntireLineCODE + "\r");
//     }

//     // generate a new apperance of input textbox for the render
//     const inputRender: string = formatPrintTextbox(ses.text, ses);

//     // render it
//     ses.out.write(
//         remText.join("") +
//         inputRender
//         + end
//     );

//     // save the result for the later
//     ses.previousInputRender = inputRender;
// }

export {formatPrintTextbox, printTextBox}