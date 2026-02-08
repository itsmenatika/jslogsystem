import { expectedError } from "../apis/allApis.js";
import { multiLineConstructor } from "../texttools.js";
import { removeInternalArguments } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const isFunction = function(obj: any): obj is Function{
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

const AsyncFunction = (async () => {}).constructor;

const commandTable = quickCmdWithAliases("call", {
    usageinfo: "call [<...data>] <function>",
    desc: "executes a function",
    longdesc: multiLineConstructor(
        "executes a function",
        "",
        "supports async functions and normal ones",
        "",
        "everything can be passed",
        "",
        "for very obvious reasons, that command is considered not safe and is not in safe shell group"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["caller", "unsafe", "shell", "javascript"],
    async callback(preargs: any[]): Promise<any>{
        const args = removeInternalArguments(preargs);

        // if there was no room for a function to be
        if(args.length < 1){
            return expectedError("Fuction expected");
        }

        // check for being a function
        const funcCandidate = args.at(-1);

        if(!isFunction(funcCandidate)){
            return expectedError("The last argument should be a function to be called but it is not");
        }

        // prepare args
        const argsToBeUsed = args.slice(0, -1);

        // execute
        let res: any = void 0;
        if(funcCandidate instanceof AsyncFunction){
            // IT DOES
            // @ts-ignore
            res = await funcCandidate.apply(
                this,
                [argsToBeUsed]
            );
        }
        else{
            res = funcCandidate.apply(
                this,
                [argsToBeUsed]
            );
        }



        return res;
    }
}, [])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};