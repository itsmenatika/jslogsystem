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
        // "-w -> only owned properties",
        "--depth DEPTH -> to set the depth",
        "--arlen LENGTH -> to set max array size",
        "--strlen LENGTH -> to set max string size",
        "--brklen LENGTH -> to set the length at which input values are split across multiple lines",
        "",
        "exclusive:",
        "-k -> parse only keys of top level",
        "-v -> parse only values of top level",
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
                args.dashCombined.includes("§") || args.isEnding || (
                    !args.dashCombined.includes("o") && legacyApi.pipes && !legacyApi.specialArguments
                )
            )
        )
        );

        const showHidden = args.dashCombined.includes("h");

        const customInspect = !args.dashCombined.includes("d");


        const compact = !args.dashCombined.includes("l");

        const getters = args.dashCombined.includes("g")

        const numericSeparator = args.dashCombined.includes("n");

        const depth = args.argsWithDoubleDash['depth'] || 2;
        const arrayLength = args.argsWithDoubleDash['arlen'] || 100;
        const stringLength = args.argsWithDoubleDash['strlen'] || 10000;
        const breakLength = args.argsWithDoubleDash['brklen'] || 80;

        const getKeys = args.dashCombined.includes("k");
        const getValues = args.dashCombined.includes("v");
        const ownedProperties = args.dashCombined.includes("w");

        if(getKeys && getValues){
            return "-k and -v are exclusive";
        }

        // const toParse: any[] = args.argsWithoutArguments.map(
        //     (arg) => {
        //         if(ownedProperties){

        //         }
        //         else return arg;
        //     }
        // )

        const toRet: any[] = args.argsWithoutArguments.map(
            (arg) => {

                let toInsp = arg;
                // if(ownedProperties){
                //     toInsp = Object.getOwnPropertyNames(toInsp).reduce(
                //         (obj, key) => {
                //             (obj as any)[key] = toInsp[key];

                //             return obj;
                //         }
                //     );

                // }


                if(getKeys){

                    toInsp = Object.keys(toInsp);
                }
                else if(getValues){
                    toInsp = Object.values(toInsp);
                }
                else{
                    toInsp = toInsp;
                }

                return inspect(toInsp, {
                    colors: useColors,
                    showHidden,
                    customInspect,
                    sorted: true,
                    compact,
                    getters,
                    numericSeparator,
                    depth,
                    maxArrayLength: arrayLength,
                    maxStringLength: stringLength,
                    breakLength
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