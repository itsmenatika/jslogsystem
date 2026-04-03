import { exit } from "process";
import { askForBindApi, askForCommandApi, commandCompoundType, expectedError, terminalApi } from "../apis/allApis.js";
import { commandDividerInternal, pipeDividerInternal } from "../apis/commands/commandParser.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { consoleShortHand } from "../tools/consoleShortHand.js";
import { consoleWrite } from "../out.js";
import { uptimeVar } from "../ultrabasic.js";
import { askForFullControl } from "../apis/terminal/fullControl.js";
import { setTimeout } from "timers/promises";
import { createInterface } from "readline/promises";
import { debug } from "../log.js";

const commandTable = quickCmdWithAliases("internal", {
    usageinfo: "internal <function> [<...data>]",
    desc: "internal functions",
    longdesc: multiLineConstructor(
        "allows you to execute internal functions",
        "",
        "those functions are mostly used for testing and should not be treated as stable ones",
        "",
        "functions:",
        "",
        "smartargs -> returns the smartargs",
        "preargs -> returns the normal args",
        "doubledashed -> double dashed",
        "dashcombined -> dash combined",
        "dashed -> dashed",
        "isend -> is Ending",
        "internalargs -> internal args",
        "terminalApi",
        "shorthand",
        "pipedivide",
        "commanddivide",
        "this",
        "session",
        "smartargspassed",
        "exit",
        "uptimevar",
        "getcmdobj",
        "bindapi",
        "cmdapi",
        "",
        "those functions won't be documented!!"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["unsafe", "internal", "testing"],
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs, this);


        switch(args.args.at(0)?.toLocaleLowerCase()){
            case "smartargs":
                return args;

            case "preargs":
                return preargs;

            case "doubledashed":
                return args.argsWithDoubleDash;
            
            case "dashcombined":
                return args.dashCombined;

            case "dashed":
                return args.dashed;

            case "isend":
                return args.isEnding;
            
            case "internalargs":
                return args.internalArgs;


            case "terminalaspi":
                return new terminalApi(this);

            case "shorthand":
                return new consoleShortHand(this);

            case "pipedivide":
                return pipeDividerInternal(args.args[1], 0);

            case "commanddivider":
                return commandDividerInternal(args.args[1]);

            case "this":
                return this;

            case "session":
                return this._terminalSession;

            case "smartargspassed":
                // consoleWrite(String(this.passedData), undefined, undefined, "\n", this);
                // consoleWrite(this.passedData.length, undefined, undefined, "\n", this);
                return smartArgs(this.passedData);

            case "exit":
                exit(-1);
                return;

            case "write":
                consoleWrite(
                    args.args.slice(1).join(" "),
                    undefined,
                    undefined,
                    "\n",
                    this
                );
                return undefined;

            case "uptimevar":
                return uptimeVar;

            case "cmdapi":
                return askForCommandApi(this);

            case "bindapi":
                return askForBindApi(this);

            case "getcmdobj": {
                const cmdName = args.args.at(1);
                const api = askForCommandApi(this);

                if(!cmdName){
                    return "NO NAME SPECIFIED";
                }

                if(!api.exists(cmdName)){
                    return "NO COMMAND FOUND";
                }

                // const list: Readonly<commandCompoundType[]> = api.find({
                //     name: cmdName
                // }, 1);

                // if(!list || list.length === 0){
                //     return "NO COMMAND FOUND";
                // }


                return api.findByName(cmdName);
                
            }

            case "test": {
                const api = askForCommandApi(this);

                api.collection.clear();
                

                return "s";
            }


            case "alt": {
                const fulcon = askForFullControl(this);

                await fulcon.codeAsyncAlt(async () => {
                    consoleWrite("s", consoleColors.FgRed);
                    
                    await setTimeout(2000);
                });

                return 's';
            }


            case "fullcontroltest":
            {
                const fulcon = askForFullControl(this);

                const m = await fulcon.codeAsync(
                    async () => {
                        
                        const s = await createInterface(process.stdin, process.stdout);

                        const w = await s.question("imie: ");

                        

                        s.close();

                
                        return w;



                    }
                );

                return "hej " + m + " !!";


                break;
            }
            case "debuglogtest": {
                debug("meow!");
                break;
            }

            default:{
                return expectedError("internal function not found!");
            }
        }


        return undefined;
    }
});

function getAllListeners(emitter: any) {
  const result = {};
  for (const event of emitter.eventNames()) {
    // @ts-ignore
    result[event] = emitter.listeners(event).slice(); // copy
  }
  return result;
}


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};