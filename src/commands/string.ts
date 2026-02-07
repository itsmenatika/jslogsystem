import { smartArgs } from "../tools/argsManipulation.js";
import { cleanReturner } from "../tools/cleanReturner.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("string", {
    usageinfo: "string [<...data>]",
    desc: "try to force the output to a string",
    longdesc: "try to force the output to a string. It ignores dashed and double dashed parameters",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["parser", "generator", "text"],
    async: true,
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs, this);
        const toReturn: any[] = [];


        for(const obj of args){
            await convertCurObj(obj, toReturn);
            // if(typeof obj === "object"){
            //     if(Array.isArray(obj)){
            //         for(const one of obj){

            //         }
            //     }
            // }

            // if(obj instanceof Blob){
            //     toReturn.push(obj.text());
            // } else
            // toReturn.push(String(obj));
        }

        // console.log(args.args, args.length, toReturn, PreArgs);

        return cleanReturner(toReturn);
    }
}, ["str", "tostring", "tostr"])


async function convertCurObj(obj: any, toReturn: string[]){
    switch(typeof obj){
        case "object": {
            if(Array.isArray(obj)){
                for(const one of obj){
                    convertCurObj(one, toReturn);
                }
            }
            else if(obj instanceof Blob){
                toReturn.push(await obj.text());
            }
            else if(obj instanceof Buffer){
                toReturn.push(obj.toString());
            }
            else{
                toReturn.push(String(obj));
            }

            break;
        }

        case "string":
            toReturn.push(obj);
            break;
        
        default:
            toReturn.push(String(obj));

        
    }
}

const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};