
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


const commandTable = quickCmdWithAliases("open", {
        usageinfo: "open <file> [<-w>] [<-b>] [<-a>]",
        desc: "opens a file in a default program",
        longdesc: multiLineConstructor(
            "opens a file in a default program",
            "",
            "-w -> wait for a program to exit",
            "-b -> open in background (macOs only)",
            "-a -> allow for every code to exit successfully (instead of generating an error)",
            "",
            "NOTE: some antiviruses may block that command!"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["file", "filesystem", "default", "open"],
        async: true,
        minver: 1.35,
        async callback(preargs: any[]): Promise<any>{
            const args = smartArgs(preargs, this);

            const wait: boolean = args.dashCombined.includes("w");
            const background: boolean = args.dashCombined.includes("b");
            const everyexit: boolean = args.dashCombined.includes("a");

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

            const chunks: Buffer[] = [];
            let handler;
            try {
                handler = await openApp(path, {wait, background, allowNonzeroExitCode: everyexit});   
                
                
                handler.stdout?.on("data", (data) => {
                    chunks.push(data);
                });
            } catch (error) {
                return expectedError("The program had an issue");
            }


            const buf = Buffer.concat(chunks);

            if(!buf || buf.length === 0){
                return;
            }

            return buf;


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
}, ["xdg-open"]);

export {commandTable};