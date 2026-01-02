import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("arguments", {
    usageinfo: "arguments [<data>]",
    desc: "returns all arguments provided",
    longdesc: "returns all arguments provided",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: any[]): any{
        return args;
    },
    categories: ["argument", "pipe"]
}, ["args"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};