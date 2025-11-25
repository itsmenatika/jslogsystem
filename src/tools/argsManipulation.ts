import { inspect, InspectOptionsStylized, InspectOptions } from "util";
import { terminalSession } from "../programdata";
import { commandContext, isCommandContext } from "../apis/commands/types.js";

function removeInternalArguments(ar: any[]): any[]{
    return ar.filter(
        (val) => {
            return typeof val != "string" || !internalArgsList.includes(val);
        }
    );
}

/**
 * HIGH level api to speed up the argument parsing process
 */
interface smartArgumentList{
    /**
     * the name of the command
     */
    name: string,
    /**
     * the name of the command (alias for name)
     */
    commandName: string,
    /**
     * args without internal arguments like -t
     */
    args: string[],
    /**
     * orginal array passed there
     */
    array: string[],
    /**
     * orginal array passed there
     */
    orginal: string[],
    /**
     * length of the orginal array
     */
    orginalLength: number,
    /**
     * internal args like -t passed there
     */
    internalArgs: string[],
    /**
     * internal args like -t passed there (an alias for internalArgs)
     */
    internal: string[],

    /**
     * whether smartargs suspect that command to be the ending command chain one
     */
    isEnding: boolean,
    /**
     * the number of arguments (excluding the internal ones like -t)
     * 
     * it is defacto an alias for .args.length
     */
    length: number,

    /**
     * list of arguments that were proceeded with -
     */
    dashed: string[],

    /**
     * list of arguments that were proceeded with -
     * 
     * an alias to .dashed
     */
    argsWithDash: string[],

    /**
     * joined dashed args. useful for detecting things like -dc instead of -d -cs
     */
    dashCombined: string,
    
    /**
     * arguments excluding internal ones, - ones. Note: it does not include objects passed as arguments
     * if you want objects: use .argsWithoutArguments 
    */
    argsWithoutDash: string[],
    /**
     * it excludes any string that has the first character "-" and internal arguments
     */
    argsWithoutArguments: string[],

    /**
     * iterates through .args
     */
    [Symbol.iterator](): any,
    [Symbol.toStringTag](): string
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string
}

const internalArgsList = ["-t"];

function smartArgs(preargs: any[], context: terminalSession | commandContext): smartArgumentList{
    let usesInternalArgs = true;
    if(isCommandContext(context)){
        usesInternalArgs = context._terminalSession.config.legacy.specialArguments;
    }
    else{
        usesInternalArgs = context.config.legacy.specialArguments;
    }
    
    const commandName = preargs[0];
    const argsWithoutOne = preargs.slice(1);
    // console.log(argsWithoutOne, preargs);
    
    const argsFiltered: string[] = [];
    const argsWithDash: string[] = [];
    const argsWithoutDash: string[] = [];

    const argsWithoutArguments: string[] = [];

    const internalArgs = [];
    let isEnding: boolean = !usesInternalArgs;
    
    let usedDoubleDashOnly: boolean = false;

    for(const arg of argsWithoutOne){
        // console.log(typeof arg, arg, arg === "-t", arg == "-t", arg in internalar);
        if(typeof arg === "string"){
            if(arg === "--"){
                usedDoubleDashOnly = true;
                continue;
            }

            if(usedDoubleDashOnly){
                argsWithoutDash.push(arg);
                argsFiltered.push(arg);
                continue;
            }

            if(internalArgsList.includes(arg)){
                internalArgs.push(arg);
    
                // console.log(arg, arg === "-t")
                if(arg === "-t") isEnding ||= true;
            }
            else{
                argsFiltered.push(arg);
            }
            
            if(arg.length > 0 && arg[0] === "-"){
                argsWithDash.push(arg.slice(1));
            }
            else{
                argsWithoutDash.push(arg);
                argsWithoutArguments.push(arg);
            }
        }
        else{
            argsFiltered.push(arg);
            argsWithoutArguments.push(arg);
        }



        
    }

    const dashCombined = argsWithDash.join("");

    return {
        name: commandName,
        commandName,
        args: argsFiltered,
        array: preargs,
        orginal: preargs,
        orginalLength: preargs.length,
        internalArgs,
        internal: internalArgs,
        isEnding,
        length: argsFiltered.length,
        dashed: argsWithDash,
        argsWithDash,
        dashCombined,
        argsWithoutDash,
        argsWithoutArguments,
        [Symbol.iterator](){
            let i = 0;
            return {
                next(){
                    // console.log(i,  argsFiltered.length);
                    if(i < argsFiltered.length){
                        return {value: argsFiltered[i++], done: false}
                    }
                    else{
                        return {done: true}
                    }
                }
            }
        },
        [Symbol.toStringTag](){
            return `smartArgs{${commandName}(\`${argsWithoutOne.join(" ")}\`)}`;
        },
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string) {
            return `smartArgs{${commandName}(\`${inspect(argsWithoutOne, options as InspectOptionsStylized)}\`)}`;
        }
    };

}

export {smartArgs, removeInternalArguments}