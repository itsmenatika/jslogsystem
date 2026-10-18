import { Completer, createInterface } from "node:readline/promises";
import { getTerminalOPJ, getTerminalOPJTYPE, sessionState, terminalSession } from "../../programdata.js";
import { ansiEscape, consoleColors } from "../../texttools.js";
import { terminalEnvVarDelete, terminalEnvVarRouteDelete, terminalEnvVarSet } from "./envMiddle.js";
import { askForFullControl } from "./fullControl.js";
import { screenWrite } from "../../out.js";

interface basicOptions{
    askName?: string | null,
    timeout?: number | null
    answerPallete?: string | null
}

type basicOptionsRequired = Required<basicOptions>;

const default_BasicOptions: basicOptionsRequired = {
    askName: null,
    timeout: null,
    answerPallete: null

}


interface askOptions extends basicOptions{
    completer?: Completer,
    ctrlfDelay?: number,
    prompt?: string
}

type askOptionsRequired = Required<basicOptions>;


const default_askOptions: askOptionsRequired = {
    ...default_BasicOptions
}



function renderText(terminal: terminalSession){

}

async function askQuestion(terminal: getTerminalOPJTYPE, question: string, opts: askOptions = {}): Promise<string>{
    // construct options
    const op = {...default_askOptions, ...opts};

    const ses = getTerminalOPJ(terminal);

    // ses.state = sessionState.delegate;
    // ses.out.write(consoleColors.Reset + question + "\n");
    
    let resolveThat; let rejectThat: (reason?: any) => void;
    
    
    // terminalEnvVarSet(ses, "xaskerxtext", "");
    // terminalEnvVarSet(ses, "xaskerxlastrender", "");
    
    // ses.inputDelegateFunction = async (data: any, ses: terminalSession) => {
    //     ses.out.write(data);
    // }

    // ses.inputRejectFunction = async (reason: any, ses: terminalSession) => {
    //     ses.out.write("\n");
    //     terminalEnvVarDelete(ses, "xaskerxtext");
    //     terminalEnvVarDelete(ses, "xaskerxlastrender");
    //     rejectThat(reason);
    // }


    const fulcon = askForFullControl(ses);

    const inps = fulcon.getNewListener_in_raw();
    
    const res = await fulcon.codeAsync(async () => {
        const intr = createInterface({
            input: inps,
            output: fulcon.session.out.getStream(),
        });


        let qconstr: string = question;

        if(opts.prompt){
            qconstr += "\n" + opts.prompt;
        }


        const res = await intr.question(qconstr);

        await intr.write(consoleColors.Reset);

        return res;
    });

    


    return res;

}

export {askQuestion}