import { log, LogType } from "../../log.js";
import { logSystemError } from "../../ultrabasic.js";
import { logSettings } from "./logstyles.js";
import { getTerminalOPJ, terminalSession } from "../../programdata.js";

/**
 * creates (joins) a new group for that log
 * @param name the group name
 * @returns the new current group string
 */
function logGroup(name: string, info: Omit<logSettings, "error" | "return"> = {}): string{
    // get that terminal
    const d = getTerminalOPJ(info.terminal || "main");

    // send a message
    if(!("messageVisible" in info) || info.messageVisible){
        const whoS = info.messageWho ? info.messageWho : undefined; // get the who

        log(LogType.GROUP, name, whoS, d); // send it
    }

    // add to logGroup
    d.logGroups.push(name);

    // return currentGroupString = currentGroupString.slice(0, currentGroupString.indexOf(lastLogGroupText)) + singleLogGroupText + lastLogGroupText;

    // reconstruct group and return it
    return reconstructLogGroup(d);
}

/**
 * leaves the group created with logGroup / group
 * @returns the new current group group string
 */
function logGroupEnd(info: logSettings & {return: "group"}): string;
function logGroupEnd(info: logSettings & {return: "logstring"}): string;
function logGroupEnd(info: logSettings & {return: "both"}): [string, string];
function logGroupEnd(info: logSettings): string | [string, string]
 {
    // get that terminal
    const d = getTerminalOPJ(info.terminal || "main");
    
    // currentGroupString = currentGroupString.slice(0, currentGroupString.lastIndexOf(singleLogGroupText)) + lastLogGroupText;

    // // TODO: MAYBE IN THE FUTURE? better group ending

    // return currentGroupString;

    // if there was no log groups
    if(d.logGroups.length === 0){
        if("error" in info && info.error){
            throw new logSystemError("there's no group");
        }

        // return according to the type
        if(!info.return || info.return === "logstring") return d.currentGroupString;
        else if(info.return === "group") return "";
        else return [d.currentGroupString, ""];
    }

    // remove the last group
    let groupRemoved = d.logGroups.pop() as string;

    // reconstruct the group string
    let reconstructedString = reconstructLogGroup(d);

    // return according to the type
    if(!info.return || info.return == "logstring") return reconstructedString;
    else if(info.return == "group") return groupRemoved;
    else return [reconstructedString, groupRemoved];
}

/**
 * recreates a currentGroupString from other things
 * @returns currentGroupString
 */
function reconstructLogGroup(data: terminalSession): string{
    // reset the current group string
    data.currentGroupString = "";

    const singleLogGroupText = data.config.styles.singleLogGroupText;

    // add it
    for(let i = 0; i < data.logGroups.length; i++){
        data.config.styles.singleLogGroupText
        data.currentGroupString += singleLogGroupText;
    }

    // add space to achieve better styling
    if(data.logGroups.length !== 0)
    data.currentGroupString += data.config.styles.lastLogGroupText + " ";

    // return the result
    return data.currentGroupString;
}

export {
    logGroup,
    logGroupEnd,
    reconstructLogGroup
}