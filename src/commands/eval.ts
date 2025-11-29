import { logNode } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { consoleShortHand } from "../tools/consoleShortHand.js";
import { globalEval } from "../tools/eval.js";
import { useWith } from "../tools/useWith.js";

const commandTable = quickCmdWithAliases("eval", {
        usageinfo: "eval <code...>",
        desc: "allows you to execute javascript",
        longdesc: "it executes javascript using globalEval which means that the context is global. $newConsole exposes newConsole api regardles of the config!",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback(args: string[]): any{
            let toUse: string = "";
            const toExps: Record<string, any> = {};

            for(const cur of args.slice(1)){
                switch(typeof cur){
                    case "object":
                        Object.assign(toExps, cur);
                        break;
                    default:
                        if(cur === "-§") break;
                        toUse += cur + " ";
                }
                // if(cur === "-t") continue;

                // toUse += cur + " ";
            }

            let code = toUse.trim();
            let evalParent = new logNode("eval", this.logNode as logNode);
            // @ts-ignore
            let answer;
            useWith("using eval", () => {
                // // @ts-expect-error
                // let prev = globalThis.$newConsole;

                // globalThis.$newConsole = newConsole;

                // @ts-ignore
                let prev = globalThis.$newConsole;
                // @ts-ignore
                let prev2 = globalThis.$con;
                // @ts-ignore
                let imp = globalThis.$imp;
                // @ts-ignore
                let bargs = globalThis.$args;


                // @ts-ignore
                globalThis.$newConsole = globalThis.$con = new consoleShortHand(this.sessionName);

                // @ts-ignore
                globalThis.$imp = toExps;
                // @ts-ignore
                globalThis.$args = args;

                answer = globalEval(code);

                // @ts-ignore
                globalThis.$newConsole = prev;
                // @ts-ignore
                globalThis.$con = prev2;
                // @ts-ignore
                globalThis.$imp = imp;
                // @ts-ignore
                globalThis.$args = bargs;
                

                // globalThis.$newConsole = prev;
                // let formatedAnswer = inspect(answer, true, null, true);

                // log(LogType.INFO, `eval returned with: ${formatedAnswer}`, evalParent);
            }, evalParent as any as string, null, this.sessionName);

            return answer;
            // }
        }             
}, ["js", "javascript"])


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds};