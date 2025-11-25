import { cd } from "../apis/commands/osApis/filesystem.js";
import { collection } from "../commandGroups/all.js";
import { configDataProvide, constructConfig } from "../config.js";
import { setupInHandlerListener } from "../in.js";
import { setUpInterrupsForProcess } from "../interrup.js";
import { createNewTerminal } from "../programdata.js";
import { logSystemError } from "../ultrabasic.js";
import { welcome } from "./welcome.js";



/**
 * 
 * HIGH LEVEL API
 * 
 * It creates a basic main terminal with all commands available
 * 
 * you can remove/add commands using config
 * 
 * that is a high level api.
 * FOR LOW LEVEL API SEARCH FOR createTerminal() or createTerminalQuick() for mid level api
 * 
 * @param configD the config of that (OPTIONAL)
 * @param chwdToSelectedCwd whether to sync cwd
 */
function quickSetup(configD: configDataProvide = {}, chwdToSelectedCwd: boolean = true){
    const toSend = {commandTable: collection};

    Object.assign(toSend, configD);

    const nT = createNewTerminal(
        "main", 
        {
            config: constructConfig(toSend),
            out: process.stdout,
            in: process.stdin,
        }
    );

    if(!nT){
        throw new logSystemError("The quick system was not able to create a main terminal properly");
    }

    if(chwdToSelectedCwd && nT.procLinked){
        nT.procLinked.chdir(nT.cwd);
    }

    welcome(nT);


    setupInHandlerListener(nT);
    setUpInterrupsForProcess(nT);
}

export {quickSetup}