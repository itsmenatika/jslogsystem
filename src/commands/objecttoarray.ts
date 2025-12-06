import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("objecttoarray", {
    usageinfo: "objecttoarray <...data>",
    desc: "transforms object into arrays",
    longdesc: multiLineConstructor(
        // "It extracts certain data from objects",
        // "if more than one object is passed, then they'll be combined into one.",
        // "",
        // "NOTE: The more latest object, the higher precendence it will have while choosing which data to use",
        // "",
        // "Identifactors will be added synchronously from the left to the right",
        // "",
        // "",
        // "Every string (identifcators) is treated as the entry of the main object to add into an array",
        // "Every object will add its data to the main object",
        // "",
        // "undefined will be produced if there is not specified data",
        // "",
        // "§ can be used to traverse through data",
        // "",
        // "NOTE: if multiple objects are provided, then it may get very flattened!"
        "it extracts certain data from objects",
        "",
        "by default every passed object will be treated with the same parameters, resulting in multiple arrays",
        "if you don't want it use -f flag to flatten the objects into one before",
        "",
        "Every string (identifactor) is treated as the entry of to add to the array",
        "",
        "§ can be used to traverse through data",
        "for example: users§name",
        "",
        "undefined will be produced if there wasn't an entry"

    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
       const args = smartArgs(preargs, this);

       const objectFlattening = args.dashCombined.includes("f");

       const objToParse: Record<string, any> = {};
       const parseObjList : Object[] = [];
        const argsToExtract: Array<Array<string | number>> = [];

       let toRet: any[] = [];
       

       for(const arg of args.argsWithoutArguments){
            if(typeof arg === "object"){
                if(objectFlattening)
                    Object.assign(objToParse, arg);
                else
                    parseObjList.push(arg);
            }
            else if(typeof arg === "string"){
                
                argsToExtract.push(arg.split("§"));
            }
            else if(typeof arg === "number"){
                argsToExtract.push([arg]);
            }
       }

       if(objectFlattening){
            for(const arg of argsToExtract){
                let cur = objToParse;
                for(const one of arg){
                    cur = cur[one];
                    if(cur === undefined) break;
                }

                toRet.push(cur);
            }
       }
       else{
            for(const obj of parseObjList){
                let toAdd = [];
                for(const arg of argsToExtract){
                    let cur = obj;
                    for(const one of arg){
                        // @ts-expect-error
                        cur = cur[one];
                        if(cur === undefined) break;
                    }

                    toAdd.push(cur);
                } 

                if(toAdd.length == 1){
                    toRet.push(toAdd[0]);
                }
                else
                toRet.push(toAdd);
            }
       }

       if(toRet && Array.isArray(toRet) && !objectFlattening && toRet.length == 1 && Array.isArray(toRet[0])){
            toRet = toRet[0];
       }

        if(toRet.length == 1) return toRet;
        else if(toRet.length == 0) return undefined;
        return toRet;
    }
}, ["objtar"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};