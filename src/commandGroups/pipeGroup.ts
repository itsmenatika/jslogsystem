import { commandTable as args } from "../commands/arguments.js";
import { commandTable as f } from "../commands/false.js";
import { commandTable as t } from "../commands/true.js";
import { commandTable as n } from "../commands/nil.js";
import { commandTable as arglen } from "../commands/argumentslength.js";
import { commandTable as strs } from "../commands/string.js";
import { commandTable as num } from "../commands/number.js";
import { commandTable as inspect } from "../commands/inspect.js";
import { commandTable as parameter } from "../commands/parameter.js";
import { commandTable as objtar } from "../commands/objecttoarray.js";
import { commandTable as revr } from "../commands/reverse.js";
import { commandTable as tonext } from "../commands/tonext.js";
import { commandTable as spacetoarguments } from "../commands/spacetoarguments.js";
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
    ...objtar,
    ...revr,
    ...tonext,
    ...spacetoarguments
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}