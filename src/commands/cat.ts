
import { readFile } from "node:fs/promises";
import { cdDummy, commandContext } from "../apis/allApis.js";
import { expectedError, onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { askQuestion } from "../apis/terminal/asker.js";

async function handleInput(context: commandContext, lineNumber: number, numberLines: boolean): Promise<[number, string]>{
    const res = await askQuestion(context, "");

    const lines: string[] = res.split("\n");
    
    let data: string = "";
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        if(numberLines){
            data += `${lineNumber}  `;
            lineNumber++;
        }

        data += line + (i === lines.length - 1 ? "" : "\n");
    }

    return [lineNumber, data];
}

async function fromFile(
    context: commandContext, 
    path: string,
    lineNumber: number, numberLines: boolean
): Promise<[number, string]>{
    
    const buf = (await readFile(path)).toString();

    const lines: string[] = buf.split("\n");
    
    let data: string = "";
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        if(numberLines){
            data += `${lineNumber}  `;
            lineNumber++;
        }

        data += line + (i === lines.length - 1 ? "" : "\n");
    }

    return [lineNumber, data];  
}

const commandTable = quickCmdWithAliases("cat", {
        usageinfo: "cat <...filenames>",
        desc: "concatenates stuff",
        longdesc: multiLineConstructor(
            "a simple stream tool to join together stuff",
            "",
            "use -n -> to number lines",
            "use -a -> to do it as an array",
            "use -N -> to force a new line after every segment"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["stream", "input", "text", "manipulation"],
        async: true,
        async callback(preargs: any[]): Promise<any>{
            const args = removeInternalArguments(preargs);

            // const numberlines = args.dashCombined.includes("n");
            // const asArray = args.dashCombined.includes("a");
            // const forceNewLine = args.dashCombined.includes("N");

            let numberLines: boolean = false;
            let asArray: boolean = false;
            let forceNewLine: boolean = false;

            let data: string[] = [];
            

            let lineNumber: number = 1;
            // create data
            for(const one of args.slice(1)){
                if(!one) continue;
                if(typeof one !== "string") continue;


                switch(one){
                    case "-n": {
                        numberLines = true; break;
                    }
                    case "-a": {
                        asArray = true; break;
                    }
                    case "-N": {
                        forceNewLine = true; break;
                    }

                    case "-": {
                        try {
                            const [ln, fromInput] = await handleInput(this, lineNumber, numberLines);
                            lineNumber = ln;
                            data.push(forceNewLine ? fromInput + "\n" : fromInput);
                        } catch (error) {
                            return expectedError("Error handling standard input");
                        }       
                        break;                 
                    }
                    default: {
                        try {
                            const path = cdDummy(this, one);
                            const [ln, fromInput] = await fromFile(this, path, lineNumber, numberLines);
                            lineNumber = ln;
                            data.push(forceNewLine ? fromInput + "\n" : fromInput);
                        } catch (error) {
                            return expectedError("Error handling standard input");
                        }
                    }
                }

                // if(one === "-"){
                //     try {
                //         const [ln, fromInput] = await handleInput(this, lineNumber, numberlines);
                //         lineNumber = ln;
                //         data.push(forceNewLine ? fromInput + "\n" : fromInput);
                //     } catch (error) {
                //         return expectedError("Error handling standard input");
                //     }

                //     continue;
                // }
                // try {
                //     const path = cdDummy(this, one);
                //     const [ln, fromInput] = await fromFile(this, path, lineNumber, numberlines);
                //     lineNumber = ln;
                //     data.push(forceNewLine ? fromInput + "\n" : fromInput);
                // } catch (error) {
                //     return expectedError("Error handling standard input");
                // }
            }


            if(asArray) return data;
            else return data.join("");
        }               
}, ["concatenate", "readfiles", "readfile", "rdfl"]);

export {commandTable};