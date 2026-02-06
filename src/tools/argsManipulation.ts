import { inspect, InspectOptionsStylized, InspectOptions } from "util";
import { terminalSession } from "../programdata.js";
import { commandContext, isCommandContext } from "../apis/commands/types.js";
import { askForLegacy } from "../apis/allApis.js";

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
    argsWithoutDash: any[],
    /**
     * it excludes any string that has the first character "-" and internal arguments
     */
    argsWithoutArguments: any[],

    /**
     * the orginal array without the execution name
     */
    argsWithoutOne: any[],


    /**
     * arguments with -- dashes
     */
    argsWithDoubleDash: Record<string, any>,

    /**
     * iterates through .args
     */
    [Symbol.iterator](): any,
    [Symbol.toStringTag](): string
    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string
}

const internalArgsList = ["-§"];

interface smartArgsOptions{
    /**
     * whether to use faster functions, that may be buggy or not work in the future
     * 
     * It defaults to true.
     * 
     * change it to false if undefined behaviour is occuring.
     * 
     * example of changes:
     * 
     * 
     * // VERSION WITH BYPASS
     * usesInternalArgs = context._terminalSession.config.legacy.specialArguments;
     * 
     * // VERSION WITHOUT BYPASS
     * usesInternalArgs = askForLegacy(context).specialArguments;
     * 
     */
    bypass?: boolean
}

/**
 * parses the provided arguments into easy to use object with different options
 * 
 * @param preargs arg list
 * @param context the context, that will be used as a help. it is optional but recommended
 * @param options the options
 * @returns 
 */
function smartArgs(
    preargs: ArrayLike<any>, 
    context?: terminalSession | commandContext,
    options: smartArgsOptions = {}
): smartArgumentList{

    if(!Array.isArray(preargs)){
        throw new TypeError("Only arrays are permitted");
    }
    
    // whether to expect internal arguments like -§
    let usesInternalArgs = true;
    if(isCommandContext(context)){
        if(options.bypass !== false){
            // use a bypass of _terminalSession to speedup it
            usesInternalArgs = context._terminalSession.config.legacy.specialArguments;
        }
        else

        // VERSION WITHOUT BYPASS
        usesInternalArgs = askForLegacy(context).specialArguments;
    }
    else if(context !== undefined){
        usesInternalArgs = context.config.legacy.specialArguments;
    }
    
    const commandName = preargs[0]; // the name that executed that
    const argsWithoutOne = preargs.slice(1); // arguments without that name
    
    const argsFiltered: any[] = []; // arguments without internal ones
    const argsWithDash: string[] = []; // arguments that were proceeded by - and not by --
    const argsWithDoubleDash: Record<string, any> = {}; // arguments that were proceeded by --
    const argsWithoutDash: string[] = []; // arguments without all dashed arguments (string ONES)

    const argsWithoutArguments: any[] = []; // arguments without all dashes arguments (all of them)

    const internalArgs: string[] = []; // internal args list

    let isEnding: boolean = !usesInternalArgs; // whether it is the last command
    
    let noArgumentsPassThisPoint: boolean = false; // whether arguments are no longer accepted

    

    // go through all of the arguments
    for(let i = 0; i < argsWithoutOne.length; i++){
        const arg = argsWithoutOne[i];

        // if it is a string type
        if(typeof arg === "string"){
            // whether it is a special sign
            if(arg === "--"){
                noArgumentsPassThisPoint = true;
                continue;
            }

            // if there was no arguments pass that point
            if(noArgumentsPassThisPoint){
                argsWithoutDash.push(arg);
                argsFiltered.push(arg);
                argsWithoutArguments.push(arg);
                continue;
            }

            // if it is a internal argument
            if(internalArgsList.includes(arg)){
                // add to internal ones
                internalArgs.push(arg);
    
                // change isEnding if it was -§
                if(arg === "-§") isEnding ||= true;
            }
            else{
                // add to filtered ones without special arguments
                argsFiltered.push(arg);
            }
            
            // dashed arguments
            if(arg.length > 0 && arg[0] === "-"){
                // double dashed
                if(arg.length > 1 && arg[1] === "-"){
                    const name: string = arg.slice(2);

                    let value: any = void 0;
                    if( i + 1 < argsWithoutOne.length){
                        value = argsWithoutOne[++i];
                    }
                    
                    argsWithDoubleDash[name] = value;


                    continue;
                }

                // single dashed
                argsWithDash.push(arg.slice(1));
            }
            // if it was not a dashed argument
            else{
                argsWithoutDash.push(arg);
                argsWithoutArguments.push(arg);
            }
        }
        // if it was something different from string
        else{
            argsFiltered.push(arg);
            argsWithoutArguments.push(arg);
        }



        
    }

    // combine all single dashed arguments
    const dashCombined = argsWithDash.join("");

    return {
        // orginal ones
        array: [...preargs],
        orginal: [...preargs],
        orginalLength: preargs.length,

        argsWithoutOne,

        // executed as:
        name: commandName,
        commandName,

        // arguments without the name
        args: argsFiltered,
        length: argsFiltered.length,

        // internals
        internalArgs,
        internal: internalArgs,
        isEnding,

        // dashed
        dashed: argsWithDash,
        argsWithDash,
        dashCombined,
        argsWithoutDash,
        argsWithoutArguments,
        
        argsWithDoubleDash,

        // internal js functions
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

// enum argumentType{
//     plain,
//     argument
// }

// interface argumentData{
//     name: string,
//     type?: argumentType
// }

// type argumentDataFinal = Required<argumentData>;

// interface descriptiveArgsResult{
//     orginal: Readonly<any[]>,
//     orginalStrings: Readonly<string[]>

// }

// /**
//  * 
//  */
// class descriptiveArgs{

//     $argumentList: Record<string, argumentDataFinal> = {};

//     constructor(){

//     }


//     addArgument(data: argumentData){
        

//         const objToSend: argumentDataFinal = {
//             name: data.name,
//             type: data.type === undefined ? argumentType.plain : data.type
//         };

//         this.$argumentList[objToSend.name] = objToSend;
//     }

//     parseFromArgs(...data: string[]){
//         return this.parse([...data]);
//     }

//     parse(data: any[]): descriptiveArgsResult{

//         const orginalStrings: string[] = [];
//         const args: Record<string, string|null> = {};

//         const argsPlain: string[] = [];

//         for(let i = 0; i < data.length; i++){
//             const obj = data[i];

//             if(typeof obj !== "string") continue;

//             orginalStrings.push(obj);

//             if(obj.length < 1) continue;

            
//             if(this.$argumentList[obj]){
//                 if(this.$argumentList[obj].type === argumentType.plain){
//                     argsPlain.push(obj.slice(1));
//                 }
//                 else if(this.$argumentList[obj].type === argumentType.argument){

//                 }
//             }

//             -sdagw --dda d


//         }



//         return {
//             orginal: data,
//             orginalStrings

//         }

//     }


//     $parsePlain(obj: string){

//     }
// }

// const g = new descriptiveArgs();
// g.addArgument(
//     {
//         name: "s",
//     }
// );


// g.parse(['s', 'g']).orginal

export {smartArgs, removeInternalArguments}