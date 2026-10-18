import { setTimeout } from "node:timers/promises";
import { fullNicroData } from "./types.js";
import { pos2D } from "../../apis/terminal/screenBuffer.js";

// function reviewText(){
//     const linesNumber: number = db.size.height - 3 - 1;

//     for(let i = 0; i < linesNumber; i++){
//         drawLine(i);
//     }


//     const crtime = Date.now();
//     if (crtime > tm) {
//         flp = !flp;
//         tm = crtime + 150;
//     }

//     // return [cursor, topleft];
    
//     const posxcursor = cursor.x - topleft.x;
//     const posycursor = cursor.y - topleft.y + 1;

//     db.edit(
//         posxcursor,
//     posycursor,
//         flp
//             ? { background: "white", foreground: "black" }
//             : { background: "black", foreground: "white" }
//     );
//     // cursor
// };


function writeFileName(data: fullNicroData){
    const db = data.db;

    db.write({x: db.size.width - 2 - data.fileName.length - 1, y: 0}, data.edited ? "~" + data.fileName : " " + data.fileName, {
        background: "white", 
        foreground: data.writeOnly ? "red" : "black"
    });
}

function writeQuestion(data: fullNicroData, question: string){
    const db = data.db;

    db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "white", foreground: "black"}, " ");
    db.write({x: 0, y: db.size.height - 3}, question, {background: "white", foreground: "black"});
    db.cursorTo(question.length + 3, db.size.height - 3);
}

function writeDataToQuestion(data: fullNicroData, question: string, what: string){
    const db = data.db;

    db.write(
        {x: question.length + 3, y: db.size.height - 3},
        what.padEnd(db.size.width - (question.length + 3)),
        {background: "white", foreground: "magenta"}
    );
}

function clearQuestion(data: fullNicroData){
    const db = data.db;

    db.rectangle({x: 0, y: db.size.height - 3}, {x: db.size.width - 1, y: db.size.height - 3}, {background: "black", foreground: "white"}, " ");
}

function intialDraw(data: fullNicroData){
    const db = data.db;

    db.rectangle({x:0, y: 0}, {x: db.size.width - 1, y: 0}, {background: "white"});
    db.write({x: 2, y: 0}, " NICRO 1.0 ", {background: "white", foreground:"black"});

    writeFileName(data);

    
    
    // db.fill("z", {background: "blue"});
    // db.rectangle(
    //     { x: 0, y: db.size.height - 2 },
    //     { x: db.size.width - 1, y: db.size.height - 1 },
    //     { background: "white" }, " "
    // );
    
    db.write({x: 0, y: db.size.height - 2}, " ^S ", {background: "black", foreground: "magenta"});
    db.write({x: 5, y: db.size.height - 2}, "SAVE", {background: "black", foreground: "white"});

    db.write({x: 0, y: db.size.height - 1}, " ^X ", {background: "black", foreground: "magenta"});
    db.write({x: 5, y: db.size.height - 1}, "EXIT", {background: "black", foreground: "white"});


    db.write({x: 12, y: db.size.height - 2}, "^L ", {background: "black", foreground: "magenta"});
    db.write({x: 17, y: db.size.height - 2}, "LINE", {background: "black", foreground: "white"});

    db.write({x: 12, y: db.size.height - 1}, "^H ", {background: "black", foreground: "magenta"});
    db.write({x: 17, y: db.size.height - 1}, "HELP", {background: "black", foreground: "white"});

    db.write({x: 24, y: db.size.height - 2}, "^C ", {background: "black", foreground: "magenta"});
    db.write({x: 29, y: db.size.height - 2}, "COPY", {background: "black", foreground: "white"});

    db.write({x: 24, y: db.size.height - 1}, "^V ", {background: "black", foreground: "magenta"});
    db.write({x: 29, y: db.size.height - 1}, "PASTE", {background: "black", foreground: "white"});

    db.write({x: 36, y: db.size.height - 2}, "^X ", {background: "black", foreground: "magenta"});
    db.write({x: 41, y: db.size.height - 2}, "CUT", {background: "black", foreground: "white"});

    db.write({x: 36, y: db.size.height - 1}, "^T ", {background: "black", foreground: "magenta"});
    db.write({x: 41, y: db.size.height - 1}, "CMD", {background: "black", foreground: "white"});

    db.write({x: 48, y: db.size.height - 2}, "^Z ", {background: "black", foreground: "magenta"});
    db.write({x: 53, y: db.size.height - 2}, "UNDO", {background: "black", foreground: "white"});

    db.write({x: 48, y: db.size.height - 1}, "^Y ", {background: "black", foreground: "magenta"});
    db.write({x: 53, y: db.size.height - 1}, "REDO", {background: "black", foreground: "white"});

    db.cursorTo(0, 1);
}



function topleftToCursor(data: fullNicroData){
    const cursor = data.cursor;
    const topleft = data.topleft;
    const db = data.db;

    // x position
    if(cursor.x > topleft.x + db.size.width - 3){
        while(cursor.x > topleft.x + db.size.width - 3) topleft.x += 1;

    }
    else if(cursor.x - 3 < topleft.x && topleft.x !== 0){
        while(cursor.x - 3 < topleft.x && topleft.x !== 0) topleft.x -= 1;
    }

    // y position
    if(cursor.y > topleft.y + db.size.height - 2 - 3){
        while(cursor.y > topleft.y + db.size.height - 2 - 3) topleft.y += 1;
    }
    else if(cursor.y < topleft.y + 1 + 3){
        while(cursor.y < topleft.y + 1 + 3 && topleft.y > 0) topleft.y -= 1;
    }
}

function drawLine(data: fullNicroData, i: number){
    const topleft = data.topleft;
    const text = data.text;
    const db = data.db;

    // only if it's there
    if(topleft.y + i < text.length){
        const curLine = text[topleft.y + i];

        const write = curLine.slice(topleft.x)
        .slice(0, db.size.width)
        .padEnd(db.size.width);

        // terminalEnvVarRouteSet(this, `${i}t`, write);
        
        db.write({x: 0, y: i + 1}, write, {foreground: "white", background: "black"});
        
    }
    else db.write({x: 0, y: i + 1}, " ".repeat(db.size.width), {background: "black", foreground: "white"});
}

function reviewText(data: fullNicroData){
    const db = data.db;

    const linesNumber: number = db.size.height - 3 - 1;

    // draw all lines
    for(let i = 0; i < linesNumber; i++){
        drawLine(data, i);
    }
}


function updateBlinkLocation(data: fullNicroData){
    const db = data.db;
    const cursor = data.cursor;
    const topleft = data.topleft;

    // remove the old signature of cursor if it exists
    // if(data.tempblnkcursorpos){
    //     db.edit(
    //         data.tempblnkcursorpos.x,
    //         data.tempblnkcursorpos.y,
    //         data.flp
    //             ? { background: "black", foreground: "white" }
    //             : { background: "white", foreground: "black" } 
    //     );
    // }       

    // calculate new position
    const posxcursor = cursor.x - topleft.x;
    const posycursor = cursor.y - topleft.y + 1;

    // // save position
    // data.tempblnkcursorpos = {x: posxcursor, y: posycursor};

    // show the new signature
    // db.edit(
    //     posxcursor,
    //     posycursor,
    //     data.flp
    //         ? { background: "white", foreground: "black" }
    //         : { background: "black", foreground: "white" }
    // );

    db.edit(
        posxcursor,
        posycursor,
        data.flp
            ? { underscore: true }
            : { underscore: false }
    );
}

async function cursorBlink(data: fullNicroData){
    const db = data.db;
    const cursor = data.cursor;
    const topleft = data.topleft;


    while(data.fulcon.stillExecuting){
        // draw cursor
        // const crtime = Date.now();
        // if (crtime > data.tm) {
        //     data.flp = !data.flp;
        //     data.tm = crtime + 150;
        // }


        // flip the state
        data.flp = !data.flp;

        updateBlinkLocation(data);

        // force render
        data.db.writeToScreenOptimized(data.context);

        // wait
        await setTimeout(150);
    }

    //   // draw cursor
    // const crtime = Date.now();
    // if (crtime > data.tm) {
    //     data.flp = !data.flp;
    //     data.tm = crtime + 150;
    // }

    // // return [cursor, topleft];
    
    // const posxcursor = cursor.x - topleft.x;
    // const posycursor = cursor.y - topleft.y + 1;

    // db.edit(
    //     posxcursor,
    //     posycursor,
    //     data.flp
    //         ? { background: "white", foreground: "black" }
    //         : { background: "black", foreground: "white" }
    // );
}


// function aWasBeforeB(a: pos2D, b: pos2D): boolean{
//     if(a.y > b.y) return false;
//     if(a.x > b.x) return false;

//     return true;
// }

function aWasBeforeB(a: pos2D, b: pos2D): boolean {
    if (a.y < b.y) return true;
    if (a.y > b.y) return false;

    return a.x < b.x;
}

function selectionRange(data: fullNicroData){
    const cursor = data.cursor;
    const topleft = data.topleft;   
    const selectionAnchor = data.selectionAnchor;
    const db = data.db;

    if(!selectionAnchor) return;

    const [firstPos, secondpos] = aWasBeforeB(cursor, selectionAnchor) ? [cursor, selectionAnchor] : [selectionAnchor, cursor];

for (let y = firstPos.y; y <= secondpos.y; y++) {
    const line = data.text[y];
    if (!line) continue;

    let startx = 0;
    let endx = line.length;

    if (y === firstPos.y) {
        startx = firstPos.x;
    }

    if (y === secondpos.y) {
        endx = secondpos.x;
    }

    const screeny = y - topleft.y;

    for (let x = startx; x < endx; x++) {
        const screenx = x - topleft.x;

        if (
            screenx >= 0 &&
            screenx < db.size.width &&
            screeny >= 0 &&
            screeny < db.size.height - 3
        ) {
            db.edit(screenx, screeny + 1, {
                reverse: true
            });
        }
    }
}
}

function standardRender(data: fullNicroData){
    if(!data.fulcon.stillExecuting) return;

    topleftToCursor(data);
    reviewText(data);
    updateBlinkLocation(data);
    selectionRange(data);
    data.db.writeToScreenOptimized(data.context);
}

export {writeFileName, intialDraw, writeQuestion, clearQuestion, writeDataToQuestion, topleftToCursor, standardRender, reviewText, cursorBlink, updateBlinkLocation, aWasBeforeB}