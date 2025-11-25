import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("nil", {
    usageinfo: "nil",
    desc: "eats the whole input and outputs nothing",
    longdesc: "eats the whole input and outputs nothing. Basically returns undefined, no matter what",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: any[]): any{
        return undefined;
    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};