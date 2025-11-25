import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { commandExecParamsProvide, commandPipe, getReadyParams, pipeType } from "./common";
import { join } from "path";
import { isControlType, isExplicitUndefined, isOnlyToRedirect, isPipeHalt, specialTypes } from "./commandSpecialTypes";
import { log, logNode, LogType } from "../../log";
import { terminalSession } from "../../programdata";
import { cmdcallback, cmdCallbackAsync, cmdCallbackResponse, commandDataAsync, commandDataRegular } from "../../config";
import { logSystemError } from "../../ultrabasic";
import { formatError } from "../../texttools";

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

function pipeExecutor(pipeTree: commandPipe[], options: commandExecParamsProvide = {}){
    const [op, session] = getReadyParams(options);


    let pipeHaltCalled: boolean = false;
    let result: any = void 0;


    // console.log(pipeTree);
    for(let i = 0; i < pipeTree.length; i++){
        const pipe = pipeTree[i];

        // console.log(pipe, result);

        if(pipeHaltCalled){
            while(i < pipeTree.length && pipeTree[i].type !== pipeType.dataClear) i++;

            pipeHaltCalled = false;

            if(!(i < pipeTree.length))
                return undefined;
        }

        switch(pipe.type){
            case pipeType.fileFrom: {


                let f = readFileSync(join(process.cwd(), pipe.val as string));

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

                appendFileSync(join(process.cwd(), pipe.val as string), m);
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

                writeFileSync(join(process.cwd(), pipe.val as string), m);
                break;
            }
            case pipeType.dataClear: {
                result = undefined;
                pipeHaltCalled = false;
                break;
            }

            case pipeType.command: {
                const commandExec = pipe.val as string;
                const commandExecParts = commandExec.split(" ");

                const commandPartsToUse = [commandExecParts[0]];

                // console.log("meow ", i, pipeTree.length);
                if(
                    session.config.legacy.specialArguments &&(
                        i === pipeTree.length - 1
                        ||
                        (
                            i + 1 < pipeTree.length &&
                            pipeTree[i + 1].type === pipeType.dataClear
                        )
                    )
                ){
                    commandPartsToUse.push("-t");
                }
                // console.log(commandPartsToUse);

                commandPartsToUse.push(...commandExecParts.slice(1));


                if(Array.isArray(result)){
                    commandPartsToUse.push(...result);
                }
                else if(result !== undefined){
                    commandPartsToUse.push(result);
                }

                // console.log('dadad ', commandPartsToUse);
                const cmdRes = handleCommandInternal(
                    commandPartsToUse, conf.silent, conf.logNode
                );

                // console.log(cmdRes);s

                if(isControlType(cmdRes)){
                    if(isOnlyToRedirect(cmdRes) && i !== pipeTree.length - 1){
                        result = cmdRes.val;
                    }
                    else if(isPipeHalt(cmdRes)){
                        pipeHaltCalled = true;
                    }
                    else if(isExplicitUndefined(cmdRes)){
                        result = cmdRes;
                    }
                    else return undefined;
                }
                else{
                    result = cmdRes;
                }

                break;
            }
            case pipeType.pipe: {
                // NO NEED TO IMPLEMENT CAUSE IT ACTUALLY ALREADY WORKING!
                break;
            }

            case pipeType.and: {
                if(!internalIsTrue(result)){
                    return result;
                }

                break;
            }

            case pipeType.or: {
                if(internalIsTrue(result)){
                    return result;
                }

                break;
            }
        }
    }

    return result;
}



// that functions handles commands. It's for internal usage
function handleCommandInternal(
    parts: any[], 
    silent: boolean = false, 
    logNode: string | logNode = "console",
    session: terminalSession
): cmdCallbackResponse | void{
    const conf = session.config;


    // get parts

    // try to execute it
    if(Object.hasOwn(conf.commandTable, parts[0])){
        // print the info as log about that cmd
        // if(!silent)
        // log(LogType.INFO, `This command has been executed: '${text}'`, logNode);

        try {
            const cmdData = conf.commandTable[parts[0]];

            // get the orginal command if that is an alias
            let orginalCmd;
            if(cmdData.isAlias){
                orginalCmd = conf.commandTable[cmdData.aliasName as string] as commandDataAsync | commandDataRegular;

                if(!orginalCmd){
                    throw new logSystemError("invalid alias");
                }

                if(orginalCmd.async){

                }
                else
                return (orginalCmd.callback as cmdcallback)(parts);
            }
            else orginalCmd = cmdData;

            const cmdToUse = orginalCmd as commandDataRegular | commandDataAsync;

            // execute it
            if(orginalCmd.async){
                (cmdToUse.callback as cmdCallbackAsync)(parts);
                return true;
            }
            else{
                return (cmdToUse.callback as cmdcallback)(parts);
            }


            // return commands[parts[0]].callback(parts);
        
        // catch errors
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the command execution:\n" + formatError(error), logNode);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    else if(parts[0] in session.bindTable){
        // print the info as log about that bind
        // if(!silent)
        // log(LogType.INFO, `This bind has been executed: '${text}'`, logNode);

        let bindD = session.bindTable[parts[0]];
        try {
            // for(const command of bindD.commands){
            //     commandInternalExec(command, true);
            // }
            return commandInternalExec(bindD.command, true, logNode, true);
        } catch (error) {
            log(LogType.ERROR, "The error has occured during the bind execution:\n" + formatError(error), logNode);
            return {__$special: specialTypes.pipeExecutorHalt};
        }
    }
    // catch unkown command
    else{
        if(!silent)
        log(LogType.ERROR, `unknown command '${parts[0]}'` , logNode);

        if(!conf.legacy.pipes) return undefined;

        return {__$special: specialTypes.pipeExecutorHalt}; 
    }

}