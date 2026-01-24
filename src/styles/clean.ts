import { combineColors, consoleColors } from "../texttools.js";
import { registerStyle } from "./common.js";

const style = registerStyle(
    "clean",
    {
        styleIdentity: "clean",
        singleLogGroupText: "┄┅",
        lastLogGroupText: "░",
        // 2013-03-11 19:15:33 [INFO] <[Owner]Mythcartoonist> Hello!
        logDisplayed: `{colors.date}{formattedDate}{color.Reset} {colors.who}{who}{color.Reset} {logColor}{logTypeString}{color.Reset} {colors.currentGroupString_color}{currentGroupString}{color.Reset}{color.Bright}{message}{color.Reset}\n`,
        logWritten: `{formattedDate} {who} {logTypeString} {currentGroupString}{message}\n`,
        inputTextbox: `{color.Reset}{colors.textboxin_common}{beforeSelected}{colors.textboxin_selected}{selected}{color.Reset}{colors.textboxin_common}{afterSelected}{color.Reset}`,
        
        info: "INFO",
        warning: "WARNING",
        error: "ERROR",
        success: "SUCCESS",
        counter: "COUNTER",
        init: "INIT",
        crash: "CRASH",
        group: "GROUP",
        
        colors: {
            "info": combineColors(consoleColors.FgWhite),
            "warning": combineColors(consoleColors.BgYellow, consoleColors.FgBlack),
            "error": combineColors(consoleColors.BgRed, consoleColors.FgBlack),
            "success": combineColors(consoleColors.BgGreen, consoleColors.FgBlack),
            "counter": combineColors(consoleColors.BgCyan, consoleColors.FgBlack),
            "init": combineColors(consoleColors.BgMagenta, consoleColors.FgBlack),
            "crash": combineColors(consoleColors.BgRed, consoleColors.FgBlack),
            "group": combineColors(consoleColors.BgMagenta, consoleColors.FgBlack),

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

export {style as STYLE_CLEAN}