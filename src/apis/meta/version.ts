import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";

interface verD{
    number: number,
    string: string,
    user: string,

}


function askForVersion(from: getTerminalOPJTYPE): verD{
    const term = getTerminalOPJ(from);

    const intVer = Number(term.logSystemVer);
    const strVer = String(term.logSystemVer);
    const user = term.config.getVersionData()

    return {
        number: intVer,
        string: strVer,
        user
    };
}

export {askForVersion}