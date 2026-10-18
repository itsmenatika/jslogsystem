import { format } from "node:util";
import { consoleWrite } from "../out.js";
import { consoleColor } from "../texttools.js";

let sessionName: string = "main";
let color: consoleColor | undefined = undefined;

function quickLogSessionName(name?: string): string{
    if(name !== undefined) sessionName = name;
    return sessionName;
}

function quickLogColor(c?: consoleColor | null): consoleColor{
    if(c !== undefined && c !== null) color = c;
    if(c) color = undefined;
    return sessionName;
}

function quickLog(...data: any[]){
    let toPr: string = "";
    if(typeof data[0] === "string"){
      toPr = format(data[0], ...data.slice(1));
    } else{
      toPr = data.map(v => format(v)).join(" ");
    }

    consoleWrite(toPr, color, undefined, "\n", sessionName);
}

function quickLogNotEndl(...data: any[]){
    let toPr: string = "";
    if(typeof data[0] === "string"){
      toPr = format(data[0], ...data.slice(1));
    } else{
      toPr = data.map(v => format(v)).join(" ");
    }

    consoleWrite(toPr, color, undefined, "", sessionName);
}

export {
    quickLogSessionName,
    quickLogColor,
    quickLog, quickLog as ql, quickLog as qLog,
    quickLogNotEndl, quickLogNotEndl as qle, quickLogNotEndl as qLogN
}