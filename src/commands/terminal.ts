import { inspect } from "util";
import { commandInternalExec } from "../apis/commands/commandExecute.js";
import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForTerminalApi, terminalApi } from "../apis/terminal/terminalApi.js";
import { getTerminal } from "../programdata.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { clearConsole } from "../tools/clearConsole.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { log, LogType } from "../log.js";
import { cmdTable } from "../apis/commands/types.js";

import { commandTable as strm } from "../commandGroups/streams.js";
import { commandTable as procGr } from "../commandGroups/processCommands.js";
import { commandTable as pipeGrp } from "../commandGroups/pipeGroup.js";
import { commandTable as thatShell } from "../commandGroups/thatShell.js";
import { commandTable as thatShellUserFriendly } from "../commandGroups/thatShellUserFriendly.js";
import { commandTable as otherShells } from "../commandGroups/othershells.js";
import { commandTable as alls } from "../commandGroups/all.js";
import { commandTable as webgroup } from "../commandGroups/webGroup.js";
import { commandTable as internalCmd } from "../commands/internal.js";
import { cd } from "../apis/commands/osApis/filesystem.js";
import { textboxVisibility } from "../apis/terminal/textbox.js";
import { printTextBox } from "../formatingSessionDependent.js";

const commandTable = quickCmdWithAliases("terminal", {
    usageinfo: "terminal [<name|uptime|history|cmdhis|inspect|list|switch|fork|exists|new|remove|exec|write>] <...args>",
    desc: "managing terminal sessions",
    longdesc: multiLineConstructor(
        "The purpose of this command is to expose the front-end of terminal sesssions to an average user",
        "",
        "not providing the first argument will cause the command to print the name",
        "(it's not yet decided if it will be for sure the default behaviour. so we recommend using 'terminal name' instead!",
        "",
        "available arguments:",
        "* terminal name -> it will print the current terminal name",
        "* terminal uptime -> it will print the current terminal uptime (it's defacto an alias for 'uptime -l').",
        "    ** using -o will cause to print the terminal start time (not how much time has passed, but the literal start time). It will not use 'uptime' command in that scenario",
        "    ** using -O will cause to print how much time has passed in miliseconds since the terminal start (it doesn't use 'uptime' command)",
        "* terminal list -> it will print list of current existing sessions",
        "* terminal history [<sessionName>] -> it will print the out stream wrapper history of that session (or current one)",
        "* terminal cmdhis [<sessionName>] -> it will print the command history of that session (or current one)",
        "* terminal switch <sessionName> -> it will switch you to another session",
        "* terminal fork <sessionName> -> it will fork the current state of the current terminal and create with that data a new one with the provided name",
        "* terminal exists <sessionName> -> checks if terminal with that name exist",
        "* terminal new <sessionName> <...groups/options> -> it will create a new terminal",
        "   ** -a -> all group (all internal commands)",
        "   ** -r -> that command (terminal) (USE AT LEAST THAT!)",
        "   ** -s -> stream group (echo, write)", 
        "   ** -p -> pipe group (arguments, argumentslength, true, false, nil, string, number)",       
        "   ** -c -> process group (exit, cd)", 
        "   ** -T -> that shell group (logs, hide, help, clear, bind, exists, version, terminal)",  
        "   **  -U -> user friendly shell groups (help, clear, bind, version)", 
        "   ** -o -> other shells group (eval, cmd)",  
        "   ** -w -> web group (getonlinedataservice)",  
        "   ** -i -> internal commands (this is not a group) (internal)",
        "   IT's RECOMENDED TO HAVE -r, -T or -a. You won't be able to to go back from that session otherwise!",
        "* terminal remove <sessionName> -> it will remove a terminal",
        "   ** NOTE: it's impossible to remove main and the session from which was that command executed",
        "* terminal inspect [<sessionName>] -> it will return the everything that the session currently stores (IT MAY BE REMOVED IN THE FUTURE! IT SHOULD BE ONLY USED FOR TESTING!)",
        "* terminal exec <this|sessionName> <command...> -> allows you to execute a command",
        "* terminal write <this|sessionName> <data...> -> allows you to print on another terminal"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        // console.log(preargs);
        const args = smartArgs(preargs, this);

        let nameOfAnother: string = this.sessionName;
        if(args.length > 1){
            let toCheck = args.args[1];
            if(toCheck != "this"){
                nameOfAnother = toCheck;
            } 
        }

        // const nameOfAnother = args.length > 1 ? 
        // args.args[1] as string : 
        // this.terminalName;

        if(args.length == 0){
            return this.sessionName;
        }

        let apNoEx = false; let anNoEx = false;
        switch(args.args[0]){
            case "name":
            case "nm":
                return this.sessionName;

            case "cmdhis":{
                const termApi = askForTerminalApi(nameOfAnother);
                if(!termApi.valid) return;
                return termApi.commandHistory();
            }

            case "up":
            case "uptime":
            case "time":{
                const ap = askForTerminalApi(nameOfAnother);
                if(!ap.valid) return;

                if(args.dashCombined.includes("o")){
                    return ap.uptime();
                }

                if(args.dashCombined.includes("O")){
                    return Date.now() - ap.uptime();
                }

                return commandInternalExec(`uptime -l ${preargs.slice(2).join(" ")}`, 
                    {
                        silent: true, logNode: this.logNode, 
                        terminal: this.sessionName, onlyReturn: true
                    }
                );
            }

            case "his":
            case "history":{
                const termData = askForTerminalApi(nameOfAnother);
                if(!termData.valid) return;
                return termData.outStreamHistory();
            }
                // return ap.outStreamHistory();

            case "list":
                let list = terminalApi.terminalNamesList();

                if(args.isEnding){
                    let _t = new multiDisplayer();

                    for(const name of list){
                        _t.push("* ",
                            name == this.sessionName ?
                            consoleColors.Blink :
                            undefined
                        );
                        _t.push(name, 
                            name == this.sessionName ?
                            consoleColors.Bright :
                            consoleColors.FgGray
                        );
                        _t.push("\n");
                    }

                    return _t.getWhole();
                }


                return onlyToRedirect(list);

            case "ses":
            case "session": {
                const termData = askForTerminalApi(nameOfAnother);
                if(!termData.valid) return;

                return termData.session;
            }

            case "inspect": {
                const termData = askForTerminalApi(nameOfAnother);
                if(!termData.valid) return;

                return inspect(Object.freeze(
                    Object.fromEntries(
                    Object.entries(termData.session)
                    )
                ), false, undefined, true);
            }

            case "switch": {
                if(args.length < 2){
                    return "ARG 2 REQUIRED";
                }
                if(this.sessionName === nameOfAnother){
                    log(LogType.ERROR, `it is not safe to switch to itself!`, undefined, this.sessionName);
                    return;
                }

                const ap = askForTerminalApi(this);
                if(!ap.valid) return;
                const termData = askForTerminalApi(nameOfAnother);
                if(!termData.valid){
                    log(LogType.ERROR, `no such terminal as '${nameOfAnother}' exist!`, undefined, this.sessionName);
                    return;
                }

                ap.switchStreamsWith(termData);
                termData.cd(undefined, true);

                // termData.getSession().procLinked?.chdir(termData.getSession().cwd);
                // printTextBox(termData.getSession());

                // clearConsole(ap);

                // ap.getSession().out.rewrite();


                return true;
                break;
            }


            case "fork": {
                const ap = askForTerminalApi(this);
                if(!ap.valid){return;}

                if(getTerminal(nameOfAnother)){
                    return false;
                }

                ap.fork(nameOfAnother);

                log(LogType.SUCCESS, `That terminal session was forked to '${nameOfAnother}'`, 'console', this.sessionName);

                return true;
                break;
            }

            case "new": {
                if(args.length < 2){
                    return "NO ARG 2 SPECIFIED";
                }

                if(getTerminal(nameOfAnother)){
                    return false;
                }

                const tb: cmdTable = {};

                const all = args.dashCombined.includes("a");

// import { commandTable as strm } from "../commandGroups/streams.js";
// import { commandTable as procGr } from "../commandGroups/processCommands.js";
// import { commandTable as pipeGrp } from "../commandGroups/pipeGroup.js";
// import { commandTable as thatShell } from "../commandGroups/thatShell.js";
// import { commandTable as otherShells } from "../commandGroups/othershells.js";
// import { commandTable as alls } from "../commandGroups/all.js";

                // all group
                if(all){
                    Object.assign(tb, alls);
                }

                // ability to return
                if(args.dashCombined.includes("r")){
                    Object.assign(tb, commandTable);
                }

                // stream group
                if(args.dashCombined.includes("s")){
                    Object.assign(tb, strm);
                }

                // pipe group
                if(args.dashCombined.includes("p")){
                    Object.assign(tb, pipeGrp);
                }

                // process group
                if(args.dashCombined.includes("c")){
                    Object.assign(tb, procGr);
                }

                // other shells group
                if(args.dashCombined.includes("o")){
                    Object.assign(tb, otherShells);
                }

                // that shell group
                if(args.dashCombined.includes("T")){
                    Object.assign(tb, thatShell);
                }

                if(args.dashCombined.includes("U")){
                    Object.assign(tb, thatShellUserFriendly);
                }

                // web group
                if(args.dashCombined.includes("w")){
                    Object.assign(tb, webgroup);
                }


                if(args.dashCombined.includes("i")){
                    Object.assign(tb, internalCmd);
                }


    

                // if(all || args.dashCombined.includes("t")){
                //     Object.assign(tb, {
                //         ...
                //     });
                // }
            

                terminalApi.create(nameOfAnother, {
                    config: {
                        commandTable: tb
                    }
                });

                return true;
                break;
            }
                
                
            case "is":
            case "exists": {
                if(getTerminal(nameOfAnother)) return true;
                else return false;
            }

            case "rem":
            case "remove": {
                if(
                    nameOfAnother == "main" ||
                    this.sessionName === nameOfAnother
                ) return false;

                const api = askForTerminalApi(nameOfAnother);
                if(!api.valid) return false;

                const res = api.destroy(false);

                return onlyToRedirect(res);
            }

            case "exec": {
                if(!(args.length > 2)){
                    return "NOT ENOUGH ARGS";
                }

                const api = askForTerminalApi(nameOfAnother);
                if(!api.valid) return false;

                const cmd = args.args.slice(2).join(" ");

                const res = api.exec(cmd, {
                    logNode: "console.terminal.exec",
                    silent: true
                });

                return res;


                break;
            }

            case "write": {
                if(!(args.length > 2)){
                    return "NOT ENOUGH ARGS";
                }

                const api = askForTerminalApi(nameOfAnother);
                if(!api.valid) return false;

                const dataarg = args.args.slice(2);

                let toWrite = "";
                for(const one of dataarg){
                    toWrite += String(one);
                }


                api.write(toWrite);


                return true;
                break;
            }

            default:
                return "UNKNOWN ARG: " + args.args[0];

        }
    }
}, ["trm"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};