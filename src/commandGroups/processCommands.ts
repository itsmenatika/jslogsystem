import { commandTable as exitC} from "../commands/exit.js";
import { commandTable as cdC} from "../commands/cd.js";
import { commandTable as infoC} from "../commands/info.js";
import { commandTable as dir} from "../commands/dir.js";
import { commandTable as remove} from "../commands/remove.js";
import { commandTable as clipboard} from "../commands/clipboard.js";
import { commandTable as start} from "../commands/start.js";
import { commandTable as open} from "../commands/open.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";

const commandTable = {
    ...exitC,
    ...cdC,
    ...infoC,
    ...dir,
    ...remove,
    ...clipboard,
    ...start,
    ...open
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}