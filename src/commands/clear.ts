import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { cmdTable, commandAlias, commandCompoundTableType, commandDataRegular } from "../apis/commands/types";
import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { clearConsole } from "../tools/clearConsole.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";



const commandTable = quickCmdWithAliases("clear", {
    usageinfo: "clear",
    desc: "clears the whole screen",
    longdesc: multiLineConstructor(
        "It clears the whole screen using clearConsole(). Aliases: cls",
        "",
        "use --message MSG to send its return message. Use quotas for space"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(preargs: string[]): onlyIfRedirected{
        const args = smartArgs(preargs, this);

        if(
            "message" in args.argsWithDoubleDash
        ){
            clearConsole(this.sessionName);
            return args.argsWithDoubleDash['message'];
        }

        clearConsole(this.sessionName);
        return onlyToRedirect(true);

        
    }   
}, ["cls"]);


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds}
   
// const clear: commandDataRegular = {
//     usageinfo: "clear",
//     desc: "clears the whole screen",
//     longdesc: "It clears the whole screen using clearConsole(). Aliases: cls",
//     hidden: false,
//     changeable: false,
//     isAlias: false,
//     callback: (args: string[]): onlyIfRedirected => {
//         clearConsole();
//         return onlyToRedirect(true);

        
//     }   
// };

// const clearAlias: commandAlias = {
//     isAlias: true,
//     aliasName: "clear",
//     hidden: true,
//     changeable: false
// }

// const clearObj: cmdTable = {
//     clear,
//     cls: clearAlias
// }

// const compounds: commandCompoundTable = [
//     ["clear", clear],
//     ["cls", clearAlias]
// ];

// export {clear, clearAlias, clearObj, compounds}