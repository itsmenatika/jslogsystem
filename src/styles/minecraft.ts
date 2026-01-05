import { combineColors, consoleColors } from "../texttools.js";
import { registerStyle } from "./common.js";

const style = registerStyle(
    "minecraft",
    {
        styleIdentity: "minecraft",
        singleLogGroupText: "┄┅",
        lastLogGroupText: "░",
        // 2013-03-11 19:15:33 [INFO] <[Owner]Mythcartoonist> Hello!
        logDisplayed: `{colors.date}{formattedDate}{color.Reset} [{colors.who}{who}{color.Reset}/{logTypeString}]: {colors.currentGroupString_color}{currentGroupString}{color.Reset}{logColor}{message}{color.Reset}\n`,
        logWritten: `{formattedDate} [{who}/{logTypeString}]: {currentGroupString}{message}\n`,
        inputTextbox: `{color.Reset}{colors.textboxin_common}{stylizedText}{color.Reset}`,
        colors: {
            "info": consoleColors.FgWhite,
            "warning": consoleColors.FgYellow,
            "error": consoleColors.FgRed,
            "success": consoleColors.FgGreen,
            "counter": consoleColors.FgCyan,
            "init": consoleColors.FgWhite,
            "crash": consoleColors.FgRed,
            "group": consoleColors.FgGray,

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

export {style as STYLE_MINECRAFT}