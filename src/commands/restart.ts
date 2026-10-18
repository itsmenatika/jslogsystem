import { spawn, spawnSync } from "child_process";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { useWith, useWithAsync } from "../tools/useWith.js";
import { info, success, warning } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { setTimeout as g } from "timers/promises";
import { runFrom } from "../apis/commands/osApis/orginalCwd.js";

const commandTable = quickCmdWithAliases("restart", {
    usageinfo: "restart",
    desc: "Restarts the process",
    longdesc: "Restarts the current Node.js process safely",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["generator", "creator", "pipe"],

    async callback(args) {
        const bakedArgs = smartArgs(args, this);

        const tsc = bakedArgs.dashCombined.includes('c');

        // TODO
        if(tsc){
            warning("TSC OPTION IS NOT READY!", undefined, this);
            useWith("using typescript", () => {
                spawnSync("tsc", {stdio: "inherit"});
            }, this.logNode, false, this);
        }
        


        useWith("restarting process", () => {
            info("CURRENT PROCESS ID: " + process.pid, "core", this.sessionName);

            process.title = "jslogsystem";

            const child = spawn("cmd.exe", [
                "/c",
                process.execPath,
                ...process.argv.slice(1),
            ], {
                stdio: "inherit",
                detached: true,
                cwd: runFrom()
            });

            child.on("spawn", () => {
                info("NEW PROCESS ID: " + child.pid, "core", this.sessionName);

                setTimeout(() => {
                    success("DONE!", "core", this.sessionName);
                    process.exit(0);
                }, 100);

            });

        info("UNREFING CHILD...", "core", this.sessionName);
        child.unref();
        success("UNREFING CHILD...", "core", this.sessionName);


        }, "core", false, this.sessionName);



    }

}, []);

const compounds = cmdTableToCommandCompounts(commandTable);

export { commandTable, compounds };