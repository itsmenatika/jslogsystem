import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("argumentslength", {
    usageinfo: "argumentslength [<data>]",
    desc: "returns the amount of arguments provided",
    longdesc: "returns the amount of arguments provided. It counts every argument, including special ones and the command executor",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: any[]): any{
        return args.length - 1;
    }
}, ["argslen"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};