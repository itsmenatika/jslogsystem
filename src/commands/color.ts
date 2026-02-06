import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { expectedError } from "../apis/allApis.js";
import { consoleColors, minecraftColorPallete, multiLineConstructor } from "../texttools.js";
import { cleanReturner } from "../tools/cleanReturner.js";

const commandTable = quickCmdWithAliases("color", {
        usageinfo: "color <color> [<...data>]",
        desc: "colorizes strings",
        longdesc: multiLineConstructor(
            "colorizes strings",
            "",
            "use 'color list' to list all available colors"
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

            const colorList: string[] = theColors.split("§");

            let colorData: string = "";

            for(const color of colorList){
                if(!Object.hasOwn(consoleColors, color)){

                    let s: boolean = true;
                    for(let i = 0; i < color.length; i++){
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
                    colorData + args[i]
                );
            }

            
            
            
            return cleanReturner(AllOfthem);
            // }
    }                
}, ["clr"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};