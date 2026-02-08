import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { expectedError } from "../apis/allApis.js";
import { ansiEscape, consoleColors, minecraftColorPallete, multiLineConstructor } from "../texttools.js";
import { cleanReturner } from "../tools/cleanReturner.js";
import { stripVTControlCharacters } from "node:util";

const commandTable = quickCmdWithAliases("color", {
        usageinfo: "color <color> [<...data>]",
        desc: "colorizes strings",
        longdesc: multiLineConstructor(
            "colorizes strings",
            "",
            "use 'color list' to list all available colors quick codes available to use",
            "short codes (one letters or numbers) can be combined",
            "",
            "add ! as a color to strip them of every ansi character",
            "add ^ to use that color in the background (for #, $ and @)",
            "use # for hex, use $ for 256 color mode, use @ for rgb mode",
            "",
            "colors can be combined using a special character or /",
            "",
            "examples:",
            "meow | color 4/Blink",
            "meow | color FgYellow/Blink",
            "meow | color 2b",
            "meow | color #bbb",
            "meow | color #^abc",
            "meow | color #129582",
            "meow | color #^198932",
            "meow | color @89.32.12",
            "meow | color @^23.23.12",
            "meow | color $19",
            "meow | color $^30",
            "meow | color #bbb/#^aaa/Blink",
            "",
            "use ! as a seperate color or with short codes to prepare the text by stripping it from any control characters",
            "use ? to add a Reset code after the text",
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["generator", "text", "creator", "manipulation", "color", "ansi"],
        callback(preargs: string[]){
            const args = removeInternalArguments(preargs);

            // if there's for sure no colors
            if(args.length < 2){
                return expectedError("Color not specified");
            }

            // get color signature
            const theColors = args[1];

            // if it requested a list
            if(theColors === "list"){
                let text = "";

                // from consoleColors
                for(const [code, color] of Object.entries(consoleColors)){
                    text += `* ${code} -> ${color}TEXT${consoleColors.Reset}\n`
                }  

                // from minecraftColorPallete short codes
                for(const [code, color] of Object.entries(minecraftColorPallete)){
                    text += `* ${code} -> ${color}TEXT${consoleColors.Reset}\n`
                }     

                return text;
            }

            // flags
            let stripOfAnsi: boolean = false;
            let addResetCode: boolean = false;

            // splits by special character or /
            const colorList: string[] = theColors.split(/[§\/]/);

            // ansi color data to be added at the start (prepare the empty string for later)
            let colorData: string = "";

            // for every code that was requested
            for(const color of colorList){
                // @ -> RGB  | @R.G.B
                if(color[0] === "@"){
                    let parts: string[]; // the parts
                    let bg: boolean; // whether that is a background

                    // check whether it requested a background
                    if(color[1] === "^"){
                        parts = color.slice(2).split(".");
                        bg = true;
                    }
                    else{
                        parts = color.slice(1).split(".");
                        bg = false;
                    }

                    // get parts
                    const r = Number(parts[0]);
                    const g = Number(parts[1]);
                    const b = Number(parts[2]);

                    // check bounds
                    if(
                        isNaN(r) || isNaN(g) || isNaN(b)
                        || r > 255 || g > 255 || b > 255
                    ){
                        return expectedError("unknown color: " + color);
                    }
                    
                    // generate a color data
                    if(bg){
                        colorData += ansiEscape + `[48;2;${r};${g};${b}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;2;${r};${g};${b}m`;
                    }

                    continue;
                }

                // # -> HEX -> DEC RGB  | #RRGGBB OR #RGB
                if(color[0] === "#"){
                    let withoutFirst: string; // the part to be parsed
                    let bg: boolean; // whether that is a background

                    // check whether it is a background
                    if(color[1] === "^"){
                        withoutFirst = color.slice(2);
                        bg = true;
                    }
                    else{
                        withoutFirst = color.slice(1);
                        bg = false;
                    }

                    // check bounds
                    if(withoutFirst.length !== 3 && withoutFirst.length !== 6){
                        return expectedError("unknown color: " + color);
                    }

                    // support shorter codes
                    if (withoutFirst.length === 3) {
                        withoutFirst = withoutFirst.split('').map(c => c + c).join('');
                    }

                    // prepare rgb values
                    const r = parseInt(withoutFirst.slice(0, 2), 16);
                    const g = parseInt(withoutFirst.slice(2, 4), 16);
                    const b = parseInt(withoutFirst.slice(4, 6), 16);

                    
                    // generate a color data
                    if(bg){
                        colorData += ansiEscape + `[48;2;${r};${g};${b}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;2;${r};${g};${b}m`;
                    }

                    continue;
                }

                // $ -> 256 ansi color mode  | $NUMBER
                if(color[0] === "$"){
                    let withoutFirst: string; // the part to be parsed
                    let bg: boolean; // whether it is a background

                    // check whether it is a background
                    if(color[1] === "^"){
                        withoutFirst = color.slice(2);
                        bg = true;
                    }
                    else{
                        withoutFirst = color.slice(1);
                        bg = false;
                    }

                    // check bounds (nothing's there)
                    if(withoutFirst.length === 0){
                        return expectedError("unknown color: " + color);
                    }

                    // get a number from that
                    const toUse = Number(withoutFirst);

                    // check bounds again
                    if(isNaN(toUse) || toUse > 255){
                        return expectedError("unknown color: " + color);
                    }

                    // generate a color code
                    if(bg){
                        colorData += ansiEscape + `[48;5;${toUse}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;5;${toUse}m`;
                    }

                    continue;
                }


                // strip character
                if(color === "!"){
                    stripOfAnsi = true;
                    continue;
                }

                // reset code character
                if(color === "?"){
                    addResetCode = true;
                    continue;
                }

                // if that's not a color from standard consoleColors
                if(!Object.hasOwn(consoleColors, color)){
                    let successful: boolean = true;

                    // loop through every character
                    for(let i = 0; i < color.length; i++){
                        // strip character
                        if(color[i] === "!"){
                            stripOfAnsi = true;
                            continue;
                        }

                        // reset code character
                        if(color[i] === "?"){
                            addResetCode = true;
                            continue;
                        }

                        // if that's from a color pallete
                        if(!Object.hasOwn(minecraftColorPallete, color[i])){
                            successful = false; // inform the rest of the code that we found a code
                            break;
                        }

                        // add new data to the colorData
                        colorData += minecraftColorPallete[color[i]];

                    }

                    // if the previous stuff was successfull, then go to the next code
                    if(successful) continue;

                    // if it was however not, print an error
                    return expectedError("Undefined color: " + color);
                }

                // add colorData from consoleColors, because if the previous if was a false, then it has to exist
                colorData += consoleColors[color as keyof typeof consoleColors];
            }


            const AllOfthem: string[] = []; // stuff that'll be returned

            // for every argument that was passed there except for the name and the color
            for(let i = 2; i < args.length; i++){
                // if that's not a string, don't care
                if(typeof args[i] !== "string") continue;

                // colorize them!
                AllOfthem.push(
                    colorData + // that colordata
                    (
                        stripOfAnsi ? stripVTControlCharacters(args[i]) : args[i]
                    ) // text
                    + (
                        addResetCode ? consoleColors.Reset : ""
                    ) // reset code?
                );
            }

            
            
            // just return it!
            return cleanReturner(AllOfthem);
    }                
}, ["clr"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};