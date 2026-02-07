import { log, logNode, LogType } from "../../log.js";
import { getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { ansiEscape } from "../../texttools.js";
import { logSystemError } from "../../ultrabasic.js";
import { logTimeEnd } from "../console/timers.js";
import { commandParsingStop, commandPipe, pipeType, specialChars } from "./common.js";


function commandDividerInternal(text: string): [commandPipe[], number | null]{
    if(text.length === 0) return [[] as commandPipe[], null];

    let commandPipe: Array<commandPipe> = [];
    let i: number = 0;
    let quotas: null | number = null;
    while(i < text.length){
        // console.log(text[i], ' wda');
        const [theNewI, commandData, quotasTemp] = pipeDividerInternal(text, i);

        if(quotasTemp !== null) return [[] as commandPipe[], quotasTemp];
        

        commandPipe.push(...commandData);
        i = theNewI;

        while(text.length > i && text[i] == " ") i++;
        if(!(i < text.length)) return [commandPipe, quotas];


        switch(text[i]){
            case "|":
                i++;

                if(i < text.length && text[i] === "|"){
                    commandPipe.push({
                        type: pipeType.or,
                        val: undefined
                    });
                    
                    i++;
                    break;
                }

                commandPipe.push({
                    type: pipeType.pipe,
                    val: undefined
                });
                break;
            case ";": {
                i++;
                commandPipe.push({
                    type: pipeType.dataTryWrite,
                    val: undefined
                });
                commandPipe.push({
                    type: pipeType.dataClear,
                    val: undefined
                });
                break;
            }
            case "&":
                i++;

                if(i < text.length && text[i] === "&"){
                    commandPipe.push({
                        type: pipeType.and,
                        val: undefined
                    });

                    i++;
                    break;
                }
                break;
            default:
                throw new Error("unexpected token: " + text[i-1]);
        }
    }

    return [commandPipe, quotas];
}


function pipeDividerInternal(text: string, startingPoint: number): [number, Array<commandPipe>, null | number]{
    let toReturn: Array<commandPipe> = [];

    let cmd: string = "";
    let i: number = startingPoint;

    let quotas: null | number  = null;

    for(; i < text.length; i++){
        //  console.log('nig ', i, text[i], cmd);
        // special chars
        if(
            text[i] == "\\" 
            && i + 1 < text.length
            && [...specialChars, ...commandParsingStop].includes(text[i + 1])
        ){
            i++;
            if(!(i < text.length)) break;
            cmd += text[i];
            continue;
            // if(!(i +1 < text.length)){
            //     cmd += text[i];
            //     break;
            // }
            
            // i++;

            // switch(text[i]){
            //     case "n":
            //         cmd += "\n";
            //         break;
            //     case "t":
            //         cmd += "\t";
            //         break;
            //     case "a":
            //         cmd += ansiEscape;
            //         break;
            //     case "x":
            //         i++;
            //         let firstChar = text[i];
            //         i++;
            //         let secondChar = text[i];

            //         cmd += String.fromCharCode(
            //             Number.parseInt(firstChar, 16) * 16
            //             +
            //             Number.parseInt(secondChar, 16)
            //         );
            //         break;
            //     default:
            //         cmd += text[i];
            // }

            // // if it a higher order one
            // if([...specialChars, ...commandParsingStop].includes(text[i + 1])){
            //     i++;
            //     if(!(i < text.length)) break;
            //     cmd += text[i];
            //     continue;
            // }
            // else if(){

            // }

            continue;
        }

        else if(
            text[i] == "\""
            &&
            text[i - 1] != "\\" 
        ){
            quotas = i;
            cmd += "\"";
            // i++;
            while(
                i < text.length
            ){
                i++;
                cmd += text[i];
                if(
                    text[i] == "\\"
                ){
                    // console.log(i, text[i], cmd);
                    i++;
                    // console.log(i, text[i], cmd);
                    if(
                        i < text.length
                        &&
                        text[i] == "\""
                    ){
                        // console.log(i, text[i], cmd);
                        cmd += "\"";
                        //  console.log(i, text[i], cmd);
                    }
                    else i--;
                }
                else if(
                    text[i] == "\""
                ){
                    quotas = null;
                    break;
                }
            }
        }
        else if(
            text[i] == "\\"
            &&
            i + 1 < text.length
            &&
            text[i + 1] == "$"
        ){
            i++;
            cmd += "§";
        }
        else{
            if(specialChars.includes(text[i]) || commandParsingStop.includes(text[i])) break;
            cmd += text[i];
        }
    }

    cmd = cmd.trim();
    // console.log(cmd);

    toReturn.push({
        type: pipeType.command,
        val: cmd
    });

    if(!(i < text.length)) return [i, toReturn, quotas];

    if(!specialChars.includes(text[i]) || commandParsingStop.includes(text[i])){
        return [i, toReturn, quotas];
    }

    let loopAllowed = true;
    while(i < text.length && loopAllowed){
        // console.log(text[i]);
        while(i < text.length && text[i] == " ") i++;

        let cmdDesc = "";
        i++;
        switch(text[i-1]){
            case "<":{
                let isAppend = text[i] == "<";
                if(isAppend) i++;
                
                // while(i < text.length && text[i] != " " && 
                //     !specialChars.includes(text[i])){
                //     cmdDesc += text[i];
                //     i++;
                // }

                [i, cmdDesc] = getFileDesc(i, text);

                toReturn.push({
                    type: isAppend ? pipeType.fileFromAppend : pipeType.fileFrom,
                    val: cmdDesc
                });
                break;
            }
            case ">":{
                let isAppend = text[i] == ">";
                if(isAppend) i++;

                // while(i < text.length && text[i] != " " && 
                //     !specialChars.includes(text[i])){
                //     cmdDesc += text[i];
                //     i++;
                // }

                [i, cmdDesc] = getFileDesc(i, text);

                toReturn.push({
                    type: isAppend ? pipeType.fileAppend : pipeType.fileSet,
                    val: cmdDesc
                });
                break;
            }
            default:
                i--;
                loopAllowed = false;
                break;
            }
    }
   

    toReturn = toReturn.sort(
       (a: commandPipe, b: commandPipe): number => {
            return a.type - b.type;
       }
    );

    return [i, toReturn, quotas];
}


function getFileDesc(i: number, text: string): [number, string]{
    let cmdDesc: string = "";

    while(i < text.length && text[i] == " ") i++;

    while(i < text.length && text[i] != " " && 
        !specialChars.includes(text[i])
        &&
        !commandParsingStop.includes(text[i])
    ){
        cmdDesc += text[i];
        i++;
    }
    return [i, cmdDesc];
}



interface commandExecOptions{
    silent?: boolean,
    logNode?: logNode | string,
    session: terminalSession
}

// async function commandExec(command: string, options: commandExecOptions = {}) {
//     // handleCommandInternal(command.split(" "), options.silent, options.logNode);
//     let res;
//     if(legacyData.pipes){
//         // TODO
//         const pipeTree = commandDividerInternal(text);
//         res = pipeExecutor(pipeTree, {silent, logNode});
//     }
//     else{
//         const parts = text.split(" ");

//         let partsToUse;
//         if(legacyData.noSpecialArguments){
//             partsToUse = parts;
//         }
//         else{
//             partsToUse = [parts[0], "-t" , ...parts.slice(1)];
//         }

//         res = handleCommandInternal(partsToUse, silent, logNode);
//     }
    

//     if(onlyReturn){
//         return res;
//     }

//     if(isExplicitUndefined(res)){
//         consoleWrite("undefined", undefined, undefined);
//     }
//     else if(res != undefined){
//         if(isOnlyToRedirect(res)) return;

//         const toW = tryToGetAsStringToPrint(res, true);

//         consoleWrite(toW, undefined, undefined, "");

//         // consolePairWrite(
//         //     tryToGetAsStringToPrint(res, false),
//         //     tryToGetAsStringToPrint(res, true)
//         // );

//         // consoleWrite(tryToGetAsStringToPrint(res, true));
//         // s.useConsoleWrite();

//         // consoleWrite(
//         //     inspect(res, true, null, true) + "\n", 
//         //     consoleColors.FgWhite
//         // );
//     }
// }

export {commandDividerInternal, pipeDividerInternal}