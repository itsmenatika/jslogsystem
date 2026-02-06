
import { emitKeypressEvents } from "readline";
import { commandInternalExec } from "./apis/commands/commandExecute.js";
import { formatPrintTextbox, printTextBox } from "./formatingSessionDependent.js";
import { terminalSession, terminalSessionObjSaved } from "./programdata.js";
import { ansiEscape, clearEntireLineCODE, consoleColors, cursorAbs, cursorRel, formatTaskError, hideCursorCODE, printViewTextbox, showCursorCODE } from "./texttools.js";
import { isTty, streamWrapper } from "./ultrabasic.js";
import { terminalApi } from "./apis/terminal/terminalApi.js";
import { internalInterupHandlerSIGINT, interrupReasonType } from "./interrup.js";
import stringWidth from "string-width";
import stripAnsi from "strip-ansi";

const allowedKeysToWrite: string = "abcdefghijklmnopqrstuxwvyz" + "abcdefghijklmnopqrstuxwvyz".toUpperCase() + "1234567890" + "!@#$%^*()" + "`~-_+\\|'\";:,<.>?" + "[{}]" + " " + "!@#$%^&*=~`'/";

// function printTextBox(ses: terminalSession){
//         ses.out.write(
//         clearEntireLineCODE + "\r" +
//         formatPrintTextbox(ses.text, ses) +
//         cursorRel(ses.relativeTextboxPos, 0) +
//         showCursorCODE
//     );
// }

// function handleEnter(ses: terminalSession){
//     if(ses.text.trim() == ""){
//         // textboxVisibility(false);
//         // textboxVisibility(true);
//         // if(textboxVisibility()) printViewTextbox();
//         if(ses.viewTextbox){
//             printTextBox(ses);
//         }
//         return;
//     }

//     if(ses.commandHistory.length > 50) 
//         ses.commandHistory = ses.commandHistory.slice(
//     ses.commandHistory.length - 50, ses.commandHistory.length);
//     ses.commandHistory.push(ses.text);

//     // handleCommandInternal(text, silent);
//     // commandInternalExec(text);
// }

async function inHandler(data: any, ses: terminalSession){
    //    console.log(data);
    if(data){
        // escape ctrl + c key
        if(data.includes('\u0003')){
            // TODO interup Handler
            // interupHandler("CTRL + C");
            // ses.procLinked?.exit();
            internalInterupHandlerSIGINT({
                session: ses,
                sessionName: ses.sessionName,
                reason: interrupReasonType.ctrlc,
                author: "core",
                forceDefault: false
            });
            return;
        }

        // control + N
        if(data.includes("\u000E")){
            const keys = Object.keys(terminalSessionObjSaved);
            let cur = keys.findIndex(
                (s) => s === ses.sessionName
            );

            cur += 1;
            if(cur > keys.length - 1) cur = 0;

            const changeTo = keys[cur];

            if(ses.sessionName == changeTo) return;

            const c = new terminalApi(ses);
            const to = new terminalApi(changeTo);

            c.switchStreamsWith(to);
            
            
            return;
        }

        // control + B
        if(data.includes("\u0002")){
            const keys = Object.keys(terminalSessionObjSaved);
            let cur = keys.findIndex(
                (s) => s === ses.sessionName
            );

            cur -= 1;
            if(cur < 0) cur = keys.length - 1;

            const changeTo = keys[cur];

            if(ses.sessionName == changeTo) return;

            const c = new terminalApi(ses);
            const to = new terminalApi(changeTo);

            c.switchStreamsWith(to);
            
            
            return;
        }

        if(ses.blockTextboxTyping) return;


        // control + X
        if(data.includes("\u0018")){
            if(ses.relativeTextboxPos !== 0){
                // create a new text with that key
                ses.text = ses.text.slice(0, ses.relativeTextboxPos) 
                + '§' + ses.text.slice(ses.relativeTextboxPos);

                
                // hideCursor();
                // process.stdout.write("\r");

                // ses.out.write(hideCursorCODE);
                // ses.out.write(
                //     clearEntireLineCODE + "\r" +
                //     formatPrintTextbox(ses.text, ses) +
                //     cursorRel(ses.relativeTextboxPos, 0) +
                //      showCursorCODE
                // );
                printTextBox(ses);

                // ses.out.write(hideCursorCODE + clearEntireLineCODE + "\r");

                // // printViewTextbox(ses.text, ses.out);

                // ses.out.write(cursorRel(ses.relativeTextboxPos, 0) + showCursorCODE);

                // process.stdout.moveCursor(relativePos, 0);
                // showCursor();

                return;
            }

            ses.text += '§';
            // ses.out.write(data); 
            printTextBox(ses);


            // ses.text += "§";
            // printTextBox(ses);
            return;
        }

        // reappearing of the textbox
        if(!ses.viewTextbox){
            ses.viewTextbox = true;
            // printViewTextbox(ses.text, ses.out);
            printTextBox(ses);
        }


        // backspace
        if(data.includes("\b")){
            // sync the relative pos if it's not in raw mode
            // const isRaw = !!(ses.out.getStream() as typeof process.stdin).isRaw;

            // // TODO: supporting non raw mode
            // if(!isRaw){
            //     ses.relativeTextboxPos = 
            // }

            // if it's not on the end
            if(ses.relativeTextboxPos !== 0){
                // if it is somehow beyond the range (idk how), then dont do anything, to avoid any possibility of crashing it
                if(ses.relativeTextboxPos * -1 >= ses.text.length) return;

                const textlen = ses.text.length;

                // create a new text with that removed character
                ses.text = ses.text.slice(0, textlen + ses.relativeTextboxPos - 1) + 
                ses.text.slice(textlen + ses.relativeTextboxPos , textlen);

                // ses.out.write(hideCursorCODE);
                // ses.out.write(
                //     cursorRel(textlen - ses.relativeTextboxPos, 0) + 
                //     ses.text + showCursorCODE
                // );

                // ses.out.write(
                //     clearEntireLineCODE + "\r" +
                //     formatPrintTextbox(ses.text, ses) +
                //     cursorRel(ses.relativeTextboxPos, 0) +
                //     showCursorCODE
                // );
                printTextBox(ses);
                fromEndToRelative(ses);

                // hideCursor();
                // remove the current textbox
                // ses.out.write(hideCursorCODE + clearEntireLineCODE + "\r");

                // // print it
                // printViewTextbox(ses.text, ses.out);

                // reappering of the cursor
                // ses.out.write(showCursorCODE);

                // process.stdout.clearLine(0);
                // process.stdout.write("\r");
                
                // process.stdout.moveCursor(relativePos, 0);
                // showCursor();


                return;
            }

            // if the cursor was on the end
            if(ses.text.length > 0){
                // ses.out.write("\b \b"); 
                ses.text = ses.text.slice(0, -1);
                printTextBox(ses);
            }
        }
        // enter
        else if(data.includes("\r")){
            await userTerminalAction(ses, terminalUserActionType.enter);


            
            // printTextBox(ses, undefined, hideCursorCODE + consoleColors.Reset + "\n");
            // // new line to main out stream and reset color
            // ses.out.write(hideCursorCODE + consoleColors.Reset + "\n");

            // if(ses.viewTextbox){
            //     ses.out.write(formatPrintTextbox(ses.text, ses));
            // }

            // ses.out.write(showCursorCODE);

            // add to command history
            // // ses.commandHistory.push(text);
            // handleEnter(ses);

            
            // process.stdout.write("\n");
            // appendFileSync(finalLatest, "> "+text+"\n");
            // let tempText: string = text;
            // text = "";
            // process.stdout.write("\x1b[0m");
            // todo enter handling
            // handleEnter(tempText)
            // if(!handleEnter(tempText) && viewTextBox){
                // process.stdout.write("> \x1b[35m");
            // }
        }
        // up key
        else if (data == '\u001B\u005B\u0041') {
            // const lenToMove = ses.text.length - ses.relativeTextboxPos;
            ses.relativeTextboxPos = 0;

            if(ses.indexCommandHistory === null){
                ses.indexCommandHistory = ses.commandHistory.length - 1;
            }
            else{
                ses.indexCommandHistory--;
                if(ses.indexCommandHistory < 0) ses.indexCommandHistory = 0;
            }

            if(ses.commandHistory.length > 0){
                ses.text = ses.commandHistory[ses.indexCommandHistory];
                printTextBox(ses);
            }

            //     ses.out.write(hideCursorCODE);
            //     ses.out.write(
            //         clearEntireLineCODE + "\r" +
            //         formatPrintTextbox(ses.text, ses) +
            //         showCursorCODE)
            // }
        }

        // down
        else if (data == '\u001B\u005B\u0042') {
            ses.relativeTextboxPos = 0;

            if(ses.indexCommandHistory !== null){
                ses.indexCommandHistory++;
                if(ses.indexCommandHistory >= ses.commandHistory.length) 
                    ses.indexCommandHistory = null;


                if(ses.indexCommandHistory !== null)
                    ses.text = ses.commandHistory[ses.indexCommandHistory];
                else
                    ses.text = ""
                
                // ses.out.write(hideCursorCODE);
                // ses.out.write(
                //     clearEntireLineCODE + "\r" +
                //     formatPrintTextbox(ses.text, ses) +
                //     showCursorCODE
                // )
                printTextBox(ses);

                // hideCursor();
                // process.stdout.clearLine(0);
                // process.stdout.write("\r\x1b[0m> \x1b[35m"+text);
                // showCursor();

            }
        }
        // left
        else if(data === '\u001B\u005B\u0044'){
            // if(ses.relativeTextboxPos * -1 >= ses.text.length) return;

            // // process.stdout.moveCursor(-1, 0);
            // ses.out.write(cursorRel(-1, 0));
            // ses.relativeTextboxPos--;
            await userTerminalAction(ses, terminalUserActionType.left);
        }

        // right
        else if(data === '\u001B\u005B\u0043'){
            // if(ses.relativeTextboxPos >= 0) return;

            // // process.stdout.moveCursor(1, 0);
            // ses.out.write(cursorRel(1, 0));
            // ses.relativeTextboxPos++;
            await userTerminalAction(ses, terminalUserActionType.right);
        }
        
        // adding keys
        else if(allowedKeysToWrite.includes(data)){
            // if it's in the middle of the text
            if(ses.relativeTextboxPos !== 0){
                // create a new text with that key
                ses.text = ses.text.slice(0, ses.relativeTextboxPos) 
                + data + ses.text.slice(ses.relativeTextboxPos);

                
                // hideCursor();
                // process.stdout.write("\r");

                // ses.out.write(hideCursorCODE);
                // ses.out.write(
                //     clearEntireLineCODE + "\r" +
                //     formatPrintTextbox(ses.text, ses) +
                //     cursorRel(ses.relativeTextboxPos, 0) +
                //      showCursorCODE
                // );
                printTextBox(ses);

                // ses.out.write(hideCursorCODE + clearEntireLineCODE + "\r");

                // // printViewTextbox(ses.text, ses.out);

                // ses.out.write(cursorRel(ses.relativeTextboxPos, 0) + showCursorCODE);

                // process.stdout.moveCursor(relativePos, 0);
                // showCursor();

                return;
            }

            ses.text += data;
            // ses.out.write(data); 
            printTextBox(ses);
        }



        }
}

enum terminalUserActionType{
    none,
    right,
    left,
    enter
}



function fromEndToRelative(ses: terminalSession) {
    return;
    // const strm = ses.out.getStream();
    // let columns = 80;
    // if (isTty(strm) && strm.columns !== undefined) {
    //     columns = strm.columns;
    // }

    // const text = ses.previousInputRender;
    // const width = stringWidth(text);

    // // clamp relativeTextboxPos
    // let relPos = ses.relativeTextboxPos;
    // if (relPos > 0) relPos = 0;
    // if (-relPos > width) relPos = -width;

    // const absPos = width + relPos;

    // // split into visual lines
    // let lines: { start: number; end: number }[] = [];
    // let start = 0;
    // while (start < width) {
    //     const end = Math.min(start + columns, width);
    //     lines.push({ start, end });
    //     start = end;
    // }

    // // find target line and column
    // let targetLine = 0;
    // let targetCol = 1;
    // for (let i = 0; i < lines.length; i++) {
    //     if (absPos < lines[i].end) {
    //         targetLine = i;
    //         targetCol = absPos - lines[i].start + 1;
    //         break;
    //     }
    //     if (i === lines.length - 1) {
    //         targetLine = i;
    //         targetCol = lines[i].end - lines[i].start;
    //         targetCol = Math.max(1, targetCol); // clamp at least 1
    //     }
    // }

    // // clamp targetCol to terminal width
    // if (targetCol > columns) targetCol = columns;

    // // move cursor up from bottom
    // const totalLines = lines.length;
    // const linesUp = totalLines - targetLine - 1;
    // let seq: string[] = [];
    // for (let i = 0; i < linesUp; i++) {
    //     seq.push("\x1b[F");
    // }

    // // move to column
    // seq.push(`\x1b[${targetCol}G`);

    // ses.out.write(seq.join(""));
}

// function returnToStartFromEnd(ses: terminalSession): void{
//     const strm = ses.out.getStream(); // gets the stream
//     const isStreamTty = isTty(strm); // checks whether it is a tty
//     let columns: number = 80;
//     if(isStreamTty && strm.columns !== undefined) columns = strm.columns;

//     let widthDisplay = stringWidth(ses.previousInputRender);
//     let textDisplay = stringWidth(ses.text);


//     let toSend: string[] = [];

//     while(widthDisplay > 0){
//         if(widthDisplay >= columns){
//             toSend.push(ansiEscape + "[F");
//             widthDisplay -= columns;
//         }
//         else{
//             toSend.push(ansiEscape + "[" + (widthDisplay - textDisplay) + "C");
//             break;
//         }
//     }

//     ses.out.write(toSend.join(""));
// }


// function fromStartToRelative(ses: terminalSession): void{
//     const strm = ses.out.getStream(); // gets the stream
//     const isStreamTty = isTty(strm); // checks whether it is a tty
//     let columns: number = 80;
//     if(isStreamTty && strm.columns !== undefined) columns = strm.columns;

//     const width = ses.text.length;
//     const widthOfRender = ses.previousInputRender.length;
//     const widthDiff = widthOfRender - width;
    
//     let toSend: string[] = [];
//     let i = 0;
//     while(i >= width){
//         if((i + widthDiff) % columns === 0){
//             toSend.push(ansiEscape + "[E");
//         }
//         else{
//             toSend.push(ansiEscape + "[" + i + "C");
//             break;
//         }
//     }

//     ses.out.write(toSend.join(""));
// }

/**
 * LOW LEVEL API
 * 
 * Performs an user action associated with the main inputbox. 
 * 
 * @param ses the session on which it was performed
 * @param action the action
 * @returns 
 */
async function userTerminalAction(ses: terminalSession, action: terminalUserActionType): Promise<void>{
    const strm = ses.out.getStream(); // gets the stream
    const isStreamTty = isTty(strm); // checks whether it is a tty
    // const widthOfText = stringWidth(ses.text); // 
    // const widthDisplay = stringWidth(ses.previousInputRender);
    const widthOfText = ses.text.length; // the length of currently used text
    const widthDisplay =  stripAnsi(ses.previousInputRender).length; // the length of previous render

    switch(action){
        // right arrow
        case terminalUserActionType.right:
            // if there's no where to move, don't move!
            if(ses.relativeTextboxPos >= 0) return;

            // // perform only if a stream is tty
            // if(isStreamTty){
            //     const columns = strm.columns || 80;

            //     let left = (widthDisplay + ses.relativeTextboxPos) % columns;

            //     if(left === columns - 2){
            //         left++;
            //         ses.relativeTextboxPos++;
            //     }

            //     if(left === columns - 1){
            //         ses.out.write(ansiEscape + "[E");
            //     }
            //     else{
            //         ses.out.write(cursorRel(1, 0));
            //     }

            // }
            // else{
            //     ses.out.write(cursorRel(1, 0));
            // }

            ses.relativeTextboxPos++;
            break;
        case terminalUserActionType.left:
            if(Math.abs(ses.relativeTextboxPos) >= widthOfText) return;

            // if(isStreamTty){
            //     const columns = strm.columns || 80;

            //     const left = (widthDisplay + ses.relativeTextboxPos) % columns;

            //     if(left == 0){
            //         ses.out.write(ansiEscape + "[F" + ansiEscape + "[" + columns + "C");
            //         ses.relativeTextboxPos--;
            //     }
            //     else{
            //         ses.out.write(cursorRel(-1, 0));
            //     }



            // }
            // else{
            //     ses.out.write(cursorRel(-1, 0));
            // }
            

            ses.relativeTextboxPos--;
            break;

        case terminalUserActionType.enter:
            await handleEnter(ses);

            
            break;
        default:
            throw new SyntaxError("Undefined action");
    }

    if(ses.relativeTextboxPos > 0) ses.relativeTextboxPos = 0;
    if(Math.abs(ses.relativeTextboxPos) > ses.text.length) ses.relativeTextboxPos = ses.text.length;

    if(ses.viewTextbox)
    printTextBox(ses);
}

/**
 * configures the handlers for you
 * @param ses the session of concern
 * @param setupStream whether the stream should also be confirmed if it is attached
 */
function setupInHandlerListener(ses: terminalSession, setupStream: boolean = true){
    if(setupStream){
        const s = ses.in.getStream();

        if(s){
            if(!s.isRaw) s?.setRawMode(true);
            s.setDefaultEncoding("utf-8");
            s.setEncoding("utf-8");
            emitKeypressEvents(s);
        }
    }

    ses.in.addListener(
        "data",
        async (chunk) => {
            await inHandler(chunk, ses);
        }
    );
}


async function handleEnter(ses: terminalSession){
    // if there's no data
    if(ses.text.trim() == "") return;
    
    // redraw inputbox without any selection
    printTextBox(ses, {noCursor: true});
    
    // save to command history
    if(ses.commandHistory.length > 50) 
        ses.commandHistory = ses.commandHistory.slice(
                ses.commandHistory.length - 50, ses.commandHistory.length);
    ses.commandHistory.push(ses.text);



    // clearing previous data \/

    // remove relative pos if there was one
    ses.relativeTextboxPos = 0;


    // remove selected index on the command history
    ses.indexCommandHistory = null;



    // save the written text and reset it
    const text = ses.text;
    ses.text = "";



    // prepare outs
    
    // write to file stream
    ses.fileout.write(stripAnsi(ses.previousInputRender) + "\n");

    // go further
    ses.out.write(consoleColors.Reset + hideCursorCODE + "\n");



    // command exec
    // commandInternalExec(text, ses);
    await commandInternalExec(text, {
        logNode: "console",
        silent: false,
        onlyReturn: false,
        terminal: ses
    });
}



// function preInHandler(data: any, thatStream: streamWrapper<any>){
//     inHandler(data, thatStream.session as terminalSession);
// }


// function setUpListener(on: streamWrapper<typeof process.stdin | undefined>, terminalSes: terminalSession){
//     on.addListener("data", (chunk) => {
//         inHandler(chunk, terminalSes)
//     });
// }

export {allowedKeysToWrite, inHandler, setupInHandlerListener}