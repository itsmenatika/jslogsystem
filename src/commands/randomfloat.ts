import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { expectedError } from "../apis/allApis.js";
import { multiLineConstructor } from "../texttools.js";

const commandTable = quickCmdWithAliases("randomfloat", {
        usageinfo: "randomfloat <from> <to> | random <to>",
        desc: "generates a random number in specified range",
        longdesc: multiLineConstructor(
            "generates a random number",
            "randomfloat <from> <to> | random <to>"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        minver: 1.35,
        categories: ["generator", "random", "number"],
        async callback(preargs: string[]){
        const args = removeInternalArguments(preargs);

        if(args.length === 3){
            const first = Number(args[1]);
            const second = Number(args[2]);

            if(isNaN(first) || isNaN(second)){
                return expectedError("The command couldn't convert the range to numbers");
            }

            return Math.random() * (second - first + 1) + first;
        }
        else if(args.length === 2){
            const second = Number(args[1]);

            if(isNaN(second)){
                return expectedError("The command couldn't convert the range to numbers");
            }


            return Math.random() * (second + 1);

        }
        else{
            return expectedError("correct usage: random <from> <to> or random <to>");
        }


    }                
}, ["rndflt"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};