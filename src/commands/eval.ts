import { logNode } from "../log.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { consoleShortHand } from "../tools/consoleShortHand.js";
import { globalEval } from "../tools/eval.js";
import { useWith } from "../tools/useWith.js";

const commandTable = quickCmdWithAliases("eval", {
        usageinfo: "eval <code...>",
        desc: "allows you to execute javascript",
        longdesc: multiLineConstructor(
            "it executes javascript using globalEval which means that the context is global",
            "",
            "Those variables will be temporaily exposed:",
            " * $con and $newConsole points to tool 'consoleShortHand'",
            " * $imp -> it provides access to any object provided to that command (flattened using Object.assign)",
            " * $obar -> it provides access to every object provided to that command in an array",
            " * $args -> it provides access to every arg",
            " * $sessionName -> the session name",
            " * $logNode -> it provides the base for log nodes",
            " * $cwd -> it provides current working directory",
            " * $provided -> it provides the provided argument array",
            " * $passed -> it provides the passed argument array",
            "",
            " * $old -> provides the orginal variables listed here"
        ),

        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["shell", "terminal", "environment", "system", "javascript", "unsafe"],
        callback(args: string[]): any{
            let toUse: string = "";
            const toExps: Record<string, any> = {};
            const obar: Array<object> = [];

            for(const cur of args.slice(1)){
                switch(typeof cur){
                    case "object":
                        if(!cur) break;

                        Object.assign(toExps, cur);
                        obar.push(cur);
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

                // create a newConsole
                const newConsole = new consoleShortHand(this.sessionName);

                // create a list of vars to swap
                const varsToSwap = {
                    "newConsole": newConsole,
                    "con": newConsole,
                    "imp": toExps,
                    "args": args,
                    "obar": obar,
                    "sessionName": this.sessionName,
                    "logNode": this.logNode,
                    "cwd": this.cwd,
                    "provided": this.providedArgs,
                    "passed": this.passedData,
                    "runAt": this.runAt
                }

                // swap them
                const oldWholeObj: Object = {};

                for(const name of Object.keys(varsToSwap)){
                    // @ts-expect-error
                    oldWholeObj['$' + name] = globalThis['$' + name];

                    // @ts-expect-error
                    globalThis['$' + name] = varsToSwap[name];
                }

                // save the previous ones
                // @ts-expect-error
                globalThis['$old'] = {...oldWholeObj};
                

                // // @ts-ignore
                // let prev = globalThis.$newConsole;
                // // @ts-ignore
                // let prev2 = globalThis.$con;
                // // @ts-ignore
                // let imp = globalThis.$imp;
                // // @ts-ignore
                // let bargs = globalThis.$args;
                // // @ts-ignore
                // let obarOld = globalThis.$obar;
                // // @ts-ignore
                // let sessionNameOld = globalThis.$sessionName;
                // // @ts-ignore
                // let logNodeOld = globalThis.$logNode;
                // // @ts-ignore
                // let cwdOld = globalThis.$cwd;
                // // @ts-ignore
                // let providedOld = globalThis.$providedOld;
                // // @ts-ignore
                // let passedOld = globalThis.$passed;


                // @ts-ignore
                // globalThis.$newConsole = globalThis.$con = new consoleShortHand(this.sessionName);

                // // @ts-ignore
                // globalThis.$imp = toExps;
                // // @ts-ignore
                // globalThis.$args = args;
                // // @ts-ignore
                // globalThis.$obar = obar;
                // // @ts-ignore
                // globalThis.$sessionName = this.sessionName;


                // execute code
                answer = globalEval(code);

                // // @ts-ignore
                // globalThis.$newConsole = prev;
                // // @ts-ignore
                // globalThis.$con = prev2;
                // // @ts-ignore
                // globalThis.$imp = imp;
                // // @ts-ignore
                // globalThis.$args = bargs;
                // // @ts-ignore
                // globalThis.$obar = obarOld;
                // // @ts-ignore
                // globalThis.$sessionName = sessionNameOld;
                

                // globalThis.$newConsole = prev;
                // let formatedAnswer = inspect(answer, true, null, true);

                // restore previous vars
                for(const name of Object.keys(varsToSwap)){
                    // @ts-expect-error
                    globalThis['$' + name] = oldWholeObj['$' + name];
                }

                // @ts-expect-error
                delete globalThis['$old'];
                


                // log(LogType.INFO, `eval returned with: ${formatedAnswer}`, evalParent);
            }, evalParent as any as string, null, this.sessionName);

            return answer;
            // }
        }             
}, ["js", "javascript"])


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds};