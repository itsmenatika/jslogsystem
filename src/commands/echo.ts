
import { stripVTControlCharacters } from "util";
import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { ansiEscape, combineColors, consoleColor, consoleColors, minecraftColorPallete, multiLineConstructor, templateReplacer } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";


const commandTable = quickCmdWithAliases("echo", {
    usageinfo: "echo <data>",
    desc: "allows you to print on the screen with special characters",
    longdesc: multiLineConstructor(
        "allows you to print on the screen with special characters",
        "",
        "additional arguments:",
        "-r -> force to not support escape characters",
        "-n -> to add a new line to the end",
        "-c -> prints asci special characters only if it has -t special argument provided. It also tries to use legacy data to simulate -t argument. it's can be useful for coloring",
        "-o -> only uses the real -t argument and doesn't care about legacy (an option to -c)",
        "-E -> disable slashes", 
        "-L -> will add the color list to the text to show how to use it",
        "-e -> to allow all arguments to be used by $. Only the first one will be used as a template then.",
        "",
        "it supports escape characters:",
        "\\n - new line; \\t - tab; \\a - asci escape; \\xAB - insert a character by hexidecimal code, where A and B are the code",
        "\\\\ - slash that can't go into escape codes",
        "",
        "using slash without appropiate letter will cause to print that letter:",
        "\\o -> o",
        "",
        "you can use \\cC to quickly use colors, where c is the code to print",
        "",
        "it will not check whether the terminal supports colors, it's up to you",
        "",
        "§ will be used equally to \\c",
        "",
        "$N where n is a number starting from 0 will be replace with according passed parameter (passed, not provided)",
        "you can use {VARNAME} to reference variables",
        "all passed arguments will have assigned a number starting from 0",
        "you can traverse using dot symbol",
        "The final product should be a string, boolean or number. Otherwise an error will be thrown",
        "you can also access: sessionName, color, colors, mcolors, styles and specified enviromental variables"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preArgs: string[]){
        let args = smartArgs(this.providedArgs, this);
        const legacy = askForLegacy(this);

        const allArguments = args.dashCombined.includes("e");

        const raw = args.dashCombined.includes("r");
        const newline = args.dashCombined.includes("n");
        const slashes = !args.dashCombined.includes("E");

        let temp;
        if(allArguments){
            temp = smartArgs(preArgs);
        }

        let psD = allArguments ? (temp as any).argsWithoutArguments.slice(1) : this.passedData;
        if(!Array.isArray(psD)){
            psD = [psD];
        }

        let colors = false;
        if(args.dashCombined.includes("o")){
            colors = legacy.pipes && !legacy.specialArguments;
        }
        colors ||= (args.dashCombined.includes("§") || !args.dashCombined.includes("c"));

        const toparse = allArguments ? (temp as any).argsWithoutArguments[0] : args.argsWithoutArguments.filter(s => typeof s == "string").join(" ");

        if(raw) return toparse;




        const varTable: Record<string, any> = {
            sessionName: this.sessionName,
            color: consoleColors,
            mcolors: minecraftColorPallete,
            colors: this._terminalSession.config.styles.colors,
            styles: {...this._terminalSession.config.styles, colors: undefined},
            ...this._terminalSession.env
        };

        
        for(let i = 0; i < Object.keys(psD).length; i++){
            varTable[String(i) as keyof typeof varTable] = psD[i];
        }


        let text;
        try {
            text = templateReplacer(
                toparse, varTable
            );
        } catch (error) {
            if(error instanceof Error){
                return error.cause || error.message || error.name;
            }

            return error;   
        }

        // let text = "";
        // let textAr = [];
        // for(let i = 0; i < toparse.length; i++){
        //     if(toparse[i] == "§"){
        //         if(i + 1 < toparse.length){
        //             i++;
        //             if( Object.hasOwn(minecraftColorPallete, toparse[i])){
        //                 const col = minecraftColorPallete[toparse[i]];
        //                 text += col;
        //             }
        //             else{
        //                 text += "\\c" + toparse[i];
        //             }
        //         }
        //     }
        //     else if(toparse[i] == "\\" && slashes){
        //         i++;
        //         switch(toparse[i]){
        //             case "c": {
        //                 if(i + 1 < toparse.length){
        //                     i++;
        //                     if( Object.hasOwn(minecraftColorPallete, toparse[i])){
        //                         const col = minecraftColorPallete[toparse[i]];
        //                         text += col;
        //                     }
        //                     else{
        //                         text += "\\c" + toparse[i];
        //                     }
        //                 }
        //                 else text += "\\c";
        //                 break;
        //             }

        //             case "n":
        //                 text += "\n";
        //                 break;
        //             case "t":
        //                 text += "\t";
        //                 break;
        //             case "a":
        //                 text += ansiEscape;
        //                 break;
        //             case "x":
        //                 i++;
        //                 let firstChar = toparse[i];
        //                 i++;
        //                 let secondChar = toparse[i];

        //                 text += String.fromCharCode(
        //                     Number.parseInt(firstChar, 16) * 16
        //                     +
        //                     Number.parseInt(secondChar, 16)
        //                 );
        //                 break;
        //             default:
        //                 text += toparse[i];                
        //         }
        //     }
        //     else if(toparse[i] == "$"){
        //         i++;
        //         if(toparse.length > i){
        //             let sym = toparse[i];


        //             // switch(sym){
        //             //     case ".": {
        //             //         text += 
        //             //     }
        //             //     default:

        //             // }
        //             const n = Number(sym);

        //             if(n < psD.length){
        //                 text += String(psD[n]);
        //             }
        //             else{
        //                 text += "?";
        //             }
        //         }
        //         else text += "$";
        //     }
        //     else text += toparse[i];
        // }

        
        // if(args.dashCombined.includes("L")){
        //     for(const [code, color] of Object.entries(minecraftColorPallete)){
        //         text += `* ${code} -> ${color}TEXT${consoleColors.Reset}\n`
        //     }
        // }


        // consoleWrite(theString + "\n", consoleColors.FgWhite);

        if(newline) text += "\n";

        if(!colors){
            return stripVTControlCharacters(text);
        }

        return text;
    }    
}, ["ech", "text"]);

const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds}