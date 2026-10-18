import { logsReceiveType } from "../config.js";
import { logsReceive } from "../log.js";
import { getTerminalOPJTYPE } from "../programdata.js";



/**
 * delay logs while executing something
 * @param session link to a session
 * @param func synchronous function
 */
async function withstandLogsWhile(session: getTerminalOPJTYPE, func: () => void): Promise<void>{
    const before = await logsReceive(session);
    if(before !== logsReceiveType.block) await logsReceive(session, logsReceiveType.block);

    func();

    await logsReceive(session, before);
}

/**
 * delay logs while executing something
 * @param session link to a session
 * @param func asynchronous function
 */
async function withstandLogsWhileAsync(session: getTerminalOPJTYPE, func: () => Promise<void>): Promise<void>{
    const before = await logsReceive(session);
    if(before !== logsReceiveType.block) await logsReceive(session, logsReceiveType.block);


    await func();

    await logsReceive(session, before);
}

export {withstandLogsWhile, withstandLogsWhileAsync}