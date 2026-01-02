import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForVersion } from "../apis/meta/version.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { cpus, arch, hostname, platform, getPriority, version, machine, loadavg } from "os";

const commandTable = quickCmdWithAliases("info", {
    usageinfo: "version [-i] [-s] [-u]",
    desc: "information about the system",
    longdesc: multiLineConstructor("shows the version information",
        "",
        "use -i to get int version",
        "use -s to get string version",
        "use -u to get user set version data",
        "",
        "if piped it uses 'version -i' by default"
        ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["unsafe", "shell", "process", "terminal", "system"],
    callback(preArgs: any[]): any {
            const args = smartArgs(preArgs, this);

           const builder = new multiDisplayer();

            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");


            let mus = process.memoryUsage();
            let pairs = [
                ["architecture", arch],
                ["host name", hostname],
                ["platform", platform],
                ["kernel version", version],
                ["process priority", getPriority()],
                ["machine", machine],
                ["cwd", process.cwd()],
                ["heap total",  Math.round(mus.heapTotal/100000)/10 + "mb"],
                ["heap used",  Math.round(mus.heapUsed/100000)/10 + "mb"],
                ["cpu usage (1m, 5m, 15m) (UNIX SPECIFIC)", `${loadavg().map(num => `${num * 100}%`)}`],
                ["cpu usage", ]
            ];

            let cpusD = cpus();

            let i = 0;
            for(let cpu of cpusD){
                pairs.push([
                    `cpu ${i}`,
                    `${cpu.model} (speed: ${cpu.speed})`
                ]);
                i++;
            }

            for(let pair of pairs){
                builder.push("\t" + pair[0] + ": ", consoleColors.FgGray);
                builder.push(pair[1] as string, consoleColors.BgRed);
                builder.push("\n");
            }


            

            builder.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
            builder.push("\n");

            // builder.useConsoleWrite();


            if(args.isEnding){
                return builder.getWhole();
            }
            else
            return builder.toRawString();

        
    }                
}, ["osinf", "osinfo"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};