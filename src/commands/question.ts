import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { cmdTable, commandAlias, commandCompoundTableType, commandDataRegular } from "../apis/commands/types.js";
import { askQuestion } from "../apis/terminal/asker.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { clearConsole } from "../tools/clearConsole.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";



const commandTable = quickCmdWithAliases("question", {
    usageinfo: "question [<--prompt PROMPT>] <...question>",
    desc: "asks something",
    longdesc: multiLineConstructor(
        "asks user for data",
        "",
        "--prompt PROMPT -> allows to set the prompt",
        "",
        "NOTE: it uses fullController and readline interface!"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["tool", "fullcontrol"],
    async: true,
    async callback(preargs: string[]): Promise<any>{
        const args = smartArgs(preargs, this);

        const question = args.argsWithoutArguments.filter((one) => typeof one === "string").join(" ");
        const prompt = args.argsWithDoubleDash['prompt'] || undefined;

        const res = await askQuestion(this, question, {
            prompt: prompt
        });

        return res;


        
    }   
}, ["qst"]);


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds}