import { exec, execSync } from "child_process";
import { logNode } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { globalEval } from "../tools/eval.js";
import { useWith, useWithAsync } from "../tools/useWith.js";
import { promisify } from "util";
import { multiLineConstructor } from "../texttools.js";

const execAsync = promisify(exec);

const commandTable = quickCmdWithAliases("powershell", {
        usageinfo: "powershell <code...>",
        desc: "executes powershell commands",
        longdesc: multiLineConstructor(
            "executes powershell commands",
            "",
            "ONLY WORKS ON WINDOWS. ON OHTER OPERATING SYSTEM IT WILL CAUSE AN ERROR",
            "",
            "Powershell is slow in its core, so use it with cause. If you want faster connection to os use dedicated commands or 'cmd' command",
            "",
            "It will run by default with -NoProfile to make it run faster"
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        async: true,
        async callback(args: string[]){
            let toUse: string = "";
            for(const cur of args.slice(1)){
                if(cur === "-§") continue;

                toUse += cur + " ";
            }

            let codeC = toUse.trim();

            let evalParentC = new logNode("powershell");
            // // @ts-ignore
            // let answer;

            const isWindows = process.platform === "win32";

            if(!isWindows){
                throw new Error("Not supported");
            }

            const {stdout, stderr} = await useWithAsync("Using powershell", async () => {
                const { stdout, stderr } = await execAsync(
                    `powershell -NoProfile -Command "${codeC}"`
                );

                return {stdout, stderr};
            }, evalParentC as any as string, null, this.sessionName)

            // const { stdout, stderr } = await execAsync(
            //     `powershell -NoProfile -Command "${codeC}"`
            // );

            // if(stderr){
            //     return stderr;
            // }

            return stdout;

            // const toExecCmd = isWindows ?
            // "chcp 65001 > nul && " + codeC : codeC;

            // useWith("using cmd", () => {
            //     answer = execSync(toExecCmd, {shell: isWindows ? "cmd.exe" : "/bin/bash"});

            //     // log(LogType.INFO, `cmd returned with: ${g}`, evalParentC);
            // }, evalParentC as any as string, null, this.sessionName);

            // }
    }                
}, ["pwrsh", 'pwsh'])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};