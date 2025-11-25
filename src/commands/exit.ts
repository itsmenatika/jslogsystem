import { textboxVisibility } from "../apis/terminal/textbox.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { actualCrash } from "../tools/exit.js";

const commandTable = quickCmdWithAliases("exit", {
    usageinfo: "exit <exit code...>",
    desc: "allows you to stop the process",
    longdesc: "It will execute process.exit(exitcode) that will cause the whole process to cease to exist. Your work may be lost. But sometimes it's the only easy way to close your program. If you want to safe close, consider using safeexit/sexit (though it requires setting the handler by the app before!).",
    hidden: false,
    changeable: false,
    isAlias: false,
    callback(args: string[]): boolean{
        let exitCode: any = args.slice(1).filter(s => {
            return s != "-t";
        })
        .join(" ").trim();
        
        exitCode = exitCode ? exitCode : 0;
        // log(LogType.CRASH, "The execution was manually stopped by EXIT COMMAND with code: "+ exitCode);
        // process.stdout.write("\x1b[0m");
        // process.exit(exitCode);
        textboxVisibility(false, this.sessionName);
        actualCrash("The execution was manually stopped by EXIT COMMAND with code: "+ exitCode, "core", -1, this.sessionName);
        return false;
    }
}, ["crash", "quit", "q", "halt"])


const compounds = cmdTableToCommandCompounts(commandTable);

export {commandTable, compounds};