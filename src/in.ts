
import { emitKeypressEvents } from "readline";
import { commandInternalExec } from "./apis/commands/commandExecute.js";
import { formatPrintTextbox, printTextBox } from "./formatingSessionDependent.js";
import { terminalSession, terminalSessionObjSaved } from "./programdata.js";
import { clearEntireLineCODE, consoleColors, cursorRel, formatTaskError, hideCursorCODE, printViewTextbox, showCursorCODE } from "./texttools.js";
import { streamWrapper } from "./ultrabasic.js";
import { terminalApi } from "./apis/terminal/terminalApi.js";
import { internalInterupHandlerSIGINT, interrupReasonType } from "./interrup.js";

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
            // if there's no data
            if(ses.text.trim() == "") return;

            // remove relative pos if there was one
            ses.relativeTextboxPos = 0;

            // remove selected index on the command history
            ses.indexCommandHistory = null;

            // save to command history
            if(ses.commandHistory.length > 50) 
                ses.commandHistory = ses.commandHistory.slice(
                        ses.commandHistory.length - 50, ses.commandHistory.length);
            ses.commandHistory.push(ses.text);


            // save the written text and reset it
            const text = ses.text;
            ses.text = "";
            
            // write to file stream
            ses.fileout.write("> " + text + "\n");

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


            // print a new line
            if(ses.viewTextbox)
            printTextBox(ses);

            
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
            if(ses.relativeTextboxPos * -1 >= ses.text.length) return;

            // process.stdout.moveCursor(-1, 0);
            ses.out.write(cursorRel(-1, 0));
            ses.relativeTextboxPos--;
        }

        // right
        else if(data === '\u001B\u005B\u0043'){
            if(ses.relativeTextboxPos >= 0) return;

            // process.stdout.moveCursor(1, 0);
            ses.out.write(cursorRel(1, 0));
            ses.relativeTextboxPos++;
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



// function preInHandler(data: any, thatStream: streamWrapper<any>){
//     inHandler(data, thatStream.session as terminalSession);
// }


// function setUpListener(on: streamWrapper<typeof process.stdin | undefined>, terminalSes: terminalSession){
//     on.addListener("data", (chunk) => {
//         inHandler(chunk, terminalSes)
//     });
// }

export {allowedKeysToWrite, inHandler, setupInHandlerListener}