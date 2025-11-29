import { InspectOptions, InspectOptionsStylized, inspect } from "util";

/**
 * type of that special type
 */
enum specialTypes{
    null, // unkown
    redirection, // only return if it's for a redirection to another medium
    unkownCmd, // that command doesnt exist
    pipeExecutorHalt, // stop that pipe line
    explicitUndefined // display undefined. Don't treat it as non result
}

/**
 * special type with special meaning in command pipeline
 */
interface controlTypes{
    __$special: specialTypes,
    val?: any,
    [inspect.custom]?(depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string
}

/**
 * SPECIAL COMMAND TYPE: will only return if it is redirect to another medium
 */
interface onlyIfRedirected extends controlTypes{
    __$special: specialTypes.redirection,
    val: any,
}

/**
 * SPECIAL COMMAND TYPE: will stop pipeline
 */
interface pipeExecutorHalt extends controlTypes{
    __$special: specialTypes.pipeExecutorHalt
} 

/**
 * SPECIAL COMMAND TYPE: will force it to display undefined
 */
interface pipeExplicitUndefined extends controlTypes{
    __$special: specialTypes.explicitUndefined
} 

/**
 * checks whether a provided thing is a control command type
 * @param val thing
 * @returns result
 */
function isControlType(val: any): val is controlTypes{
    return typeof val === "object" && val && "__$special" in val;
}

/**
 * creates a special command type. The value will be returned only if it's redirected to another medium
 * 
 * if it is not, then undefined will be returned
 * (undefined is not displayed be default)
 * 
 * it is not dependent on special arguments
 * 
 * @param val the value
 * @returns redirection special type
 */
function onlyToRedirect(val: any): onlyIfRedirected{
    return {
        __$special: specialTypes.redirection, 
        val,
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string) {
            return `onlyToRedirect((\`${inspect(val, options as InspectOptionsStylized)}\`)}`;
        }
    };
}


function isOnlyToRedirect(val: any): val is onlyIfRedirected{
    return val && typeof val === "object" &&
    "__$special" in val &&
    val.__$special === specialTypes.redirection;
}


/**
 * creates a special command type. It will force the current pipeline to stop
 * 
 * @returns pipehalt special type
 */
function pipeHalt(): pipeExecutorHalt{
    return {
        __$special: specialTypes.pipeExecutorHalt,
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string) {
            return `pipeHalt()`;
        }
    };
}

function isPipeHalt(val: any): val is pipeExecutorHalt{
    return typeof val === "object" && val && "__$special" in val &&
    val.__$special === specialTypes.pipeExecutorHalt;
}

/**
 * creates a special command type. It will force undefined to be displayed and not treated as no return value.
 * 
 * @returns pipehalt special type
 */
function explicitUndefined(): pipeExplicitUndefined{
    return {
        __$special: specialTypes.explicitUndefined,
        [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string) {
                    return `explicitUndefined()`;
        }
    };
}

function isExplicitUndefined(val: any): val is pipeExplicitUndefined{
    return typeof val === "object" && val && "__$special" in val &&
    val.__$special === specialTypes.explicitUndefined;
}


export {
    specialTypes,
    controlTypes,
    onlyIfRedirected,
    pipeExecutorHalt,
    pipeExplicitUndefined,

    isControlType,

    onlyToRedirect,
    isOnlyToRedirect,

    pipeHalt,
    isPipeHalt,

    explicitUndefined,
    isExplicitUndefined
}