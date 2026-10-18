import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { cdDummy, expectedError } from "../apis/allApis.js";
import { multiLineConstructor } from "../texttools.js";
import { cleanReturner } from "../tools/cleanReturner.js";
import { readFile } from "fs/promises";

const commandTable = quickCmdWithAliases("wc", {
        usageinfo: "wc [<-l>] [<-L>] [<-w>] [<-c>] [<-m>] [<-t>] [<-i>] [<-o>] [<--encoding encoding>] <...files or data>",
        desc: "counts stuff",
        longdesc: multiLineConstructor(
            "allows you to count things from files or input",
            "",
            "-l -> count lines",
            "-L -> get the length of the longest line",
            "-w -> count words",
            "-c -> count bytes",
            "-m -> count characters",
            "-t -> force additional \"total\" entry that doesn't show if there was only one other entry",
            "-i -> interpret arguments as text to count, not file names",
            "-o -> return object instead of string list",
            "",
            "--encoding ENCODING sets encoding (it defaults to utf8)"
        ),
        hidden: false,
        changeable: false,
        async: true,
        isAlias: false,
        minver: 1.35,
        categories: ["text", "filesystem", "count", "pipes", "manipulation"],
        async callback(preargs: string[]){
           const args = smartArgs(preargs, this);

            const countLines: boolean = args.dashCombined.includes("l");
            const countLongestLine: boolean = args.dashCombined.includes("L");
            const countWords: boolean = args.dashCombined.includes("w");
            const countBytes: boolean = args.dashCombined.includes("c");
            const countChars: boolean = args.dashCombined.includes("m");
            const forceTotal: boolean = args.dashCombined.includes("t");
            const inputAsFiles: boolean = args.dashCombined.includes("i");
            const encoding: BufferEncoding  = args.argsWithDoubleDash['encoding'] || "utf8";

            const returnObj: boolean = args.dashCombined.includes("o");

            let wordCount: number = 0;
            let lineCount: number = 0;
            let byteCount: number = 0;
            let charCount: number = 0;
            let longestLineCount: number = 0;
            let allStuff: number = 0;


            const countObj: Record<string, Record<string, number>> = {};

            if(inputAsFiles){
                const input = args.argsWithoutArguments;
                allStuff += input.length;

                let i: number = 1;
                for(const one of input){
                    
                    const data = Buffer.from(one);

                
                    const tempObj: Record<string, number> = {};
                    
                    if(countBytes){
                        tempObj['bytes'] = data.byteLength;
                        byteCount += data.byteLength;
                    }

                    const strBuf = data.toString(encoding);


                    if(countChars){
                            tempObj['chars'] = strBuf.length;
                            charCount += tempObj['chars'];
                    }

                    if(countWords){
                            tempObj['words'] = strBuf.split(/\w/).length;
                            wordCount += tempObj['words'];
                    }

                    if(countLines || countLongestLine){
                            const lines = strBuf.split(/\n/);

                            if(countLongestLine){
                                const longest: number = Math.max(...lines.map((line) => line.length));

                                tempObj['longestLine'] = longest;
                                if(longest > longestLineCount) longestLineCount = longest;
                            }

                            if(countLines){
                                tempObj['lines'] = lines.length;
                                lineCount += tempObj['lines'];
                            }


                            // tempObj['lines'] = strBuf.split(/\n/).length;
                            // lineCount += tempObj['lines'];               
                    }

                    countObj["arg" + i] = tempObj;
                }
            }
            else{
                const files = args.argsWithoutArguments;
                allStuff += files.length;

                for(const file of files){
                    if(typeof file !== "string") return expectedError("The command tried to use not a string type as a path");

                    let path: string;

                    try {
                        path = cdDummy(this, file);
                    } catch (error) {
                        return expectedError("The program tried to exit the outside directory");
                    }

                    const tempObj: Record<string, number> = {};

                    const data = await readFile(path);
                
                if(countBytes){
                    tempObj['bytes'] = data.byteLength;
                    byteCount += data.byteLength;
                }

                const strBuf = data.toString(encoding);


                if(countChars){
                        tempObj['chars'] = strBuf.length;
                        charCount += tempObj['chars'];
                }

                if(countWords){
                        tempObj['words'] = strBuf.split(/\w/).length;
                        wordCount += tempObj['words'];
                }

                if(countLines || countLongestLine){
                        const lines = strBuf.split(/\n/);

                        if(countLongestLine){
                            const longest: number = Math.max(...lines.map((line) => line.length));

                            tempObj['longestLine'] = longest;
                            if(longest > longestLineCount) longestLineCount = longest;
                        }

                        if(countLines){
                            tempObj['lines'] = lines.length;
                            lineCount += tempObj['lines'];
                        }


                        // tempObj['lines'] = strBuf.split(/\n/).length;
                        // lineCount += tempObj['lines'];               
                }

                countObj[file] = tempObj;
                }

            }





            if(forceTotal || allStuff > 1){
                countObj['total'] = {};
    
                if(countWords) countObj['total']['words'] = wordCount;
                if(countLines) countObj['total']['lines'] = lineCount;
                if(countBytes) countObj['total']['bytes'] = byteCount;
                if(countChars) countObj['total']['chars'] = charCount;
                if(countLongestLine) countObj['total']['longestLine'] = longestLineCount;
            }

            if(returnObj)
            return countObj;


            let retStr: string = "";


            for(const [name, data] of Object.entries(countObj)){
                retStr += `${data['lines'] ? data['lines'] + " ": " "}${data['longestLine'] ? data['longestLine'] + " ": " "}${data['words'] ? data['words'] + " " : ""}${data['bytes'] ? data['bytes'] : " "}${data['chars'] ? data['chars'] : " "}  ${name}\n`;
            }

            return retStr;




    }                
}, ["wordcount"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};