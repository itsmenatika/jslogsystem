import { bindData, connectedToSpecificTerminal, getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { logSystemError } from "../../ultrabasic.js";

class bindApi extends connectedToSpecificTerminal{
    constructor(from: getTerminalOPJTYPE){
        super(from);
        // const terminalData = getTerminalOPJ(terminal);

        // if(!terminalData){
        //     throw new logSystemError("The bind api couldn't use that terminal!");
        // }

        // this.terminalName = terminalData.terminalName;
    }

    getBinds(): Readonly<bindData>{
        return this.session.bindTable;
    }


    add(command: string, executor: string): bindApi{
        const commandParts = command.split(" ");
        const commandName = commandParts[0];

        const terminalData = this.session;

        terminalData.bindTable[commandName] = {
            name: commandName,
            command,
            executor
        };

        return this;
    }


    exits(command: string): boolean{
        const commandName = command.split(" ")[0];

        const terminalData = this.session;

        return Object.hasOwn(terminalData.bindTable, commandName)
    }

    remove(command: string): bindApi{
        const commandName = command.split(" ")[0];

        const terminalData = this.session; 
        
        if(!Object.hasOwn(terminalData.bindTable, commandName)){
            throw new logSystemError(`bind named '${commandName}' doesn't exist!`);
        }

        delete terminalData.bindTable[commandName];

        return this;
    }
}

function askForBindApi(terminal: getTerminalOPJTYPE){
    return new bindApi(terminal);
}

export {bindApi, askForBindApi}