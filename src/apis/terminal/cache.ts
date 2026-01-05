import { terminalSession } from "../../programdata.js";

function cache(ses: terminalSession, route: string, val?: any){
    if(val !== undefined){
        ses.cache[route] = val;
    }

    return ses.cache[route];
}

function clearCache(ses: terminalSession){
    ses.cache = {};
}

export {cache, clearCache}