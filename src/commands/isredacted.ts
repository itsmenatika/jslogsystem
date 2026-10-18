import { removeInternalArguments } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("isredacted", {
    usageinfo: "true",
    desc: "outputs true if redacted",
    longdesc: "outputs true if something of that is redacted",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["if", "pipe"],
    callback(args: any[]): any{
        
        let isRed: boolean = false;

        for(const arg of args){
            if(arg === "[REDACTED]"){
                isRed = true;
                break;
            }
        }


        return isRed;

    }
}, ["isrd"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};