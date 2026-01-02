import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("number", {
    usageinfo: "number [...<number>]",
    desc: "creates a number",
    longdesc: "creates a number from provided numbers. If multiple ones are provided, all of them are summed. It supports negative numbers with ! or - as prefix. ",
    hidden: false,
    changeable: false,
    categories: ["generator", "creator", "pipe", "number"],
    callback(preArgs: string[]): any{
        const s = smartArgs(preArgs, this);

        let sum = 0;
        for(const som of s.args){
            if(som[0] === "!"){
                sum += -Number(som.slice(1))
            }
            else{

                sum += Number(som);
            }
        }

        return sum;
    }
}, ["num", "sum"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};