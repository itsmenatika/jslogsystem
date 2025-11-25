import { setupInHandlerListener } from "../../in.js";
import { createNewTerminal, terminalCreateData } from "../../programdata.js"
import { welcome } from "../../tools/welcome.js";

/**
 * 
 * middle level api for creating a terminal without using high level api
 * 
 * it will setup everything for you and you still have a huge control over what you want to do
 * 
 * NOTE: IT WILL NOT ADD ANY DEFAULT COMMANDS!
 * 
 * @param name the name of the terminal
 * @param data the data
 * @returns whether it has succeded
 */
function createTerminalQuick(name: string, data: terminalCreateData): boolean{
    const s = createNewTerminal(name, data);

    if(!s) return false;

    welcome(s);
    setupInHandlerListener(s);

    return true;
}

export {createTerminalQuick}