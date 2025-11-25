import { textboxVisibility } from "../apis/terminal/textbox.js";
import { consoleWrite } from "../out.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";
import { combineColors, consoleColors } from "../texttools.js";
import { multiDisplayer } from "./multiDisplayer.js";

function welcome(terminal: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(terminal);
    const quick = ses.config.quickHello;
    
    const prev = textboxVisibility(undefined, ses);
    textboxVisibility(false);
    if(quick){
        consoleWrite("welcomne to LogSystem ", undefined, false, "", ses);
        consoleWrite("v"+String(ses.logSystemVer), consoleColors.FgRed, false, "", ses);
        consoleWrite(" by Naticzka", combineColors(consoleColors.Bright, consoleColors.Blink), false, "\n", ses);
    }
    else{
        const s = new multiDisplayer();
        s.push("Log system has been properly loaded!\n", consoleColors.FgGreen);
        s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
        s.push("\n\n");
        s.push(`Welcome to the log system v${ses.logSystemVer} `, consoleColors.FgCyan);
        s.push("by Naticzka\n", combineColors(consoleColors.FgMagenta, consoleColors.Blink));
        s.push("\n")
        s.push("......................", combineColors(consoleColors.BgGray, consoleColors.FgGray));
        s.push("\n");
        s.push("start using it by writting 'help' or '?'\n")
        s.useConsoleWrite(false, undefined, ses);
    }

    if(ses.config.message){
        consoleWrite(ses.config.message, undefined, false, "\n", ses);
    }

    textboxVisibility(prev, ses);


}

export {welcome}