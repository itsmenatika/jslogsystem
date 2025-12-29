import { askForCommandApi, askForEnvApi } from "../apis/allApis.js";
import { textboxVisibility } from "../apis/terminal/textbox.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { actualCrash } from "../tools/exit.js";

const commandTable = quickCmdWithAliases("environment", {
    usageinfo: "environment <get|g|set|s|delete|del|d|remove|rem|r|exists|e|is|all> [<varName/route>] [<value>] [<-b>]",
    desc: "allows you to edit environment variables",
    longdesc: multiLineConstructor(
        "allows you to edit environment variables",
        "",
        "NOTE: THOSE ARE SESSION VARIABLES AND WON'T BE EXPORTED TO process children AUTOMATICALLY",
        "",
        "They will be deleted as soon the session ceases to exist",
        "",
        "sub commands:",
        " * get/g -> gets a variable by route",
        " * set/s -> sets a variable by route",
        " * delete/del/d/remove/rem/r -> removes a variable by route",
        " *exists/e/is -> checks whether a variable exists by route",
        " *all -> gets the whole environment as an object",
        "",
        "-b can be used with delete to also remove everything under/below, not only the exact path"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        // smartsargs :3
        const args = smartArgs(preargs, this);

        // get api
        const api = askForEnvApi(this);

        // subcommand
        switch(args.args[0]){
            case "g":
            case "get":
                if(args.args.length < 2){
                    return "invalid syntax";
                }

                return api.getRoute(args.args[1]);
            
            case "s":
            case "set":
                if(args.args.length < 3){
                    return "invalid syntax";
                }

                return api.setRoute(args.args[1], args.args[2]);

            case "delete":
            case "del":
            case "d":
            case "remove":
            case "rem":
            case "r":
                if(args.args.length < 2){
                    return "invalid syntax";
                }

                if(args.dashCombined.includes("b")){
                    return api.deleteRouteBelow(args.args[1]);
                }

                return api.deleteRoute(args.args[1]);

            case "exists":
            case "e":
            case "is":
                if(args.args.length < 2){
                    return "invalid syntax";
                }

                return api.existsRoute(args.args[1]);

    
            case "all":
                return api.getWholeEnvironment();

            default:
                return "invalid syntax";
        }
    }
}, ["env"])


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds};