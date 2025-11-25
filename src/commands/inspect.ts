import { inspect } from "util";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";

const commandTable = quickCmdWithAliases("inspect", {
    usageinfo: "inspect <...args> <...data>",
    desc: "inspects data",
    longdesc: multiLineConstructor(
        "tries to color out or/and show the properties of an object (works like node js internal inspect)",
        "",
        "arguments:",
        "-h -> shows hidden properties",
        "-f -> colorizes the data (always)",
        "-c -> colorize only if -t provided (ALSO WORKS WITH LEGACY)",
        "-o -> don't care about legacy (requires -c parameter to work)",
        "-d -> skip custom inspector if exists",
        "-l -> allows to longer descriptions (long option)",
        "-a -> force output as an array",
        "-g -> allows for getters and setters to be seen",
        "-n -> number seperator",
        "",
        "",
        "if provided with more than one arguments it will return an array",
        "if provided with less than one argument then it will return that object"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: any[]): any{
        const args = smartArgs(preargs, this);
        const legacyApi = askForLegacy(this);

        const useColors = (
            args.dashCombined.includes("f") || (
            args.dashCombined.includes("c") && (
                args.dashCombined.includes("t") || args.isEnding || (
                    !args.dashCombined.includes("o") && legacyApi.pipes && !legacyApi.specialArguments
                )
            )
        )
        );

        const showHidden = args.dashCombined.includes("h");

        const depth = 3;

        const customInspect = !args.dashCombined.includes("d");


        const compact = !args.dashCombined.includes("l");

        const getters = args.dashCombined.includes("g")

        const numericSeparator = args.dashCombined.includes("n");

        const toRet: any[] = args.argsWithoutArguments.map(
            (arg) => {
                return inspect(arg, {
                    colors: useColors,
                    showHidden,
                    customInspect,
                    sorted: true,
                    compact,
                    getters,
                    numericSeparator

                })
            }
        );

        if(toRet.length === 0 && !args.dashCombined.includes("a")){
            return undefined;
        }
        else if(toRet.length === 1 && !args.dashCombined.includes("a")){
            return toRet[0];
        }

        return toRet;
    }
}, ["insp"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};