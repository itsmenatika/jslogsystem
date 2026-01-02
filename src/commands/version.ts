import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForVersion } from "../apis/meta/version.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("version", {
    usageinfo: "version [-i] [-s] [-u]",
    desc: "shows the version information",
    longdesc: multiLineConstructor("shows the version information",
        "",
        "use -i to get int version",
        "use -s to get string version",
        "use -u to get user set version data",
        "",
        "if piped it uses 'version -i' by default"
        ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "jslogsystem"],
    callback(preArgs: any[]): any {
        const args = smartArgs(preArgs, this);

        const verApi = askForVersion(this);

        const toReturn: Record<string, number | string> = {};

        if(args.dashCombined.includes("i")){
            toReturn['int'] = verApi.number;
        }

        if(args.dashCombined.includes("s")){
            toReturn['str'] = verApi.string;
        }

        if(args.dashCombined.includes("u")){
            toReturn['user'] = verApi.user;
        }

        let len = Object.keys(toReturn).length;

        if(len === 1){
            return toReturn[Object.keys(toReturn)[0]];
        }
        else if(len > 1){
            return toReturn;
        }

        if(args.isEnding){
            const d = new multiDisplayer();

            d.push("logSystem ", consoleColors.FgYellow);
            d.push("v" + verApi.string, consoleColors.FgRed);
            d.push(" by ");
            d.push("Naticzka", consoleColors.Blink);
            d.push("\n");
            d.push("The description of that version:", consoleColors.Reverse);
            d.push("\n");
            d.push(verApi.user, consoleColors.FgRed);
            d.push("\n");


            // consoleWrite("logSystemVer: ", undefined, undefined, "", this);
            // consoleWrite(this._terminalSession.logSystemVer, consoleColors.BgCyan, undefined, "", this);
            // consoleWrite(" by naticzka", [consoleColors.FgMagenta, consoleColors.Blink], "", this);
            // consoleWrite(config.getversionInfoData(), consoleColors.BgGray);
            // return undefined;

            return d.getWhole();
        }

        return onlyToRedirect(verApi.number);
        // }
    }                
}, ["ver", "v"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};