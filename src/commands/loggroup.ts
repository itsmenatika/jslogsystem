import { logGroup, logGroupEnd } from "../apis/allApis.js";
import { expectedError } from "../apis/commands/commandSpecialTypes.js";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("loggroup", {
    usageinfo: "loggroup <e|enter|entr|new|n|exit|close|c||cur|current|cur|string|str> [<name>] [<--visible True/False>] [<-e>] [<--rtype both|string|group>]",
    desc: "manages log groups in the current terminal session",
    longdesc: multiLineConstructor(
        "manages log groups in the current terminal session",
        "",
        "the first argument is a subcommand:",
        "   * e/enter/entr/new/n <name> -> creates a new group",
        "       * --visible can be used to set if this should be logged",
        "   * close|c -> closes the recent group",
        "       * --visible can be used to set if this should be logged",
        "       * --rtype both|string|group -> it allows to change the return type",
        "           * string -> current prefix",
        "           * group -> group removed",
        "           * group -> both in an array [string, group]",
        "       * -e -> if that flag is set, the error will be thrown if there is no group",
        "   * cur|current -> returns the current group",
        "   * string|str -> returns the current prefix"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "session", "testing"],
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);

        // if(args.args.length === 0){
        //     return expectedError("subcommand needed");
        // }

        const subCommand = args.args[0];


        let visible: boolean = !args.dashCombined.includes("n");
        if("visible" in args.argsWithDoubleDash){
            visible = args.argsWithDoubleDash["visible"] && args.argsWithDoubleDash["visible"]?.toLowerCase() !== "false";
        }

        visible &&= args.isEnding;
        
        switch(subCommand){
            case "enter":
            case "entr":
            case "e":
            case "n":
            case 'new':{

                if(args.args.length < 2){
                    return expectedError("Group name needed!");
                }

                const name: any = args.args[1];

                if(typeof name !== "string"){
                    return expectedError("Group name has to be a string!");
                }


                logGroup(name, {
                    terminal: this,
                    messageWho: this.logNode,
                    messageVisible: visible
                });

                return true;
            }

            case "exit":
            case "close":
            case "c":
                {
                    const returnType = args.argsWithDoubleDash['rtype'];

                    if(
                        returnType !== undefined
                        &&
                        !(["both", "group", "logstring"].includes(returnType))
                    ){
                        return expectedError("rtype only accepts: both, group and logstring");
                    }


                    const toR = logGroupEnd({
                        terminal: this,
                        messageWho: this.logNode,
                        messageVisible: visible,
                        return: returnType,
                        error: args.dashCombined.includes("e")
                    });

                    if(returnType) return toR;
                    else return true;
                }

            case "current":
            case "cur":
                return this._terminalSession.logGroups.at(-1);
            case "string":
            case "str":
                return this._terminalSession.currentGroupString;

            default:
                return expectedError("INVALID SYNTAX");
        }

    }
}, ['lgrp']);


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};