// CONFIG

import { createReadStream, createWriteStream, PathLike, renameSync } from "fs";
import { join, dirname } from "path";
import { logSystemError } from "./ultrabasic.js";
import { combineColors, consoleColor, consoleColorRGB, consoleColors, consoleColorsMulti, generateAnsiColor } from "./texttools.js";
import { cmdTable } from "./apis/commands/types.js";

import type { commandCollection } from "./tools/commandCollection.js";
import { InspectOptions, InspectOptionsStylized, inspect } from "util";
import { createGzip } from "zlib";
import { unlink } from "fs/promises";
import { constructStyles } from "./styles/constructStyles.js";
import { terminalStyles, terminalStylesProvide } from "./styles/common.js";


enum logsReceiveType{}

//
// -----------------
// CONFIG DEFAULTS
// -----------------
//

// USE JOIN for paths
// const workingDirectory: string = join(import.meta.dirname, "dev");
// const LOGDIRECTORY: string = join(workingDirectory, "logs");
// const LATESTLOGNAME: string = "latest.txt";

// TO EDIT COLORS SEARCH FOR consoleColorTable!

// callback to write information on the "ver" command
// let getversionInfoData = (): string => {
//     return "meow:3";
// }

// // callback to write information on the top
// const getMoreStartInformation = (): string => {
//     const dateObj = new Date();
//     return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n`;
// }

// // callback which is used to what to do with the previous log file
// const saveTheLatest = (date: Date, previousFilePath: string, config: configData): void => {
//     renameSync(
//         previousFilePath, 
//         join(config.LogDirectory, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
//     );
// }

// let viewTextBoxStart: boolean = true; // if the textbox should be visible at the start
// // let blockLogsVarStart: boolean = false; // if the logs should be displayed
// let logsReceiveStart: logsReceiveType = logsReceiveType.normal;

// let singleLogGroupText: string = "┄┅"; // the indicator used to indicate a single log group
// let lastLogGroupText: string = "░"; // the string that gets added to the last group. It only gets added if there's at least log grpoup

// const useAddToGlobalAs: boolean = false; // whether to newConsole as a global automatically. It defaults to false
// const addToGlobalAs: string[] = ["newConsole"]; // addsnewConsole as listed keys to globalThis. Works only with useAddToGlobalAs enabled.

// const quickHello: boolean = false; // quicker hello option

// const finalLatest: string = join(LOGDIRECTORY, LATESTLOGNAME); // the path to the previous log
// const tempFinal: string = join(LOGDIRECTORY, "temp"); // the path to previous temp file log

//
// -----------------
// CONFIG DEFAULTS END
// -----------------
//


enum logsReceiveType{
    normal,
    block,
    wait
}


// type acColors = consoleColor | consoleColors | consoleColorsMulti | consoleColorRGB | string;


/**
 * the config of log system
 * 
 * The same config can be shared across terminals
 */
interface configDataProvide {
    /**
     * the working directory at the start. it change directory on this, unless otherwise specified
     * 
     * It should be already resolved
     * 
     * it defaults to: join(import.meta.dirname, "dev")
     */
    workingDirectory?: string,

    /**
     * dont allow to go above the working directory
     * 
     * NOTE: this config option is not as reliable as you may think
     * 
     * the custom commands can still not listen to that config value!
     * 
     * defaults to true
     */
    blockGoingOutsideWorkingDirectory?: boolean

    /**
     * the directory where the logs are provided. 
     * 
     * it is relative to workingDirectory
     * 
     * It defaults to: "logs"
     */
    LogDirectory?: string,

    /**
     * the path under which the latest log will be saved
     * it defaults to: latest.log
     *
     * it is relative to workingDirectory
     * 
     * NOTICE: you should not change it to 'temp' as it is reserved for storing latest log metadata
     */
    latestLog?: string,

    /**
     * the function that is called everytime a user requests a information about that specific version
     * treat it as distro image from neofetch
     * 
     * it can be seen for example under: ver (or extracted by ver -u)
     */
    getVersionData?: () => string,

    /**
     * the string that is written every time to every new log file
     * 
     * it defaults to:
     * function s(){
     *     const dateObj = new Date();
    return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n`;
        }
     * 
     * @returns the string to write
     */
    logFileHeader?: () => string;

    /**
     * the function that deals with the previous log after a new log system session is started
     * 
     * It should be used to name logs according to your critieria
     * 
     * it defaults to:
     * function meow(date: Date, previousFilePath: string, config: configData): void => {
     *      renameSync(
     *          previousFilePath,
     *          join(config.logDirectory, 
     * `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)
     *      );
     * }
     * 
     * 
     * @param date 
     * @param previousFilePath 
     * @returns 
     */
    saveTheLatest?: (date: Date, previousFilePath: string, config: configData) => void 

    /**
     * it determines whether the textbox should be visible at the start of the terminal session
     */
    viewTextBoxStart?: boolean,

    /**
     * it determines the way of handling logs at the start of terminal session
     * 
     * IT DOESNT WORK RIGHT NOW
     */
    logsReceiveStart?: logsReceiveType,

    /**
     * the formatting of the terminal
     */
    styles?: terminalStylesProvide

    /**
     * whether the object should polute the global scope. Checkbox
     * 
     * it defaults to false
     */
    useAddToGlobalAs?: boolean,

    /**
     * whether the object should polute the global scope. The names
     * 
     * it defaults to ["newConsole"]
     */
    addToGlobalAs?: string[],


    /**
     * whether process.env should be added to that session environment
     * 
     * It defaults to false
     */
    addProcessEnvToSessionEnv?: boolean,
    
    /**
     * whether the standard welcome message on terminal should be one lined.
     */
    quickHello?: boolean;

    /**
     * additional message. It will be stripped from ansi if colors in styles are disabled
     */
    message?: string;

    // /**
    //  * the path under the latest log will be saved
    //  * 
    //  * it defaults to: join(LOGDIRECTORY, LATESTLOGNAME)
    //  */
    // latestLog?: string;

    /**
     * the location of temp file of latest log
     * 
     * it is relative to workingDirectory
     * 
     * defaults to: "temp"
     */
    tempLatest?: string;


    /**
     * legacy information
     */
    legacy?: legacyData;


    /**
     * acting log system version
     */
    logSystemVersion?: [number, string]



    commandTable?: cmdTable | commandCollection
}

interface configData extends Required<configDataProvide>{
    /**
     * the formatting of the terminal
     */
    styles: terminalStyles,

    /**
     * cache for absolute path of log directory
     */
    $cache$LogDirectoryPath: string

    /**
     * cache for absolute path of latest log file
     */
    $cache$latestLogPath: string

    /**
     * cache for absolute path of latest temp log file
     */
    $cache$latestLogTempPath: string


    commandTable: cmdTable,

    [Symbol.toStringTag]: () => string;
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string;
}

// /**
//  * quick lookup table for color groups
//  */
// const default_colorTable: colorTable = {

//     "info": consoleColors.FgWhite,
//     "warning": consoleColors.FgYellow,
//     "error": consoleColors.FgRed,
//     "success": consoleColors.FgGreen,
//     "counter": consoleColors.FgCyan,
//     "init": consoleColors.FgWhite,
//     "crash": consoleColors.FgRed,
//     "group": consoleColors.FgGray,

//     "date": consoleColors.FgGray,
//     "who": consoleColors.FgMagenta,

//     "textboxin_infoSep": consoleColors.Bright,
//     "textboxin_common": consoleColors.FgYellow,
//     "textboxin_terminalName": consoleColors.Italic,
//     "textboxin_cwd": consoleColors.FgGray,
//     "textboxin_prefixSep": consoleColors.FgGray,

//     "textboxin_text_common": consoleColors.FgWhite,
//     "textboxin_text_first": combineColors(consoleColors.FgYellow, consoleColors.Underscore),
//     "textboxin_text_direct": consoleColors.FgGreen,
//     "textboxin_text_sep": consoleColors.FgGray,
//     "textboxin_text_quotas": consoleColors.FgGray
// }


//  const toWrite: string = `${formattedDate} ${logTypeString} ${who}: ${terminalData?.currentGroupString}${message}\n`;
//     const toDisplay: string = `${ct.date}${formattedDate}${consoleColors.Reset} ${logTypeString} ${ct.who}${who}${consoleColors.Reset}: ${consoleColors.FgGray}${terminalData?.currentGroupString}${consoleColors.Reset}${logColor}${message}${consoleColors.Reset}\n`;

// const default_terminalStyles: terminalStyles = {
//     singleLogGroupText: "┄┅",
//     lastLogGroupText: "░",
//     logDisplayed: `{colors.date}{formattedDate}{color.Reset} {logTypeString} {colors.who}{who}{color.Reset}: {color.FgGray}{currentGroupString}{color.Reset}{logColor}{message}{color.Reset}\n`,
//     logWritten: `{formattedDate} {logTypeString} {who}: {currentGroupString}{message}\n`,
//     inputTextbox: `{color.Reset}{cwd}{color.Reset}{colors.textboxin_prefixSep}:{color.Reset}{colors.textboxin_terminalName}{sessionName}{color.Reset}{colors.textboxin_infoSep} >{color.Reset} {colors.textboxin_common}{stylizedText}{color.Reset}`,
//     colors: default_colorTable
// };



// /**
//  * construct terminal styles
//  * @param data selected settings to change
//  * @returns the terminal styles obj
//  */
// function constructStyles(data: terminalStylesProvide = {}): terminalStyles{
//     const newStyles = {...default_terminalStyles};

//     Object.assign(newStyles, data);
//     newStyles.colors = {...default_colorTable};

//     if(data.colors){
//         Object.assign(newStyles.colors, data.colors);
//     }

//     return Object.freeze(newStyles);
// }


interface legacyDataProvide{
    /**
     * allows you to execute more commands than one in one go.
     * 
     */
    pipes?: boolean,
    /**
     * removes adding special arguments. It may cause the command to not interpret correctly if it uses those arguments
     * 
     * special arguments include: -t (for the last command in pipeline)
     * 
     * use: true -> to allow adding them
     * use: false -> to disallow adding them
     */
    specialArguments?: boolean,
};

const default_legacyDataProvide: legacyData = {
    pipes: true,
    specialArguments: true
}

type legacyData = Required<legacyDataProvide>;

function constructLegacyData(data: legacyDataProvide = {}): legacyData{
    const toRe = {...default_legacyDataProvide};

    Object.assign(toRe, data);

    return Object.freeze(toRe);
}


const default_configData: configDataProvide | {
    [Symbol.toStringTag]: () => string;
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string;
} = {
    workingDirectory: join(process.cwd(), "dev"),
    blockGoingOutsideWorkingDirectory: true,
    LogDirectory: "logs",
    latestLog: "latest.txt",
    getVersionData(): string {
        return "That update was focused on terminal sessions and configuration\nHope you enjoy it!\n\nYou can change it by changing config.getVersionData() function";
    },
    logFileHeader(){
        const dateObj = new Date();
        return `----------------\nLOGS FROM ${dateObj.toISOString()} UTC TIME ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}\n\n`;
    },
    saveTheLatest(date, previousFilePath, config) {
        const newPath = join(config.$cache$LogDirectoryPath, `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`)

        renameSync(
            previousFilePath, 
            newPath
        );


        const from = createReadStream(newPath);
        const to = createWriteStream(newPath.replace(".txt", ".txt.gz"));

        const engine = createGzip();

        from.pipe(engine).pipe(to);

        to.on("finish", async () => {
            await unlink(newPath);
        });
    },
    viewTextBoxStart: true,
    logsReceiveStart: logsReceiveType.normal,
    styles: constructStyles(),
    useAddToGlobalAs: false,
    addToGlobalAs: ["newConsole"],
    addProcessEnvToSessionEnv: false,
    quickHello: false,
    message: "",
    tempLatest: "temp",
    legacy: constructLegacyData(),

    logSystemVersion: [1.31, "1.31"],

    commandTable: {},



    [Symbol.toStringTag](): string{
        return `config()`;
    },
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string{
        if(options.colors){
            return `${consoleColors.FgYellow}configData${consoleColors.FgGray}()${consoleColors.Reset}`;
        }
        return "configData()"
    }
};

function constructConfig(data: configDataProvide = {}): configData{
    const newConfig = {...default_configData} as configDataProvide;

    Object.assign(newConfig, data);

    // const finalData = {
    //     ...newConfig,
    //     $cache$LogDirectoryPath: join(
    //         newConfig.workingDirectory as string, 
    //         newConfig.LogDirectory as string
    //     ),
    //     $cache$latestLogPath: join(
    //         newConfig.workingDirectory as string,
    //         newConfig.latestLog as string
    //     ),
    //     $cache$latestLogTempPath: join(
    //         newConfig.workingDirectory as string,
    //         newConfig.tempLatest as string
    //     )
    // };

    // const toSet: Record<string, any> = {
    //     $cache$LogDirectoryPath: join(
    //         newConfig.workingDirectory as string, 
    //         newConfig.LogDirectory as string
    //     ),
    //     $cache$latestLogPath: join(
    //         newConfig.workingDirectory as string,
    //         newConfig.latestLog as string
    //     ),
    //     $cache$latestLogTempPath: join(
    //         newConfig.workingDirectory as string,
    //         newConfig.tempLatest as string
    //     )
    // };

    Object.assign(newConfig, {
        $cache$LogDirectoryPath: join(
            newConfig.workingDirectory as string, 
            newConfig.LogDirectory as string
        ),
    });

    Object.assign(newConfig, {
        $cache$latestLogPath: join(
            // @ts-expect-error
            newConfig.$cache$LogDirectoryPath as string,
            newConfig.latestLog as string
        ),
        $cache$latestLogTempPath: join(
            newConfig.workingDirectory as string,
            newConfig.tempLatest as string
        )
    });

    if(
        typeof newConfig['commandTable'] == "object"
        &&
        newConfig['commandTable']['get']
        &&
        typeof newConfig['commandTable']['get'] == "function"
    ){
        newConfig['commandTable'] = newConfig['commandTable'].get();
    }

    // for(let [path, val] of Object.entries(toSet)){
    //     Object.defineProperty(newConfig, path, {
    //         value: val,
    //         writable: false
    //     });
    // }

    // const listenAt: Record<string, ((val: any) => void)> = {
    //     tempLatest: (val: any) => {

    //     }
    // }

    // for(let [valToListen, callback] of Object.entries(listenAt)){
    //     Object.defineProperty(newConfig, valToListen, {
    //             set: (val: any) => {
    //                 // @ts-expect-error
    //                 this[valToListen] = val;

    //                 callback(val);
    //             }
    //         }   
    //     );
    // }

    // Object.defineProperty(finalData, "$cache$LogDirectoryPath", {
    //     value: join(
    //         newConfig.workingDirectory as string, 
    //         newConfig.LogDirectory as string
    //     ),
    //     writable: false
    // });

    // finalData.$cache$LogDirectoryPath.

    return Object.freeze(newConfig as configData);
}

type savedPresetsType = Record<string, configData>;

const savedConfigPresets: savedPresetsType = {'default': constructConfig()}; 

function savePreset(name: string, data: configData): configData{
    return savedConfigPresets[name] = data;
}

function getPreset(name: string, tolerateError: true): configData | undefined;
function getPreset(name: string, tolerateError: false): configData;
function getPreset(name: string, tolerateError: boolean = false): configData | undefined {
    if(!(name in savedConfigPresets)){
        if(!tolerateError){
            throw new logSystemError("the preset " + name + " doesnt exist!");
        }

        return undefined;
    }

    return savedConfigPresets[name];
}

// type configData = Required<configDataProvide>;

export {
    constructConfig,
    constructStyles,
    terminalStyles,
    terminalStylesProvide,
    configData,
    configDataProvide,
    getPreset,
    savePreset,
    logsReceiveType,

    legacyData,
    legacyDataProvide
}

// export {
//     // paths
//     workingDirectory, LOGDIRECTORY, LATESTLOGNAME,

//     // messages customization
//     getversionInfoData,
//     getMoreStartInformation,
//     quickHello,

//     // log management
//     saveTheLatest,

//     // logs behaviour
//     viewTextBox,
//     blockLogsVar,

//     // groups
//     singleLogGroupText,
//     lastLogGroupText,

//     // globals
//     useAddToGlobalAs,
//     addToGlobalAs,

//     // log paths
//     finalLatest,
//     tempFinal
// }

