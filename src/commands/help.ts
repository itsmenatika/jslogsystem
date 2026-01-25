import { inspect } from "util";
import { askForCommandApi, commandtypes } from "../apis/commands/commandApis.js";
import { expectedError, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { consoleMultiWrite } from "../out.js";
import { combineColors, consoleColor, consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("help", {
        usageinfo: "help ([<--category CATEGORYNAME> [<--regex REGEX>]] [-d]|[<about>])",
        desc: "shows the list of commands or describes the command usage",
        longdesc: multiLineConstructor(
            "shows the list of commands or describes the command usage",
            "",
            "use help <command/commandAlias> to get information about that specific command",
            "use help [<--category NAME>] [<--regex REGEX>] [-d] to list commands",
            "   * use --category name to limit search for specified category",
            "   * use --regex to search for a phrase within a name and a short description",
            "       * use -d to also search through categories and long descriptions"
        ),
        hidden: false,
        changeable: false,
        categories: ["manual"],
        callback(preArgs: string[]){
            const args = smartArgs(preArgs, this);

            const category = args.argsWithDoubleDash['category'];
            const regex = args.argsWithDoubleDash['regex'];
            const regexLong = args.dashCombined.includes("d");

            let regexObj: undefined | RegExp = undefined;
            if(regex){
                regexObj = new RegExp(regex);
            }

            // return args;

            const length = args.argsWithoutArguments.length;

            // if there was no arguments (the first is called command name)
            if(
                length == 0
            ){
                const commandList = askForCommandApi(this);

                let toDisplay: string[] = [];
                let colors: consoleColor[] = [];

                let i: number = 0;
                for(let [commandName, commandData] of commandList){
                    if(commandData.hidden) continue;

                    // checks for a category
                    if(category && (!commandData.categories || !commandData.categories?.includes(category))){
                        continue;
                    }

                    // regex
                    if(regexObj){
                        let found: boolean = false;
                        
                        found ||= regexObj.test(commandName);
                        found ||= regexObj.test(commandData.desc || "");

                        if(regexLong && !found){
                            found ||= regexObj.test(commandData.longdesc || "");

                            for(const one of commandData.categories || []){
                                found ||= regexObj.test(one);
                                if(found) break;
                            }
                        }

                        


                        if(!found) continue;
                    }

                    i++;
                    
                    toDisplay.push("* "); colors.push(consoleColors.FgYellow);
                    toDisplay.push(commandName); colors.push(consoleColors.FgWhite);
                    toDisplay.push(" -> "); colors.push(consoleColors.FgMagenta);

                    if(commandList.exists(commandName, commandtypes.alias)){
                        toDisplay.push(`alias for ${commandData.aliasName}\n`);
                        colors.push(consoleColors.FgGray); 
                    }
                    else{
                        const description = commandData.desc ? commandData.desc + "\n" : "no description specified" + "\n";

                        toDisplay.push(description); 
                        colors.push(consoleColors.FgWhite);
                    }
                }

                // print the amount of those that were found
                toDisplay.push("\n"); colors.push(consoleColors.FgWhite);
                toDisplay.push(String(i)); colors.push(combineColors(consoleColors.BgCyan, consoleColors.FgRed));
                toDisplay.push(` commands found`); colors.push(consoleColors.FgWhite);
                toDisplay.push("\n"); colors.push(consoleColors.FgWhite);

                if(args.isEnding)
                consoleMultiWrite(toDisplay, colors, this.sessionName);

                return onlyToRedirect(toDisplay.join(""));
            }
            else if(length == 1){
                const commandList = askForCommandApi(this);

                let forMulti = new multiDisplayer();

                let cmdToCheck: string = args.argsWithoutArguments[0];


                const commandD = commandList.getOrginal(cmdToCheck);

                if(!commandD){
                    // forMulti.push("There's no reference to ", consoleColors.FgRed);
                    // forMulti.push(cmdToCheck, consoleColors.FgYellow);
                    // forMulti.push(" in any list!\n", consoleColors.FgRed);
                    return expectedError(`There's no reference to: ${consoleColors.FgYellow}${cmdToCheck}${this.colors.specialTypes_error_common} in any list!`);
                }
                else{
                    // let cmd = commands[cmdToCheck];

                    // let cmdTouse;
                    // let cmdTouseName;
                    // if(cmd.isAlias){
                    //     cmdTouseName = cmd.aliasName;
                    //     cmdTouse = commands[cmd.aliasName as string];
                    // }
                    // else{
                    //     cmdTouse = cmd;
                    //     cmdTouseName = cmdToCheck;
                    // } 

                    const name = commandD[0];
                    const data = commandD[1];


                    const aliases = commandList.find({
                        aliasName: name,
                        isAlias: true 
                    });

                    // let toDisplayAl: string = "";
                    let toDisplayAl = aliases.map((alias) => alias[0]).join(", ")
                    // for(const [name, d] of aliases){
                    //     toDisplayAl += name + ", "
                    // }

                    // if(aliases.length > 0){
                    //     toDisplayAl = toDisplayAl.slice(0, -2);
                    // }


                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n");

                    // const commandData = commands[args[1]];

                    forMulti.push(" " + data.usageinfo + "\n\n", consoleColors.FgCyan);


                    forMulti.push("aliases: ", consoleColors.FgGray);
                    forMulti.push((toDisplayAl == "" ? "NOT FOUND" : toDisplayAl) + "\n", consoleColors.FgWhite);
            
                    forMulti.push("categories: ", consoleColors.FgGray);
                    forMulti.push((data.categories ? data.categories.join(", ") : "") + "\n", consoleColors.FgWhite);

                    forMulti.push("hidden: ", consoleColors.FgGray);
                    forMulti.push(String(data.hidden) + "\n", consoleColors.FgWhite);

                    forMulti.push("changable: ", consoleColors.FgGray);
                    forMulti.push(String(data.changeable) + "\n", consoleColors.FgWhite);

                    forMulti.push("minimum version: ", consoleColors.FgGray);
                    forMulti.push((data.minver === undefined ? "NOT SPECIFIED" : data.minver) + "\n", consoleColors.FgWhite);

                    forMulti.push("maximum version: ", consoleColors.FgGray);
                    forMulti.push((data.maxver === undefined ? "NOT SPECIFIED" : data.maxver) + "\n", consoleColors.FgWhite);

                    forMulti.push("short desc: ", consoleColors.FgGray);

                    const description = "desc" in data ? data.desc : "no description specified";

                    forMulti.push(description + "\n", consoleColors.FgWhite);

                    forMulti.push("long desc: ", consoleColors.FgGray);
                    forMulti.push(data.longdesc + "\n", consoleColors.FgWhite);

                    forMulti.push("_______________", consoleColors.BgYellow + consoleColors.FgYellow);
                    forMulti.push("\n")
                }

                if(args.isEnding)
                forMulti.useConsoleWrite(undefined, undefined, this.sessionName);

                return onlyToRedirect(forMulti.toRawString());

                
            }


            return onlyToRedirect(false);

        }
}, ["?", "whatis"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};