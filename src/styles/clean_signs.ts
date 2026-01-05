import { combineColors, consoleColors } from "../texttools.js";
import { registerStyle } from "./common.js";

const style = registerStyle(
    "cleanSigns",
    {
        styleIdentity: "cleanSigns",
        singleLogGroupText: "┄┅",
        lastLogGroupText: "░",
        logDisplayed: `{colors.date}{formattedDate}{color.Reset} {colors.who}{who}{color.Reset} {logTypeString} {colors.currentGroupString_color}{currentGroupString}{color.Reset}{message}{color.Reset}\n`,
        logWritten: `{formattedDate} {who} {logTypeString} {currentGroupString}{message}\n`,
        inputTextbox: `{color.Reset}{colors.textboxin_common}{stylizedText}{color.Reset}`,
        
        info: "💬",
        warning: "🚨",
        error: "❌",
        success: "✅",
        counter: "🖩",
        init: "✴",
        crash: "🚩",
        group: "📁",
        
        colors: {
            "info": consoleColors.NoColor,
            "warning": consoleColors.NoColor,
            "error": consoleColors.NoColor,
            "success": consoleColors.NoColor,
            "counter": consoleColors.NoColor,
            "init": consoleColors.NoColor,
            "crash": consoleColors.NoColor,
            "group": consoleColors.NoColor,

            "date": combineColors(consoleColors.BgGray, consoleColors.FgBlack),
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

export {style as STYLE_CLEANSIGNS}