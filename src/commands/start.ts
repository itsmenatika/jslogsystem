
import { access, readFile } from "node:fs/promises";
import { cdDummy, commandContext } from "../apis/allApis.js";
import { expectedError, onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { askQuestion } from "../apis/terminal/asker.js";
import { execFile, execSync, spawnSync } from "node:child_process";


const commandTable = quickCmdWithAliases("start", {
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
            const args = smartArgs(preargs, this);

            if(args.argsWithoutArguments.length === 0){
                return expectedError("SYNTAX ERROR");
            }

            if(typeof args.argsWithoutArguments[0] !== "string"){
                return expectedError("The path is expected to be of type string");
            }

            const programName: string = args.argsWithoutArguments[0].trim();

            let path: string;
            try {
                path = cdDummy(this, programName);
            } catch (error) {
                return expectedError("The program tried to exit the outside directory");
            }

            // try {
            //     await access(path);
            // } catch (error) {
            //     return expectedError("The file to start is not available");
            // }

            let ret;

            ret = spawnSync(programName);

            return ret;
            


            // for(const one of args.argsWithoutArguments){
            //     if(one && typeof one === "string"){
            //         const trimmed: string = one.trim();

            //         if(trimmed.length === 0) continue;

            //         let path: string;
            //         try {
            //             path = cdDummy(this, trimmed);
            //         } catch (error) {
            //             return expectedError("The command tried to exit the working directory");
            //         }

            //         programsToRun.push(path);


            //     }
            // }

            // for(const pathToPorgram of programsToRun){
            //     spawnSync(pathToPorgram);
            // }



        }               
}, []);

export {commandTable};