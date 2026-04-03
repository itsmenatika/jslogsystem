import { exit } from "process";
import { askForBindApi, askForCommandApi, askForVersion, commandCompoundType, terminalApi } from "../apis/allApis.js";
import { commandDividerInternal, pipeDividerInternal } from "../apis/commands/commandParser.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { consoleShortHand } from "../tools/consoleShortHand.js";
import { consoleWrite } from "../out.js";
import { uptimeVar } from "../ultrabasic.js";
import { askForFullControl } from "../apis/terminal/fullControl.js";
import { setTimeout } from "timers/promises";
import { arch, hostname, platform, type, release, endianness, version} from "os";


interface engineData{
    javascriptEngine: string,
    javascriptEngineVersion: any
}

function engineData(): engineData{
    const vrs = process.versions;

    if (vrs.v8){
        return {
            javascriptEngine: "v8",
            javascriptEngineVersion: vrs.v8
        }
    }
    else if (process.versions.chakracore){
        return {
            javascriptEngine: "chakracore",
            javascriptEngineVersion: vrs.chakracore
        }
    }
    else if (process.versions.spidermonkey){
         return {
            javascriptEngine: "spidermonkey",
            javascriptEngineVersion: vrs.spidermonkey
        }       
    }
    else if (process.versions.javascriptcore){
        return {
            javascriptEngine: "javascriptcore",
            javascriptEngineVersion: vrs.javascriptcore
        }       
    }

    return {
        javascriptEngine: "unknown",
        javascriptEngineVersion: "unknown"
    }   
}

const commandTable = quickCmdWithAliases("runtime", {
    usageinfo: "runtime",
    desc: "runtime description",
    longdesc: multiLineConstructor(
       "returns an object containing runtime description",
       "",
       "contains:",
       "at: TIMESTAMP -> when it was got",
       "javascriptIntrVer \"V{version}\" -> the version of javascript script",
       "arch STRING -> system architecture",
       "hostname STRING -> the name of the host",
       "platform STRING -> a platform identificator (OS)",
       "type STRING -> type of os",
       "release STRING -> system release number",
       "endianness STRING:RE/LE -> system endianess",
       "osVersion STRING -> claimed os version",
       "execPath STRING -> exec path of javascript interpreter",
       "processCwd STRING -> current process cwd",
       "pid NUMBER -> process pid",
       "ppid NUMBER -> process ppid",
       "argv ARRAY -> an array of argv starting arguments",
        "runtimeBranch 'main'|'experimental'|'legacy' -> jslogsystem branch (verApi) ",
        "runtimeEdition 'javascript'|'c'|'lua' -> jslogsystem edition (verApi)",
        "isRuntimeExperimental BOOLEAN -> is jslogsystem version experimental (verApi)",
        "runtimeVersion INT -> jslogsystem version"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["unsafe"],
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs, this);

        const verApi = askForVersion(this);

        const toRet: Record<string, any> = {
            at: Date.now(),

            javascriptIntrVer: process.version,

            arch: arch(),
            hostname: hostname(),
            platform: platform(),
            type: type(),
            release: release(),
            endianness: endianness(),
            osVersion: version(),

            execPath: process.execPath,
            processCwd: process.cwd(),

            
            pid: process.pid,
            ppid: process.ppid,
            argv: process.argv,


            runtimeBranch: verApi.branch,
            runtimeEdition: verApi.edition,
            isRuntimeExperimental: verApi.isExperimental,
            runtimeVersion: verApi.number,


        };


        Object.assign(toRet, engineData());



        return toRet;
    }
});


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};