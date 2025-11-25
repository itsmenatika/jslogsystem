import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("string", {
    usageinfo: "string [<...data>]",
    desc: "try to force the output to a string",
    longdesc: "try to force the output to a string. It ignores dashed and double dashed parameters",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);
        const toReturn: any[] = [];


        for(const obj of args){
            toReturn.push(String(obj));
        }

        // console.log(args.args, args.length, toReturn, PreArgs);

        if(toReturn.length === 0) return undefined;
        return toReturn.length === 1 ? toReturn[0] : toReturn;
    }
}, ["str", "tostring", "tostr"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};