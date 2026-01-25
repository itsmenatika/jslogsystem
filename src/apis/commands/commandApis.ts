import { connectedToSpecificTerminal, getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../../programdata.js";
import { commandCollection } from "../../tools/commandCollection.js";
import { logSystemError } from "../../ultrabasic.js";
import { cmdTable, commandCompoundTableType, commandCompoundType, commandContext, commandData, unifiedCommandTypes } from "./types.js";

type commandType = number;

const commandtypes = {
    undefined: 0,
    alias: 1
};

type searchCriteria = commandData & {name?: string};

class commandApi extends connectedToSpecificTerminal{
    constructor(from: getTerminalOPJTYPE){
        super(from);
    }

    /**
     * a collection created from provided commands
     * 
     * NOTE: it will create a new copy of a command table as terminal configs are not mutable
     */
    get collection(): Readonly<commandCollection>{
        return new commandCollection(this.session.config.commandTable, {readonly: true});
    }

    get commandTable(): Readonly<cmdTable>{
       return this.session.config.commandTable;
    }

    getCommandNames(): Readonly<string[]>{
        return Object.keys(this.commandTable);
    }

    getCommandTable(): Readonly<cmdTable>{
        return this.commandTable;
    }

    *[Symbol.iterator](): Generator<[string, commandData]>{
        for(const [name, cmdData] of Object.entries(this.commandTable)){
            yield [name, cmdData];
        }
    }

    exists(name: string, type: commandType = 0){
        if(!Object.hasOwn(this.commandTable, name)) return false;

        const obj = this.commandTable[name];

        if((type & commandtypes.alias) as number == commandtypes.alias){
            if(!obj.isAlias) return false;
        }

        return true;
    }

    // getCommand(name: string){
        
    // }

    find(criteria: searchCriteria, limit?: number): Readonly<commandCompoundType[]>{
        let toRet: commandCompoundType[] = [];

        for(const [name, command] of Object.entries(this.commandTable)){
            if(criteria.name !== undefined && !name.endsWith(criteria.name)) continue;

            let missed: boolean = false;
            for(const [prop, val] of Object.entries(criteria)){
                if(val !== command[prop as keyof typeof command]){
                    missed = true;
                }
            }

            if(missed) continue;

            toRet.push([
                name, command
            ]);


        }

        return Object.freeze(toRet);
    }

    findByName(name: string): undefined | unifiedCommandTypes{
        const toRet = this.commandTable[name];

        return Object.freeze(toRet);
    }   


    get aliases(): cmdTable{
        const toRet: cmdTable = {};

        for(const [name, data] of Object.entries(this.commandTable)){
            if(data.isAlias){
                toRet[name] = data;
            }
        }

        return toRet;
    }


    get orginals(): cmdTable{
        const toRet: cmdTable = {};

        for(const [name, data] of Object.entries(this.commandTable)){
            if(!data.isAlias){
                toRet[name] = data;
            }
        }

        return toRet;
    }



    getOrginal(name: string): undefined | commandCompoundType{
        if(!Object.hasOwn(this.commandTable, name)) return undefined;

        const obj = this.commandTable[name];


        if(obj.isAlias){
            return this.getOrginal(obj.aliasName);
        }

        return [name, obj];
    }

}

function askForCommandApi(from: getTerminalOPJTYPE){
    return new commandApi(from);
}


export {askForCommandApi, commandtypes}
