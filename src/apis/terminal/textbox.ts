import { formatPrintTextbox, printClearMessage, printTextBox } from "../../formatingSessionDependent.js";
import { getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { clearEntireLineCODE } from "../../texttools.js";

/**
 * function to use to hide textbox to write texts
 * @param status allows to change the status
 * @returns current status
 */
function textboxVisibility(status?: boolean, terminal: getTerminalOPJTYPE = "main"): boolean{
	const session: terminalSession = getTerminalOPJ(terminal);
	
	if(typeof status === "boolean") session.viewTextbox = status;
	
	if(status === false){
		printClearMessage(session);
	}
	else if(status === true){
		printTextBox(session);
	}

    return session.viewTextbox;

}

export {textboxVisibility}