import { cmdTable, commandAlias, commandCompoundTableType, commandDataAsync, commandDataRegular } from "../apis/commands/types.js";

function quickCmdWithAliases(
    name: string,
    data: commandDataRegular | commandDataAsync,
    aliases: string[] = []
){
    const toRe: cmdTable = {};
    toRe[name] = data;

    for(const alias of aliases){
        const aliasData: commandAlias = {
            isAlias: true,
            aliasName: name,
            hidden: true,
            changeable: false,
            categories: data.categories
        };

        toRe[alias] = aliasData;
    }

    return toRe;
}

function cmdTableToCommandCompounds(data: cmdTable): commandCompoundTableType{
    const toRe: commandCompoundTableType = [];

    for(const [name, cmdData] of Object.entries(data)){
        toRe.push([name, cmdData]);
    }

    return toRe;
}


function commandCompoundsToCmdTable(data: commandCompoundTableType): cmdTable{
    const toRe: cmdTable = {};

    for(const [name, cmdData] of data){
        toRe[name] = cmdData;
    }

    return toRe;
}


export {
    quickCmdWithAliases, 
    cmdTableToCommandCompounds as cmdTableToCommandCompounts, // compatibility with my old silly mistake
    cmdTableToCommandCompounds,
    commandCompoundsToCmdTable
}