import { askForBindApi } from "../apis/commands/bindApi.js";
import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { error } from "../log.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("bind", {
    usageinfo: "bind [<`command`:`executor>`]",
    desc: "manages binds in the current terminal sessions",
    longdesc: multiLineConstructor(
        "manages binds in the current terminal sessions",
        "",
        "bind without arguments will return the list of binds",
        "bind `NAME`:`` will remove a selected bind",
        "bind `NAME`:`EXECUTOR` will set a bind",
        "",
        "examples:",
        "bind `clearmeow`:`clear\\;meow"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "bind", "commands", "command", "manager", "session"],
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);
        const b = askForBindApi(this);
        const d = new multiDisplayer();

        let ermes: string = "";

        if(args.length == 0){
            const bindData = b.getBinds();

            d.push("BIND LIST", consoleColors.Reverse);
            d.push("\n");

            for(const [name, data] of Object.entries(bindData)){
                d.push(
                    "*",
                    consoleColors.FgYellow
                );

                d.push(" ");

                d.push(
                    data.command,
                    consoleColors.BgCyan
                );

                d.push(" ");

                d.push(
                    "->",
                    consoleColors.Bright
                );

                d.push(" ");

                d.push(
                    data.executor,
                    consoleColors.BgYellow
                );

                d.push("\n");
            }
            d.push("BIND LIST", consoleColors.Reverse);
        }
        else{
                let toParse: string = args.args.join(" ");
                toParse = toParse.trim();

                // format: ` `:``

                const parts = toParse.split(":");

                if(parts.length != 2){
                    ermes = "invalid syntax";
                }

                // console.log(parts);

                if(
                    parts[0].at(0) != "`" || parts[1].at(0) != "`"
                    || parts[0].at(-1) != "`" || parts[1].at(-1) != "`"
                ){
                    ermes = "invalid syntax";                   
                }

                const command = parts[0].slice(1, -1).trim();
                const executor = parts[1].slice(1, -1).trim();

                // console.log(command, executor);

                if(executor == ""){
                    b.remove(command.split(" ")[0]);

                    d.push("bind was removed!\n");
                }
                else{
                    b.add(command, executor);
    
                    d.push("bind was added!\n");
                }
        

        }
        
        if(ermes){
            error(ermes, this.logNode, this.sessionName);
            return onlyToRedirect(ermes);
        }

        if(args.isEnding){
            return d.getWhole();
        }
        else{
            return d.toRawString();
        }
        // d.useConsoleWrite(undefined, false, this.terminalName);
        // return onlyToRedirect(d.toRawString());
    }
}, ["bnd"]);


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};