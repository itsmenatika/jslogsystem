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

            if(args.length < 2){
                return expectedError("Color not specified");
            }

            const theColors = args[1];

            if(theColors === "list"){
                let text = "";

                for(const [code, color] of Object.entries(consoleColors)){
                    text += `* ${code} -> ${color}TEXT${consoleColors.Reset}\n`
                }  
                for(const [code, color] of Object.entries(minecraftColorPallete)){
                    text += `* ${code} -> ${color}TEXT${consoleColors.Reset}\n`
                }     

                return text;
            }

            let stripOfAnsi: boolean = false;
            let addResetCode: boolean = false;

            const colorList: string[] = theColors.split(/[§\/]/);

            let colorData: string = "";

            for(const color of colorList){
                if(color[0] === "@"){

                    let parts: string[];
                    let bg: boolean;
                    if(color[1] === "^"){
                        parts = color.slice(2).split(".");
                        bg = true;
                    }
                    else{
                        parts = color.slice(1).split(".");
                        bg = false;
                    }


                    const r = Number(parts[0]);
                    const g = Number(parts[1]);
                    const b = Number(parts[2]);

                    
                    if(
                        isNaN(r) || isNaN(g) || isNaN(b)
                        || r > 255 || g > 255 || b > 255
                    ){
                        return expectedError("unknown color: " + color);
                    }
                    
                    
                    if(bg){
                        colorData += ansiEscape + `[48;2;${r};${g};${b}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;2;${r};${g};${b}m`;
                    }


                    continue;
                }

                if(color[0] === "#"){
                    let withoutFirst: string;
                    let bg: boolean;
                    if(color[1] === "^"){
                        withoutFirst = color.slice(2);
                        bg = true;
                    }
                    else{
                        withoutFirst = color.slice(1);
                        bg = false;
                    }

                    if(withoutFirst.length !== 3 && withoutFirst.length !== 6){
                        return expectedError("unknown color: " + color);
                    }

                    if (withoutFirst.length === 3) {
                        withoutFirst = withoutFirst.split('').map(c => c + c).join('');
                    }

                    const r = parseInt(withoutFirst.slice(0, 2), 16);
                    const g = parseInt(withoutFirst.slice(2, 4), 16);
                    const b = parseInt(withoutFirst.slice(4, 6), 16);

                    
                    
                    if(bg){
                        colorData += ansiEscape + `[48;2;${r};${g};${b}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;2;${r};${g};${b}m`;
                    }


                    continue;
                }

                if(color[0] === "$"){
                    let withoutFirst: string;
                    let bg: boolean;
                    if(color[1] === "^"){
                        withoutFirst = color.slice(2);
                        bg = true;
                    }
                    else{
                        withoutFirst = color.slice(1);
                        bg = false;
                    }

                    if(withoutFirst.length === 0){
                        return expectedError("unknown color: " + color);
                    }

                    const toUse = Number(withoutFirst);

                    if(isNaN(toUse) || toUse > 255){
                        return expectedError("unknown color: " + color);
                    }

                    if(bg){
                        colorData += ansiEscape + `[48;5;${toUse}m`;
                    }
                    else{
                        colorData += ansiEscape + `[38;5;${toUse}m`;
                    }

                    continue;
                }


                if(color === "!"){
                    stripOfAnsi = true;
                    continue;
                }
                if(color === "!"){
                    addResetCode = true;
                    continue;
                }

                if(!Object.hasOwn(consoleColors, color)){

                    let s: boolean = true;
                    for(let i = 0; i < color.length; i++){
                        if(color[i] === "!"){
                            stripOfAnsi = true;
                            continue;
                        }
                        if(color[i] === "?"){
                            addResetCode = true;
                            continue;
                        }

                        if(!Object.hasOwn(minecraftColorPallete, color[i])){
                            s = false;
                            break;
                        }

                        colorData += minecraftColorPallete[color[i]];

                    }

                    if(s) continue;

                    return expectedError("Undefined color: " + color);
                }

                colorData += consoleColors[color as keyof typeof consoleColors];
            }


            
            const AllOfthem: string[] = [];
            for(let i = 2; i < args.length; i++){
                if(typeof args[i] !== "string") continue;

                AllOfthem.push(
                    colorData + (
                        stripOfAnsi ? stripVTControlCharacters(args[i]) : args[i]
                    )
                    + (
                        addResetCode ? consoleColors.Reset : ""
                    )
                );
            }

            
            
            
            
            return cleanReturner(AllOfthem);
            // }
    }                
}, ["clr"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};