import { expectedError, terminalTitle } from "../apis/allApis.js";
import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("title", {
    usageinfo: "title [<--session sessionName>] [<-g>] [<-s>] <name>",
    desc: "sets a title for a window",
    longdesc: multiLineConstructor(
        "sets a title for a window",
        "",
        "-s -> sets it to session, not only a process",
        "--session NAME -> allows to set to a different session",
        "-g -> only get it, not set"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["caller", "unsafe", "shell", "javascript"],
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs);

        const sessionSpecific: boolean = args.dashCombined.includes("s");
        const sessionName = args.argsWithDoubleDash['session'];
        const get = args.dashCombined.includes("g");

        if(get){
            if(sessionSpecific){
                return terminalTitle(sessionName || this.sessionName);
            }
            return process.title;
        }

        let title: string[] = [];

        for(const one of args.argsWithoutArguments){
            switch(typeof one){
                case "string": {
                    title.push(one);
                    break;
                }
                case "number": {
                    title.push(String(one));
                    break;
                }
                case "bigint": {
                    title.push(one.toString());
                    break;
                }
                case "boolean": {
                    title.push(String(one));
                    break;
                }
                case "symbol": {
                    title.push(String(one));
                    break;
                }
                default: break;
            }
        }

        const doneTitle = title.join(" ");

        if(sessionSpecific){
            terminalTitle(this.sessionName, doneTitle);
        }
        else
        process.title = doneTitle;





        return title;
    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};