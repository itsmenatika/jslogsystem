import { commandTable as args } from "../commands/arguments.js";
import { commandTable as f } from "../commands/false.js";
import { commandTable as t } from "../commands/true.js";
import { commandTable as n } from "../commands/nil.js";
import { commandTable as arglen } from "../commands/argumentslength.js";
import { commandTable as strs } from "../commands/string.js";
import { commandTable as num } from "../commands/number.js";
import { commandTable as inspect } from "../commands/inspect.js";
import { commandTable as parameter } from "../commands/parameter.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";


const commandTable = {
    ...args,
    ...t,
    ...f,
    ...n,
    ...arglen,
    ...strs,
    ...num,
    ...inspect,
    ...parameter,
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}