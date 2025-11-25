import { getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";
import { clearEntireBuffer, clearScrenDownCODE, cursorAbs, printViewTextbox } from "../texttools.js";

/**
 * clears the console. Equivalent to vannilia JS console.clear()
 * 
 * @param terminal the name of terminal
 */
function clearConsole(terminal: getTerminalOPJTYPE = "main", clearBuf: boolean = true){
    // get that terminal
    const terminalData = getTerminalOPJ(terminal);

    terminalData.fileout.setHistory([]);

    terminalData.out.setHistory([]);
    terminalData?.out.write(
        (clearBuf ? clearEntireBuffer : "") +
        cursorAbs(0,0)
        +
        clearScrenDownCODE
    );

    
    // process.stdout.cursorTo(0,0);
    // process.stdout.clearScreenDown();

    if(terminalData?.viewTextbox){
        printViewTextbox(terminalData.text);
    }
}

export {clearConsole}