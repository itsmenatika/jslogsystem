import { commandTable as meow} from "../commands/meow.js";
import { commandTable as simplesnake} from "../commands/simplesnake.js";
import { commandCollection } from "../tools/commandCollection.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";

const commandTable = {
    ...meow,
    ...simplesnake
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}