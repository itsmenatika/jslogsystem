import { commandTable as exitC} from "../commands/exit.js";
import { commandTable as cdC} from "../commands/cd.js";
import { commandTable as infoC} from "../commands/info.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";

const commandTable = {
    ...exitC,
    ...cdC,
    ...infoC
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}