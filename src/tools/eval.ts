/**
 * allows you to run eval on global context
 * @param code the code to be run
 * @returns 
 */
function globalEval(code: string){
    return globalThis.eval.apply(globalThis, [code]);
}


export {globalEval}