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

    "date"?: allColorType,
    "who"?: allColorType,
    "currentGroupString_color"?: allColorType,

    "textboxin_infoSep"?: allColorType,
    "textboxin_common"?: allColorType,
    "textboxin_terminalName"?: allColorType,
    "textboxin_cwd"?: allColorType,
    "textboxin_prefixSep"?: allColorType,

    "textboxin_text_common"?: allColorType,
    "textboxin_text_first"?: allColorType,
    "textboxin_text_direct"?: allColorType,
    "textboxin_text_sep"?: allColorType,
    "textboxin_text_quotas"?: allColorType
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


function registerStyle(name: string, data: terminalStylesProvide = {}): terminalStyles{
    return data as terminalStyles;
}


export {
    colorTableProvide, colorTable,
    terminalStylesProvide, terminalStyles,

    registerStyle
}