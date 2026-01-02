import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("spacetoarguments", {
    usageinfo: "spacetoarguments <...data>",
    desc: "splits strings into multiple arguments by space",
    longdesc: multiLineConstructor(
        "splits strings into multiple arguments by space",
        "",
        "It is a very fast command and can be used with echo to create advanced argument chains",
        "everything is preserved. Including dashed arguments",
        "",
        "examples:",
        `spacetoarguments "meow da" -> 'meow' 'da'`
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["argument", "pipe", "text", "generator", "manipulation"],
    callback(args: any[]): any{
        const toRet: Array<any> = [];

        for(let i = 1; i < args.length; i++){
            const obj = args[i];

            if(typeof obj === 'string'){
                toRet.push(
                    ...(obj.split(" "))
                );
                continue;
            }

            toRet.push(obj);
        }


        return toRet;
    }
}, ["spctargs"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};