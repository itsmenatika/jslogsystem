import { logTimeEnd, logTimeExist, logTimeStamp, logTimeStart, timerList } from "../apis/allApis.js";
import { askForBindApi } from "../apis/commands/bindApi.js";
import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { error } from "../log.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("timer", {
    usageinfo: "timer <exists|start|end|end|get|stamp|list> [<timerName>] [<-n>] [<--visible (true|false)>] [<--(command|cmd) subCommandName>] [<--(label|name|l) label>]",
    desc: "manages timers in the current terminal session",
    longdesc: multiLineConstructor(
        "manages timers in the current terminal session",
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);

        let subCommand = args.args[0];

        if(args.argsWithDoubleDash['command']){
            subCommand = args.argsWithDoubleDash['command']
        }
        else if(args.argsWithDoubleDash['cmd']){
            subCommand = args.argsWithDoubleDash['cmd'];
        }

        let label = args.args[1];

        if(args.argsWithDoubleDash['label']){
            subCommand = args.argsWithDoubleDash['label']
        }
        else if(args.argsWithDoubleDash['l']){
            subCommand = args.argsWithDoubleDash['l'];
        }
        else if(args.argsWithDoubleDash['name']){
            subCommand = args.argsWithDoubleDash['name'];
        }
        else if(args.argsWithDoubleDash['n']){
            subCommand = args.argsWithDoubleDash['n'];
        }
        
        let visible: boolean = !args.dashCombined.includes("n");
        if("visible" in args.argsWithDoubleDash){
            visible = args.argsWithDoubleDash["visible"] && args.argsWithDoubleDash["visible"]?.toLowerCase() !== "false";
        }



       
        switch(subCommand){
            case "exists":
                return logTimeExist(label, this);
            case "start":
                return logTimeStart(label, {terminal: this, messageVisible: visible});
            case "end":
                return logTimeEnd(label, {terminal: this, error: true, messageVisible: visible});
            case "get":
            case "stamp":
                return logTimeStamp(label, {terminal: this, error: true, messageVisible: visible});
            case "list":
                return timerList(this);
            default:
                return "INVALID SYNTAX";
        }

    }
}, []);


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};