import clipboard from "clipboardy";
import { connectedToSpecificTerminal, getTerminalOPJ, getTerminalOPJTYPE } from "../../../programdata.js";
import { logSystemError } from "../../../ultrabasic.js";
import { debug } from "../../../log.js";
import { terminalEnvVarGet } from "../../allApis.js";


const ENVFLAGTOFORCE: string = "FORCESIMCLIPBOARD";

function hasGuiClipboard(proc: typeof process) {
  const platform = proc.platform;

  // Windows + macOS always have GUI clipboard in normal sessions
  if (platform === "win32" || platform === "darwin") {
    return true;
  }

  // Linux (needs display server)
  return !!(
    proc.env.DISPLAY ||        // X11
    proc.env.WAYLAND_DISPLAY    // Wayland
  );
}


let simulatedClipBoard: any = undefined;


/**
 * gets the content of clipboard
 * @param context optional context. Defaults to main
 * @returns what is there
 */
async function clipboardGetContent(context: getTerminalOPJTYPE = "main"): Promise<unknown>{
    const ses = getTerminalOPJ(context);

    if(!ses){
        throw new logSystemError("the clipboard system requires a valid session");
    }

    if(!ses.procLinked){
        throw new Error("no process linked to the context");
    }

    const hasSupport: boolean = hasGuiClipboard(ses.procLinked) && terminalEnvVarGet<string>(context, ENVFLAGTOFORCE) !== "true";

    let toRet: any;
    if(hasSupport){
        try {
            toRet = await clipboard.read();
        } catch (error) {
            await debug("clipboard system was unable to use clipboardy package. Using backup...", undefined, context);

            toRet = structuredClone(simulatedClipBoard);
        }
    }
    else{
        toRet = structuredClone(simulatedClipBoard);
    }

    return toRet;
}


/**
 * sets clipboard's context
 * @param to to what
 * @param context optional context. Defaults to main
 */
async function clipboardSetContent(to: any, context: getTerminalOPJTYPE = "main"): Promise<void>{
    const ses = getTerminalOPJ(context);

    if(!ses){
        throw new logSystemError("the clipboard system requires a valid session");
    }

    if(!ses.procLinked){
        throw new Error("no process linked to the context");
    }

    const hasSupport: boolean = hasGuiClipboard(ses.procLinked) && terminalEnvVarGet<string>(context, ENVFLAGTOFORCE) !== "true";

    // let toRet: any;
    if(hasSupport){
        try {
            await clipboard.write(to);
        } catch (error) {
            await debug("clipboard system was unable to use clipboardy package. Using backup...", undefined, context);

            simulatedClipBoard = structuredClone(to);
        }
    }
    else{
        simulatedClipBoard = structuredClone(to);
    }
}

/**
 * Checks if there's a native support for clipboard
 * @param context optional context. Defaults to main
 * @returns true or false
 */
async function clipboardIsNativeSupport(context: getTerminalOPJTYPE = "main"): Promise<boolean>{
    const ses = getTerminalOPJ(context);

    if(!ses){
        throw new logSystemError("the clipboard system requires a valid session");
    }

    if(!ses.procLinked){
        throw new Error("no process linked to the context");
    }

    return hasGuiClipboard(ses.procLinked) && terminalEnvVarGet<string>(context, ENVFLAGTOFORCE) !== "true";

}

class clipboardManager extends connectedToSpecificTerminal{
    constructor(context: getTerminalOPJTYPE = "main"){
        super(context);
    }
    
    /**
     * gets the content of clipboard
     * @returns what is there
     */
    async get(): Promise<any>{
        return await clipboardGetContent(this.sessionName);
    }

    /**
     * sets clipboard's context
     * @param to to what
     */
    async set(to: any): Promise<void>{
        await clipboardSetContent(to, this.sessionName);
    }

    /**
     * Checks if there's a native support for clipboard
     * @returns true or false
     */
    async isNativeSupport(): Promise<boolean>{
        return await clipboardIsNativeSupport(this.sessionName);
    }
}

function askForClipboardManager(context: getTerminalOPJTYPE = "main"): clipboardManager{
    return new clipboardManager(context);
}

export {clipboardGetContent, clipboardSetContent, clipboardIsNativeSupport, clipboardManager, askForClipboardManager}