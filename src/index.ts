import { logSystemError, streamWrapper, uptimeVar } from "./ultrabasic.js";
import { getCurrentVersionOfLogSystem, getTerminal, getTerminalOPJ, createNewTerminal, removeTerminal, connectedToSpecificTerminal, saveterminalSessionObj } from "./programdata.js";
import { multiLineConstructor, consoleColor, consoleColorsMulti, consoleColors, consoleColorRGB, generateAnsiColor, combineColors, formatError, formatTaskError, printViewTextbox, textBoxPrefix, ansiEscape, clearEntireLineCODE, clearScrenDownCODE, clearEntireBuffer, hideCursorCODE,
    showCursorCODE, cursorAbs, cursorRel} from "./texttools.js";
import { consoleUltraRawWrite, streamArray, consoleWrite, consolePairWrite,consoleMultiWrite, hideCursor, showCursor } from "./out.js";
import { LogType, logNode, log, assertConsole, info, error, init, warning, warn, timer, group, crash, success
} from "./log.js"
import { allowedKeysToWrite, inHandler, setupInHandlerListener } from "./in.js"
import { formatPrintTextbox, printTextBox } from "./formatingSessionDependent.js";
import { constructConfig, constructStyles, terminalStyles, terminalStylesProvide, configData, configDataProvide, getPreset, savePreset,logsReceiveType, colorTable, colorTableProvide,
legacyData, legacyDataProvide } from "./config.js";

// for safety checks
import { resolve } from "node:path";
import { quickSetup } from "./tools/quickSetup.js";
import { fileURLToPath } from "node:url";
import { allGroup_collection } from "./commandGroups/allGroups.js";
import { commandTable as commandTableInternal } from "./commands/internal.js";

export {
    // *****
    // ultrabasic
    // *****

    uptimeVar, // stores the actual uptime of the entire logSystem
    logSystemError, //general error class
    streamWrapper, // a wrapper with history

    // *****
    // text tools
    // *****
    multiLineConstructor, // easy constructing multiline texts
    consoleColor, consoleColorsMulti, consoleColorRGB, // color types
    generateAnsiColor, // generate a asci color from RGB
    consoleColors, // a table for fast consoleColors
    combineColors, // uniform color combining function
    formatTaskError, formatError, // error formating
    printViewTextbox, // DEPRECATED. a function to print view textbox that was used before 1.3


    textBoxPrefix, // prefix used in textbox and by printViewTextbox
    // ansi codes
    ansiEscape, 
    clearEntireLineCODE, 
    clearScrenDownCODE,
    clearEntireBuffer,
    hideCursorCODE,
    showCursorCODE,
    cursorAbs,
    cursorRel,

    // *****
    // programdata
    // *****
    getCurrentVersionOfLogSystem, // current version
    getTerminal, // gets terminal by name
    getTerminalOPJ, // tries to conver data to a terminal session
    createNewTerminal, // creates a new terminal
    removeTerminal, // removes a terminal
    connectedToSpecificTerminal, // a class wrapper with session managing
    saveterminalSessionObj, // force saving the object as specified terminal name

    // *****
    // out
    // *****
    consoleUltraRawWrite, // ultra raw writting on console
    streamArray, // an array of out and outfile streams
    consoleWrite, // plain writting with a lot of functions to keep it safe. USE IT
    consolePairWrite, // write two versions. one for display and second for files
    consoleMultiWrite, // prints from arrays
    hideCursor, // DEPRECATED. hidding the cursor
    showCursor, // DEPRECATED. showing the cursor

    // *****
    // log
    // *****
    LogType, // type of log
    logNode, // the node system for better pathing of who created that log
    log, // basic logging
    
    assertConsole, // asserting

    // different shorthands for log types
    info, error, init, warning, warn,
    timer, group, crash, success,

    // *****
    // in
    // *****
    allowedKeysToWrite, // keys that can be written by someone on the terminal
    inHandler, // general function (NOT RECOMMENDED)
    setupInHandlerListener, // auto setter

    // *****
    // formatingSessionDependent
    // *****
    formatPrintTextbox, // creates a string to be written (full form)
    printTextBox, // prints that string automatically to a session from a session

    // *****
    // config
    // *****
    constructConfig, // creating config
    constructStyles, // creating styles
    terminalStyles, // type for styles
    terminalStylesProvide, // type for providing styles
    configData, // type for config
    configDataProvide, // type for providing config
    getPreset, // getting presets
    savePreset, // saving presets
    logsReceiveType, // current status of receiving
    colorTable, // a table of colors to use
    colorTableProvide, // providing a table of colors to use

    legacyData, // legacy data type
    legacyDataProvide // legacy data providing type
}

// groups
export * from "./commandGroups/allGroups.js";

// tools
export * from "./tools/allTools.js";

// apis
export * from "./apis/allApis.js";

export { unregisterInterrups, setUpInterrupsForProcess} from "./interrup.js";

(async () => {
    // if it was not exported, then
if(
    resolve(process.argv[1]) ==
    resolve(fileURLToPath(import.meta.url))
){
    await quickSetup({
        commandTable: allGroup_collection.copy().extend(commandTableInternal)
    });
    log(LogType.ERROR, "jslogsystem was not exported!");
    log(LogType.INFO, "use 'import [...] from 'jslogsystem' next time!");
    log(LogType.INFO, "examples:\n * import * from 'jslogsystem';\n * import { quickSetup } from 'jslogystem';");
    log(LogType.INFO, "doing it like it is now is not safe at all");
    log(LogType.INFO, "The default console intiated though!");

    log(LogType.WARNING, "It was not possible to know the user intention, so the default 'main' terminal session was loaded with all commands available. If that was not your intention, try importing it, instead of directly launching it");

    log(LogType.INFO, "more information can be found on github (https://github.com/itsmenatika/jslogsystem) or npm (https://www.npmjs.com/package/jslogsystem)");

    log(LogType.INFO, "'internal' command was added for testing purposes");
}

})();
