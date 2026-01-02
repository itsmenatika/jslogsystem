import { askForBindApi } from "../apis/commands/bindApi.js";
import { askForCommandApi, commandtypes } from "../apis/commands/commandApis.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("exists", {
    usageinfo: "exists [<args...>] [<commands...>]",
    desc: "checks whether something exists in the namespace",
    longdesc: multiLineConstructor(
        "checks whether something exists in the namespace",
        "",
        "-x to check for everything",
        "-a to check for aliases",
        "-o to check for orginal commands (not aliases)",
        "-c to check for any command (it's -a and -o combined)",
        "-b to check for binds"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["commands", "bind", "terminal", "session", "environment", "shell"],
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);

        const cmdApi = askForCommandApi(this);
        const bindApi = askForBindApi(this);
        const anyExists = args.dashCombined.includes("x");

        let toRet: boolean = false;

        if(args.dashCombined.includes("c") || anyExists){
            for(const cmd of args.args){
                toRet ||= cmdApi.exists(cmd);
            }
        }

        if(args.dashCombined.includes("a") || anyExists){
            for(const cmd of args.args){
                 toRet ||= cmdApi.exists(cmd, commandtypes.alias);
            }
        }

        if(args.dashCombined.includes("o") || anyExists){
            for(const cmd of args.args){
                toRet ||= cmdApi.exists(cmd) && !cmdApi.exists(cmd, commandtypes.alias);
            }
        }


        if(args.dashCombined.includes("b") || anyExists){
            for(const cmd of args.args){
                toRet ||= bindApi.exits(cmd);
            }
        }


        return toRet;

    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};