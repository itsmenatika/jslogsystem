import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("true", {
    usageinfo: "true",
    desc: "outputs true",
    longdesc: "outputs true. basically returns true, no matter what",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["generator", "creator", "pipe"],
    callback(args: any[]): any{
        return true;
    }
}, ["True", "!!"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};