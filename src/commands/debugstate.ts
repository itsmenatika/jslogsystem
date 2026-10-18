import { expectedError } from "../apis/allApis.js";
import { debugState, log, LogType } from "../log.js";
import { terminalWithThatNameExists } from "../programdata.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("debugstate", {
    usageinfo: "debugstate",
    desc: "outputs debug state",
    longdesc: "outputs debug state (true or false)",
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["debug"],
    async: true,
    async callback(preargs: any[]): Promise<any>{
        const args = removeInternalArguments(preargs);

        const sessionName: string = args[1] ? args[1] : this.sessionName;

        if(!terminalWithThatNameExists(sessionName)){
            return expectedError("no terminal with that name");
        }

        return debugState(undefined, sessionName);
    }
}, ["dbgst", "dbgstate"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};