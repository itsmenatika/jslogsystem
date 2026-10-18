import { commandContext } from "../apis/commands/types.js";
import { cd, cdDummy, getCwdToShowFromString, isAccessPossible } from "../apis/commands/osApis/filesystem.js";
import { log, LogType } from "../log.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiLineConstructor } from "../texttools.js";
import { askForEnvApi, expectedError, expectedErrorType } from "../apis/allApis.js";
import { dirname, join } from "path";
import { rm, stat, unlink } from "fs/promises";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { askQuestion } from "../apis/terminal/asker.js";

const commandTable = quickCmdWithAliases("remove", {
    usageinfo: "remove [<-r>] [<-f>] [<-v>] [<-i>] [<-I>] <...files>",
    desc: "allows you to delete files and directories",
    longdesc: multiLineConstructor(
        "allows you to delete files and directories",
        "",
        "-r -> recursive (required for directories)",
        "-f -> force",
        "-v -> verbose (tell everything)",
        "-i -> ask per file",
        "-I -> ask once before doing"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["environment", "filesystem", "file", "directory"],
    async: true,
    async callback(presArgs: any[]){
        const args = smartArgs(presArgs, this);

        const recursive = args.dashCombined.includes("r");
        const force = args.dashCombined.includes("f");
        const verbose = args.dashCombined.includes("v");
        const perfile = args.dashCombined.includes("i");
        const once = args.dashCombined.includes("I");

        if(once){
            const res = await askQuestion(this, `are you sure about deleting ${args.argsWithoutArguments.join(", ")}? y/n  `);
            if(!res){
                return expectedError("terminated");
            }
        }

        const g = new multiDisplayer();
        for(const one of args.argsWithoutArguments){
            if(typeof one === "string"){
                let where: string = one;
                try {
                    where = cdDummy(this, one);
                    if(perfile){
                        const res = await askQuestion(this, `are you sure about deleting: '${getCwdToShowFromString(this, where)};? y/n  `);

                        if(!(["y", "yes", "ya"].includes(res.toLowerCase()))) continue;
                    }

                    await isAccessPossible(this, one);
                    const stats = await stat(where);
                    if (stats.isDirectory()) {
                        if(!recursive){
                            if(verbose || !force){
                                g.push(getCwdToShowFromString(this, where));
                                g.push(" WASN'T DELETED (it's directory)\n");   
                                continue;                             
                            }
                        }

                        await rm(where, { recursive: recursive, force: force });
                    } else {
                        await unlink(where);
                    }

                    if(verbose){
                        g.push(getCwdToShowFromString(this, where));
                        g.push(" DELETED\n");
                    }
                } catch (error) {
                    if(verbose || !force){
                        g.push(getCwdToShowFromString(this, where));
                        g.push(" WASN'T DELETED\n");    
                        continue;              
                    }
                }
            }
        }

        return g.getWhole();

    }
}, ["rem", "rm", "rmdir", "del", "delete"])


const compounds = cmdTableToCommandCompounts(commandTable);


export {commandTable, compounds};