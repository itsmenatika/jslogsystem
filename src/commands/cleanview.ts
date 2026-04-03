import { setTimeout } from "timers/promises";
import { expectedError } from "../apis/allApis.js";
import { askForFullControl, codeMatchWhat } from "../apis/terminal/fullControl.js";
import { consoleUltraRawWrite, consoleWrite } from "../out.js";
import { cursorAbs, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("cleanview", {
    usageinfo: "cleanview <...data> [<--sep <SEPERATOR>>]",
    desc: "shows a text in a clean manner",
    longdesc: multiLineConstructor(
        "shows a text in a clean manner using an alternate buffer from fullController",
        "",
        "It will only shown strings that were passed there",
        "",
        "you can use --sep <SEPERATOR> to change a seperator between texts. It defaults to ' '",
        "",
        "NOTE: some terminals may not support scroll properly in an alternate buffer mode! So, it's better to keep your texts small!",
        "",
        "use ESCAPE key to go back. USE ctrl c to forcefully crash the jslogsystem"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["text", "buffer"],
    async callback(preargs: any[]): Promise<any>{
        // get arguments
        const argsD = smartArgs(preargs, this);
        const args = argsD.argsWithoutArguments;

        // seperator
        let seperator = " ";
        if(argsD.argsWithDoubleDash['sep']){
            seperator = argsD.argsWithDoubleDash['sep'];
        }

        // get a full control
        const fulcon = askForFullControl(this);

        // prepare material for printing
        let ToPrint: string = "";
        for(let i = 0; i < args.length; i++){
            if(typeof args[i] !== "string") continue;

            ToPrint += args[i] + seperator;
        }

        // setup listeners
        fulcon.addListener('in', "data", async (data: any) => {
            if(fulcon.codeMatch(data, codeMatchWhat.ctrlc)){
                fulcon.ctrlC(this.logNode);
                return;
            }

            if(fulcon.codeMatch(data, codeMatchWhat.escape)){
                fulcon.end();
                return;
            }
        });

        // display
        await fulcon.codeAsyncAlt(async () => {
            consoleWrite(
                cursorAbs(0,0) + ToPrint,

                undefined,
                false,
                undefined,
                this
            );

            await fulcon.dontClose();

            
        });

        
    
    }
}, ["clnvw"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};