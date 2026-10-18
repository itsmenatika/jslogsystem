import { basename } from "path";
import { askForFullControl, cdDummy, commandContext, expectedError } from "../../apis/allApis.js";
import { commandInternalExec } from "../../apis/commands/commandExecute.js";
import { mouseEventReportingType, mouseReportingFormat, terminalSession } from "../../programdata.js";
import { smartArgs } from "../../tools/argsManipulation.js";
import { access, constants, readFile } from "fs/promises";
import { pos2D, screenBufferDouble } from "../../apis/terminal/screenBuffer.js";
import { fullNicroData, nicroData } from "./types.js";
import { loop } from "./loop.js";
import { emitKeypressEvents } from "readline";
import { setupKeyHandlers } from "./keyHandler.js";
import { hideCursorCODE } from "../../texttools.js";
import { log, LogType } from "../../log.js";
import { ensureArray } from "../../tools/arrayTools.js";

//  await fulcon.codeAsyncAlt(async () => {
//             const out = fulcon.session.out;
//             const ins = fulcon.getNewListener_in_raw();
//             emitKeypressEvents(ins);

//             ins.on("keypress", (str: string, key: Key) => {
//                 if(state !== "default"){
//                     if(key.ctrl && key.name === "x"){
//                         fulcon.end();
//                         return;
//                     }

//                     switch(key.name){
//                         case "escape": {
//                             state = "default";
//                             lanenumTo = "";
//                             db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "black", foreground: "white"}, " ");
//                             break;
//                         }
//                         case "backspace": {
//                             lanenumTo = lanenumTo.slice(0, -1);
//                             db.write(
//                                 {x: "to line: ".length + 3, y: db.size.height - 3},
//                                 lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
//                                 {background: "white", foreground: "magenta"}
//                             );
//                             break;
//                         }
//                         case "enter":
//                         case "return": {
//                             const num = Number(lanenumTo) - 1;

//                             if(isNaN(num) || num > text.length){
//                                 db.write(
//                                     {x: "to line: ".length + 3, y: db.size.height - 3},
//                                     "INVALID LINE".padEnd(db.size.width - ("to line: ".length + 3)),
//                                     {background: "white", foreground: "red"}
//                                 );                            
//                                 lanenumTo = "";
//                             }
//                             else{
//                                 cursor.x = 0;
//                                 cursor.y = num;
//                                 topleftToCursor();

//                                 state = "default";
//                                 lanenumTo = "";
//                                 db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "black", foreground: "white"}, " ");
//                                 break;                               
//                             }
//                         }
//                         default: {
//                             if(/^[0-9]$/.test(str as string)){
//                                 lanenumTo += str;
//                                 db.write(
//                                     {x: "to line: ".length + 3, y: db.size.height - 3},
//                                     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
//                                     {background: "white", foreground: "magenta"}
//                                 );


//                             }
//                         }
//                     }


//                 }
//                 else if(key.ctrl){
//                     switch(key.name){
//                         case "s": {
//                             edited = false;
//                             writeFileName();
//                             break;
//                         }
//                         case "x": {
//                             fulcon.end();
//                             break;
//                         }
//                         case "l":
//                             state = "toline";
//                             db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "white", foreground: "black"}, " ");
//                             db.write({x: 0, y: db.size.height - 3}, "to line: ", {background: "white", foreground: "black"});
//                             db.cursorTo("to line: ".length + 3, db.size.height - 3);
//                             break;
//                     }
//                 }
//                 else
//                 switch(key.name){
//                     case "escape": {
//                         tryToClose();
//                         break;
//                     } 
//                     case "right": {

//                         cursor.x += 1;

//                         // move to next line
//                         if (cursor.x > text[cursor.y].length) {

//                             // if next line exists
//                             if (cursor.y < text.length - 1) {
//                                 cursor.y += 1;
//                                 cursor.x = 0;
//                             }
//                             else {
//                                 // stay at end of file
//                                 cursor.x = text[cursor.y].length;
//                             }
//                         }

//                         break;
//                     }
//                     case "left": {
//                         cursor.x -= 1;

//                         if(cursor.x < 0){
//                             if(cursor.y <= 0){
//                                 cursor.x = 0;
//                             }
//                             else{
//                                 cursor.y -= 1;
//                                 cursor.x = text[cursor.y].length;
//                             }
//                         }
//                         break;
//                     }
//                     case "up": {
//                         cursor.y -= 1;

//                         if(cursor.y < 0){
//                             cursor.y = 0;
//                         }
                        
//                         if(cursor.x > text[cursor.y].length){
//                             cursor.x = text[cursor.y].length; 
//                         }

//                         break;
//                     }
//                     case "down": {
//                         cursor.y += 1;

//                         if(cursor.y >= text.length){
//                             cursor.y = text.length - 1;
//                         }

//                         if(cursor.x > text[cursor.y].length){
//                             cursor.x = text[cursor.y].length;
//                         }

//                         break;
//                     }
//                     case "delete": {
//                         // write only case
//                         if(writeOnly) break;
                        
//                         text[cursor.y] = text[cursor.y].slice(0, cursor.x) + text[cursor.y].slice(cursor.x + 1);
//                         markEdited();
//                         break;
//                     }
//                     case "backspace": {
//                         // write only case
//                         if(writeOnly) break;

//                         // normal backspace
//                         if (cursor.x > 0) {

//                             const line = text[cursor.y];

//                             text[cursor.y] =
//                                 line.slice(0, cursor.x - 1) +
//                                 line.slice(cursor.x);

//                             if(cursor.x > 0)
//                             cursor.x -= 1;
//                             markEdited();
//                         }

//                         // merge lines
//                         else if (cursor.y > 0) {

//                             const current = text[cursor.y];
//                             const previous = text[cursor.y - 1];

//                             cursor.x = previous.length;

//                             text[cursor.y - 1] = previous + current;

//                             text.splice(cursor.y, 1);

//                             cursor.y -= 1;
//                             markEdited();
//                         }
//                         break;
//                     }
//                     case "return":
//                     case "enter": {
//                         // write only case
//                         if(writeOnly) break;

//                         const newCurrentLine: string = text[cursor.y].slice(0, cursor.x);
//                         const newNewLine: string = text[cursor.y].slice(cursor.x);

//                         text[cursor.y] = newCurrentLine;
//                         text.splice(cursor.y + 1, 0, newNewLine);

//                         cursor.y += 1;
//                         cursor.x = 0;

//                         markEdited();
//                         break;
//                     }
//                     default: {
//                         // write only case
//                         if(writeOnly) break;

//                         // const whereToAddText: pos2D = {
//                         //     x: cursor.x - topleft.x,
//                         //     y: cursor.y - topleft.y
//                         // };

//                         let toUse: string = str;

//                         if(key.name == "tab"){
//                             toUse = "   ";
//                         }

//                         if(text.length > cursor.y){
//                             text[cursor.y] = text[cursor.y].slice(0, cursor.x) + toUse + text[cursor.y].slice(cursor.x);
//                         }
//                         cursor.x += 1;
//                         markEdited();
//                     }
//                 }
//                 topleftToCursor();

//                 // if(key && key.name === "escape"){
//                 //     fulcon.end();
//                 // }
//                 // else if(key.name == "right"){
//                 //     cursor.x += 1;
//                 // }
//                 // else if(key)
//                 // else{
//                 //     db.writeCursor(str, {});
//                 // }
//             });


//             const tryToClose = () => {
//                 if(edited){
//                     state = "leaveUnsavedQuestion";
//                     db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "white", foreground: "black"}, " ");
//                     db.write({x: 0, y: db.size.height - 3}, "leave without saving (y/n)? ", {background: "white", foreground: "black"});
//                     return;
//                 }

//                 fulcon.end();
//                 return;
//             }

//             const writeFileName = () => {
//                 db.write({x: db.size.width - 2 - fileName.length - 1, y: 0}, edited ? "~" + fileName : " " + fileName, {
//                     background: "white", 
//                     foreground: writeOnly ? "red" : "black"
//                 });
//             }
            
//             const markEdited = () => {
//                 if(!edited){
//                     edited = true;
//                     writeFileName();
//                 }
//             }

//             const db = new screenBufferDouble({width: out.columns, height: out.rows});


//         //     db.rectangle({x:0, y: 0}, {x: db.size.width - 1, y: 0}, {background: "white"});
//         //     db.write({x: 2, y: 0}, " NICRO 1.0 ", {background: "white", foreground:"black"});

//         //     writeFileName();

            
            
//         //     // db.fill("z", {background: "blue"});
//         //     // db.rectangle(
//         //     //     { x: 0, y: db.size.height - 2 },
//         //     //     { x: db.size.width - 1, y: db.size.height - 1 },
//         //     //     { background: "white" }, " "
//         //     // );
            
//         //     db.write({x: 0, y: db.size.height - 2}, " ^S ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 5, y: db.size.height - 2}, "SAVE", {background: "black", foreground: "white"});

//         //     db.write({x: 0, y: db.size.height - 1}, " ^X ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 5, y: db.size.height - 1}, "EXIT", {background: "black", foreground: "white"});


//         //     db.write({x: 12, y: db.size.height - 2}, "^L ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 17, y: db.size.height - 2}, "LINE", {background: "black", foreground: "white"});

//         //     db.write({x: 12, y: db.size.height - 1}, "^H ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 17, y: db.size.height - 1}, "HELP", {background: "black", foreground: "white"});

//         //     db.write({x: 24, y: db.size.height - 2}, "^C ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 29, y: db.size.height - 2}, "COPY", {background: "black", foreground: "white"});

//         //     db.write({x: 24, y: db.size.height - 1}, "^V ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 29, y: db.size.height - 1}, "PASTE", {background: "black", foreground: "white"});

//         //     db.write({x: 36, y: db.size.height - 2}, "^X ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 41, y: db.size.height - 2}, "CUT", {background: "black", foreground: "white"});

//         //     db.write({x: 36, y: db.size.height - 1}, "^T ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 41, y: db.size.height - 1}, "CMD", {background: "black", foreground: "white"});

//         //     db.write({x: 48, y: db.size.height - 2}, "^Z ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 53, y: db.size.height - 2}, "UNDO", {background: "black", foreground: "white"});

//         //     db.write({x: 48, y: db.size.height - 1}, "^Y ", {background: "black", foreground: "magenta"});
//         //     db.write({x: 53, y: db.size.height - 1}, "REDO", {background: "black", foreground: "white"});
        

//         // db.cursorTo(0, 1);

//         let tm: number = Date.now();
//         let flp: boolean = false;

//             // db.write({x: 0, y: db.size.height - 1}, usedNameToEdit, {background: "white", foreground: "black"});

//             // db.write({x: 10, y: 5}, "hi", {blink: false});
//             // db.write({x: 10, y: 6}, "his", {blink: true});
//             // db.write({x: 10, y: 7}, "co tam?", {blink: true, background: "magenta", foreground: "green", italic: true});

//             const topleftToCursor = () => {
//                 // x position
//                 if(cursor.x > topleft.x + db.size.width - 3){
//                     while(cursor.x > topleft.x + db.size.width - 3) topleft.x += 1;

//                 }
//                 else if(cursor.x - 3 < topleft.x && topleft.x !== 0){
//                     while(cursor.x - 3 < topleft.x && topleft.x !== 0) topleft.x -= 1;
//                 }

//                 if(cursor.y > topleft.y + db.size.height - 2 - 3){
//                     while(cursor.y > topleft.y + db.size.height - 2 - 3) topleft.y += 1;
//                 }
//                 else if(cursor.y < topleft.y + 1 + 3){
//                     while(cursor.y < topleft.y + 1 + 3 && topleft.y > 0) topleft.y -= 1;
//                 }
//             }

//             const drawLine = (i: number) => {
//                     if(topleft.y + i < text.length){
//                         const curLine = text[topleft.y + i];

//                         const write = curLine.slice(topleft.x)
//                         .slice(0, db.size.width)
//                         .padEnd(db.size.width);

//                         terminalEnvVarRouteSet(this, `${i}t`, write);
                        
//                         db.write({x: 0, y: i + 1}, write, {foreground: "white", background: "black"});
                        
//                     }
//                     else db.write({x: 0, y: i + 1}, " ".repeat(db.size.width), {background: "black", foreground: "white"});
//             }


//             const reviewText = () => {
//                 const linesNumber: number = db.size.height - 3 - 1;

//                 for(let i = 0; i < linesNumber; i++){
//                     drawLine(i);
//                 }


//                 const crtime = Date.now();
//                 if (crtime > tm) {
//                     flp = !flp;
//                     tm = crtime + 150;
//                 }

//                 // return [cursor, topleft];
                
//                 const posxcursor = cursor.x - topleft.x;
//                 const posycursor = cursor.y - topleft.y + 1;

//                 db.edit(
//                    posxcursor,
//                 posycursor,
//                     flp
//                         ? { background: "white", foreground: "black" }
//                         : { background: "black", foreground: "white" }
//                 );
//                 // cursor
//             };


//             const handleTimes = async () => {
//                 const left = Date.now() - deadlinetime;

//                 if(left > 0){
//                     fulcon.end();
//                     return;
//                 }
//             }


//             topleftToCursor();
//             if(!instantclose){
//                 while(fulcon.stillExecuting){                    
//                     reviewText();
//                     db.writeToScreenOptimizedWithTime(this, 100);
//                     await fulcon.giveTimeToOthers();
//                     if(maxtime) await handleTimes();
//                 }
//             }

//             fulcon.removeNewListener_in_raw(ins);
//         });






// // interface nicroData{
// //     context: commandContext,
// //     preargs: any[]
// // }

// // interface fullNicroData extends nicroData{
// //     usePassedArgumentsAlsoLikeFiles: boolean,
// //     forceNewBuffer: boolean,
// //     instantClose: boolean,
// //     returntype: 'default' | 'buffer' | 'text' | 'number' | 'filename' | 'savepath' | 'object',
// //     maxtime: any,
// //     maxtimenum: number,
// //     fileNames: string[],
// //     state: "default",
// //     topleft: pos2D,
// //     cursor: pos2D,
// //     shiftOffset: pos2D,
// //     edited: boolean,
// //     laneNumTo: string,
// //     writeOnly: boolean,
// //     text: string[],
// //     savePath: string,
// //     fileName: string

// // }

//     // const newNicroDataContext = {
//     //     context: con,
//     //     preargs,
//     //     usePassedArgumentsAlsoLikeFiles,
//     //     forceNewBuffer,
//     //     instantclose,
//     //     returntype,
//     //     maxtime,
//     //     forcedWriteOnly,
//     //     fileNames,
//     //     state: "default",
//     //     topleft,
//     //     cursor,
//     //     shiftOffset,
//     //     edited: false,
//     //     laneNumTo: "",
//     //     writeOnly,
//     //     text,
//     //     savePath,
//     //     fileName
//     // };


async function getData(
    context: commandContext, 
    fileNames: string[],
): Promise<[number, string]>{
    let textToParse: string = "";

    // files
    for(const one of fileNames){
        try {                
            const where: string = cdDummy(context, one);
            textToParse += await readFile(where);
        } catch (error) {
            return [0, String(error)];
        }
    }

    // for(const arg of psdvargs.argsWithoutArguments){
    //     if(Buffer.isBuffer(arg)) textToParse += arg.toString();
    //     else if(typeof arg === "string") textToParse += arg;
    //     else if(typeof arg === "number") textToParse += String(arg);
    //     else if(typeof arg === "bigint") textToParse += arg.toString();
    // }

    return [1, textToParse];
}

async function nicroSetup(data: nicroData){
    const con = data.context;
    const preargs = data.preargs;

    // get arguments
    const args = smartArgs(preargs, con);
    const prvargs = smartArgs(con.providedArgs, con);
    const passedargs = ensureArray(con.passedData);


    
    // const psdvargs = smartArgs(con.passedData, con);    

    // extract settings
    const usePassedArgumentsAlsoLikeFiles: boolean = args.dashCombined.includes("g");
    const forceNewBuffer: boolean = args.dashCombined.includes("n");
    const instantclose: boolean = args.dashCombined.includes("x");
    const returntype: string | undefined = args.argsWithDoubleDash['return'] || "default";
    const addSomethingToEnd: string | undefined = args.argsWithDoubleDash['end'];
    const maxtime: number | undefined = args.argsWithDoubleDash['maxtime'];
    const forcedWriteOnly: boolean = args.dashCombined.includes("d");
    const forcesaveas: string | undefined = args.argsWithDoubleDash['saveas'];
    const forceunsaved: boolean = args.dashCombined.includes("u");
    const dontconfirm: boolean = args.dashCombined.includes("a");

    // verify settings and set up them

    // return type
    if(returntype){
        if(typeof returntype !== "string"){
            return expectedError("--return have to be a string");
        }
        if(!['default', 'buffer', 'text', 'number', 'filename', 'savepath', 'object', "true"].includes(returntype)){
            return expectedError(`--return type: ${returntype} is not a valid option`);
        }
    }

    // max time to close
    let maxtimenum: number = Infinity;
    if(maxtime){
        switch(typeof maxtime){
            case "function":
            case "symbol":
            case "boolean": {
                return expectedError("maxtime should be of type that is able to be converted into miliseconds");
            }
            case "number": {
                maxtimenum = maxtime;
                break;
            }
            case "bigint": {
                return expectedError("nicro currently doesn't support big ints");
            }
            case "string": {
                maxtimenum = Number(maxtime);
                if(isNaN(maxtimenum)){
                    return expectedError("maxtime should be of type that is able to be converted into miliseconds");
                }
                break;
            }
            case "object": {
                return expectedError("nicro currently doesn't support any objects");
            }

        }
    }
    
    // endline
    const endline: string = args.argsWithDoubleDash['endline'] ? 

    await commandInternalExec(
        `echo -- \"${String(args.argsWithDoubleDash['endline']).replace("\"", "\\\"")}\"`,
        {silent: true, terminal: con.sessionName, noPrintResult: true, thereIsMore: false}
    )
    : 
    "\n";

    // let ansiDetected: boolean = false;


    
    // await log(LogType.INFO, `${typeof passedargs} ${passedargs} ${passedargs} ${usePassedArgumentsAlsoLikeFiles}`);

    // prepare file names
    const fileNames: string[] = [...prvargs.argsWithoutArguments];
    if(usePassedArgumentsAlsoLikeFiles){
        fileNames.push(...passedargs.filter((o) => typeof o === "string"));
    }

    let savePath: string = "";
    let fileName: string = "";

    // determine save destination
    if(forcesaveas){
        savePath = forcesaveas;
        fileName = basename(forcesaveas);
    }
    else if(!forceNewBuffer && fileNames.length === 1 && addSomethingToEnd === undefined){
        savePath = fileNames[0];
        fileName = basename(savePath);
    }
    else{
        savePath = "";
        fileName = "NEW BUFFER";
    }


    // read data from files

    let text: Array<string> = [];
    if(fileNames.length !== 0){
        const readData = await getData(con, fileNames);
        if(readData[0] === 0) return expectedError(readData[1]);
    
    
        text = readData[1].split(/\r?\n/);
    }


    if(!usePassedArgumentsAlsoLikeFiles){
        const additionalData: string[] = (passedargs.filter((o) => typeof o === "string").join(" ").split(/\r?\n/));

        if(additionalData.length > 0){
            text[text.length - 1] += additionalData[0];

            text.push(...additionalData.slice(1));
        }

    }


    // ensure at least one line
    if(text.length === 0) text.push("");
    
    // add something to end
    if(addSomethingToEnd){
        const whatAdd = await commandInternalExec(
            `echo -- \"${addSomethingToEnd.replace("\"", "\\\"")}\"`,
            {silent: true, terminal: con.sessionName, noPrintResult: true, thereIsMore: false}
        );

        const whatAddAr = whatAdd.split(/\r?\n/);

        text[text.length - 1] += whatAddAr[0];
        text.push(...whatAddAr.slice(1));
    }
    

    const topleft: pos2D = {
        x: 0,
        y: 0
    };

    const cursor: pos2D = {
        x: text.at(-1)?.length || 0,
        y: text.length - 1
    };

    const shiftOffset: pos2D = {
        x: 0,
        y: 0
    };

    // let state: string = "default";
    // let edited: boolean = false;

    // let lanenumTo: string = "";


    const starttime: number = Date.now();
    const deadlinetime: number = starttime + maxtimenum;


    // check if save path is writable
    let writeOnly: boolean = forcedWriteOnly;
    if(!writeOnly && savePath !== "" && !forcesaveas){
        try {
            await access(savePath, constants.W_OK);
        } catch (error) {
            writeOnly = true;            
        }
    }

    
    
    // get full controller
    const fulcon = askForFullControl(data.context);
    
    // check whether we even have control
    if(!fulcon.valid){
        return expectedError("There was no ability to get a full controller");
    }

    // set mouse mode
    fulcon.mouseSetReporting(mouseEventReportingType.mouseClickAndDraggingTracking);
    fulcon.mouseSetEncoding(mouseReportingFormat.mouseReportingFormatDigits);
    
    // configure streams
    const out = fulcon.session.out;
    const ins = fulcon.getNewListener_in_raw();
    emitKeypressEvents(ins);

    const db = new screenBufferDouble({width: out.columns, height: out.rows});
    
    const newNicroDataContext = {
        context: con,
        fulcon,
        preargs,
        usePassedArgumentsAlsoLikeFiles,
        forceNewBuffer,
        returntype,
        maxtime,
        forcedWriteOnly,
        fileNames,
        state: "default",
        topleft,
        cursor,
        shiftOffset,
        edited: forceunsaved,
        laneNumTo: "",
        writeOnly,
        text,
        savePath,
        fileName,
        instantClose: instantclose,
        maxtimenum,
        out,
        ins,
        db,
        flp: false,
        tm: 0,
        endline,
        actionStack: [],
        redoStack: [],
        dontconfirm
    } as unknown as fullNicroData;


    setupKeyHandlers(newNicroDataContext);
    const d = await loop(newNicroDataContext);

    fulcon.removeNewListener_in_raw(ins);

    if(d) return d;


    switch(newNicroDataContext.returntype){
        case "buffer":
            return Buffer.from(newNicroDataContext.text.join(endline));
        case "filename":
            return fileName;
        case "text":
            return newNicroDataContext.text.join(endline);
        case "number":
            return Number(newNicroDataContext.text.join(endline));
        case "savepath":
            return newNicroDataContext.savePath;
        case "filename":
            return basename(newNicroDataContext.savePath);
        case "object": 
            const t = newNicroDataContext.text.join(endline);

            return {
                text: t,
                buffer: Buffer.from(t),
                savePath: newNicroDataContext.savePath,
                fileName: basename(newNicroDataContext.savePath),
                number: Number(t),
                endline: newNicroDataContext.endline,
                writeOnly: newNicroDataContext.writeOnly
            };
        case "true":
        case "default":
        default:
            return true;
    }
}

export {nicroSetup}