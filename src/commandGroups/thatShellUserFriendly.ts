import { commandTable as helpZ } from "../commands/help.js";
import { commandTable as clearZ } from "../commands/clear.js";
import { commandTable as bindZ } from "../commands/bind.js";
import { commandTable as versionZ } from "../commands/version.js";
import { commandTable as sleep } from "../commands/sleep.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";


const commandTable = {
    ...helpZ,
    ...clearZ,
    ...bindZ,
    ...versionZ,
    ...sleep
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}