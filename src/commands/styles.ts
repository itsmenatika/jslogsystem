import { spawn, spawnSync } from "child_process";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { useWith, useWithAsync } from "../tools/useWith.js";
import { info, success, warning } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { setTimeout as g } from "timers/promises";
import { runFrom } from "../apis/commands/osApis/orginalCwd.js";
import { deregisterStyle, getExactStyle, registerStyle, styleExists, stylesNames } from "../styles/common.js";
import { cdDummy, expectedError, isSafe, logTimeStamp } from "../apis/allApis.js";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { multiLineConstructor } from "../texttools.js";


const longdeschelp = multiLineConstructor(
    "styles list <- lists all styles",
    "styles get <name> -> get tht a style object",
    "styles exists <name> -> returns true if a style exists, otherwise false",
    "styles import <name> <path> -> imports a style as JSON",
    "styles export <name> <path> -> exports a style as JSON",
    "styles fromjson <name> <JSON> <- creates a styles from JSON",
    "styles tojson <name> <- dumps JSON from a style",
    "styles entry <name> <entrypath> <- gets an entry from a style",
    "styles edit <name> <entrypath> <value> -> edits an entry",
    "styles fork <name> -> forks a style",
    "styles rename <name <newname> -> renames a style (it doesnt change identificator field"
)

const commandTable = quickCmdWithAliases("styles", {
    usageinfo: "styles <list/get/exists/import/export/fromjson/tojsn/entry/edit/fork/rename> [<name>] [<path/JSON/entrypath/newname>] [<value>]",
    desc: "manages terminal styles",
    longdesc: longdeschelp,
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["style", "terminal", "session"],

    async callback(args) {
        const bakedArgs = smartArgs(args, this);

       
        switch(bakedArgs.argsWithoutArguments[0]){
            case "list": {
                const list = stylesNames();

                if(!bakedArgs.isEnding) return list;

                let toRet: string = list.join(", ");
                return toRet;
            }

            case "get": {
                const name = bakedArgs.argsWithoutArguments[1];

                if(!name) return expectedError("usage: styles get <name>");

                if(!styleExists(name)) return expectedError("that style doesnt exist");

                return getExactStyle(name);
                
            }

            case "exists": {
                const name = bakedArgs.argsWithoutArguments[1];

                if(!name) return expectedError("usage: styles get <name>");

                return styleExists(name);
            }

            case "export": {
                const name = bakedArgs.argsWithoutArguments[1];
                const loc = bakedArgs.argsWithoutArguments[2];

                if(!name || !loc) return expectedError("usage: styles export <name>");

                if(!styleExists(name)) return expectedError("that style doesnt exist");    
                
                const newloc = join(this.cwd, loc);

                if(!isSafe(this, newloc)) return expectedError("Can't exit the working directory");

                const style = getExactStyle(name);

                const data = JSON.stringify(style, undefined, "\t");

                try {
                    await writeFile(newloc, data);
                    return true;
                } catch (error) {
                    return expectedError("error while writting the file");
                }
            }

            case "import": {
                const name = bakedArgs.argsWithoutArguments[1];
                const loc = bakedArgs.argsWithoutArguments[2];

                if(!name || !loc) return expectedError("usage: styles import <name>");

                if(styleExists(name)) return expectedError("that style does exist");    
                
                const newloc = join(this.cwd, loc);

                if(!isSafe(this, newloc)) return expectedError("Can't exit the working directory");

        

                try {
                    const d = await readFile(newloc);
                    const obj = JSON.parse(d.toString());

                    if(styleExists(name)) return expectedError("that style does exist");  
                    registerStyle(name, obj);
                    return true;
                } catch (error) {
                    return expectedError("error while reading the file");
                }
            }

            case "tojson": {
                const name = bakedArgs.argsWithoutArguments[1];
                const sp = bakedArgs.argsWithoutArguments[2] || "";

                if(!name || !sp) return expectedError("usage: styles tojson <name> [<sp>]");

                if(!styleExists(name)) return expectedError("that style doesnt exist");    
                

                const style = getExactStyle(name);

                const data = JSON.stringify(style, undefined, "\t");

                return data;
            }

            case "fromjson": {
                const name = bakedArgs.argsWithoutArguments[1];
                const data = bakedArgs.argsWithoutArguments[2];

                if(!name) return expectedError("usage: styles fromjson <name> <data>");

                if(styleExists(name)) return expectedError("that style does exist");    
                

                let obj;
                try {
                    obj = JSON.parse(data); 
                } catch (error) {
                    return expectedError("Error while parsing JSON");
                }

                if(styleExists(name)) return expectedError("that style does exist");    
                registerStyle(name, obj);

                return data;
            }

            case "remove":
                {
                const name = bakedArgs.argsWithoutArguments[1];

                if(name === "default") return expectedError("default style is protected");

                if(!styleExists(name)) return expectedError("that style doesnt exist");

                deregisterStyle(name);

                return true;
                }

            case "entry":
                {
                const name = bakedArgs.argsWithoutArguments[1];
                const path = bakedArgs.argsWithoutArguments[2];

                if(!name || !path) return expectedError("usage: styles entry <name> <entry>")

                if(!styleExists(name)) return expectedError("that style doesnt exist");

                
                const listP = path.split(".");
                let obj = getExactStyle(name);
                if(!obj) return expectedError("that style doesnt exist");

                for(const way of listP){
                    obj = (obj as Record<string, any>)[way];

                    if(!obj) return expectedError("No entry: " + path);
                }

                if(typeof obj !== "string") return expectedError("No entry: " + path);

                return obj;
            }

            case "edit":
                {
                const name = bakedArgs.argsWithoutArguments[1];
                const path = bakedArgs.argsWithoutArguments[2];
                const value = bakedArgs.argsWithoutArguments[3];

                if(!name || !path || !value) return expectedError("usage: styles edit <name> <entry> <value>")

                if(!styleExists(name)) return expectedError("that style doesnt exist");

                
                const listP = path.split(".");
                let obj = getExactStyle(name);
                if(!obj) return expectedError("that style doesnt exist");

                for(let i = 0; i < listP.length - 1; i++){
                    const way = listP[i];
                    obj = (obj as Record<string, any>)[way];

                    if(!obj) return expectedError("No entry: " + path);
                }

                if(!obj || typeof obj !== "object" || !Object.hasOwn(obj, listP.at(-1))) return expectedError("No entry: " + path);
                
                // info(String(obj) + " " + String(listP.at(-1)) + name + " " + path + " " + value) ;

                obj[listP.at(-1)] = value;
                

                return true;
            }

            case "default":
                {
                const name = bakedArgs.argsWithoutArguments[1];
                const path = bakedArgs.argsWithoutArguments[2];
                const value = bakedArgs.argsWithoutArguments[3];

                if(!name || !path || !value) return expectedError("usage: styles edit <name> <entry> <value>")

                if(!styleExists(name)) return expectedError("that style doesnt exist");

                
                const listP = path.split(".");
                let obj = getExactStyle(name);
                if(!obj) return expectedError("that style doesnt exist");

                for(let i = 0; i < listP.length - 1; i++){
                    const way = listP[i];
                    obj = (obj as Record<string, any>)[way];

                    if(!obj) return expectedError("No entry: " + path);
                }

                 if(!obj || typeof obj !== "object" || !Object.hasOwn(obj, listP.at(-1))) return expectedError("No entry: " + path);
                
                // info(String(obj) + " " + String(listP.at(-1)) + name + " " + path + " " + value) ;

                obj[listP.at(-1)] = (getExactStyle("default") as Record<string, string>)[listP.at(-1)];

                return true;
            }

            case "fork": {
                const name = bakedArgs.argsWithoutArguments[1];
                const namet = bakedArgs.argsWithoutArguments[2];

                if(!name) return expectedError("usage: styles fork <name> <newname>");

                if(!styleExists(name)) return expectedError("that style doesnt exist");
                if(styleExists(namet)) return expectedError("that style does exist");

                registerStyle(namet, structuredClone(getExactStyle(name)));

                return true; 
            }

            case "rename": {
                const name = bakedArgs.argsWithoutArguments[1];
                const namet = bakedArgs.argsWithoutArguments[2];

                if(name === "default") return expectedError("default is prohibited");
                if(!name || namet) return expectedError("usage: styles rename <name> <newname>");

                if(!styleExists(name)) return expectedError("that style doesnt exist");
                if(styleExists(namet)) return expectedError("that style does exist");

                const d = getExactStyle(name);
                deregisterStyle(name);
                registerStyle(namet, d);

                return true; 
            }

            

            default:
            case "?":
            case "help":
                return longdeschelp;
        }



    }

}, ["style"]);

const compounds = cmdTableToCommandCompounts(commandTable);

export { commandTable, compounds };