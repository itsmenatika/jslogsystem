import { allColorType, consoleColors } from "../texttools.js";


interface colorTableProvide{
    "info"?: allColorType,
    "warning"?: allColorType,
    "error"?: allColorType,
    "success"?: allColorType,
    "counter"?: allColorType,
    "init"?: allColorType,
    "crash"?: allColorType,
    "group"?: allColorType,
    "timer"?: allColorType,

    "info_secondary"?: allColorType,
    "warning_secondary"?: allColorType,
    "error_secondary"?: allColorType,
    "success_secondary"?: allColorType,
    "counter_secondary"?: allColorType,
    "init_secondary"?: allColorType,
    "crash_secondary"?: allColorType,
    "group_secondary"?: allColorType,
    "timer_secondary"?: allColorType,

    "date"?: allColorType,
    "who"?: allColorType,
    "currentGroupString_color"?: allColorType,

    "textboxin_infoSep"?: allColorType,
    "textboxin_common"?: allColorType,
    "textboxin_terminalName"?: allColorType,
    "textboxin_cwd"?: allColorType,
    "textboxin_prefixSep"?: allColorType,
    "textboxin_selected"?: allColorType,

    "textboxin_text_common"?: allColorType,
    "textboxin_text_first"?: allColorType,
    "textboxin_text_direct"?: allColorType,
    "textboxin_text_sep"?: allColorType,
    "textboxin_text_quotas"?: allColorType,

    "specialTypes_error_common"?: allColorType
}

type colorTable = Required<colorTableProvide>;


interface terminalStylesProvide extends Record<string, any>{
    /**
     * the string that identifies a style
     */
    styleIdentity?: string,

    /**
     * the text that is added to every log group when displaying them
     * 
     * it defaults to: "┄┅"
     */
    singleLogGroupText?: string,

    /**
     * the text that is added to the last log group when displaying them
     * 
     * it is not added if there are not groups
     * 
     * it defaults to: "░"
     */
    lastLogGroupText?: string,

    /**
     * The template which is used to displayed the log
     * 
     * It defaults to: `{colors.date}{formattedDate}{color.Reset} {logTypeString} {colors.who}{who}{color.Reset}: {color.FgGray}{currentGroupString}{color.Reset}{logColor}{message}{color.Reset}\n`
     */
    logDisplayed?: string,

    /**
     * The template which is used to write the log
     * 
     * It defaults to: `{formattedDate} {logTypeString} {who}: {currentGroupString}{message}\n`
     */
    logWritten?: string,


    inputTextbox?: string,


    info?: string,
    warning?: string,
    error?: string,
    success?: string,
    counter?: string,
    init?: string,
    crash?: string,
    group?: string,

    info_secondary?: string,
    warning_secondary?: string,
    erro_secondaryr?: string,
    success_secondary?: string,
    counter_secondary?: string,
    init_secondary?: string,
    crash_secondary?: string,
    group_secondary?: string,

    colors?: colorTableProvide
}

type terminalStyles = Required<terminalStylesProvide> & {colors: colorTable};


// /**
//  * construct terminal styles
//  * @param data selected settings to change
//  * @returns the terminal styles obj
//  */
// function constructStyles(data: terminalStylesProvide = {}): terminalStyles{
//     const newStyles = {...default_terminalStyles};

//     Object.assign(newStyles, data);
//     newStyles.colors = {...default_colorTable};

//     if(data.colors){
//         Object.assign(newStyles.colors, data.colors);
//     }

//     return Object.freeze(newStyles);
// }


const styleList: Record<string, terminalStylesProvide> = {};


/**
 * registers a new style
 * 
 * Throws a range error if that name is taken
 * @param name the name to be registered on
 * @param data the data of that style
 * @returns that style
 */
function registerStyle(name: string, data: terminalStylesProvide = {}): terminalStyles{
    if(Object.hasOwn(styleList, name)){
        throw new RangeError("There's already a style with that registered name! (looking for: " + name + " )");
    }

    styleList[name] = data;


    return data as terminalStyles;
}

/**
 * searches for names of style
 * 
 * ALTERNATIVES: getStyles, getExactStyle
 * 
 * @param like regEx of string to be searched on. String will be changed to a regex
 * @returns the list of likely names
 */
function stylesNames(like?: RegExp | string): string[]{
    const list: string[] = Object.keys(styleList);

    if(typeof like === undefined) return list;

    const toTest: RegExp = new RegExp(like as RegExp | string);

    return list.filter(
        (one) => {
            return toTest.test(one);
        }
    )

}

/**
 * gets the exact style object
 * @param name the name of that style
 * @returns undefined or that style
 */
function getExactStyle(name: string): undefined | terminalStylesProvide{
    if(Object.hasOwn(styleList, name)) return styleList[name];
    else return undefined;
}

/**
 * checks whether that style exists
 * @param name the name of the style
 * @returns boolean
 */
function styleExists(name: string): boolean{
    return Object.hasOwn(styleList, name);
}


/**
 * checks whether that style exists (BUT WITH LIKE. IT'S A LOT SLOWER THAN EXACT)
 * @param name the name of the style
 * @returns boolean
 */
function styleLikeExists(like?: RegExp | string): boolean{
    return stylesNames(like).length > 0;
}

/**
 * searches for names of style. But returns objects
 * 
 * ALTERNATIVES: stylesNames, getExactStyle
 * 
 * @param like regEx of string to be searched on. String will be changed to a regex
 * @returns the list of likely names
 */
function getStyles(like?: RegExp | string): [string, terminalStylesProvide][]{
    const listOfStylesToGet = stylesNames(like);
    
    return listOfStylesToGet.map((name: string) => [name, styleList[name]]);
}


export {
    colorTableProvide, colorTable,
    terminalStylesProvide, terminalStyles,

    registerStyle,
    stylesNames,
    getExactStyle,
    styleExists,
    styleLikeExists,
    getStyles
}