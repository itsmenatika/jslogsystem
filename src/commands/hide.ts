import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { textboxVisibility } from "../apis/terminal/textbox.js";
import { consoleWrite } from "../out.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("hide", {
        usageinfo: "hide",
        desc: "hides the textbox that allows you to write",
        longdesc: "It hides the textbox that shows what you are writting. It also displays the message about what has happened.\nThe message is as follows: \n\nThe textbox was hidden. Start writting to make it appear again!\n\nuse: `hide -h` to remove the message\nuse: `hide -c` to use nonslashed arguments as the custom message",
        hidden: false,
        changeable: false,
        isAlias: false,
        categories: ["shell", "terminal"],
        callback(preargs: string[]): onlyIfRedirected{
            let vis: boolean = true;
            let m: string = "The textbox was hidden. Start writting to make it appear again!\n";

            const args = smartArgs(preargs, this);
            
            if(args.dashCombined.includes("h")){
                vis = false;
            }

            if(args.dashCombined.includes("c")){
                m = args.argsWithoutDash.join(" ") + "\n";
            }

            if(vis){
                consoleWrite(
                    m, 
                    undefined, undefined, "", this.sessionName
                );
            }
            
            textboxVisibility(false);
            this._terminalSession.flags['dontChangeTextboxVisiblity'] = true;

            return onlyToRedirect(true);
        }     
}, ["h"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};