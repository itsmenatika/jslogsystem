import Stream from "stream"
import { commandContext, fullControler } from "../../apis/allApis.js"
import { pos2D, screenBufferDouble } from "../../apis/terminal/screenBuffer.js"

interface nicroData{
    context: commandContext,
    preargs: any[]
}

const enum actionType{
    undefined,
    insertText,
    removeText
}

interface action{
    type: actionType
    pos?: pos2D
    text?: string
}

interface actionInsertText extends action{
    pos: pos2D,
    text: string
}

interface actionRemoveText extends action{
    pos: pos2D,
    text: string
}

interface fullNicroData extends nicroData{
    fulcon: fullControler,
    usePassedArgumentsAlsoLikeFiles: boolean,
    forceNewBuffer: boolean,
    instantClose: boolean,
    returntype: 'default' | "true" | 'buffer' | 'text' | 'number' | 'filename' | 'savepath' | 'object',
    maxtime: any,
    maxtimenum: number,
    fileNames: string[],
    state: "default" | "toline" | "leaveUnsavedQuestion" | "saveas" | "saveasleave" | "cmd",
    topleft: pos2D,
    cursor: pos2D,
    shiftOffset: pos2D,
    edited: boolean,
    laneNumTo: string,
    writeOnly: boolean,
    text: string[],
    savePath: string,
    fileName: string,
    out: Stream,
    ins: Stream,
    db: screenBufferDouble,
    flp: boolean,
    tm: number,
    tempblnkcursorpos: pos2D | undefined,
    endline: string
    forcereturnthing?: unknown,
    selectionAnchor?: pos2D,
    actionStack: action[],
    redoStack: action[],
    dontconfirm: boolean
}


export {nicroData, fullNicroData, actionType, actionInsertText, actionRemoveText, action}