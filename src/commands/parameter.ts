import { pipeHalt } from "../apis/allApis.js";
import { log, LogType } from "../log.js";
import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("parameter", {
    usageinfo: "parameter <IDENTIFICATOR> <...data>",
    desc: "returns only specified parameter",
    longdesc: multiLineConstructor(
        "extracts only especified parameter provided to that function",
        "",
        "a number just adds that number",
        "if there is no such thing in arguments, undefined is provided",
        "FIRST..SECOND SPECIFIES A RANGE. SLASH CAN BE USED TO COMBINE SECTIONS",
        "",
        "special characters can be used instead of numbers:",
        "e/^ -> the length of the array (so the last one)",
        "s/$ -> the first argument (so 1),",
        "c -> the very first argument (so 0, so basically also the name by which it was called)",
        "m -> the middle (it is floored to the nearest integer)",
        "n -> the middle (it is ceiled to the nearest integer)",
        "r -> to get a random number in the bounds of an array size",
        "q -> to get a unique random number in the bounds of an array size. If no unique number can be found, undefined will be returned and section ignored"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["argument", "pipe", "manipulation"],
    callback(preargs: any[]): any{
        const args = removeInternalArguments(preargs);

        if(!(args.length > 1)){
            return "USAGE: parameter <IDENTIFICATOR> <...data>";
        }

        const ident = String(args[1]).trim();

        // const rest = args.slice(2);

        const toUse = [args[0], ...args.slice(2)];
        const toRet = [];

        const data = {unique: []};

        for(let i = 1; i < toUse.length; i++){
            // shut up typescript
            // @ts-expect-error
            data.unique.push(i);
        }

        for(const section of ident.split("/"))
        {
            const parts = section.split("..");

            if(parts.length == 1){
                const n = parseIdent(parts[0], toUse, data);
                if(n === undefined) continue;
                toRet.push(toUse[n]);
            }
            else if(parts.length == 2){
                const start = parseIdent(parts[0], toUse, data);
                

                const end = parseIdent(parts[1], toUse, data);

                if(end === undefined || start === undefined) continue;

                if(end >= start)
                toRet.push(...toUse.slice(start, end+1));
                else
                toRet.push(...toUse.slice(end, start+1).toReversed());
            }
            else if(parts.length != 0){
                log(LogType.ERROR, `It was not possible to parse range '${section}'!`);
                return pipeHalt();
            }    
        }

        return toRet;   
    }
}, ["par"]);

function parseIdent(ident: string, toUse: any[], data: Record<string, any>){
    switch(ident.toLowerCase()){
        case "e":
        case "^":
            return toUse.length;
        case "s":
        case "$":
            return 1;
        case "c":
            return 0;
        case "m":
            return Math.floor(toUse.length / 2);
        case "n":
            return Math.ceil(toUse.length / 2);
        case "r":
            return Math.floor(Math.random() * toUse.length);
        case "q":
            if(data.unique.length == 0) return undefined;

            const which = Math.floor(Math.random() * data.unique.length);
            const d = data.unique[which];
            data.unique = [...data.unique.slice(0, which), ...data.unique.slice(which + 1)];

            // console.log(d, which, data.unique.length);



            return d;

            // if(data.unique.length === toUse.length) return undefined;



            // let tries = 1000000;
            // while(true && tries > 0){
            //     let toTest =  Math.ceil(Math.random() * toUse.length);

            //     if(data.unique.includes(toTest)){
            //         tries--;
            //         continue;
            //     }

            //     data.unique.push(toTest);

            //     return toTest;
            // }

            // return undefined;

        
        default:
            return Number(ident);
    }
}


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};