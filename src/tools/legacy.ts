import { getTerminalOPJTYPE } from "../programdata.js";
import { consoleShortHand } from "./consoleShortHand.js";
import { NodeJsWrappedConsole } from "./nodejsConsole.js";

/**
 * Creates a fake async task that forces the app to never exit
 * 
 * It is not required as long there is any listener with outside world (like listening for input on stdin)
 * 
 * It is usually not required, except for very specific cases
 * 
 * It will almost for sure not be required with quickSetup()
 * 
 * It used to be required previous to version 1.3
 * 
 * Higher resolveTime will mean less CPU resources wasted
 * 
 * @param resolveTime the time between each loop iteraction
 * @returns the function to stop it
 */
function keepProcessAlive(resolveTime: number = 20): () => void{
    let keep: boolean = true;

    const func = () => {
        keep = false;
    };

    (async () => {
        while(keep){
            await new Promise((resolve) => setTimeout(resolve, resolveTime));
        }
    })();

    return func;
}

/**
 * @deprecated
 * 
 * Replace global Console obj with NODEJSWrappedConsole, allowing you to forward stuff into logging system easily
 * 
 * it was deprecated due to safety reasons
 * 
 * @param session session to use. It defaults to main. It was not available before it was deprecated!
 * @param use What replacement to use. It uses by default more compatible to standard node.js console NodeJsWrappedConsole. Though you may want to change it to 'consoleShortHand' as it was more compatible with the previous versions of jslogsystem. It was not available before it was deprecated!
 */
function replaceConsole(
    session: getTerminalOPJTYPE = 'main',
    use: "NodeJsWrappedConsole" | "consoleShortHand" = "NodeJsWrappedConsole"
){
    let newCon: consoleShortHand | NodeJsWrappedConsole;
    if(use == "consoleShortHand"){
        newCon = new consoleShortHand(session);
    }
    else{
        newCon = new NodeJsWrappedConsole(session);
    }

    const orginalCon = globalThis.console;

    Object.assign(globalThis,
        {
            console: newCon,
            newConsole: newCon,
            orginalConsole: orginalCon
        }
    );
}



export {keepProcessAlive, replaceConsole}