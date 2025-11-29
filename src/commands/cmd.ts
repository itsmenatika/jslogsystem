import { execSync } from "child_process";
import { logNode } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { globalEval } from "../tools/eval.js";
import { useWith } from "../tools/useWith.js";

const commandTable = quickCmdWithAliases("cmd", {
        usageinfo: "cmd <code...>",
        desc: "executes system commands",
        longdesc: "It allows you to execute system command using execSync()",
        hidden: false,
        changeable: false,
        isAlias: false,
        callback(args: string[]){
            let toUse: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-§") continue;

                toUse += cur + " ";
            }

            let codeC = toUse.trim();

            let evalParentC = new logNode("cmd");
            // @ts-ignore
            let answer;

            const isWindows = process.platform === "win32";

            const toExecCmd = isWindows ?
            "chcp 65001 > nul && " + codeC : codeC;

            useWith("using cmd", () => {
                answer = execSync(toExecCmd, {shell: isWindows ? "cmd.exe" : "/bin/bash"});

                // log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
            }, evalParentC as any as string, null, this.sessionName);

            return answer;

            // }
    }                
}, ["cmd.exe", "execute", "exec"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};