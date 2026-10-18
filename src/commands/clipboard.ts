import { expectedError  } from "../apis/commands/commandSpecialTypes.js";
import { askForClipboardManager } from "../apis/commands/osApis/clipboard.js";
import { multiLineConstructor } from "../texttools.js";
import { isEndingCommand, removeInternalArguments } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";

const commandTable = quickCmdWithAliases("clipboard", {
    usageinfo: "clip <...data>",
    desc: "copy or paste data into the clipboard",
    longdesc: multiLineConstructor(
        "allows to copy or paste data into the system clipboard",
        "",
        "if there's no available system clipboard, a backup will be used",
        "use env flag 'FORCESIMCLIPBOARD' with 'true' to force that behaviour, or change it in a session config",
        "",
        "all piped data will be written into the clipboard (except for internal parameters)",
        "",
        "the clipboard content will be returned"
        ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    minver: 1.35,
    categories: ["unsafe", "shell", "process", "terminal", "system", "copy", "paste", "clipboard"],
    async callback(preArgs: any[]): Promise<any> {
        
        const args: any[] = removeInternalArguments(preArgs);
        const isEnd: boolean = isEndingCommand(preArgs, this);
        const man = askForClipboardManager(this);

        if(!man.valid){
            return expectedError("There was a problem with acquiring clipboard manager");
        }


        if(args.length === 1){
            return await man.get();
        }
        
        // const chunks: Buffer[] = [];
        let str: string = "";


        for(const one of args.slice(1)){
            switch(typeof one){

            //     case "string":
            //         chunks.push(Buffer.from(one));
            //         break;
            //     case "boolean":{
            //         const buf = Buffer.alloc(1);
            //         buf.writeUInt8(true ? 1 : 0, 0);
            //         chunks.push(buf)
            //         break;
            //     }
            //     case "function": {
            //         return expectedError("clipboard doesnt support functions");
            //     }
            //     case "symbol": {
            //         return expectedError("clipboard doesnt support symbols");
            //     }
            //     case "number": {
            //         const buf = Buffer.alloc(8);
            //         buf.writeDoubleLE(one, 0);
            //         chunks.push(buf)
            //         break;
            //     }
            //     case "bigint": {
            //         const hex = one.toString(16);
            //         const buf = Buffer.from(
            //             hex.length % 2 ? '0' + hex : hex,
            //             'hex'
            //         );
            //         chunks.push(buf);
            //         break;
            //     }

            //     case "undefined": {
            //         return expectedError("clipboard doesnt support undefined");
            //     }

            //     case "object": {
            //         if(Buffer.isBuffer(one)){
            //             chunks.push(one);
            //             break;
            //         }

            //         return expectedError("clibpard currently doesn't support objects");
            //     }
                case "string":{
                    str += one;
                    break;
                }
                case "bigint":{
                    str += one.toString();
                    break;
                }
                case "boolean": {
                    str += String(one);
                    break;
                }
                case "function": {
                    return expectedError("clipboard currently doesnt support functions");
                }
                case "number": {
                    str += String(one);
                    break;
                }
                case "object": {
                     return expectedError("clipboard currently doesnt support objects");
                }
                case "symbol": {
                     return expectedError("clipboard currently doesnt support symbols");
                }
                case "undefined": {
                     return expectedError("clipboard currently doesnt support undefined");
                }
                default: {
                     return expectedError("clipboard currently doesnt support unknown types");
                }
            }

        }

        // const whole = Buffer.concat(chunks);





        await man.set(str);

        return str;

         

        
    }                
}, ["clip", "xclip"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};