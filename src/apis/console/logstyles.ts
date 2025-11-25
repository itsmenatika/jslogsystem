import { logNode } from "../../log";
import { getTerminalOPJTYPE } from "../../programdata.js";

// group settings
interface logSettings{
    messageVisible?: boolean,
    messageWho?: string | logNode,
    error?: boolean,
    terminal?: getTerminalOPJTYPE,
    return?: string
}

type logSettingsRequired = Required<logSettings>;

export {logSettings, logSettingsRequired}
