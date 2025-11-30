import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("objecttoarray", {
    usageinfo: "objecttoarray <...data>",
    desc: "transforms object into arrays",
    longdesc: multiLineConstructor(
        "It extracts certain data from objects",
        "if more than one object is passed, then they'll be combined into one.",
        "",
        "NOTE: The more latest object, the higher precendence it will have while choosing which data to use",
        "",
        "Identifactors will be added synchronously from the left to the right",
        "",
        "",
        "Every string (identifcators) is treated as the entry of the main object to add into an array",
        "Every object will add its data to the main object",
        "",
        "undefined will be produced if there is not specified data",
        "",
        "§ can be used to traverse through data",
        "",
        "NOTE: if multiple objects are provided, then it may get very flattened!"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
       const args = smartArgs(preargs, this);

       const objToParse: Record<string, any> = {};
       const toRet: any[] = [];

       for(const arg of args.args){
            if(typeof arg === "object"){
                Object.assign(objToParse, arg);
            }
       }

    //    const toRet: any[] = [];
    // console.log(objToParse);

       for(const arg of args.args){
            if(typeof arg === "string"){
                const pathList: string[] = arg.split("§");

                let cur = objToParse;
                for(const one of pathList){
                    cur = cur[one];
                    if(cur === undefined) break;
                }

                toRet.push(cur);
            }
       }

       return toRet;
    }
}, ["objtar"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};