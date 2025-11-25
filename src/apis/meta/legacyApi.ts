import { legacyData } from "../../config";
import { commandContext } from "../commands/types";

function askForLegacy(from: commandContext): Readonly<legacyData>{
    return Object.freeze(from._terminalSession.config.legacy);
}


export {askForLegacy, }
