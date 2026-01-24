import { expectedError, expectedErrorType } from "../apis/allApis.js";
import { log, logNode, LogType } from "../log.js";
import { getTerminal } from "../programdata.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { uptimeVar } from "../ultrabasic.js";

const commandTable = quickCmdWithAliases("uptime", {
    usageinfo: "uptime",
    desc: "shows the time since the program start.",
    longdesc: multiLineConstructor("shows the time since the program start.", 
        "", "",
        "use -e to get miliseconds since epoch",
        "use -x to extract miliseconds (max 1000)",
        "use -s to extract seconds (max 60)",
        "use -m to extract minutes (max 60)",
        "use -h to extract hours (max 24)",
        "use -d to extract days",
        "",
        "those are exclusive:",
        "use -l to use a linked terminal session uptime (default)",
        "use -p to use a linked process time (it is rounded up to seconds!)",
        "use -g to use a global log system variable",
        "",
        "use --terminal sessionName to specify the terminal that is talked about"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "session", "testing", "process"],
    callback(preArgs: string[]): string | number | Record<string, number> | undefined | expectedErrorType{
        const args = smartArgs(preArgs, this);
        const dashCombined = args.dashCombined;

        const sessionName = args.argsWithDoubleDash['terminal'] || this.sessionName;

        let exc = 0;
        if(dashCombined.includes("p")) exc++;
        if(dashCombined.includes("g")) exc++;
        if(dashCombined.includes("l")) exc++;
        if(exc > 1){
            return expectedError("Arguments: p, g and l are exclusive");
            // log(LogType.ERROR, "Arguments: p, g and l are exclusive!", new logNode("uptime", this.logNode as logNode), this.sessionName);
            return undefined;
        }



        let current: number = 0;
        if(args.dashCombined.includes("p")){
            // current = this._terminalSession.procLinked?.uptime() as number * 1000;
            const trm = getTerminal(sessionName);

            if(!trm) return expectedError("unknown terminal");

            current = trm.procLinked?.uptime() as number * 1000;
        }
        else if(args.dashCombined.includes("g")){
            current = Date.now() - uptimeVar;
        }
        else{
            // uptime = this._terminalSession.uptime;
            // current = Date.now() - this._terminalSession.uptime;
            const trm = getTerminal(sessionName);

            if(!trm) return expectedError("unknown terminal");

            current = Date.now() - trm.uptime;
        }

   
        let mili = current % 1000;
        let seconds = Math.floor((current / 1000) % 60);
        let minutes = Math.floor((current / 1000 / 60) % 60);
        let hours = Math.floor((current / 1000 / 60 / 60) % 24);
        let days = Math.floor((current / 1000 / 60 / 60 / 24));

        let toReturn: Record<string, any> = {};

        if(args.dashCombined.includes("e")){
            toReturn["sinceEpoch"] = current;
        }

        if(args.dashCombined.includes("x")){
            toReturn["miliseconds"] = mili;
        }

        if(args.dashCombined.includes("m")){
            toReturn["minutes"] = minutes;
        }

        if(args.dashCombined.includes("s")){
            toReturn["seconds"] = seconds;
        }

        if(args.dashCombined.includes("h")){
            toReturn["hours"] = hours;
        }

        if(args.dashCombined.includes("d")){
            toReturn["days"] = days;
        }

        if(args.dashCombined.length != 0){
            let len = Object.keys(toReturn).length;

            if(len === 1){
                return toReturn[Object.keys(toReturn)[0]];
            }
            else if(len > 1){
                return toReturn;
            }
        }




        let toShow: string = `current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}ms (since epoch: ${current})`;

        // newConsole.log(`current uptime: ${days}d ${hours}h ${minutes}m ${seconds}s ${mili}ms (exmili: ${current})`);
        return toShow;

        // }
    }                
}, ["up"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};