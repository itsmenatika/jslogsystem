
import { stripVTControlCharacters } from "util";
import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { ansiEscape, combineColors, consoleColor, consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const minecraftColorPallete: Record<string, consoleColor> = {
    "1": consoleColors.FgBlack,
    "2": consoleColors.FgBlue,
    "3": consoleColors.FgYellow,
    "4": consoleColors.FgMagenta,
    "5": consoleColors.FgRed,
    "6": consoleColors.FgGreen,
    "7": consoleColors.FgCyan,
    "8": consoleColors.FgGray,

    "9": consoleColors.Bright,
    "0": consoleColors.Dim,

    // "9": combineColors(consoleColors.FgBlack, consoleColors.Bright),
    // "0": combineColors(consoleColors.FgBlue, consoleColors.Bright),
    // "a": combineColors(consoleColors.FgYellow, consoleColors.Bright),
    // "b": combineColors(consoleColors.FgMagenta, consoleColors.Bright),
    // "c": combineColors(consoleColors.FgRed, consoleColors.Bright),
    // "d": combineColors(consoleColors.FgGreen, consoleColors.Bright),
    // "e": combineColors(consoleColors.FgCyan, consoleColors.Bright),
    // "g": combineColors(consoleColors.FgGray, consoleColors.Bright),    

    // "h": combineColors(consoleColors.FgBlack, consoleColors.Dim),
    // "i": combineColors(consoleColors.FgBlue, consoleColors.Dim),
    // "j": combineColors(consoleColors.FgYellow, consoleColors.Dim),
    // "k": combineColors(consoleColors.FgMagenta, consoleColors.Dim),
    // "l": combineColors(consoleColors.FgRed, consoleColors.Dim),
    // "m": combineColors(consoleColors.FgGreen, consoleColors.Dim),
    // "n": combineColors(consoleColors.FgCyan, consoleColors.Dim),
    // "o": combineColors(consoleColors.FgGray, consoleColors.Dim),  
    
    "a": consoleColors.BgBlack,
    "c": consoleColors.BgBlue,
    "d": consoleColors.BgYellow,
    "e": consoleColors.BgMagenta,
    "g": consoleColors.BgRed,
    "h": consoleColors.BgGreen,
    "j": consoleColors.BgCyan,
    "k": consoleColors.BgGray,

    "i": consoleColors.Italic,
    "v": consoleColors.Reverse,
    "u": consoleColors.Underscore,
    "s": consoleColors.strikeThrough,
    "b": consoleColors.Blink,

    "f": consoleColors.FgWhite,

    "r": consoleColors.Reset
}

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
        "$N where n is a number starting from 0 will be replace with according passed parameter (passed, not provided)"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preArgs: string[]){
        const args = smartArgs(this.providedArgs, this);
        const legacy = askForLegacy(this);

        const raw = args.dashCombined.includes("r");
        const newline = args.dashCombined.includes("n");
        const slashes = !args.dashCombined.includes("E");

        let colors = false;
        if(args.dashCombined.includes("o")){
            colors = legacy.pipes && !legacy.specialArguments;
        }
        colors ||= (args.dashCombined.includes("§") || !args.dashCombined.includes("c"));

        const toparse = args.argsWithoutDash.filter(s => typeof s == "string").join(" ");

        if(raw) return toparse;

        let text = "";
        let textAr = [];
        for(let i = 0; i < toparse.length; i++){
            if(toparse[i] == "§"){
                if(i + 1 < toparse.length){
                    i++;
                    if( Object.hasOwn(minecraftColorPallete, toparse[i])){
                        const col = minecraftColorPallete[toparse[i]];
                        text += col;
                    }
                    else{
                        text += "\\c" + toparse[i];
                    }
                }
            }
            else if(toparse[i] == "\\" && slashes){
                i++;
                switch(toparse[i]){
                    case "c": {
                        if(i + 1 < toparse.length){
                            i++;
                            if( Object.hasOwn(minecraftColorPallete, toparse[i])){
                                const col = minecraftColorPallete[toparse[i]];
                                text += col;
                            }
                            else{
                                text += "\\c" + toparse[i];
                            }
                        }
                        else text += "\\c";
                        break;
                    }

                    case "n":
                        text += "\n";
                        break;
                    case "t":
                        text += "\t";
                        break;
                    case "a":
                        text += ansiEscape;
                        break;
                    case "x":
                        i++;
                        let firstChar = toparse[i];
                        i++;
                        let secondChar = toparse[i];

                        text += String.fromCharCode(
                            Number.parseInt(firstChar, 16) * 16
                            +
                            Number.parseInt(secondChar, 16)
                        );
                        break;
                    default:
                        text += toparse[i];                
                }
            }
            else if(toparse[i] == "$"){
                i++;
                if(toparse.length > i){
                    let sym = toparse[i];


                    // switch(sym){
                    //     case ".": {
                    //         text += 
                    //     }
                    //     default:

                    // }
                    const n = Number(sym);

                    text += this.passedArgs[n];
                }
                else text += "$";
            }
            else text += toparse[i];
        }

        


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