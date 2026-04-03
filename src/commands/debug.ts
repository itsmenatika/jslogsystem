import { commandContext } from "../apis/commands/types.js";
import { cd } from "../apis/commands/osApis/filesystem.js";
import { log, LogType } from "../log.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiLineConstructor } from "../texttools.js";
import { askForEnvApi, expectedError, expectedErrorType } from "../apis/allApis.js";
import { join } from "path";

const commandTable = quickCmdWithAliases("debug", {
    usageinfo: "debug [<s|status|on|off|true|false|t|f|toogle|tg>]",
    desc: "allows you to change debug status",
    longdesc: multiLineConstructor(
        "allows you to toogle debug",
        "",
        "debug status|s -> returns the debug status",
        "debug on|true|t -> sets debug to true",
        "debug off|false|f -> sets debug to false",
        "debug toogle|tg -> toogles debug and returns current one",
        "",
        "executing it without arguments will toogle and return pretty message"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["environment"],
    callback(presArgs: any[]): string | boolean | expectedErrorType{
        const preArgs = removeInternalArguments(presArgs);

        const s = askForEnvApi(this);

        if(preArgs.length > 1){
            if(preArgs.length > 2 || typeof preArgs[1] !== "string"){
                return expectedError("USAGE: DEBUG [<S|STATUS|TRUE|FALSE|ON|OFF>]");
            }

    

            switch(preArgs[1].toLowerCase()){
                default:
                     return expectedError("USAGE: debug [<STATUS|TRUE|FALSE|ON|OFF>]");
                case "s":
                case "status":
                    return s.exists("DEBUG");
                case "on":
                case "true":
                case "t":
                    if(s.exists("DEBUG")){
                        return false;
                    }

                    s.set("DEBUG", "TRUE");
                    return true;

                case "off":
                case "false":
                case "f":
                    if(s.exists("DEBUG")){
                        s.delete("DEBUG");
                        return true;
                    }

                    return false;                    

                case "tg":
                case "toogle":
                    if(s.exists("DEBUG")){
                         s.delete("DEBUG");
                        return false;
                    }
                    else{
                        s.set("DEBUG", "true");
                        return true;
                    }
            }
        }

        if(s.exists("DEBUG")){
            s.delete("DEBUG");
            return "DEBUG IS NOW OFF";
        }
        else{
            s.set("DEBUG", "true");
            return "DEBUG IS NOW ON";
        }
    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable);


export {commandTable, compounds};