import { logNode } from "../../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";

/**
 * a type of a single node in the command tree
 */
enum pipeType{
    unkown, // unkown
    fileFrom, // <
    fileFromAppend, // <<
    command, // cmd
    fileSet, // >
    fileAppend, // >>
    and, // &&
    or, // ||
    pipe, // |
    dataTryWrite, // print the result
    dataClear // ;
}

/**
 * a single node in the command tree
 */
interface commandPipe{
    type: pipeType,
    val: any
}

const specialChars = [">", "<"];
const commandParsingStop = ["|", "&", ";"];


interface commandExecParamsProvide{
    logNode?: string | logNode,
    silent?: boolean,
    onlyReturn?: boolean,
    terminal?: getTerminalOPJTYPE,
    startingResult?: any,
    thereIsMore?: boolean,
    noPrintResult?: boolean,
    LaunchedFromBind?: boolean
}

interface commandExecParams extends Required<commandExecParamsProvide>{};

const default_execParams = {
    logNode: "core",
    silent: false,
    onlyReturn: false,
    terminal: "main",
    thereIsMore: false,
    noPrintResult: false,
    LaunchedFromBind: false
} as commandExecParams;

function getReadyParams(data: commandExecParamsProvide = {}): [commandExecParams, terminalSession]{
    const toRet = {...default_execParams};
    Object.assign(toRet, data);

    return [toRet, getTerminalOPJ(toRet.terminal)];
}


export {specialChars, commandParsingStop, commandPipe, pipeType,
    commandExecParamsProvide, commandExecParams,

    default_execParams, getReadyParams
}