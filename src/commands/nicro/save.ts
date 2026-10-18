import { writeFile } from "node:fs/promises";
import { cdDummy, expectedError, terminalEnvVarSet } from "../../apis/allApis.js";
import { fullNicroData } from "./types.js";

async function saveEverything(data: fullNicroData): Promise<void>{
    // consolidate buffer
    const toSave: string = data.text.join(data.endline);

    // terminalEnvVarSet(data.context, "s", `${data.savePath}, ${data.writeOnly}`);

    // save
    if(data.savePath != "" && !data.writeOnly){
        try {
            const where: string = cdDummy(data.context, data.savePath);
            await writeFile(where, toSave);
            return;
        } catch (error) {
            // terminalEnvVarSet(data.context, "n", `daw`);
            data.forcereturnthing = expectedError("it was not possible to write a file");
            data.fulcon.end();
            return;
        }
        
    }

    data.forcereturnthing = expectedError("tried to save to write only file");
    data.fulcon.end();       
}

export {saveEverything}