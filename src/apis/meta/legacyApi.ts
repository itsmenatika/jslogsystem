import { legacyData } from "../../config.js";
import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";
import { commandContext } from "../commands/types.js";

function askForLegacy(from: getTerminalOPJTYPE): Readonly<legacyData>{
    const ses = getTerminalOPJ(from);

    return ses.config.legacy;
}


export {askForLegacy, }
