import { commandTable as logsZ} from "../commands/logs.js";
import { commandTable as hideZ } from "../commands/hide.js";
import { commandTable as helpZ } from "../commands/help.js";
import { commandTable as clearZ } from "../commands/clear.js";
import { commandTable as bindZ } from "../commands/bind.js";
import { commandTable as existsx } from "../commands/exists.js";
import { commandTable as versionZ } from "../commands/version.js";
import { commandTable as term } from "../commands/terminal.js";
import { commandTable as timer } from "../commands/timer.js";
import { commandTable as envZ } from "../commands/environment.js";
import { commandTable as sleep } from "../commands/sleep.js";
import { commandTable as call } from "../commands/call.js";
import { commandTable as loggroup } from "../commands/loggroup.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";
import { commandCollection } from "../tools/commandCollection.js";


const commandTable = {
    ...logsZ,
    ...hideZ,
    ...helpZ,
    ...clearZ,
    ...bindZ,
    ...existsx,
    ...term,
    ...versionZ,
    ...timer,
    ...envZ,
    ...sleep,
    ...call,
    ...loggroup
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}