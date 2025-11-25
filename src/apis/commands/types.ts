import { logNode } from "../../log";
import { terminalSession } from "../../programdata";

interface commandContext {
    isCommandContext: true,
    logNode: logNode | string | undefined,
    sessionName: string,
    cwd: string,

    /**
     * @internal @deprecated
     * for internal use, use apis instead
     * 
     * it is very prone to changes in the future. Compatibility will not be kept
     * 
     * use only if what you want can't be achieved otherwise
     */
    _terminalSession: terminalSession,

    executedAs: "BIND" | "ALIAS" | "ORGINAL" | "UNKOWN",
    runAt: number
};

function isCommandContext(obj: any): obj is commandContext{
    return typeof obj === "object" && obj.isCommandContext;
}

type cmdCallbackResponse = void | boolean | number | string | undefined | null | Object;

type cmdcallback = ((this: commandContext, args: any[]) => cmdCallbackResponse);
type cmdCallbackAsync = ((this: commandContext, args: any[]) => Promise<cmdCallbackResponse>);

/**
 * blank callback, that can be used for testing purposes
 */
const blankCallback = (args: any[]) => false;

interface commandData{
    "usageinfo"?: string
    "desc"?: string,
    "longdesc"?: string,
    "hidden"?: boolean,
    "changeable"?: boolean,
    "isAlias"?: boolean,
    "aliasName"?: string,
    "callback"?: cmdcallback | cmdCallbackAsync,
    "async"?: boolean,
    "minver"?: number,
    "maxver"?: number
}

interface commandDataAsync extends commandData{
    isAlias?: false,
    aliasName?: undefined,
    "async": true,
    "callback": cmdCallbackAsync,
}

// interface commandDataAsyncInMemory extends Pick<commandDataAsync, "desc"

interface commandDataRegular extends commandData{
    isAlias?: false,
    aliasName?: undefined,
    "async"?: false,
    "callback": cmdcallback
}

interface commandAlias extends commandData {
    usageInfo?: undefined,
    desc?: undefined,
    longDesc?: undefined,
    callback?: undefined,
    async?: undefined,
    isAlias: true
    aliasName: string,
}

type unifiedCommandTypes = commandDataRegular | commandDataAsync | commandAlias;

function isCommandAlias(command: commandData): command is commandAlias{
    return typeof command === "object" && command.isAlias == true && typeof command.aliasName === "string";
}


type cmdTable = Record<string, unifiedCommandTypes>;


// interface commandCompound{
//     name: string,
//     data: unifiedCommandTypes
// }

type commandCompoundType = [string, unifiedCommandTypes];

type commandCompoundTableType = commandCompoundType[];

export {isCommandContext, commandContext, isCommandAlias, cmdTable, unifiedCommandTypes, commandDataRegular, commandData, commandDataAsync, commandAlias, blankCallback, cmdcallback, cmdCallbackAsync, cmdCallbackResponse, commandCompoundType, commandCompoundTableType}