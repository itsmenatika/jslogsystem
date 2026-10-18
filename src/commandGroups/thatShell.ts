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
import { commandTable as runtime } from "../commands/runtime.js";
import { commandTable as debug } from "../commands/debug.js";
import { commandTable as debugstate } from "../commands/debugstate.js";
import { commandTable as restart } from "../commands/restart.js";
import { commandTable as title } from "../commands/title.js";
import { commandTable as ascmd } from "../commands/ascmd.js";
import { commandTable as log } from "../commands/log.js";
import { commandTable as styles } from "../commands/styles.js";
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
    ...loggroup,
    ...runtime,
    ...debug,
    ...debugstate,
    ...restart,
    ...title,
    ...ascmd,
    ...log,
    ...styles
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}