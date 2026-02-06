import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { expectedError } from "../apis/allApis.js";
import { multiLineConstructor } from "../texttools.js";

const commandTable = quickCmdWithAliases("base64", {
        usageinfo: "base64 [<-e | -d>] <data...>",
        desc: "encodes and decodes base64 encoding",
        longdesc: multiLineConstructor(
            "encodes and decodes base64 encoding",
            "",
            "use -d to decode (default) or -e to encode"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["generator", "text", "creator", "manipulation", "encoding"],
        callback(preargs: string[]){
            const args = smartArgs(preargs, this);

            const isDecode = args.dashCombined.includes("d");
            const isEncode = args.dashCombined.includes("e");

            if(isDecode && isEncode){
                return expectedError("-b and -e are exclusive");
            }

            let toRet: string[] = [];

            for(const one of args.argsWithoutArguments){
                if(typeof one !== "string") continue;


                if(isEncode){
                    toRet.push(
                        Buffer.from(one).toString("base64")
                    );
                }
                else{
                    toRet.push(
                        Buffer.from(one, 'base64').toString()
                    );
                }
            }
            
            

            if(toRet.length === 0) return undefined;
            else if(toRet.length === 1) return toRet[0];
            return toRet;
            // }
    }                
}, ["b64", "bs64"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};