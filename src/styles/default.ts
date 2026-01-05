import { combineColors, consoleColors } from "../texttools.js";
import { registerStyle } from "./common.js";

const style = registerStyle(
    "default",
    {
        styleIdentity: "default",
        singleLogGroupText: "┄┅",
        lastLogGroupText: "░",
        logDisplayed: `{colors.date}{formattedDate}{color.Reset} {logTypeString} {colors.who}{who}{color.Reset}: {colors.currentGroupString_color}{currentGroupString}{color.Reset}{logColor}{message}{color.Reset}\n`,
        logWritten: `{formattedDate} {logTypeString} {who}: {currentGroupString}{message}\n`,
        inputTextbox: `{color.Reset}{cwd}{color.Reset}{colors.textboxin_prefixSep}:{color.Reset}{colors.textboxin_terminalName}{sessionName}{color.Reset}{colors.textboxin_infoSep} >{color.Reset} {colors.textboxin_common}{stylizedText}{color.Reset}`,
        
        info: "INFO",
        warning: "WARNING",
        error: "ERROR",
        success: "SUCCESS",
        counter: "COUNTER",
        init: "INIT",
        crash: "CRASH",
        group: "GROUP",

        info_secondary: "INFO",
        warning_secondary: "WARNING",
        error_secondary: "ERROR",
        success_secondary: "SUCCESS",
        counter_secondary: "COUNTER",
        init_secondary: "INIT",
        crash_secondary: "CRASH",
        group_secondary: "GROUP",

        colors: {
            "info": consoleColors.FgWhite,
            "warning": consoleColors.FgYellow,
            "error": consoleColors.FgRed,
            "success": consoleColors.FgGreen,
            "counter": consoleColors.FgCyan,
            "init": consoleColors.FgWhite,
            "crash": consoleColors.FgRed,
            "group": consoleColors.FgGray,

            "info_secondary": consoleColors.FgWhite,
            "warning_secondary": consoleColors.FgYellow,
            "error_secondary": consoleColors.FgRed,
            "success_secondary": consoleColors.FgGreen,
            "counter_secondary": consoleColors.FgCyan,
            "init_secondary": consoleColors.FgWhite,
            "crash_secondary": consoleColors.FgRed,
            "group_secondary": consoleColors.FgGray,

            "date": consoleColors.FgGray,
            "who": consoleColors.FgMagenta,
            "currentGroupString_color": consoleColors.FgGray,

            "textboxin_infoSep": consoleColors.Bright,
            "textboxin_common": consoleColors.FgYellow,
            "textboxin_terminalName": consoleColors.Italic,
            "textboxin_cwd": consoleColors.FgGray,
            "textboxin_prefixSep": consoleColors.FgGray,

            "textboxin_text_common": consoleColors.FgWhite,
            "textboxin_text_first": combineColors(consoleColors.FgYellow, consoleColors.Underscore),
            "textboxin_text_direct": consoleColors.FgGreen,
            "textboxin_text_sep": consoleColors.FgGray,
            "textboxin_text_quotas": consoleColors.FgGray
        }    
    } 
);

export {style as STYLE_DEFAULT}