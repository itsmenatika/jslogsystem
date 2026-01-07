import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { onlyToRedirect } from "../apis/allApis.js";

const sleep = new Promise(
    (resolve) => {
        setTimeout(resolve)
    }
);

const commandTable = quickCmdWithAliases("sleep", {
        usageinfo: "sleep <time>",
        desc: "sleeps for a certain number of miliseconds",
        longdesc: multiLineConstructor(
            "sleeps for a certain number of miliseconds",
            "",
            "sleep <time>",
            "",
            "time here is an amount of miliseconds to sleep",
            "returns 'INCORRECT NUMBER' if a number couldn't be parsed"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        async: true,
        categories: ["launcher", "shell", "terminal", "system", "time"],
        async callback(preargs: any[]){
            const args = smartArgs(preargs, this);

            let time: any = args.args[0];
            let timeFin: number;
            if(typeof time === "string"){
                if(/^\d+$/.test(time)){
                    timeFin = parseInt(time);
                }
                else{
                    return "INCORRECT NUMBER";
                }
            }
            else if(typeof time === "number"){
                timeFin = time;
            }
            else{
                return "INCORRECT NUMBER";
            }

            await new Promise((resolve) => setTimeout(resolve, timeFin));

            return onlyToRedirect(true);
        }                
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};