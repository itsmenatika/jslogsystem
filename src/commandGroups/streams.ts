import { commandTable as echo} from "../commands/echo.js";
import { commandTable as write } from "../commands/write.js";
import { commandTable as json } from "../commands/json.js";
import { commandTable as b64 } from "../commands/b64.js";
import { commandTable as color } from "../commands/color.js";
import { commandTable as question } from "../commands/question.js";
import { commandTable as nicro } from "../commands/nicro.js";
import { commandTable as stream } from "../commands/stream.js";
import { commandTable as random } from "../commands/random.js";
import { commandTable as randomfloat } from "../commands/randomfloat.js";
import { commandCollection } from "../tools/commandCollection.js";
import { cmdTableToCommandCompounts } from "../tools/commandCreatorTools.js";

const commandTable = {
    ...echo,
    ...write,
    ...json,
    ...b64,
    ...color,
    ...question,
    ...nicro,
    ...stream,
    ...random,
    ...randomfloat
};

const compounds = cmdTableToCommandCompounts(commandTable);

const collection = new commandCollection(commandTable);

export {commandTable, compounds, collection}