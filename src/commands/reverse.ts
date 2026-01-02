import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("reverse", {
    usageinfo: "reverse <...data>",
    desc: "reverses the data order (parameters)",
    longdesc: multiLineConstructor(
        "reverses the data order (parameters)",
        "",
        "examples:",
        "reverse 2 5 -> 5 2",
        "revers 52 1 55 242 12 -> 12 242 55 1 52",
        "",
        "you can also reverse string by using another command: 'parameter $..^'"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["manipulation", "argument", "pipe"],
    callback(args: any[]): any{
        return args.slice(1).toReversed();
    }
}, ["revr"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};