import { commandTable as gods} from "../commands/getonlinedataservice.js";
import { commandCollection } from "../tools/commandCollection.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";

const commandTable = {
    ...gods,
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}