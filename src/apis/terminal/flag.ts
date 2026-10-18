import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";


type standardFlags = "";


/**
 * @lowlevel @low low level api 
 * 
 * allows you to see whether a flag is set
 * 
  * NOTE: Use environment values whenever you can. Flags are just an alternative system that is mostly for the internal use and may not be stable!
 * 
 * @param name the name of flag
 * @param session session. Defaults to main
 * @returns True or false
 */
function flag(name: string, session: getTerminalOPJTYPE = "main"): boolean{
    const ses = getTerminalOPJ(session);

    return Object.hasOwn(ses.flags, name);
}

/**
 * @lowlevel @low low level api 
 * 
 * allows you to set a flag
 * 
 * NOTE: Use environment values whenever you can. Flags are just an alternative system that is mostly for the internal use and may not be stable!
 * 
 * @param name the name of flag
 * @param value value
 * @param session session. Defaults to main
 * @returns True or false
 */
function setFlag(name: string, value: any = undefined, session: getTerminalOPJTYPE = "main"){
    const ses = getTerminalOPJ(session);

    if(value === undefined){
        delete ses.flags[name];
    }
    else{
        ses.flags[name] = value;
    }
}

/**
 * @lowlevel @low low level api 
 * 
 * allows you to see the content of a flag
 * 
 * NOTE: It will throw a Reference error if there's no flag with that name!
 * 
 * NOTE: Use environment values whenever you can. Flags are just an alternative system that is mostly for the internal use and may not be stable!
 * 
 * @param name the name of flag
 * @param session session. Defaults to main
 * @returns value
 */
function flagVal(name: string, session: getTerminalOPJTYPE = "main"){
    const ses = getTerminalOPJ(session);

    if(!Object.hasOwn(ses.flags, name)){
        throw new ReferenceError("No flag with that name " + name);
    }

    return ses.flags[name];    
}

export {flag, setFlag, flagVal}