import { connectedToSpecificTerminal, getTerminalOPJTYPE } from "../../programdata.js";
import { terminalEnvVarDelete, terminalEnvVarExists, terminalEnvVarGet, terminalEnvVarRouteDelete, terminalEnvVarRouteDeleteBelow, terminalEnvVarRouteExists, terminalEnvVarRouteGet, terminalEnvVarRouteSet, terminalEnvVarSet } from "./envMiddle.js";

/**
 * 
 * HIGH LEVEL API
 * 
 * Environement api used to manage environmental variables
 */
class envApi extends connectedToSpecificTerminal{
    constructor(from: getTerminalOPJTYPE){
        super(from);
    }

    get(name: string): any{
        return terminalEnvVarGet(this.session, name);
    }

    set<T>(name: string, value: T): T{
        return terminalEnvVarSet(this.session, name, value);
    }

    exists(name: string): boolean{
        return terminalEnvVarExists(this.session, name);
    }

    delete(name: string): void{
        return terminalEnvVarDelete(this.session, name);
    }

    getRoute(name: string, delimeter: string = "."): any{
        return terminalEnvVarRouteGet(this.session, name, delimeter);
    }

    setRoute<T>(name: string, value: T, delimeter: string = "."): T | undefined{
        return terminalEnvVarRouteSet(this.session, name, value, delimeter);
    }

    existsRoute(name: string, delimeter: string = "."): boolean{
        return terminalEnvVarRouteExists(this.session, name, delimeter);
    }

    deleteRoute(name: string, delimeter: string = "."): void{
        return terminalEnvVarRouteDelete(this.session, name, delimeter);
    }

    deleteRouteBelow(name: string, delimeter: string = "."): void{
        return terminalEnvVarRouteDeleteBelow(this.session, name, delimeter);
    }


    getWholeEnvironment(): typeof this.session.env{
        return this.session.env;
    }

    loadFromProcess(proc: typeof process = process){
        Object.assign(this.session.env, proc.env);
    }
}

function getEnvApi(from: getTerminalOPJTYPE): envApi{
    return new envApi(from);
}

export {envApi, getEnvApi}