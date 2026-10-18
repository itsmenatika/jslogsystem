import { expectedError } from "../apis/allApis.js";
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
            const g = await convertCurObj(obj, toReturn);
            if(g){
                return g;
            }
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
            if(isTextDecoderInput(obj)){

                const decoder = new TextDecoder();
    
                const on = decoder.decode(obj);
    
                toReturn.push(on);
            }
            else if(Array.isArray(obj)){
                for(const one of obj){
                    await convertCurObj(one, toReturn);
                }
            }
            else if(obj instanceof Blob){
                toReturn.push(await obj.text());
            }
            else if(obj instanceof Buffer){
                toReturn.push(obj.toString());
            }
            else if(obj.string){
                if(typeof obj.string === "function"){
                    toReturn.push(obj.string());
                }
                else toReturn.push(obj.string);
            }
            else if(obj.toString){
                if(typeof obj.toString === "function"){
                    toReturn.push(obj.toString());
                }
                else toReturn.push(obj.toString);
            }
            else{
                try {
                    toReturn.push(String(obj));
                } catch (error) {
                    return expectedError("It was not possible to convert one of the objects to a string");
                }
            }

            break;
        }

        case "string":
            toReturn.push(obj);
            break;

        case "bigint":
            toReturn.push(obj.toString());
            break;

        case "function":
            return expectedError("functions are not supported by string command");
        case "symbol":
            return expectedError("symbols are not supported by string command");

        
        default:
            toReturn.push(String(obj));

        
    }
}

function isTextDecoderInput(x: any): boolean {
  return (
    x instanceof ArrayBuffer ||
    ArrayBuffer.isView(x) // covers all TypedArrays + Buffer
  );
}

const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};