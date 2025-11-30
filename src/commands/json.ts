import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("json", {
    usageinfo: "json [<-c/-p>] [<...data>]",
    desc: "parses or creates json objects",
    longdesc: multiLineConstructor(
        "fetches data from the web",
        "",
        "arguments:",
        "",
        "-c -> to create an object from JSON string",
        "-p -> to parse an object into a JSON string (default)"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    async callback(preArgs: any[]): Promise<any>{
        const args = smartArgs(preArgs, this);

        const expectedToCreate = args.dashCombined.includes("c");

        const toRet = [];
        for(const one of args.argsWithoutArguments){

            try {
                let f;
                if(expectedToCreate){
                    f = JSON.parse(one);
                } 
                else{
                    f = JSON.stringify(one);
                }

                toRet.push(f);
            } catch (error) {
                throw error;
            }
        }

        if(toRet.length == 1) return toRet;
        else if(toRet.length == 0) return undefined;
        return toRet;
    }
}, ["JSON"])

const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};