import { commandContext } from "../apis/commands/types";
import { cd } from "../apis/commands/osApis/filesystem.js";
import { log, LogType } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiLineConstructor } from "../texttools.js";

const commandTable = quickCmdWithAliases("cd", {
    usageinfo: "cd [<directory>]",
    desc: "managing the cwd of the current session",
    longdesc: multiLineConstructor(
        "managing the cwd of the current session",
        "",
        "allows you to set the current cwd if the argument is provided",
        "it will use all string arguments",
        "",
        "returns the current cwd"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["filesystem"],
    callback(preArgs: any[]): string | undefined{
        const args = smartArgs(preArgs, this);

        if(args.args.length === 0){
            return this.cwd;
        }

        let loc
        try {
            loc = cd(this, args.args);
        } catch (error) {
            log(LogType.ERROR, "couldn't enter the directory", this.logNode);
            return undefined;
        }


        return loc;
    }
}, ["pwd", "cwd"])


const compounds = cmdTableToCommandCompounts(commandTable);


export {commandTable, compounds};