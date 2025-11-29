import { multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("getonlinedataservice", {
    usageinfo: "getonlinedataservice [<-j/-t/-s/-o/-r/-b>] <URL>",
    desc: "fetches online data",
    longdesc: multiLineConstructor(
        "fetches data from the web",
        "",
        "available arguments:",
        "-j <- convert to object according to the json format",
        "-t <- convert to the text",
        "-s <- get status code",
        "-o <- returns true or false according to whether the communication was successful",
        "-r <- returns true or false according to whether the communication was redirected",
        "-b <- returns blob (default)",
        "",
        "it will use a blob by default. If more than one option is selected, an object will be returned",
        "",
        "the command is asynchronous!"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    async callback(preArgs: any[]): Promise<any>{
        const args = smartArgs(preArgs, this);

        const url = args.argsWithoutArguments[0];

        const fetched = await fetch(url);

        const res = await fetched.blob();

        let toRet: Record<string, any> = {};

        if(args.dashCombined.includes("t")){
            toRet['text'] = await res.text()
        }

        if(args.dashCombined.includes("b")){
            toRet['blob'] = res;
        }

        if(args.dashCombined.includes("j")){
            try {
                toRet['json'] = JSON.parse(await res.text());
            } catch (error) {
                toRet['json'] = null;
            }
        }

        if(args.dashCombined.includes("s")){
            toRet['status'] = fetched.status;
        }

        if(args.dashCombined.includes("o")){
            toRet['ok'] = fetched.ok;
        }        

        if(args.dashCombined.includes("r")){
            toRet['ok'] = fetched.redirected;
        }        


        const keysOfRet = Object.keys(toRet);

        if(keysOfRet.length == 1){
            return toRet[keysOfRet[0]];
        }
        else if(keysOfRet.length == 0){
            return res;
        }
        else{
            return toRet;
        }
    }
}, ["gods"])

const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};