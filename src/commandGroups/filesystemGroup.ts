import { commandTable as cdC} from "../commands/cd.js";
import { commandTable as dir} from "../commands/dir.js";
import { commandTable as remove} from "../commands/remove.js";
import { commandTable as cat} from "../commands/cat.js";
import { commandTable as wc} from "../commands/wc.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";

const commandTable = {
    ...cdC,
    ...dir,
    ...remove,
    ...cat,
    ...wc
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}