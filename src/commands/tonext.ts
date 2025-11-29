import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("tonext", {
    usageinfo: "tonext <...data>",
    desc: "passess data to the next command in the chain",
    longdesc: "passess data to the next command in the chain. It doesn't do anything. It is just to make it prettier",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: any[]): any{
        return args.slice(1);
    }
}, ["tnxt"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};