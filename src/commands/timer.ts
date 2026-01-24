import { logTimeEnd, logTimeExist, logTimeStamp, logTimeStart, timerList } from "../apis/allApis.js";
import { askForBindApi } from "../apis/commands/bindApi.js";
import { expectedError, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { error } from "../log.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("timer", {
    usageinfo: "timer <is|exists|start|end|end|get|timestamp|stamp|list|names|current|cur|now> [<timerName>] [<-n>] [<--visible (true|false)>] [<--(command|cmd) subCommandName>] [<--(label|name|l) label>]",
    desc: "manages timers in the current terminal session",
    longdesc: multiLineConstructor(
        "manages timers in the current terminal session",
        "",
        "the first argument is a subcommand:",
        "* is/exists -> returns a boolean value indicating whether specified timer exists",
        "* start/new -> starts a new timer or resets it if one was already present",
        "* stop/end -> stops a timer and returns time that has passed",
        "* get/timestamp/stamp * returns current time that has passed according to a specified timer",
        "* list -> returns an object containing timer labels as keys and values containing a starting time of them",
        "* names -> returns a list of all existing timers (their labels)",
        "* current/cur/now -> returns number of miliseconds since January 1, 1970 (unix time)",
        "",
        "-n to remove an auto message",
        "--visible True/False can serve the same purpose",
        "",
        "A label name will be extracted from the second argument or a --label dashed argument"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "session", "testing"],
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

        visible &&= args.isEnding;

       
        switch(subCommand){
            case "exists":
                return logTimeExist(label, this);
            case "start":
            case "new":
                if(!label){
                    return expectedError("INVALID SYNTAX");
                }

                return logTimeStart(label, {terminal: this, messageVisible: visible, messageWho: this.logNode});
            case "stop":
            case "end":
                if(!label){
                    return expectedError("INVALID SYNTAX");
                }

                return logTimeEnd(label, {terminal: this, error: true, messageVisible: visible, messageWho: this.logNode});
            case "get":
            case "timestamp":
            case "stamp":
                if(!label){
                    return expectedError("INVALID SYNTAX");
                }

                return logTimeStamp(label, {terminal: this, error: true, messageVisible: visible, messageWho: this.logNode});
            case "list":
                return timerList(this);
            case "names":
                return Object.keys(timerList(this));
            case "current":
            case "cur":
            case "now":
                return Date.now();
            default:
                return expectedError("INVALID SYNTAX");
        }

    }
}, []);


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};