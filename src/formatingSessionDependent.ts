import { relative } from "path";
import { terminalSession } from "./programdata.js";
import { clearEntireLineCODE, consoleColors, cursorRel, hideCursorCODE, showCursorCODE, templateReplacer } from "./texttools.js";

function formatPrintTextbox(text: string, ses: terminalSession){
    const ct = ses.config.styles.colors;
    const loc = relative(ses.config.workingDirectory, ses.procLinked?.cwd() || "");

    // const firstWords = /(^\s*|(?<!\\)(?:\||\|\||&&|&|>|>>|<)\s*)([A-Za-z]+)/g;
    // const specialCharsReg = /(?<!\\)(\||\|\||&&|&|>|>>|<)/g;

    // let stylizedText = text.replaceAll(firstWords, `$1${ct.textboxin_text_first}$2${consoleColors.Reset}`)
    // .replaceAll(specialCharsReg, `${ct.textboxin_text_direct}$1${consoleColors.Reset}`);

    const stylizedText: string = text;

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
    const varTable: Record<string, string | object> = {
        color: consoleColors,
        colors: ct,
        stylizedText,
        cwd: loc,
        sessionName: ses.sessionName
    }

    return templateReplacer(ses.config.styles.inputTextbox, varTable);

    // return `${consoleColors.Reset}${loc}${consoleColors.Reset}${ct.textboxin_prefixSep}:${consoleColors.Reset}${ct.textboxin_terminalName}${ses.sessionName}${consoleColors.Reset}${ct.textboxin_infoSep} >${consoleColors.Reset} ${ct.textboxin_common}${stylizedText}${consoleColors.Reset}`;
}

function printTextBox(ses: terminalSession, end: string = showCursorCODE, start: string = hideCursorCODE){
    if(start.length != 0) ses.out.write(start);
    ses.out.write(
        clearEntireLineCODE + "\r" +
        formatPrintTextbox(ses.text, ses) +
        cursorRel(ses.relativeTextboxPos, 0) +
        end
    );
}

export {formatPrintTextbox, printTextBox}