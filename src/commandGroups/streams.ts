import { commandTable as echo} from "../commands/echo.js";
import { commandTable as write } from "../commands/write.js";
import { commandCollection } from "../tools/commandCollection.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";

const commandTable = {
    ...echo,
    ...write
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}