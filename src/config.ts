// CONFIG

import { renameSync } from "fs";
import { join } from "path";

// USE JOIN for paths
const workingDirectory: string = join(import.meta.dirname, "dev");
const LOGDIRECTORY: string = join(workingDirectory, "logs");
const LATESTLOGNAME: string = "latest.txt";

// TO EDIT COLORS SEARCH FOR consoleColorTable!

// callback to write information on the "ver" command
let getversionInfoData = (): string => {
    return "meow:3";
}

// callback to write information on the top
const getMoreStartInformation = (): string => {
    const dateObj = new Date();
    return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n`;
}

// callback which is used to what to do with the previous log file
const saveTheLatest = (date: Date, previousFilePath: string): void => {
    renameSync(
        previousFilePath, 
        join(LOGDIRECTORY, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
    );
}

let viewTextBox: boolean = true; // if the textbox should be visible at the start
let blockLogsVar: boolean = false; // if the logs should be displayed

let singleLogGroupText: string = "┄┅"; // the indicator used to indicate a single log group
let lastLogGroupText: string = "░"; // the string that gets added to the last group. It only gets added if there's at least log grpoup

const useAddToGlobalAs: boolean = false; // whether to newConsole as a global automatically. It defaults to false
const addToGlobalAs: string[] = ["newConsole"]; // addsnewConsole as listed keys to globalThis. Works only with useAddToGlobalAs enabled.

const quickHello: boolean = false; // quicker hello option

export {
    // paths
    workingDirectory, LOGDIRECTORY, LATESTLOGNAME,

    // messages customization
    getversionInfoData,
    getMoreStartInformation,
    quickHello,

    // log management
    saveTheLatest,

    // logs behaviour
    viewTextBox,
    blockLogsVar,

    // groups
    singleLogGroupText,
    lastLogGroupText,

    // globals
    useAddToGlobalAs,
    addToGlobalAs
}