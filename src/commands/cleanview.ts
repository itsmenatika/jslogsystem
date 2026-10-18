import { emitKeypressEvents } from "readline";
import { askForFullControl } from "../apis/terminal/fullControl.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { screenBufferDouble } from "../apis/terminal/screenBuffer.js";
import { cdDummy, expectedError } from "../apis/allApis.js";
import { readFile } from "fs/promises";
import { qLog } from "../tools/quickLog.js";

const commandTable = quickCmdWithAliases("cleanview", {
    usageinfo: "cleanview <...data> [-b] [<--sep <SEPERATOR>>]",
    desc: "shows a text in a clean manner",
    longdesc: multiLineConstructor(
        "shows a text in a clean manner using an alternate buffer from fullController",
        "",
        "It will only show strings that were passed there",
        ""
        ,
        "you can use --sep <SEPERATOR> to change a seperator between texts.",
        "It defaults to ' '.",
        "",
        "-b enables scroll bars.",
        "",
        "Arrow keys scroll.",
        "Page Up / Page Down scroll vertically.",
        "Home / End scroll horizontally.",
        "",
        "use ESCAPE key or CTRL C to go back",
        "",
        "use -f to use data as files to read from"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["text", "buffer"],

    async callback(preargs: any[]): Promise<any> {
        // prepare arguments
        const argsD = smartArgs(preargs, this);
        const args = argsD.argsWithoutArguments;

        // whether to show bars
        const showBars = argsD.argsWithDash.includes("b");

        const interpretAsFiles = argsD.argsWithDash.includes("f");

        let text: string = "";

        if(interpretAsFiles){
            for(const file of args){
                let loc;
               try {
                    loc = cdDummy(this, file);
               } catch (error) {
                    return expectedError(`The path tried to exit a local directory: ${file}`);
               }
               text += await readFile(loc);
            }
        }
        else{
            let seperator = " ";

            if(argsD.argsWithDoubleDash["sep"]) {
                seperator = argsD.argsWithDoubleDash["sep"];
            }

            for(let i = 0; i < args.length; i++) {
                if(typeof args[i] !== "string") continue;

                if(text.length > 0) {
                    text += seperator;
                }

                text += args[i];
            }

        }


        // ask for full control
        const fulcon = askForFullControl(this);

        if(!fulcon.valid){
            return expectedError("no full control");
        }







        /*
         * Expand tabs using real tab stops.
         */
        const TAB_WIDTH = 8;

        const lines: string[] = [];
        let maxWidth = 0;

        for(const rawLine of text.split(/\r?\n/)) {
            let line = "";
            let column = 0;

            for(const char of rawLine) {
                if(char === "\t") {
                    const spaces = TAB_WIDTH - (column % TAB_WIDTH);

                    line += " ".repeat(spaces);
                    column += spaces;
                }
                else {
                    line += char;
                    column++;
                }
            }

            lines.push(line);

            if(line.length > maxWidth) {
                maxWidth = line.length;
            }
        }

        const terminalWidth = process.stdout.columns || 80;
        const terminalHeight = process.stdout.rows || 24;

        /*
         * Reserve one column for the vertical bar and one row
         * for the horizontal bar when enabled.
         */
        const contentWidth = showBars
            ? Math.max(1, terminalWidth - 1)
            : terminalWidth;

        const contentHeight = showBars
            ? Math.max(1, terminalHeight - 1)
            : terminalHeight;

        const buffer = new screenBufferDouble({
            width: terminalWidth,
            height: terminalHeight
        });

        let scrollX = 0;
        let scrollY = 0;

        const getMaxScrollX = () => {
            return Math.max(0, maxWidth - contentWidth);
        };

        const getMaxScrollY = () => {
            return Math.max(0, lines.length - contentHeight);
        };

        // a function to render everything
        const render = () => {
            // get maximum dimensions of text
            const maxX = getMaxScrollX();
            const maxY = getMaxScrollY();

            // set maximums and minimums
            if(scrollX < 0) {
                scrollX = 0;
            }

            else if(scrollX > maxX) {
                scrollX = maxX;
            }

            if(scrollY < 0) {
                scrollY = 0;
            }
            else if(scrollY > maxY) {
                scrollY = maxY;
            }

            // draw everything
            for(let screenY = 0; screenY < contentHeight; screenY++) {
                const documentY = scrollY + screenY;

                // get line
                let line = "";

                if(documentY < lines.length) {
                    line = lines[documentY].slice(
                        scrollX,
                        scrollX + contentWidth
                    );
                }

                if(line.length < contentWidth) {
                    line += " ".repeat(contentWidth - line.length);
                }

                // write it
                buffer.write(
                    {
                        x: 0,
                        y: screenY
                    },
                    line,
                    {},
                    false
                );
            }

            // bars
            if(showBars) {

                // vertical bar

                let verticalBar = " ";

                if(maxY > 0) {
                    const trackHeight = contentHeight;

                    const thumbSize = Math.max(
                        1,
                        Math.floor(
                            (contentHeight / lines.length) *
                            trackHeight
                        )
                    );

                    const available = Math.max(
                        0,
                        trackHeight - thumbSize
                    );

                    const thumbPosition = Math.round(
                        (scrollY / maxY) * available
                    );

                    verticalBar = " ".repeat(trackHeight);

                    const chars = verticalBar.split("");

                    for(
                        let i = 0;
                        i < thumbSize;
                        i++
                    ) {
                        if(thumbPosition + i < chars.length) {
                            chars[thumbPosition + i] = "█";
                        }
                    }

                    verticalBar = chars.join("");
                }
                else {
                    verticalBar = " ".repeat(contentHeight);
                }

                for(let y = 0; y < contentHeight; y++) {
                    buffer.write(
                        {
                            x: terminalWidth - 1,
                            y
                        },
                        verticalBar[y],
                        {},
                        false
                    );
                }

                // horizontal bar
                let horizontalBar = " ".repeat(contentWidth);

                if(maxX > 0) {
                    const thumbSize = Math.max(
                        1,
                        Math.floor(
                            (contentWidth / maxWidth) *
                            contentWidth
                        )
                    );

                    const available = Math.max(
                        0,
                        contentWidth - thumbSize
                    );

                    const thumbPosition = Math.round(
                        (scrollX / maxX) * available
                    );

                    const chars = horizontalBar.split("");

                    for(
                        let i = 0;
                        i < thumbSize;
                        i++
                    ) {
                        if(thumbPosition + i < chars.length) {
                            chars[thumbPosition + i] = "█";
                        }
                    }

                    horizontalBar = chars.join("");
                }

                buffer.write(
                    {
                        x: 0,
                        y: terminalHeight - 1
                    },
                    horizontalBar,
                    {},
                    false
                );

                // Bottom-right corner.
                buffer.write(
                    {
                        x: terminalWidth - 1,
                        y: terminalHeight - 1
                    },
                    " ",
                    {},
                    false
                );
            }

            buffer.writeToScreenOptimized(this);
        };


        // link controls
        const stream = fulcon.getNewListener_in_raw();
        emitKeypressEvents(stream);

        // controls
        const onKeypress = (_str: string, key: any) => {
            if(!key) return;

            if(key.name === "c" && key.ctrl) {
                // fulcon.ctrlC();
                fulcon.end();
                return;
            }

            if(key.name === "escape") {
                fulcon.end();
                return;
            }

            // to see whether a render is required
            let changed = false;

            // keys
            if(key.name === "up") {
                scrollY--;
                changed = true;
            }
            else if(key.name === "down") {
                scrollY++;
                changed = true;
            }
            else if(key.name === "pageup") {
                scrollY -= contentHeight;
                changed = true;
            }
            else if(key.name === "pagedown") {
                scrollY += contentHeight;
                changed = true;
            }
            else if(key.name === "left") {
                scrollX--;
                changed = true;
            }
            else if(key.name === "right") {
                scrollX++;
                changed = true;
            }
            else if(key.name === "home") {
                scrollX = 0;
                changed = true;
            }
            else if(key.name === "end") {
                scrollX = getMaxScrollX();
                changed = true;
            }

            // if something has changed, render it again
            if(changed) {
                render();
            }
        };

        stream.on("keypress", onKeypress);

        try {
            await fulcon.codeAsyncAlt(async () => {
                render();

                await fulcon.dontClose();
            });
        }
        finally {
            stream.removeListener("keypress", onKeypress);
            fulcon.removeNewListener_in_raw(stream);
        }
    }
}, ["clnvw"]);
const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds}