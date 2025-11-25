import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("false", {
    usageinfo: "false",
    desc: "outputs false",
    longdesc: "outputs false. basically returns false, no matter what",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: any[]): any{
        return false;
    }
}, ["False", "!"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};