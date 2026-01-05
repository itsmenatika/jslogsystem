import { legacyData } from "../../config.js";
import { commandContext } from "../commands/types.js";

function askForLegacy(from: commandContext): Readonly<legacyData>{
    return Object.freeze(from._terminalSession.config.legacy);
}


export {askForLegacy, }
