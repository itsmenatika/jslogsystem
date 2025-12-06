import { exists, existsSync, mkdirSync} from "fs";
import { setupInHandlerListener } from "../../in.js";
import { setUpInterrupsForProcess } from "../../interrup.js";
import { createNewTerminal, getTerminal, getTerminalOPJ, getTerminalOPJTYPE, removeTerminal, terminalCreateData } from "../../programdata.js"
import { welcome } from "../../tools/welcome.js";
import { cd } from "../allApis.js";
import { constructConfig } from "../../config.js";
import { access, mkdir, stat, writeFile, readFile } from "fs/promises";
import { logSystemError } from "../../ultrabasic.js";

/**
 * 
 * middle level api for creating a terminal without using high level api
 * 
 * it will setup everything for you and you still have a huge control over what you want to do
 * 
 * NOTE: IT WILL NOT ADD ANY DEFAULT COMMANDS!
 * 
 * @param name the name of the terminal
 * @param data the data
 * @returns whether it has succeded
 */
async function createTerminalQuick(name: string, data: terminalCreateData): Promise<boolean>{
    const config = constructConfig(data.config);

    if(
        data.fileout !== null
        &&
        existsSync(config.$cache$latestLogPath)
        &&
        existsSync(config.$cache$latestLogTempPath)
    ){
        const data = await readFile(config.$cache$latestLogTempPath);
        const dataNum = Number(data);


        config.saveTheLatest(new Date(dataNum), config.$cache$latestLogPath, config);
    }

    // if(obj.flags['stf']){
    //     console.log(obj.config.$cache$latestLogTempPath);
    //     const data = await readFile(obj.config.$cache$latestLogTempPath);
    //     const dataNum = Number(data);


    //     obj.config.saveTheLatest(new Date(dataNum), obj.config.$cache$latestLogPath, obj.config);
    // }



    await mkdir(config.$cache$LogDirectoryPath, {recursive: true});
    await writeFile(config.$cache$latestLogPath, config.logFileHeader(), {flag: "w"});
    await writeFile(config.$cache$latestLogTempPath, String(Date.now()), {flag: "w"});

    const s = createNewTerminal(name, {...data, trustConfig: true, config});

    if(!s) return false;

    welcome(s);
    setupInHandlerListener(s);

    if(
        data.setupProcessInterrups === true ||
        (data.setupProcessInterrups === undefined && name === "main")
    ){
        setUpInterrupsForProcess(s);
    }

    if(
        s.procLinked &&
        data.chwdToSelectedCwd === true ||
        (data.chwdToSelectedCwd === undefined && name === "main")
    ){
        if(!existsSync(s.cwd)){
            mkdirSync(s.cwd, {recursive: true});
        }
        s.procLinked?.chdir(s.cwd);
    }


    return true;
}

interface rmOptions{
    errorIfDoesntExist?: boolean
}

/**
 * MIDDLE LEVEL API
 * 
 * removes the terminal with specified name
 * 
 * LOW LEVEL API: removeTerminal
 * 
 * @param name name of terminal
 * @param removeOptions options
 * @returns whether it was successful
 */
async function removeTerminalQuick(name: string, removeOptions: rmOptions = {}): Promise<boolean> {
    const obj = getTerminal(name);

    if(!obj){
        if(removeOptions.errorIfDoesntExist !== false){
            throw new logSystemError(`Terminal named '${name}' doesn't exist`);
        }

        return false;
    }

    // if(obj.flags['stf']){
    //     console.log(obj.config.$cache$latestLogTempPath);
    //     const data = await readFile(obj.config.$cache$latestLogTempPath);
    //     const dataNum = Number(data);


    //     obj.config.saveTheLatest(new Date(dataNum), obj.config.$cache$latestLogPath, obj.config);
    // }

    return removeTerminal(name, removeOptions.errorIfDoesntExist);
}

export {createTerminalQuick, removeTerminalQuick}