import { getTerminalOPJ, getTerminalOPJTYPE } from "../programdata.js";

function ifDebug(func: () => void, terminal: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(terminal);

    if(ses.env.DEBUG){
        func();
    }
}

async function ifDebugAsync(func: () => Promise<void>, terminal: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(terminal);

    if(ses.env.DEBUG){
        await func();
    }
}

function ifNoDebug(func: () => void, terminal: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(terminal);

    if(!ses.env.DEBUG){
        func();
    }
}

async function ifNoDebugAsync(func: () => Promise<void>, terminal: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(terminal);

    if(!ses.env.DEBUG){
        await func();
    }
}

export {
    ifDebug, ifDebugAsync,
    ifNoDebug, ifNoDebugAsync
}