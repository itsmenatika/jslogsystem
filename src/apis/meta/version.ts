import { getTerminalOPJ, getTerminalOPJTYPE } from "../../programdata.js";

interface verD{
    number: number,
    string: string,
    user: string,
    edition: "javascript" | "c" | "lua",
    branch: "main" | "experimental" | "legacy"
    isExperimental: boolean
}


function askForVersion(from: getTerminalOPJTYPE): verD{
    const term = getTerminalOPJ(from);

    const intVer = Number(term.config.logSystemVersion[0]);
    const strVer = String(term.config.logSystemVersion[1]);
    const user = term.config.getVersionData();
    const edition: "javascript" = "javascript";
    const branch: "main" = "main";
    const isExperimental: boolean = true;

    return {
        number: intVer,
        string: strVer,
        user,
        edition,
        branch,
        isExperimental
    };
}

export {askForVersion}