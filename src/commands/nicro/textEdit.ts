import { pos2D } from "../../apis/terminal/screenBuffer.js";
import { action, actionInsertText, actionType, fullNicroData, nicroData } from "./types.js";



function insertText(data: fullNicroData, text: string, where: pos2D, saveAs: 'none' | 'redo' | 'action' = 'action'){
    // if write only, dont do anything
    if(data.writeOnly){
        throw new Error("data is write only");
    }

    // if it's out of bounds (y)
    if(where.y >= data.text.length){
        throw new Error("ypos out of bounds");
    }

    if(where.x > data.text[where.y].length){
        throw new Error("xpos out of bounds");
    }


    if(saveAs === 'action'){
        data.actionStack.push(
            {
                type: actionType.insertText,
                pos: {...where},
                text,
            }
        );
    }
    else if(saveAs === "redo"){
        data.redoStack.push(
            {
                type: actionType.insertText,
                pos: {...where},
                text,
            }
        );
    }

    
    const left: string = data.text[where.y].slice(0, where.x);
    const right: string = data.text[where.y].slice(where.x);
    
    const lines: string[] = text.split("\n");
    
    let expectedCursorPos: pos2D = {x: 0, y: 0};

    if(lines.length === 1){
        // just change the specified line
        data.text[where.y] = left + text + right;
        expectedCursorPos.x = where.x + text.length;
        expectedCursorPos.y = where.y;
    }
    else{
        // first line
        data.text[where.y] = left + lines[0];

        // insert new lines
        for(let i = 1; i < lines.length - 1; i++) {
            data.text.splice(where.y + i, 0, lines[i]);
        }

        // insert the last line with the right side
        data.text.splice(
            where.y + lines.length - 1,
            0,
            lines[lines.length - 1] + right
        );


        expectedCursorPos.x = (lines.at(-1) as string)?.length;
        expectedCursorPos.y = where.y + lines.length - 1;
    }

    return {expectedCursorPos};
}


function removeText(data: fullNicroData, where: pos2D, to: pos2D, saveAs: 'none' | 'redo' | 'action' = 'action'){
    // if write only, dont do anything
    if(data.writeOnly){
        throw new Error("data is write only");
    }

    // // if it's out of bounds (where)
    // if(where.y >= data.text.length){
    //     throw new Error("ypos out of bounds (where)");
    // }

    // if(where.x >= data.text[where.y].length){
    //     throw new Error("xpos out of bounds (where)");
    // }

    // // if it's out of bounds (to)
    // if(to.y >= data.text.length){
    //     throw new Error("ypos out of bounds (to)");
    // }

    // if(to.x >= data.text[where.y].length){
    //     throw new Error("xpos out of bounds (to)");
    // }

    
    let removedText: string;
    if(where.y === to.y){
        removedText = data.text[where.y].slice(where.x, to.x + 1);
    }
    else{
        const partsOfRemovedText: string[] = [];

        partsOfRemovedText.push(data.text[where.y].slice(0, where.x));

        for (let i = where.y + 1; i < to.y; i++) {
            partsOfRemovedText.push(data.text[i]);
        }

        partsOfRemovedText.push(data.text[to.y].slice(to.x + 1));

        removedText = partsOfRemovedText.join("\n");
    }
    
    const firstLine: string = data.text[where.y];
    const lastLine: string = data.text[to.y];
    
    const left: string = firstLine.slice(0, where.x);
    const right: string = lastLine.slice(to.x + 1);
    
    data.text[where.y] = left + right;
    data.text.splice(where.y + 1, to.y - where.y);
    
    // action
    if(saveAs === "action"){
        data.actionStack.push(
            {
                type: actionType.removeText,
                pos: {...where},
                text: removedText
            }
        );    
    }
    else if(saveAs === "redo"){
        data.redoStack.push(
            {
                type: actionType.removeText,
                pos: {...where},
                text: removedText
            }
        );          
    }

    return {left, right, removedText, expectedCursorPos: where};

}

// function removeLine(data: fullNicroData, lineNumber: number){
//     // removeText(data, {x: data.text[cursor.y - 1].length, y: cursor.y - 1}, {x: -1, y: cursor.y});


//     const previousLineLength = data.text[lineNumber - 1].length;
//     const currentLineLength = data.text[lineNumber].length;

//     removeText(data, {x: previousLineLength, y: lineNumber - 1}, {x: currentLineLength, y: lineNumber});
// }

function endPos(pos: pos2D, text: string): pos2D {
    const lines = text.split("\n");

    if (lines.length === 1) {
        return {
            x: pos.x + lines[0].length - 1,
            y: pos.y
        };
    }

    return {
        x: lines[lines.length - 1].length - 1,
        y: pos.y + lines.length - 1
    };
}

function undo(data: fullNicroData, errorIfNothing: boolean = false, stack: "redo" | "undo" = "undo"): void | Record<string, number | string | pos2D>{
    const stck = stack === "undo" ? data.actionStack : data.redoStack;
    const saveAs = stack === "undo" ? "redo" : "action";
    
    // length check
    if(stck.length === 0){
        if(errorIfNothing) throw new Error("action stack is empty");
        return;
    }

    // get last action
    const lastAction = stck.pop() as action;

    switch(lastAction.type){
        case actionType.insertText: {
            
            return removeText(data, lastAction.pos as pos2D, endPos(lastAction.pos as pos2D, lastAction.text as string), saveAs);
 
            break;
        }
        case actionType.removeText: {
            return insertText(data, lastAction.text as string, lastAction.pos as pos2D, saveAs);
            
            break;
        }

        case actionType.undefined:
        default: {
            throw new Error("undefined action");
        }
    }

}


function clearStack(data: fullNicroData, stack: 'action' | 'redo'){
    if(stack === "action") data.actionStack.length = 0;
    else if(stack === "redo") data.redoStack.length = 0;
}


// function redo(data: fullNicroData, errorIfNothing: boolean = false): void | Record<string, number | string | pos2D>{
//     // length check
//     if(data.redoStack.length === 0){
//         if(errorIfNothing) throw new Error("action stack is empty");
//         return;
//     }

//     // get last action
//     const lastAction = data.redoStack.pop() as action;

//     switch(lastAction.type){
//         case actionType.insertText: {
//             return insertText(data, lastAction.text as string, lastAction.pos as pos2D);
//             break;
//         }
//         case actionType.removeText: {
//             return removeText(data, lastAction.pos as pos2D, endPos(lastAction.pos as pos2D, lastAction.text as string));
//         }
//         case actionType.undefined:
//         default: {
//             throw new Error("undefined action");
//         }
//     }

// }

export {undo, insertText, removeText, clearStack}