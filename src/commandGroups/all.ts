import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandTable as pipeGroup } from "./pipeGroup.js";
import { commandTable as otherShells } from "./othershells.js";
import { commandTable as processCmds } from "./processCommands.js";
import { commandTable as streamsC } from "./streams.js";
import { commandTable as thatShell } from "./thatShell.js";
import { commandTable as uptime} from "../commands/uptime.js";
import { commandTable as meow} from "../commands/meow.js";
import { commandCollection } from "../tools/commandCollection.js";

const commandTable = {
    ...pipeGroup,
    ...otherShells,
    ...processCmds,
    ...streamsC,
    ...thatShell,
    ...uptime,
    ...meow,
    

};

const compounds = cmdTableToCommandCompounts(commandTable)

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}