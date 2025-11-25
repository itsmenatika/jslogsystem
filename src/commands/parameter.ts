import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("parameter", {
    usageinfo: "parameter <IDENTIFICATOR> <...data>",
    desc: "returns only specified parameter",
    longdesc: multiLineConstructor(
        "extracts only especified parameter provided to that function",
        "",
        "A RANGE CAN BE USED: START-END, where START AND END ARE INCLUDED",
        "parameters are indexed starting at 1",
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        const args = removeInternalArguments(preargs);

        if(!(args.length > 1)){
            return "USAGE: parameter <IDENTIFICATOR> <...data>";
        }

        const ident = String(args[1]).trim();

        const rest = args.slice(2);

        const toSplit = ident.split("/");

        let end; let start;
        if(toSplit.length == 2){
            start = Number(toSplit[0]) - 1;
            end = Number(toSplit[1]) - 1;
        }
        else{
            start = Number(toSplit[0]) - 1;
            end = Number(toSplit[0]) - 1;
        }

        const toRet = rest.slice(start, end+1);
        
        if(toRet.length == 0){
            return undefined;
        }
        else if(toRet.length == 1){
            return toRet[0];
        }
        else return toRet;
    }
}, ["par"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};