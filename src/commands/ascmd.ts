
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
import { openApp } from "open";
import Stream, { Writable } from "node:stream";
import { commandInternalExec } from "../apis/commands/commandExecute.js";
import { logNode } from "../log.js";


const commandTable = quickCmdWithAliases("ascmd", {
        usageinfo: "ascmd <...comand>",
        desc: "uses provided data as a command and executes it",
        longdesc: multiLineConstructor(
        
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["command", "unsafe", "terminal"],
        async: true,
        minver: 1.35,
        async callback(preargs: any[]): Promise<any>{
            const args = removeInternalArguments(preargs);

            const node = new logNode("ascmd", this.logNode);


            const rawText: string = args.slice(1).join(" ");

            const toExec = await commandInternalExec(
                `echo -- \"${rawText.replace("\"", "\\\"")}\"`,
                {silent: true, terminal: this.sessionName, noPrintResult: true, thereIsMore: false}
            );



            let res;
            try {               
                res = await commandInternalExec(toExec, {
                    logNode: node,
                    onlyReturn: false,
                    silent: false,
                    terminal: this,
                });
                
            } catch (error) {
                return expectedError("Command couldn't execute a command pipeline properly: " + error);
            }


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
}, ["runcommand", "runcmd", "ascommand"]);

export {commandTable};