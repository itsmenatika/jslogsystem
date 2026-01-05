import { terminalStyles, terminalStylesProvide } from "./common.js";
import { STYLE_DEFAULT } from "./default.js";

/**
 * construct terminal styles
 * @param data selected settings to change
 * @returns the terminal styles obj
 */
function constructStyles(data: terminalStylesProvide = {}): terminalStyles{
    const newStyles = {...STYLE_DEFAULT};

    Object.assign(newStyles, data);
    newStyles.colors = {...STYLE_DEFAULT.colors};

    if(data.colors){
        Object.assign(newStyles.colors, data.colors);
    }

    return Object.freeze(newStyles);
}


export {constructStyles}