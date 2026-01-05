import { inspect, stripVTControlCharacters } from "util";
import { log, logNode, LogType } from "../../log.js";
import { consoleUltraRawWrite, consoleWrite } from "../../out.js";
import { getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { commandDividerInternal } from "./commandParser.js";
import { isControlType, isExplicitUndefined, isOnlyToRedirect, isPipeHalt, pipeHalt, specialTypes } from "./commandSpecialTypes.js";
import { commandExecParams, commandExecParamsProvide, commandPipe, getReadyParams, pipeType } from "./common.js";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";
import { logSystemError } from "../../ultrabasic.js";
import { consoleColors, formatError } from "../../texttools.js";
import { cmdcallback, cmdCallbackAsync, cmdCallbackResponse, commandContext, commandDataAsync, commandDataRegular } from "./types.js";
import { textboxVisibility } from "../terminal/textbox.js";
import { printTextBox } from "../../formatingSessionDependent.js";
import { access, appendFile, constants, mkdir, readFile, writeFile } from "fs/promises";

// function commandExec(text: string, ses: terminalSession, silent: boolean = false){
//     if(!silent){
//         log(LogType.INFO, `This command has been executed: '${text}'`);
//     }
// }


type execParType = [Array<any>,  any];

function setResult(){
    
}

function tryToGetAsStringToPrint(val: any, canUseColors: boolean = false): string {
    let toPrint: string;
    // toPrint = inspect(val, true, null, canUseColors); 
    switch(typeof val){
        case "string": {
            toPrint = val;
            break;
        }
        case "object":
        default:
            if(isOnlyToRedirect(val)){
                toPrint = val.val;
                break;
            }
            toPrint = inspect(val, true, null, canUseColors); 
    }

    // toPrint += "\n";

    return toPrint;
}


function tryToPrintResult(
    result: any,
    op: commandExecParams,
    session: terminalSession
){
    if(isExplicitUndefined(result)){
        consoleUltraRawWrite(
            "undefined",
            "undefined",
            session.out,
            session.fileout
        );
        // consoleWrite("undefined", undefined, undefined, undefined, session);
    }
    else if(result !== undefined){
        if(isOnlyToRedirect(result)) return;

        const toW = tryToGetAsStringToPrint(result, true);
        // consoleWrite(toW, undefined, undefined, "", session);

        consoleUltraRawWrite(
            toW,
            stripVTControlCharacters(String(toW)),
            session.out,
            session.fileout
        );

        // consolePairWrite(
        //     tryToGetAsStringToPrint(res, false),
        //     tryToGetAsStringToPrint(res, true)
        // );

        // consoleWrite(tryToGetAsStringToPrint(res, true));
        // s.useConsoleWrite();

        // consoleWrite(
        //     inspect(res, true, null, true) + "\n", 
        //     consoleColors.FgWhite
        // );
    }
}

function divider(data: string): [string[], number | null]{
    const toRet: string[] = [];

    let i: number = 0;
    let cur: string = "";
    let closedQuotas: number | null = null;
    while(i < data.length){
        // console.log('da', i, data.length, data[i]);
        switch(data[i]){
            case "\\": {
                if(i + 1 >= data.length){
                    cur += "\\";
                    break;
                }
                switch(data[i + 1]){
                    case "\\":
                        cur += "\\";
                        i++;
                        break;
                    case "\"":
                        cur += "\""
                        i++;
                        break;
                    default:
                        cur += "\\";
                        break;
                }
                break;
            }
            case "\"": {
                closedQuotas = i;
                i++;
                
                while(
                    i < data.length
                ){
                    if(
                        data[i] === "\\"
                        &&
                        i + 1 < data.length
                        && 
                        data[i + 1] === "\""
                    ){
                        i++;
                        continue;
                    }

                    if(
                        data[i] === "\""
                        &&
                        i != 0
                        &&
                            data[i - 1] != "\\"
                    ){
                        closedQuotas = null;
                        break;
                    }

                    cur += data[i];
                    i++;

                    // if(
                    //     data[i] == "\\"
                    //     &&
                    //     i + 1 < data.length
                    //     &&
                    //     data[i + 1] == "\""
                    // ){
                    //     cur += "\"";
                    //     i += 2;
                    // }
                    // else if(data[i] == "\""){
                    //     closedQuotas = true;
                    //     break;
                    // }
                    // else cur += data[i];
                    // i++;
                }

                break;
            }
            case " ": {
                toRet.push(cur);
                cur = "";
                break;
            }
            default: {
                cur += data[i];
                break;
            }
        }
        i++;
    }

    if(cur.length > 0) toRet.push(cur);

    return [toRet, closedQuotas];
}

async function commandInternalExec(
    text: string, 
    options: commandExecParamsProvide
){
    let quotasFin: null | number = null;
    const [op, session] = getReadyParams(options);

    // the information about the command execution
    if(!op.silent)
    log(LogType.INFO, `This command has been executed: '${text}'`, op.logNode, session);

    const prev = textboxVisibility(undefined, session);

    if(!op.onlyReturn)
    textboxVisibility(false, session);

    let res;
    let prints = 0;
    // console.log('g');
    if(session.config.legacy.pipes){
        const [pipeTree, quotas] = commandDividerInternal(text);
        quotasFin = quotas;


        // console.log(pipeTree);
        // return; 
        if(quotas === null)
        [res, prints] = await pipeExecutor(pipeTree, options);
    }
    else{
        // const parts = text.split(" ");
        const [parts, quotas] = divider(text);
        quotasFin = quotas ? null : 2;

        if(quotas === null){
            let partsToUse;
            if(!session.config.legacy.specialArguments){
                partsToUse = parts;
            }
            else{
                partsToUse = [parts[0], !op.onlyReturn ? "-§" : "" , ...parts.slice(1)];
            }
    
            res = await handleCommandInternal(partsToUse, options, [partsToUse, partsToUse]);
        }
    }

    if(!op.onlyReturn && !op.noPrintResult)
    tryToPrintResult(res, op, session);

    if((res !== undefined || prints != 0) && !op.onlyReturn && !op.noPrintResult){
        consoleUltraRawWrite(
            "\n",
            "\n",
            session.out,
            session.fileout
        );   
    }

    if(quotasFin !== null){
        if(op.silent !== true)
        log(LogType.ERROR, `unclosed quotas: ${consoleColors.FgWhite}${text.slice(0, quotasFin)}${consoleColors.BgRed}${text.slice(quotasFin)}${consoleColors.Reset}`, "console", session);
    }

    if(!Object.hasOwn(session.flags, 'dontChangeTextboxVisiblity') && !op.onlyReturn){
        // printTextBox(session);
        textboxVisibility(prev, session);
    }
    else{
        delete session.flags['dontChangeTextboxVisiblity'];
    }

    return res;
}


/**
 * tests the object to determine whether it should be treated as a positive result of a command
 * it's required because javascript tends for example to treat empty strings as false
 * 
 * @param obj any object to test
 * @returns the result (boolean)
 */
function internalIsTrue(obj: any): boolean{
    switch(typeof obj){
        case "boolean":
            return obj;

        case "bigint":
            return true;
        
        case "function":
            return true;

        case "number":
            return true;

        case "object":
            if(obj === null) return false;
            if(Array.isArray(obj)) return true;

            const searchFor: Array<string | symbol> = ['valid', 'isValid', 'ok', 'isTrue', 'toBoolean', 'valueOf', Symbol.toPrimitive, 'toString'];

            for(let i = 0; i < searchFor.length; i++){
                if(searchFor[i] in obj) continue;

                const toTest = obj[searchFor[i]];

                if(typeof toTest === "boolean") return toTest;
                if(typeof toTest === "function") return !!(toTest());
            }


            return true;
        
        case "string":
            return true;
        
        case "symbol":
            return true;

        case "undefined":
            return false;
            

        default:
            return false;
    }
}

async function pipeExecutor(pipeTree: commandPipe[], options: commandExecParamsProvide = {}):
Promise<[any, number]>{
    // console.log(pipeTree);
    const [op, session] = getReadyParams(options);


    let pipeHaltCalled: boolean = false;
    let result: any = options.startingResult;
    let prints: number = 0;


    // console.log(pipeTree);
    for(let i = 0; i < pipeTree.length; i++){
        const pipe = pipeTree[i];
        // console.log(pipe, result, pipeHaltCalled, prints);

        // console.log(pipe, result);

        if(pipeHaltCalled){
            while(i < pipeTree.length && pipeTree[i].type !== pipeType.dataClear) i++;

            pipeHaltCalled = false;

            if(!(i < pipeTree.length))
                return [undefined, prints];
        }

        switch(pipe.type){
            case pipeType.unkown: {
                log(LogType.WARNING, "UNKNOWN TYPE PIPE", "pipeExec", session);
                break;
            }
            case pipeType.dataTryWrite: {
                tryToPrintResult(result, op, session);
                prints++;

                break;
            }

            case pipeType.fileFrom: {
                let where = join(session.cwd, pipe.val as string);

                try {
                    await access(where, constants.R_OK);
                } catch (error) {
                    result = undefined;

                    const loc = relative(session.config.workingDirectory, where);

                    log(LogType.ERROR, `It was not possible to access '${loc}'!`, "pipeExec", session);
                    break;
                }

                let f = await readFile(where);

                result = f;
                break;
            }

            case pipeType.fileAppend: {
                let m = result;
                if(Array.isArray(m) && m.length === 1){
                    m = m[0];
                }
                
                if(typeof m !== "string" && !(
                    m instanceof Uint8Array
                )){
                    m = Buffer.of(m);
                }


                const where = join(session.cwd, pipe.val as string);

                try {
                    await mkdir(dirname(where), {recursive: true});
                    await appendFile(where, m, undefined);
                } catch (error) {
                    result = undefined;

                    const loc = relative(session.config.workingDirectory, where);

                    log(LogType.ERROR, `It was not possible to access '${loc}'!`, "pipeExec", session);
                    pipeHaltCalled = true;
                    break;
                }

                // appendFileSync(where, m);
                break;
            }

            case pipeType.fileSet: {
                let m = result;
                if(Array.isArray(m) && m.length === 1){
                    m = m[0];
                }
                
                if(typeof m !== "string" && !(
                    m instanceof Uint8Array
                )){
                    m = Buffer.of(m);
                }

                const where = join(session.cwd, pipe.val as string);

                
                
                try {
                    await mkdir(dirname(where), {recursive: true});
                    await writeFile(where, m, undefined);
                } catch (error) {
                    result = undefined;

                    const loc = relative(session.config.workingDirectory, where);

                    log(LogType.ERROR, `It was not possible to access '${loc}'!`, "pipeExec", session);
                    pipeHaltCalled = true;
                    break;
                }

                // writeFileSync(where, m);

                const dir = dirname(where);

                

                break;
            }
            case pipeType.dataClear: {
                result = undefined;
                pipeHaltCalled = false;
                break;
            }

            case pipeType.command: {
                const commandExec = pipe.val as string;
                const [commandExecParts, quotas] = divider(commandExec);

                if(quotas !== null){
                    pipeHaltCalled = true;
                    if(op.silent !== true)
                    log(LogType.ERROR, `unclosed quotas: ${consoleColors.FgWhite}${commandExec.slice(0, quotas)}${consoleColors.BgRed}${commandExec.slice(quotas)}${consoleColors.Reset}`, "console", session);
                    return [result, prints];
                }

                const commandPartsToUse = [commandExecParts[0]];

                // console.log("meow ", i, pipeTree.length);

                let addThereIsMore: boolean = false;


                // console.log(pipeTree, op.thereIsMore, addThereIsMore,
                //     (i >= pipeTree.length), i + 1 < pipeTree.length
                // );

                // console.log(
                //     pipeTree,

                //        !op.thereIsMore , !options.onlyReturn
                //     , session.config.legacy.specialArguments ,
                //     (
                //         i === pipeTree.length - 1
                //         ||
                //         (
                //             i + 1 < pipeTree.length &&
                //             pipeTree[i + 1].type === pipeType.dataClear
                //         )
                //     )
                // );

                if(
                    !op.LaunchedFromBind && !op.thereIsMore && !options.onlyReturn
                    && session.config.legacy.specialArguments &&
                    (
                        i === pipeTree.length - 1
                        ||
                        (
                            i + 1 < pipeTree.length &&
                            pipeTree[i + 1].type === pipeType.dataClear
                        )
                    )
                ){
                    
                    commandPartsToUse.push("-§");
                }

                // if(
                //     session.config.legacy.specialArguments &&(
                //         i === pipeTree.length - 1
                //         ||
                //         (
                //             i + 1 < pipeTree.length &&
                //             pipeTree[i + 1].type === pipeType.dataClear
                //         )
                //     )
                //     &&
                //     !op.onlyReturn
                // ){
                //     if(!options.thereIsMore)
                //     commandPartsToUse.push("-§");
                // }

                // console.log(commandPartsToUse);

                commandPartsToUse.push(...commandExecParts.slice(1));

                const provided = [...commandPartsToUse];

                if(Array.isArray(result)){
                    commandPartsToUse.push(...result);
                }
                else if(result !== undefined){
                    commandPartsToUse.push(result);
                }

                // if(i === 0){
                //     if(Array.isArray(execPar[1])){
                //         commandPartsToUse.push(...execPar[1]);
                //     }
                //     else if(execPar[1] !== undefined){
                //         commandPartsToUse.push(execPar[1]);
                //     }
                // }


                // console.log('dadad ', commandPartsToUse);
                const cmdRes = await handleCommandInternal(
                    commandPartsToUse, addThereIsMore ? {...options, thereIsMore: addThereIsMore || op.thereIsMore, startingResult: undefined} : options,
                     [provided, result]
                );
                
                // console.log(cmdRes, ' dadad');

                // console.log(cmdRes);s

                if(isControlType(cmdRes)){
                    // console.log(options.thereIsMore);
                    if(
                        isOnlyToRedirect(cmdRes)
                        &&
                        (
                            options.thereIsMore
                            || (
                                i !== pipeTree.length - 1
                                &&
                                pipeTree[i + 1].type !== pipeType.dataTryWrite
                            )
                            ||
                            op.onlyReturn
                        )
                    // if(
                    //     isOnlyToRedirect(cmdRes) 
                    //     &&
                    //     options.thereIsMore
                    //     && (
                    //         i !== pipeTree.length - 1
                    //         &&
                    //         pipeTree[i + 1].type !== pipeType.dataTryWrite
                    //     )
                    //     ||
                    //     op.onlyReturn
                    ){
                        result = cmdRes.val;
                    }
                    else if(isPipeHalt(cmdRes)){
                        pipeHaltCalled = true;
                    }
                    else if(isExplicitUndefined(cmdRes)){
                        result = cmdRes;
                    }
                    // else return [undefined, prints];
                }
                else{
                    result = cmdRes;
                }

                // console.log(cmdRes, result, options,  '  d');

                break;
            }
            case pipeType.pipe: {
                // NO NEED TO IMPLEMENT CAUSE IT ACTUALLY ALREADY WORKING!
                break;
            }

            case pipeType.and: {
                if(!internalIsTrue(result)){
                    return [result, prints];
                }

                break;
            }

            case pipeType.or: {
                if(internalIsTrue(result)){
                    return [result, prints];
                }

                break;
            }
        }
    }

    return [result, prints];
}



// async function handleCommandInternalFinal(
//     parts: any[],
//     options: commandExecParams,
//     execPar: [any[], any[]],
//     executedAs: "UNKNOWN" | "BIND" | "ORGINAL" | "ALIAS"
// ) {
    
// }

// that functions handles commands. It's for internal usage
async function handleCommandInternal(
    parts: any[], 
    options: commandExecParamsProvide,
    execPar: execParType = [[], undefined]
): Promise<cmdCallbackResponse | void>{

    const [op, session] = getReadyParams(options);
    const conf = session.config;


    const thisObj: commandContext = {
        isCommandContext: true,
        executedAs: "UNKOWN",
        logNode: options.logNode,
        sessionName: session.sessionName,
        cwd: session.cwd,
        _terminalSession: session,
        runAt: Date.now(),
        providedArgs: execPar[0] || [],
        passedData: execPar[1] || []
    };


    // get parts

    // try to execute it
    if(Object.hasOwn(conf.commandTable, parts[0])){
        // print the info as log about that cmd
        // if(!silent)
        // log(LogType.INFO, `This command has been executed: '${text}'`, logNode);

        thisObj.executedAs = "ORGINAL";

        try {
            const cmdData = conf.commandTable[parts[0]];

            if(
                cmdData.minver !== undefined 
                &&
                Number(session.config.logSystemVersion[0]) < cmdData.minver
            ){
                log(LogType.ERROR, `'${parts[0]}' doesn't support versions below ${String(cmdData.minver)} and your version is ${String(session.config.logSystemVersion[1])}`, op.logNode, session);

                if(!conf.legacy.pipes) return undefined;

                return {__$special: specialTypes.pipeExecutorHalt};                 
            }


            if(
                cmdData.maxver !== undefined 
                &&
                Number(session.config.logSystemVersion[0]) > cmdData.maxver
            ){
                log(LogType.ERROR, `'${parts[0]}' doesn't support versions above ${String(cmdData.maxver)} and your version is ${String(session.config.logSystemVersion[1])}`, op.logNode, session);

                if(!conf.legacy.pipes) return undefined;

                return {__$special: specialTypes.pipeExecutorHalt};                 
            }

            // get the orginal command if that is an alias
            let orginalCmd;
            if(cmdData.isAlias){
                thisObj.executedAs = "ALIAS";
                orginalCmd = conf.commandTable[cmdData.aliasName as string] as commandDataAsync | commandDataRegular;

                if(!orginalCmd){
                    throw new logSystemError("invalid alias");
                }

                if(orginalCmd.async){

                }
                else
                return (orginalCmd.callback as cmdcallback).apply(thisObj, [parts]);
            }
            else orginalCmd = cmdData;

            const cmdToUse = orginalCmd as commandDataRegular | commandDataAsync;

            // execute it
            if(orginalCmd.async){
                return await (cmdToUse.callback as cmdCallbackAsync).apply(thisObj, [parts]);
                // return true;
            }
            else{
                return await (cmdToUse.callback as cmdcallback).apply(thisObj, [parts]);
            }


            // return commands[parts[0]].callback(parts);
        
        // catch errors
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the command execution:\n" + formatError(error), op.logNode, session);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    else if(parts[0] in session.bindTable){
        thisObj.executedAs = "BIND";

        // print the info as log about that bind
        // if(!silent)
        // log(LogType.INFO, `This bind has been executed: '${text}'`, logNode);

        let bindD = session.bindTable[parts[0]];

        let sr = execPar[0].slice(1);
        // console.log('w');
        try {
            // for(const command of bindD.commands){
            //     commandInternalExec(command, true);
            // }
            return await commandInternalExec(
                bindD.executor + " " + sr.join(" "), {...options, silent: true, LaunchedFromBind: true, noPrintResult: true, startingResult: execPar[1]},
            );
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the bind execution:\n" + formatError(error), op.logNode, session);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    // catch unkown command
    else{
        // if(!op.silent)
        log(LogType.ERROR, `unknown command '${parts[0]}'`, op.logNode, session);

        if(!conf.legacy.pipes) return undefined;

        return {__$special: specialTypes.pipeExecutorHalt}; 
    }

}

// // }

export {commandInternalExec}