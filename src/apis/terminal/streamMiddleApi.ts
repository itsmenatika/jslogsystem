// TODO

// import { getTerminalOPJ, getTerminalOPJTYPE, globalStreamTable } from "../../programdata.js";

// /**
//  * checks whether a stream exists
//  * @param name name
//  * @param alsoGlobal whether check also global 
//  * @param session the way to get a session
//  * @returns 
//  */
// function streamExists(name: string, alsoGlobal: boolean = true, session: getTerminalOPJTYPE = "main"){
//     const ses = getTerminalOPJ(session);

//     return Object.hasOwn(ses.streams, name) || Object.hasOwn(globalStreamTable, name);
// }

// /**
//  * checks whether a stream exists in the global scope
//  * @param name name
//  * @returns 
//  */
// function streamExistsGlobal(name: string){
//     return Object.hasOwn(globalStreamTable, name);
// }


// /**
//  * checks whether a stream exists (REGEX)
//  * @param regex regex
//  * @param alsoGlobal whether check also global 
//  * @param session the way to get a session
//  * @returns 
//  */
// function streamExistsRegex(name: RegExp, alsoGlobal: boolean = true, session: getTerminalOPJTYPE = "main"){
//     const ses = getTerminalOPJ(session);

//     return Object.hasOwn(ses.streams, name) || Object.hasOwn(globalStreamTable, name);
// }

// /**
//  * checks whether a stream exists in the global scope
//  * @param name name
//  * @returns 
//  */
// function streamExistsGlobal(name: RegExp){
//     for(const )
// }