import { commandContext } from "../apis/commands/types.js";
import { cd, cdDummy, getCwdToShow, getCwdToShowFromString, isAccessPossible } from "../apis/commands/osApis/filesystem.js";
import { log, LogType } from "../log.js";
import { smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { consoleColors, multiLineConstructor } from "../texttools.js";
import { expectedError, expectedErrorType } from "../apis/allApis.js";
import { join, relative } from "path";
import { access, readdir, stat } from "fs/promises";
import { multiDisplayer } from "../tools/multiDisplayer.js";
import { Dirent } from "fs";
import { getBorderCharacters, table } from "table";
import byteSize from 'byte-size';
import statMode from 'stat-mode';

function getIndicator(entry: Dirent<string>): string{
    return entry.isDirectory() ? "DIR" : "FILE";
}


// NOT MINE
function toPermissionString(mode: number): string {
  const types = {
    0o040000: "d", // directory
    0o100000: "-", // file
    0o120000: "l", // symlink
  };

  const type = (mode & 0o170000);

  // @ts-expect-error
  let str = types[type] || "-";

  const perms = ["r", "w", "x"];

  for (let i = 0; i < 3; i++) {
    str += (mode & (0o400 >> (i * 3))) ? "r" : "-";
    str += (mode & (0o200 >> (i * 3))) ? "w" : "-";
    str += (mode & (0o100 >> (i * 3))) ? "x" : "-";
  }

  return str;
}

const commandTable = quickCmdWithAliases("directory", {
    usageinfo: "directory [<...where>] [<-l>] [<--time ctime|atime|birth|mtime>] [<-x>] [<-t>] [<-s>] [<-m>] [<-c>] [<-b>] [<-a>] [<-o>] [<-g>] [<-f>]",
    desc: "lists the files and directories in a specified directory",
    longdesc: multiLineConstructor(
        "lists the files and directories in a specified directory",
        "",
        "-l -> long mode: a shortcut for -sogf and a time field determined by --time (by default it's ctime [-c])",
        "   --time -> an option for long mode",
        "-s -> file sizes",
        "-m -> mtime",
        "-c -> ctime",
        "-b -> birth time",
        "-a -> atime",
        "-o -> owner",
        "-g -> group",
        "-t -> file type",
        "-p -> absolute path",
        "-r -> relative path",
        "-x -> force a classic format while only names are displayed (or objects when piped)",
        "-§ -> force final output mode"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    categories: ["filesystem", "directory"],
    async: true,
    async callback(preArgs: any[]){
        const args = smartArgs(preArgs, this);

        let toGo: string = this.cwd;
        let toDir: string[] = [];

        for(const one of args.argsWithoutArguments){
            if(typeof one === "string"){
                toDir.push(one);
            }
        }

        try {
            toGo = cdDummy(this, toDir);
            // console.log(toGo);
            await isAccessPossible(this, toDir);
        } catch (error) {
            return expectedError("It was not possible to get access to that directory");
        }


        const timeMode = args.argsWithDoubleDash['time'];

        let fileType = args.dashCombined.includes('t');
        let fileSize = args.dashCombined.includes('s');
        let showMtime = args.dashCombined.includes('m');
        let showCtime = args.dashCombined.includes('c');
        let showBirth = args.dashCombined.includes('b');
        let showAtime = args.dashCombined.includes('a');
        let owner = args.dashCombined.includes('o');
        let group = args.dashCombined.includes('g');
        let flags = args.dashCombined.includes('f');
        let absolutePath = args.dashCombined.includes('p');
        let relativePath = args.dashCombined.includes('r');
        let forceTable = args.dashCombined.includes('x');

        const long = args.dashCombined.includes('l');

        if(long){
            fileSize = true;
            if(timeMode){
                switch(timeMode){
                    case "ctime":
                        showCtime = true;
                        break;
                    case "ctime":
                        showCtime = true;
                        break;
                    case "birth":
                        showBirth = true;
                        break;
                    case "atime":
                        showAtime = true;
                        break;
                    case "mtime":
                        showMtime = true;
                        break;
                    default:
                        return expectedError("unknown time flag: " + timeMode);
                }
            }
            else showMtime = true;

            owner = true;
            group = true;
            flags = true;


        }
        
        const inside = await readdir(toGo, {withFileTypes: true});

        if(!args.isEnding){
            const toRet: Array<any> = [];

            if(!relativePath && !absolutePath && !flags && !fileType && !owner && !group && !fileSize && !showMtime && !showCtime && !showBirth && !showAtime && !forceTable){
                
                for(const one of inside){
                    toRet.push(one.name);
                }

                return toRet;
            }

            for(const one of inside){
                const fullpath: string = join(toGo, one.name);
                const fileData = await stat(fullpath);
                const objToadd: Record<string, any> = {};

                objToadd['name'] = one.name;

                if(absolutePath){
                    objToadd['absolutePath'] = getCwdToShowFromString(this, fullpath);
                }

                if(relativePath){
                    objToadd['relativePath'] = relative(this.cwd, fullpath);
                }


                if(flags){
                    const statM = statMode(fileData);

                   objToadd['flags'] = statM.toString();
                   objToadd['flagsOctal'] = statM.toOctal();
                   objToadd['flagsNumber'] = statM.valueOf();
                }

                if(fileType){
                     objToadd['filetype'] = getIndicator(one);
                }

                if(owner){
                    objToadd['owner'] = String(fileData.uid);
                }

                if(group){
                    objToadd['group'] = String(fileData.gid);
                }

                if(fileSize){
                    
                    const sizePre = one.isFile() ? fileData.size : await getDirectorySize(fullpath);
                    
                    // it's not my fault
                    // @ts-expect-error
                    const size = byteSize(sizePre);

                    objToadd['filesizeHumanized'] = (size.value + size.unit);
                    objToadd['filesize'] = sizePre;
                }

                if(showMtime){
                    objToadd['mtimeHumanized'] = fileData.mtime.toISOString();
                    objToadd['mtime'] = fileData.mtime.getTime();
                }
            
                if(showCtime){
                    objToadd['ctimeHumanized'] = fileData.ctime.toISOString();
                    objToadd['ctime'] = fileData.ctime.getTime();
                }
            
                if(showBirth){
                    objToadd['birthHumanized'] = fileData.birthtime.toISOString();
                    objToadd['birth'] = fileData.birthtime.getTime();
                }
            
            
                if(showAtime){
                    objToadd['atimeHumanized'] = fileData.atime.toISOString();
                    objToadd['atime'] = fileData.atime.getTime();
                }
            


                toRet.push(objToadd);
            }

            return toRet;


        }


        // table

        const headers: string[] = [];

        if(flags) headers.push(consoleColors.Bright + "FLAGS" + consoleColors.Reset);
        if(fileType) headers.push(consoleColors.Bright + "TYPE" + consoleColors.Reset);
        if(owner) headers.push(consoleColors.Bright + "OWNER" + consoleColors.Reset);
        if(group) headers.push(consoleColors.Bright + "GROUP" + consoleColors.Reset);
        if(fileSize) headers.push(consoleColors.Bright + "SIZE" + consoleColors.Reset);
        if(showMtime) headers.push(consoleColors.Bright + "mtime" + consoleColors.Reset);
        
        if(showCtime) headers.push(consoleColors.Bright + "ctime" + consoleColors.Reset);
        if(showBirth) headers.push(consoleColors.Bright + "birth" + consoleColors.Reset);
        if(showAtime) headers.push(consoleColors.Bright + "atime" + consoleColors.Reset);
        if(absolutePath) headers.push(consoleColors.Bright + "ABSPATH" + consoleColors.Reset);
        if(relativePath) headers.push(consoleColors.Bright + "RELPATH" + consoleColors.Reset);
        headers.push(consoleColors.Bright + 'NAME' + consoleColors.Reset);
        



        if(!relativePath && !absolutePath && !flags && !fileType && !owner && !group && !fileSize && !showMtime && !showCtime && !showBirth && !showAtime && !forceTable){
            
            // find the longest name
            let longestNameLength: number = 0;
            for(const one of inside){
                const lnf = one.isDirectory() ? one.name + "/" : one.name;

                if(longestNameLength < lnf.length) longestNameLength = lnf.length;
            }   

            // how many columns
            const cl = Math.floor(this._terminalSession.out.columns / (longestNameLength + 2));


            let txtToUse: string = "";
            let clr: number = 0;
            for(const one of inside){
                txtToUse += (one.isDirectory() ? "/" + one.name : one.name).padEnd(longestNameLength) + "  ";
                clr += 1;

                if(clr >= cl){
                    clr = 0;
                    txtToUse += "\n";
                }
                
            }

            return txtToUse;


        }

        const data: string[][] = [headers];

        for(const one of inside){
            const fullpath: string = join(toGo, one.name);
            const fileData = await stat(fullpath);

            


            const ar: string[] = [];

            if(flags){
                ar.push(
                    statMode(fileData).toString()
                );
            }

            if(fileType){
                ar.push(getIndicator(one));
            }

            if(owner){
                ar.push(String(fileData.uid));
            }

            if(group){
                ar.push(String(fileData.gid));
            }

            if(fileSize){
                // it's not my fault
                // @ts-expect-error
                const size = one.isFile() ? byteSize(fileData.size) : byteSize((await getDirectorySize(fullpath)));

                ar.push(size.value + size.unit);
            }

            if(showMtime){
                ar.push(fileData.mtime.toISOString());
            }
            
            if(showCtime){
                ar.push(fileData.ctime.toISOString());
            }
            
            if(showBirth){
                ar.push(fileData.birthtime.toISOString());
            }
            
            
            if(showAtime){
                ar.push(fileData.atime.toISOString());
            }
            
            if(absolutePath){
                ar.push(getCwdToShowFromString(this, fullpath));
            }

            if(relativePath){
                ar.push(relative(this.cwd, fullpath));
            }

            ar.push(one.isDirectory() ? "/" + one.name : one.name);



            data.push(ar);
        }




        return table(data, {
            border: getBorderCharacters('void'),
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1
            },
            drawHorizontalLine: () => false
            
        });




        // const g = new multiDisplayer();

        



        // let fileNameMax: number = 6;
        // let typeNameMax: number = 6;

        // for(const entry of inside){
        //     if(fileType){
        //         const indicator = getIndicator(entry) + " ";
        //         if(indicator.length > typeNameMax) typeNameMax = indicator.length;
        //     }

        //     if(entry.name.length > fileNameMax) fileNameMax = entry.name.length;
        // }
        

        // const headers = new multiDisplayer();

        // headers.push("DIRECTORY: ");
        // headers.push(getCwdToShowFromString(this, toGo), consoleColors.Underscore);
        // headers.push("\n\n");

        // if(fileType){
        //     // headers.push("type | ".length > typeNameMax ? "type | " : "type | " + " ".repeat(typeNameMax - "type | ".length), consoleColors.Bright);
        //     headers.push("type ".padEnd(typeNameMax - 1) + " | ");
        // }
        // headers.push("name ".padEnd(fileNameMax - 1) + " | ");
        // // headers.push("name | ".length > fileNameMax ? "name | " : "name | " + " ".repeat(fileNameMax - "name | ".length), consoleColors.Bright);
        // // headers.push("\n");
        // headers.push("\n");



        // for(const entry of inside){
        //     if(fileType){
        //         const indicator = getIndicator(entry) + " ";
        //         g.push(indicator.padEnd(typeNameMax + 3));
        //     }
        //     g.push(entry.name.padEnd(fileNameMax + 3));
        //     g.push(" ");
        //     g.push("\n");
        // }

        // return headers.getWhole() + g.getWhole();

    }
}, ["dir", "ls", "list"])


async function getDirectorySize(dir: string): Promise<number> {
    let total = 0;

    try {
        const entries = await readdir(dir, {
            withFileTypes: true,
        });

        for (const entry of entries) {
        if (entry.isSymbolicLink()) continue;

        const fullPath = join(dir, entry.name);

        try {
            if (entry.isDirectory()) {
                total += await getDirectorySize(fullPath);
            } 
            else if (entry.isFile()) {
                const stats = await stat(fullPath);
                total += Number(stats.size);
            }
        } catch {}
        }
    } catch {
        return 0;
    }

    return total;
}

const compounds = cmdTableToCommandCompounts(commandTable);


export {commandTable, compounds};