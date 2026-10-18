import { emitKeypressEvents, Key } from "node:readline";
import { askForFullControl, cdDummy, expectedError, getCwdToShowFromString, onlyToRedirect, terminalEnvVarRouteSet } from "../apis/allApis.js";
import { pos2D, screenBufferDouble } from "../apis/terminal/screenBuffer.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { basename } from "node:path";
import { access, constants, readFile, stat, writeFile } from "node:fs/promises";
import { log, LogType } from "../log.js";
import { commandInternalExec } from "../apis/commands/commandExecute.js";
import { isNumeric } from "../thirdparty/isNumeric.js";
import { nicroSetup } from "./nicro/nicroSetup.js";



const commandTable = quickCmdWithAliases("nicro", {
    usageinfo: "nicro <FILENAMES...>",
    desc: "a simple text editor",
    longdesc: multiLineConstructor(
        "a simple text editor",
        "",
        "provided arguments will be added as a stream",

        "",
        "--saveas FILE <- force saving to specified path",
        "-a -> no confirm, always save and don't listen to user",
        "-l -> lines numbers (not working)",
        "-n -> force a new buffer",
        "-g -> to use passed arguments also like files",
        "--return TYPE -> what to return",
        "   * none",
        "   * default (default option, not recommended. It's currently true)",
        "   * true ",
        "   * buffer",
        "   * text -> buffer forced to be string",
        "   * number -> buffer forced to be a number",
        "   * filename -> the filename",
        "   * savepath -> to where it was saved",
        "   * object -> object will all data",
        "--endline TEXT -> set ending line format (defaults to '\\n') (echo command will be used for provided string)",
        "--end TEXT -> to add something to end (defaults to '')",
        "-x -> to instant close the app",
        "--maxtime miliseconds -> to force close the app after time has ellapsed",
        "-d -> write only mode",
        "-u -> starts as unsaved"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    minver: 1.35,
    categories: ["pipe", "generator", "manipulation", "parser", "text"],
    async callback(preargs: any[]): Promise<any>{
        return await nicroSetup({
            context: this,
            preargs
        });

        // const args = smartArgs(preArgs, this);
        // const prvargs = smartArgs(this.providedArgs, this);
        // const psdvargs = smartArgs(this.passedData, this);

        // const usePassedArgumentsAlsoLikeFiles = args.dashCombined.includes("g");
        // const forceNewBuffer = args.dashCombined.includes("n");
        // const instantclose: boolean = args.dashCombined.includes("x");
        // const returntype: string | undefined = args.argsWithDoubleDash['return'] || "default";
        // const maxtime: number | undefined = args.argsWithDoubleDash['maxtime'];
        // const forcedWriteOnly: boolean = args.dashCombined.includes("d");

        // if(returntype){
        //     if(typeof returntype !== "string"){
        //         return expectedError("--return have to be a string");
        //     }
        //     if(!['default', 'buffer', 'text', 'number', 'filename', 'savepath', 'object'].includes(returntype)){
        //         return expectedError(`--return type: ${returntype} is not a valid option`);
        //     }
        // }

        // let maxtimenum: number = Infinity;
        // if(maxtime){
        //     switch(typeof maxtime){
        //         case "function":
        //         case "symbol":
        //         case "boolean": {
        //             return expectedError("maxtime should be of type that is able to be converted into miliseconds");
        //         }
        //         case "number": {
        //             maxtimenum = maxtime;
        //             break;
        //         }
        //         case "bigint": {
        //             return expectedError("nicro currently doesn't support big ints");
        //         }
        //         case "string": {
        //             maxtimenum = Number(maxtime);
        //             if(isNaN(maxtimenum)){
        //                 return expectedError("maxtime should be of type that is able to be converted into miliseconds");
        //             }
        //             break;
        //         }
        //         case "object": {
        //             return expectedError("nicro currently doesn't support any objects");
        //         }

        //     }
        // }

        // const endline: string = args.argsWithDoubleDash['endline'] ? 

        // await commandInternalExec(
        //     `echo \"${String(args.argsWithDoubleDash['endline']).replace("\"", "\\\"")}\"`,
        //     {silent: true, terminal: this.sessionName, noPrintResult: true, thereIsMore: false}
        // )
        // : 
        // "\n";

        // let ansiDetected: boolean = false;

        // // prepare file names
        // const fileNames: string[] = [...prvargs.argsWithoutArguments];
        // if(usePassedArgumentsAlsoLikeFiles){
        //     fileNames.push(...prvargs.argsWithoutArguments.filter((o) => typeof o === "string"));
        // }

        // let savePath: string = "";
        // let fileName: string = "";

        // // determine save destination
        // if(!forceNewBuffer && fileNames.length === 1){
        //     savePath = fileNames[0];
        //     fileName = basename(savePath);
        // }
        // else{
        //     savePath = "";
        //     fileName = "NEW BUFFER";
        // }




        // let textToParse: string = "";

        // // files
        // for(const one of fileNames){
        //     try {                
        //         const where: string = cdDummy(this, one);
        //         textToParse += await readFile(where);
        //     } catch (error) {
        //         return expectedError(String(error));
        //     }
        // }

        // for(const arg of psdvargs.argsWithoutArguments){
        //     if(Buffer.isBuffer(arg)) textToParse += arg.toString();
        //     else if(typeof arg === "string") textToParse += arg;
        //     else if(typeof arg === "number") textToParse += String(arg);
        //     else if(typeof arg === "bigint") textToParse += arg.toString();
        // }
        
    
        // let text: Array<string> = textToParse.split(/\r?\n/);


        // const topleft: pos2D = {
        //     x: 0,
        //     y: 0
        // };

        // const cursor: pos2D = {
        //     x: text.at(-1)?.length || 0,
        //     y: text.length - 1
        // };

        // const shiftOffset: pos2D = {
        //     x: 0,
        //     y: 0
        // };

        // let state: string = "default";
        // let edited: boolean = false;

        // let lanenumTo: string = "";


        // const starttime: number = Date.now();
        // const deadlinetime: number = starttime + maxtimenum;


        // // check if save path is writable
        // let writeOnly: boolean = forcedWriteOnly;
        // if(!writeOnly && savePath !== ""){
        //     try {
        //         await access(savePath, constants.W_OK);
        //     } catch (error) {
        //         writeOnly = true;            
        //     }
        // }

        // const fulcon = askForFullControl(this);

        // if(!fulcon.valid){
        //     return expectedError("Nicro couldn't get a hold of fullcontroler");
        // }


       


        // // consolidate buffer
        // const data: string = text.join(endline);

        // // save
        // if(savePath != "" && !writeOnly){
        //     try {
        //         const where: string = cdDummy(this, savePath);
        //         await writeFile(where, data);
        //     } catch (error) {
        //         return expectedError(String(error));
        //     }
            
        // }

        // switch(returntype?.toLowerCase()){
        //     case "filename":
        //         return fileName;
        //     case "savepath":
        //         return getCwdToShowFromString(this, savePath);
        //     case "data":
        //         return data;

        //     case "default":
        //     case "bufred":
        //         return onlyToRedirect(data);

        //     case "number":
        //         return Number(data);
        //     case "text":
        //         return String(data);
        //     case "object":
        //         return {
        //             buffer: data,
        //             filename: fileName,
        //             savepath: getCwdToShowFromString(this, savePath)
        //         };

        //     default:
        //         return expectedError("return type is corrupted");
        // }

        // return data;
    }
}, ["JSON"])

const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};