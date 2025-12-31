import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";

const defaultSymbol = Symbol("default value");

function terminalEnvVarExists(session: getTerminalOPJTYPE, name: string): boolean{
    const ses = getTerminalOPJ(session);


    return Object.hasOwn(ses.env, name);
}

function terminalEnvVarGet<T>(session: getTerminalOPJTYPE, name: string): T | undefined{
    const ses = getTerminalOPJ(session);


    return Object.hasOwn(ses.env, name) ? ses.env[name] : undefined;
}

function terminalEnvVarSet<T>(session: getTerminalOPJTYPE, name: string, value: T): T{
    const ses = getTerminalOPJ(session);


    return ses.env[name] = value;
}


function terminalEnvVarDelete<T>(session: getTerminalOPJTYPE, name: string): void{
    const ses = getTerminalOPJ(session);


    delete ses.env[name];
}


function terminalEnvVarRouteExists(session: getTerminalOPJTYPE, route: string, delimeter: string = "."): boolean{
    if(route == "") return false;
    
    const ses = getTerminalOPJ(session);

    const toTraverse = route.split(delimeter);

    let cur = ses.env;
    for(let i = 0; i < toTraverse.length; i++){
        if(
            typeof cur !== "object" ||
            !Object.hasOwn(cur, toTraverse[i])
        ) return false;

        cur = cur[toTraverse[i]];
    }

    return true;
}

function terminalEnvVarRouteGet<T>(session: getTerminalOPJTYPE, route: string, delimeter: string = "."): T | undefined{
    if(route == "") return undefined;
    
    const ses = getTerminalOPJ(session);

    const toTraverse = route.split(delimeter);

    let cur = ses.env;
    for(let i = 0; i < toTraverse.length; i++){
        if(
            typeof cur !== "object" ||
            !Object.hasOwn(cur, toTraverse[i])
        ) return undefined;

        cur = cur[toTraverse[i]];
    }

    if(
        typeof cur === "object"
        &&
        Object.hasOwn(cur, defaultSymbol)
    ) return cur[defaultSymbol];

    return cur as T;   
}

function terminalEnvVarRouteSet<T>(session: getTerminalOPJTYPE, route: string, value: T, delimeter: string = "."): T | undefined{
    if(route == "") return undefined;
    
    const ses = getTerminalOPJ(session);

    const toTraverse = route.split(delimeter);

    let cur = ses.env;
    for(let i = 0; i < toTraverse.length - 1; i++){
        const part = toTraverse[i];

        if(!Object.hasOwn(cur, part)){
            cur[part] = {};
            cur = cur[part];
            continue;
        }
        
        if(typeof cur[part] !== "object"){
            const now = cur[part];

            cur[part] = {
                [defaultSymbol]: now
            };
        }
        cur = cur[part];
    }

    if(typeof cur[toTraverse[toTraverse.length - 1]] === "object"){
        cur[toTraverse[toTraverse.length - 1]][defaultSymbol] = value;
    }
    else{
        cur[toTraverse[toTraverse.length - 1]] = value;
    }

    return cur[toTraverse[toTraverse.length - 1]];   
}

function terminalEnvVarRouteDelete(session: getTerminalOPJTYPE, route: string, delimeter: string = "."): void{
    if(route == "") return undefined;
    
    const ses = getTerminalOPJ(session);

    const toTraverse = route.split(delimeter);

    let cur = ses.env;
    for(let i = 0; i < toTraverse.length - 1; i++){
        const part = toTraverse[i];

        if(!Object.hasOwn(cur, part)){
            cur[part] = {};
            cur = cur[part];
            continue;
        }
        
        if(typeof cur[part] !== "object"){
            const now = cur[part];

            cur[part] = {
                [defaultSymbol]: now
            };
        }

        cur = cur[part];
    }

    if(typeof cur[toTraverse[toTraverse.length - 1]] === "object"){
        if(Object.hasOwn(cur[toTraverse[toTraverse.length - 1]], defaultSymbol)){
            delete cur[toTraverse[toTraverse.length - 1]][defaultSymbol];
        }
    }
    else{
        delete cur[toTraverse[toTraverse.length - 1]];
    }
}

function terminalEnvVarRouteDeleteBelow(session: getTerminalOPJTYPE, route: string, delimeter: string = "."): void{
    if(route == "") return undefined;
    
    const ses = getTerminalOPJ(session);

    const toTraverse = route.split(delimeter);

    let cur = ses.env;
    for(let i = 0; i < toTraverse.length - 1; i++){
        const part = toTraverse[i];

        if(!Object.hasOwn(cur, part)){
            cur[part] = {};
            cur = cur[part];
            continue;
        }
        
        if(typeof cur[part] !== "object"){
            const now = cur[part];

            cur[part] = {
                [defaultSymbol]: now
            };
        }

        cur = cur[part];
    }

    delete cur[toTraverse[toTraverse.length - 1]];
}

function terminalEnvGetWhole(session: getTerminalOPJTYPE): Record<string | number | symbol, any>{
    const ses = getTerminalOPJ(session);
   
    return ses.env;
}

function terminalEnvClearWhole(session: getTerminalOPJTYPE): void{
    const ses = getTerminalOPJ(session);
   
    ses.env = {};
}




export {
    defaultSymbol,

    terminalEnvVarExists,
    terminalEnvVarRouteExists,
    
    terminalEnvVarGet,
    terminalEnvVarRouteGet,

    terminalEnvVarSet,
    terminalEnvVarRouteSet,

    terminalEnvVarDelete,
    terminalEnvVarRouteDelete,
    terminalEnvVarRouteDeleteBelow,

    terminalEnvGetWhole,
    terminalEnvClearWhole
}