import { existsSync, readdirSync, readFileSync, unlinkSync } from "fs";
import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { commandContext } from "../apis/commands/types";
import { log, LogType } from "../log.js";
import { combineColors, consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { logLocs } from "../apis/commands/osApis/filesystem.js";
import { join } from "path";

const commandTable = quickCmdWithAliases("logs", {
    usageinfo: "logs [<-d [...names]|-a>]",
    desc: "allows you to manage logs",
    longdesc: multiLineConstructor(
        "it allows you to manage your logs",
        "",
        "'logs' to display the list of logs",
        "'logs NAME' to display the content of that log",
        "'logs -d name1 ... nameN' to remove certain logs",
        "'logs -d latest' to remove the content of the current loging file (WARNING: it requires a session restart to restore logging)",
        "'logs -d -a' to delete all logging files except latest"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preArgs: string[]): any{
        const args = smartArgs(preArgs, this);
        const g = new multiDisplayer();

        const logDic = logLocs(this).logDirectory;

        if(args.length === 0){
            const f = readdirSync(logDic);

            for(let file of f){
                if(file === "temp") continue;
                g.push("* ", consoleColors.FgYellow);

                if(file.endsWith(".txt")) file = file.slice(0, -4);
                g.push(file, consoleColors.FgWhite);
                g.push("\n");
            }
        }
        else if(args.length === 1){
            const path = join(logDic, args.args[0]);

            let res;
            if(existsSync(path)){
                res = readFileSync(path);
                
                if(args.isEnding){
                    g.push("CONTENT OF " + path, combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                    g.push("\n");
                }
                g.push(String(res));
                
                if(args.isEnding){
                    g.push("CONTENT OF " + path, combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                    g.push("\n");
                }
            }
            else if(existsSync(path + ".txt")){
                res = readFileSync(path + ".txt");
                if(args.isEnding){
                    g.push("CONTENT OF " + path + ".txt", combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                    g.push("\n");
                }
                g.push(String(res));
                
                if(args.isEnding){
                    g.push("CONTENT OF " + path + ".txt", combineColors(consoleColors.BgMagenta, consoleColors.FgWhite));
                    g.push("\n");
                }
            }
            else{
                g.push(path, consoleColors.FgWhite);
                g.push(" NOT FOUND", consoleColors.FgRed);
                if(args.isEnding)
                g.push("\n");
            }
        }
        else if(args.args.includes("-d") && args.args.includes("-a")){
            const f = readdirSync(logDic).filter(
                (s) => s !== "latest.txt" && s !== "temp"
            );

            for(const file of f){
                g.push("* ", consoleColors.FgYellow);
                g.push(file, consoleColors.FgWhite);
                unlinkSync(join(logDic, file));
                g.push(" DELETED \n");
            }

            g.push("\n");
            g.push(`${f.length}/${f.length+1} DELETED`, consoleColors.BgMagenta);
            g.push("\n");
        }
        else if(args.args.includes("-d")){
            const whatToDelete = args.args.filter(
                (s) => s !== "-d"
            );

            let c = 0;
            for(let del of whatToDelete){
                let where = join(logDic, del);

                if(existsSync(where)){
                    unlinkSync(where);
                    g.push("* ", consoleColors.FgYellow);
                    g.push(where, consoleColors.FgWhite);
                    g.push(" DELETED \n");
                    c++;
                }
                else if(existsSync(where+".txt")){
                    unlinkSync(where+".txt");
                    g.push("* ", consoleColors.FgYellow);
                    g.push(where, consoleColors.FgWhite);
                    g.push(" DELETED \n");
                    c++;
                }
                else{
                    g.push("* ", consoleColors.FgYellow);
                    g.push(where, consoleColors.FgWhite);
                    g.push(" NOT FOUND \n");
                }

                g.push("\n");
                g.push(`${c}/${whatToDelete.length} DELETED`, consoleColors.BgMagenta);
                g.push("\n");
            }
        }


        if(args.isEnding)
        return g.getWhole();

        return g.toRawString();
    },
}, [])

export {commandTable};