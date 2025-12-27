import { commandTable as evalZ} from "../commands/eval.js";
import { commandTable as cmd } from "../commands/cmd.js";
import { commandTable as powershell } from "../commands/powershell.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";

const commandTable = {
    ...evalZ,
    ...cmd,
    ...powershell
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}