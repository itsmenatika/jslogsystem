import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";


const commandTable = quickCmdWithAliases("write", {
    usageinfo: "write <data>",
    desc: "allows you to print raw characters on the screen",
    longdesc: "It prints the characters into the screen",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback: (args: string[]): string => {
        let toPrint: string = "";
        for(const cur of args.slice(1)){
            if(cur === "-t") continue;

            toPrint += cur + " ";
        }

        let theString = toPrint.slice(0, -1);

        // let theString: string = args.slice(1).join(" ");

        // consoleWrite(theString + "\n", consoleColors.FgWhite);

        return theString;
    }     

}, ["wrt"]       
);


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds}
   
// const write: commandDataRegular = {
//     usageinfo: "write <data>",
//     desc: "allows you to print raw characters on the screen",
//     longdesc: "It prints the characters into the screen",
//     hidden: false,
//     changeable: false,
//     isAlias: false,
//     callback: (args: string[]): string => {
//         let toPrint: string = "";
//         for(const cur of args.slice(1)){
//             if(cur === "-t") continue;

//             toPrint += cur + " ";
//         }

//         let theString = toPrint.slice(0, -1);

//         // let theString: string = args.slice(1).join(" ");

//         // consoleWrite(theString + "\n", consoleColors.FgWhite);

//         return theString;
//     }        
// };

// const writeAlias: commandAlias = {
//     isAlias: true,
//     aliasName: "write",
//     hidden: true,
//     changeable: false
// }

// const writeObj: cmdTable = {
//     write,
//     wtr: writeAlias
// }

// const compounds: commandCompoundTable = [
//     ["write", write],
//     ["wtr", writeAlias]
// ];

// export {write, writeAlias, writeObj, compounds}