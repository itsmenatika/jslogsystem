
import { readFile } from "node:fs/promises";
import { cdDummy, commandContext } from "../apis/allApis.js";
import { expectedError, onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { askQuestion } from "../apis/terminal/asker.js";

const commandTable = quickCmdWithAliases("stream", {
        usageinfo: "stream",
        desc: "manages streams (REVERSED)",
        longdesc: multiLineConstructor(
            "* "
        ),
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["stream", "input", "text", "manipulation"],
        callback(preargs: any[]){
            return expectedError("NOT DONE");
        }               
}, ["strm"]);

export {commandTable};