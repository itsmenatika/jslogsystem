import { Key } from "node:readline";
import { fullNicroData } from "./types.js";
import { aWasBeforeB, clearQuestion, standardRender, topleftToCursor, writeDataToQuestion, writeFileName, writeQuestion } from "./render.js";
import { saveEverything } from "./save.js";
import { cdDummy } from "../../apis/allApis.js";
import { basename } from "node:path";
import { clearStack, insertText, removeText, undo } from "./textEdit.js";
import { clipboardGetContent, clipboardSetContent } from "../../apis/commands/osApis/clipboard.js";
import { pos2D } from "../../apis/terminal/screenBuffer.js";


async function tryToClose(data: fullNicroData){
    if(data.edited){
        if(data.dontconfirm){
            await tryToSave(data, true);
            data.fulcon.end();
            return;
        }

        data.state = "leaveUnsavedQuestion";
        writeQuestion(data, "leave without saving (y: exit, n: save, escape: cancel)? ");
        // db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "white", foreground: "black"}, " ");
        // db.write({x: 0, y: db.size.height - 3}, "leave without saving (y/n)? ", {background: "white", foreground: "black"});
        return;
    }

    data.fulcon.end();
    return;
}

async function tryToSave(data: fullNicroData, immediatelyClose: boolean = false, forcedSave: boolean = false){
    if(data.edited || forcedSave){
        // if there's no path
        if(data.savePath === ""){
            data.state = immediatelyClose ? "saveasleave" : "saveas";
            writeQuestion(data, "save as: ");
            return;
        }

        await saveEverything(data);

        data.edited = false;
        writeFileName(data);
    }
}

function markEdited(data: fullNicroData){
    clearStack(data, "redo");

    if(!data.edited){
        data.edited = true;
        writeFileName(data);
    }
}


function deleteSelected(data: fullNicroData){
    const cursor = data.cursor;
    const selectedAnchor = data.selectionAnchor;

    if(!selectedAnchor) return;

    const [firstPos, secondpos] = aWasBeforeB(cursor, selectedAnchor) ? [cursor, selectedAnchor] : [selectedAnchor, cursor];

    removeText(data, firstPos, secondpos);

    data.cursor = firstPos;
    data.selectionAnchor = undefined;

    markEdited(data);

}

async function handleDefaultState(data: fullNicroData, str: string, key: Key){
    if(key.ctrl){
        
        switch(key.name){            

            case "home": {
                data.cursor.x = 0;
                data.cursor.y = 0;
                break;
            }
            case "end": {
                const cursor = data.cursor;

                cursor.y = data.text.length - 1;
                cursor.x = data.text[cursor.y].length;
                break;
                
            }

            case "a": {
                // select all

                data.selectionAnchor = {x: 0, y: 0};
                data.cursor.x = (data.text.at(-1) as string).length;
                data.cursor.y = data.text.length - 1;

                break;
            }

            case "v": {
                // paste

                if(data.selectionAnchor){
                    deleteSelected(data);
                }

                const cursor = data.cursor;
                const whatToPaste = await clipboardGetContent(data.context);

                if(typeof whatToPaste !== "string") return;

                const obj = insertText(data, whatToPaste, cursor);

                cursor.x = obj.expectedCursorPos.x;
                cursor.y = obj.expectedCursorPos.y;
                break;

            }


            case "c": {
                // copy
                const cursor = data.cursor;
                const selectionTo = data.selectionAnchor;

                if(!selectionTo) break;
               

                const [firstPos, secondpos] = aWasBeforeB(cursor, selectionTo) ? [cursor, selectionTo] : [selectionTo, cursor];

                let toWrite: string;
                if(firstPos.y === secondpos.y){
                    toWrite = data.text[firstPos.y].slice(firstPos.x, secondpos.x);
                }
                else{
                    const left: string = data.text[firstPos.y].slice(firstPos.x);
                    const right: string = data.text[secondpos.y].slice(0, secondpos.x);

                    let middle: string = "";
                    for(let i = firstPos.y + 1; i < secondpos.y; i++){
                        middle += data.text[i] + "\n";
                    }

                    toWrite = left + "\n" + middle + right;
                }


                // const left: string = data.text[firstPos.y].slice(firstPos.x);
                // const right: string = data.text[secondpos.y].slice(0, secondpos.x);



                // const toWrite: string = left + right;


                await clipboardSetContent(toWrite, data.context);
                break;
            }

            case "x": {
                // cut
                const cursor = data.cursor;
                const selectionTo = data.selectionAnchor;

                if(!selectionTo) break;
               

                const [firstPos, secondpos] = aWasBeforeB(cursor, selectionTo) ? [cursor, selectionTo] : [selectionTo, cursor];

                // let toWrite: string;
                // if(firstPos.y === secondpos.y){
                //     toWrite = data.text[firstPos.y].slice(firstPos.x, secondpos.x);
                // }
                // else{
                //     const left: string = data.text[firstPos.y].slice(firstPos.x);
                //     const right: string = data.text[secondpos.y].slice(0, secondpos.x);

                //     let middle: string = "";
                //     for(let i = firstPos.y + 1; i < secondpos.y; i++){
                //         middle += data.text[i] + "\n";
                //     }

                //     toWrite = left + "\n" + middle + right;
                // }


                // const left: string = data.text[firstPos.y].slice(firstPos.x);
                // const right: string = data.text[secondpos.y].slice(0, secondpos.x);



                // const toWrite: string = left + right;

                const {left, right, removedText} = removeText(data, firstPos, {x: secondpos.x, y: secondpos.y});


                cursor.x = firstPos.x;
                cursor.y = firstPos.y;
                data.selectionAnchor = undefined;


                standardRender(data);
                await clipboardSetContent(removedText, data.context);
                break;


            }

            // undo
            case "z": {
                const obj = undo(data, false, "undo");

                if(obj && obj.expectedCursorPos){
                    data.cursor.x = (obj.expectedCursorPos as pos2D).x;
                    data.cursor.y = (obj.expectedCursorPos as pos2D).y;
                }

                standardRender(data);
                break;
            }

            // redo
            case "y": {
                const obj = undo(data, false, "redo")

                if(obj && obj.expectedCursorPos){
                    data.cursor.x = (obj.expectedCursorPos as pos2D).x;
                    data.cursor.y = (obj.expectedCursorPos as pos2D).y;
                }

                standardRender(data);
                break;
            }


            // save
            case "s": {
                await tryToSave(data, false, true);
                break;
            }
            // exit
            case "q": {
                data.fulcon.end();
                break;
            }
            // to line
            case "l": {
                data.state = "toline";
                // db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "white", foreground: "black"}, " ");
                // db.write({x: 0, y: db.size.height - 3}, "to line: ", {background: "white", foreground: "black"});
                // db.cursorTo("to line: ".length + 3, db.size.height - 3);
                writeQuestion(data, "to line: ");


                break;
            }

            case "t": {
                data.state = "cmd";
                writeQuestion(data, "command: ");
                break;
            }
        }
    }
    // else if(key.shift){
    //     switch(key.name){
    //         case "right": {

    //         }
    //     }
    // }
    else{
        switch(key.name){
            
            case "escape": {
                await tryToClose(data);
                break;
            }

            case "home": {
                data.cursor.x = 0;
                break;
            }
            case "end": {
                data.cursor.x = data.text[data.cursor.y].length;
                break;
            }

            case "tab": {
                insertText(data, "    ", data.cursor);
                data.cursor.x += 4;
                break;
            }

            case "right": {
                const cursor = data.cursor;
                const text = data.text;

                if(key.shift && !data.selectionAnchor){
                    data.selectionAnchor = {...cursor};
                }
                else if(!key.shift && data.selectionAnchor){
                    data.selectionAnchor = undefined;
                }

                cursor.x += 1;

                // move to next line
                if (cursor.x > text[cursor.y].length) {

                    // if next line exists
                    if (cursor.y < text.length - 1) {
                        cursor.y += 1;
                        cursor.x = 0;
                    }
                    else {
                        // stay at end of file
                        cursor.x = text[cursor.y].length;
                    }
                }

                break;
            }
            case "left": {
                const cursor = data.cursor;
                const text = data.text;

                if(key.shift && !data.selectionAnchor){
                    data.selectionAnchor = {...cursor};
                }
                else if(!key.shift && data.selectionAnchor){
                    data.selectionAnchor = undefined;
                }

                cursor.x -= 1;

                if(cursor.x < 0){
                    if(cursor.y <= 0){
                        cursor.x = 0;
                    }
                    else{
                        cursor.y -= 1;
                        cursor.x = text[cursor.y].length;
                    }
                }
                break;                
            }
            case "up": {
                const cursor = data.cursor;
                const text = data.text;

                if(key.shift && !data.selectionAnchor){
                    data.selectionAnchor = {...cursor};
                }
                else if(!key.shift && data.selectionAnchor){
                    data.selectionAnchor = undefined;
                }
            
                cursor.y -= 1;

                if(cursor.y < 0){
                    cursor.y = 0;
                }
                
                if(cursor.x > text[cursor.y].length){
                    cursor.x = text[cursor.y].length; 
                }

                break;
            }
            case "down": {
                const cursor = data.cursor;
                const text = data.text;

                if(key.shift && !data.selectionAnchor){
                    data.selectionAnchor = {...cursor};
                }
                else if(!key.shift && data.selectionAnchor){
                    data.selectionAnchor = undefined;
                }


                cursor.y += 1;

                if(cursor.y >= text.length){
                    cursor.y = text.length - 1;
                }

                if(cursor.x > text[cursor.y].length){
                    cursor.x = text[cursor.y].length;
                }

                break;
            }
            case "delete": {
                // write only case
                if(data.writeOnly) break;

                if(data.selectionAnchor){
                    deleteSelected(data);
                    return;
                }

                const cursor = data.cursor;
                const text = data.text;
                
                // text[cursor.y] = text[cursor.y].slice(0, cursor.x) + text[cursor.y].slice(cursor.x + 1);

                removeText(data, cursor, cursor);
                markEdited(data);
                break;
            }
            case "backspace": {
                // write only case
                if(data.writeOnly) break;

                if(data.selectionAnchor){
                    deleteSelected(data);
                    return;
                }

                const cursor = data.cursor;
                
                if(cursor.x === 0){
                    if(cursor.y === 0){
                        return;
                    }

                    

                    const {left, right, removedText} = removeText(data, {x: data.text[cursor.y - 1].length, y: cursor.y - 1}, {x: -1, y: cursor.y});



                    cursor.y -= 1;
                    cursor.x = data.text[cursor.y].length - (right as any as string).split("\n")[0].length;

                    markEdited(data);
                }
                else{
                    const loc = {x: cursor.x - 1, y: cursor.y};

                    removeText(data, loc, loc);

                    cursor.x -= 1;

                    markEdited(data);
                }
                

                // const text = data.text;

                // // normal backspace
                // if (cursor.x > 0) {

                //     const line = text[cursor.y];

                //     text[cursor.y] =
                //         line.slice(0, cursor.x - 1) +
                //         line.slice(cursor.x);

                //     if(cursor.x > 0)
                //     cursor.x -= 1;
                //     markEdited(data);
                // }

                // // merge lines
                // else if (cursor.y > 0) {

                //     const current = text[cursor.y];
                //     const previous = text[cursor.y - 1];

                //     cursor.x = previous.length;

                //     text[cursor.y - 1] = previous + current;

                //     text.splice(cursor.y, 1);

                //     cursor.y -= 1;
                //     markEdited(data);
                // }
                break;
            }
            case "return":
            case "enter": {
                // write only case
                if(data.writeOnly) break;

                const cursor = data.cursor;
                // const text = data.text;

                // const newCurrentLine: string = text[cursor.y].slice(0, cursor.x);
                // const newNewLine: string = text[cursor.y].slice(cursor.x);

                // text[cursor.y] = newCurrentLine;
                // text.splice(cursor.y + 1, 0, newNewLine);

                insertText(data, "\n", cursor);

                cursor.y += 1;
                cursor.x = 0;

                markEdited(data);
                break;
            }
            default: {
                // write only case
                if(data.writeOnly) break;

                if(data.selectionAnchor){
                    deleteSelected(data);
                }

                // const whereToAddText: pos2D = {
                //     x: cursor.x - topleft.x,
                //     y: cursor.y - topleft.y
                // };

                const cursor = data.cursor;
                const text = data.text;

                let toUse: string = str;

                if(key.name == "tab"){
                    toUse = "   ";
                }

                if(text.length > cursor.y){
                    // text[cursor.y] = text[cursor.y].slice(0, cursor.x) + toUse + text[cursor.y].slice(cursor.x);
                    insertText(data, toUse, cursor);
                }
                cursor.x += 1;
                markEdited(data);
            }
        }
    }


}

async function handleToLine(data: fullNicroData, str: string, key: Key){
    // always allow to exit
    if(key.ctrl && key.name === "x"){
        data.fulcon.end();
        return;
    }

    switch(key.name){
        case "escape": {
            data.state = "default";
            data.laneNumTo = "";
            clearQuestion(data);
            break;
        }
        case "backspace": {
            data.laneNumTo = data.laneNumTo.slice(0, -1);
            writeDataToQuestion(data, "to line: ", data.laneNumTo);
            // db.write(
            //     {x: "to line: ".length + 3, y: db.size.height - 3},
            //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
            //     {background: "white", foreground: "magenta"}
            // );
            break;
        }
        case "enter":
        case "return": {
            const num = Number(data.laneNumTo) - 1;

            if(isNaN(num) || num > data.text.length){
                writeDataToQuestion(data, "to line: ", "INVALID LINE");                          
                data.laneNumTo = "";
            }
            else{
                data.cursor.x = 0;
                data.cursor.y = num;
                // TODO
                topleftToCursor(data);

                data.state = "default";
                data.laneNumTo = "";
                clearQuestion(data);
                break;                               
            }
            break;
        }
        default: {
            if(/^[0-9]$/.test(str as string)){
                data.laneNumTo += str;
                // db.write(
                //     {x: "to line: ".length + 3, y: db.size.height - 3},
                //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
                //     {background: "white", foreground: "magenta"}
                // );
                writeDataToQuestion(data, "to line: ", data.laneNumTo);


            }
        }
    }
}




async function handleLeaveUnsaved(data: fullNicroData, str: string, key: Key){
    // always allow to exit
    if(key.ctrl && key.name === "x"){
        data.fulcon.end();
        return;
    }

    if(key.name === "escape"){
        data.state = "default";
        clearQuestion(data);
        return;
    }


    const smallLetter: string = str.toLowerCase();

    if(smallLetter === "y"){
        data.fulcon.end();       
    }
    else if(smallLetter === "n"){
        tryToSave(data, true);
        
    }


}

async function handleSaveAs(data: fullNicroData, str: string, key: Key){
    // always allow to exit
    if(key.ctrl && key.name === "x"){
        data.fulcon.end();
        return;
    }

    switch(key.name){
        case "escape": {
            data.state = "default";
            data.laneNumTo = "";
            clearQuestion(data);
            break;
        }
        case "backspace": {
            data.laneNumTo = data.laneNumTo.slice(0, -1);
            writeDataToQuestion(data, "save as: ", data.laneNumTo);
            // db.write(
            //     {x: "to line: ".length + 3, y: db.size.height - 3},
            //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
            //     {background: "white", foreground: "magenta"}
            // );
            break;
        }
        case "enter":
        case "return": {
            if(data.laneNumTo == "") break;

            let where: string = "buf";

            try {
                where = cdDummy(data.context, data.laneNumTo);
            } catch (error) {
                writeDataToQuestion(data, "save as: ", "[unavailable]");
                return;
            }

            data.savePath = data.laneNumTo;
            data.fileName = basename(data.savePath);

            await saveEverything(data);
            data.edited = false;
            writeFileName(data);

            if(data.state === "saveasleave"){
                data.fulcon.end();
                return;
            }

            clearQuestion(data);
            data.state = "default";
            break;
        }
        default: {
            data.laneNumTo += str;
            // db.write(
            //     {x: "to line: ".length + 3, y: db.size.height - 3},
            //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
            //     {background: "white", foreground: "magenta"}
            // );
            writeDataToQuestion(data, "save as: ", data.laneNumTo);

        }
    }
}

async function handleCmdBox(data: fullNicroData, str: string, key: Key){
  // always allow to exit
    if(key.ctrl && key.name === "x"){
        data.fulcon.end();
        return;
    }

    switch(key.name){
        case "escape": {
            data.state = "default";
            data.laneNumTo = "";
            clearQuestion(data);
            break;
        }
        case "backspace": {
            data.laneNumTo = data.laneNumTo.slice(0, -1);
            writeDataToQuestion(data, "command: ", data.laneNumTo);
            // db.write(
            //     {x: "to line: ".length + 3, y: db.size.height - 3},
            //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
            //     {background: "white", foreground: "magenta"}
            // );
            break;
        }
        case "enter":
        case "return": {
            switch(data.laneNumTo){
                case "exit": {
                    data.fulcon.end();
                    break;
                }
            }

            data.laneNumTo = "";
            data.state = "default";
            clearQuestion(data);
            break;

        }
        default: {
            data.laneNumTo += str;
            // db.write(
            //     {x: "to line: ".length + 3, y: db.size.height - 3},
            //     lanenumTo.padEnd(db.size.width - ("to line: ".length + 3)),
            //     {background: "white", foreground: "magenta"}
            // );
            writeDataToQuestion(data, "command: ", data.laneNumTo);
        }
    }
}


async function keyHandler(data: fullNicroData, str: string, key: Key){

    switch(data.state){
        case "default":
            await handleDefaultState(data, str, key);
            break;
        case "toline":
            await handleToLine(data, str, key);
            break;

        case "leaveUnsavedQuestion":
            await handleLeaveUnsaved(data, str, key);
            break;

        case "saveas":
        case "saveasleave":
            await handleSaveAs(data, str, key);
            break;

        case "cmd":
            await handleCmdBox(data, str, key);
            break;

        default:
            throw new Error("invalid nicro state " + data.state);
    }

    standardRender(data);
}

function setupKeyHandlers(data: fullNicroData){
    data.ins.on("keypress", async (str, key) => {
        await keyHandler(data, str, key);
    });
}

export {keyHandler, setupKeyHandlers}