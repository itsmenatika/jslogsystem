import { onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForVersion } from "../apis/meta/version.js";
import { combineColors, consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("version", {
    usageinfo: "version [-a] [-i] [-s] [-u] [-e] [-b] [-x]",
    desc: "shows the version information",
    longdesc: multiLineConstructor("shows the version information",
        "",
        "use -i to get an int version",
        "use -s to get a string version",
        "use -u to get an user set version data",
        "use -e to get an edition",
        "use -b to get a branch",
        "use -x to get a whether a version is experimental",
        "",
        "use -a to get all information",
        "",
        "if piped, it uses 'version -i' by default"
        ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["terminal", "shell", "jslogsystem"],
    callback(preArgs: any[]): any {
        const args = smartArgs(preArgs, this);

        const verApi = askForVersion(this);


        const toReturn: Record<string, number | string | boolean> = {};

        const all = args.dashCombined.includes("a");

        if(args.dashCombined.includes("i") || all){
            toReturn['int'] = verApi.number;
        }

        if(args.dashCombined.includes("s") || all){
            toReturn['str'] = verApi.string;
        }

        if(args.dashCombined.includes("u") || all){
            toReturn['user'] = verApi.user;
        }

        if(args.dashCombined.includes("e") || all){
            toReturn['edition'] = verApi.edition;
        }

        if(args.dashCombined.includes("b") || all){
            toReturn['branch'] = verApi.branch;
        }

        if(args.dashCombined.includes("x") || all){
            toReturn['isExperimental'] = verApi.isExperimental;
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
            d.push(` (${verApi.edition} EDITION) `);

            if(verApi.isExperimental || verApi.branch !== "main"){
                d.push("\n");

                if(verApi.isExperimental){
                    d.push("EXPERIMENTAL", combineColors(consoleColors.Blink, consoleColors.FgRed, consoleColors.Bright));
                }

                if(verApi.branch !== "main"){
                    d.push(`${verApi.branch} branch`);
                }
            }

            d.push("\n\n");
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