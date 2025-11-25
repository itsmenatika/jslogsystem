import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { cmdTable, commandAlias, commandCompoundTableType, commandDataRegular } from "../apis/commands/types";
import { clearConsole } from "../tools/clearConsole.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";



const commandTable = quickCmdWithAliases("clear", {
    usageinfo: "clear",
    desc: "clears the whole screen",
    longdesc: "It clears the whole screen using clearConsole(). Aliases: cls",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: string[]): onlyIfRedirected{
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