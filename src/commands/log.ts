import { log, LogType } from "../log.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("log", {
    usageinfo: "true",
    desc: "outputs true if redacted",
    longdesc: "outputs true if something of that is redacted",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["if", "pipe"],
    async: true,
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs, this);

        const sessionName: string = args.argsWithDoubleDash['session'] ? args.argsWithDoubleDash['session'] : this.sessionName;
        const logTypeT: string = args.argsWithDoubleDash['type'] ? String(args.argsWithDoubleDash['type']).toUpperCase() : "INFO";

        

        let toLog: string = "";
        for(let i = 0; i < args.argsWithoutArguments.length; i++){
            toLog += args.argsWithoutArguments[i];

            if(i !== args.argsWithoutArguments.length - 1) toLog += " ";
        }


        await log(LogType[logTypeT as keyof typeof LogType], toLog, undefined, sessionName);
        


    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};