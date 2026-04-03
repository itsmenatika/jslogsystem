import { setTimeout } from "timers/promises";
import { expectedError } from "../apis/allApis.js";
import { askForFullControl, codeMatchWhat } from "../apis/terminal/fullControl.js";
import { consoleUltraRawWrite, consoleWrite } from "../out.js";
import { consoleColors, cursorAbs, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { createInterface, Interface } from "readline/promises";
import { emitKeypressEvents } from "readline";

interface pos{
    x: number,
    y: number
}

const commandTable = quickCmdWithAliases("simplesnake", {
    usageinfo: "cleanview <...data> [<--sep <SEPERATOR>>]",
    desc: "shows a text in a clean manner",
    longdesc: multiLineConstructor(
        "shows a text in a clean manner using an alternate buffer from fullController",
        "",
        "It will only shown strings that were passed there",
        "",
        "you can use --sep <SEPERATOR> to change a seperator between texts. It defaults to ' '",
        "",
        "NOTE: some terminals may not support scroll properly in an alternate buffer mode! So, it's better to keep your texts small!",
        "",
        "use ESCAPE key to go back. USE ctrl c to forcefully crash the jslogsystem"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["text", "buffer"],
    async callback(preargs: any[]): Promise<any>{
       const fulcon = askForFullControl(this);


       let snake: pos[] = [
        {
            x: 20,
            y: 20
        },
       ];

       const snakeDir: pos = {
            x: 1,
            y: 0
       };

       let snakeSize = 3;

       const rerender = () => {
            fulcon.clearScreen();
            for(const pos of snake){
                consoleWrite(
                    cursorAbs(pos.x, pos.y) + "#", undefined, undefined, undefined, this
                );
            }
       }

       const physics = () => {
            
            snake.unshift(
                {
                    x: snake[0].x + snakeDir.x,
                    y: snake[0].y + snakeDir.y
                }
            );
            

            if(snake.length > snakeSize){
                snake = snake.slice(0, snakeSize);
            }
       }

    //    let data = "";

        // setup listeners
        // fulcon.addListener('in', "data", async (datza: any) => {
        //     data += String(datza);


        //     if(fulcon.codeMatch(data, codeMatchWhat.ctrlc)){
        //         fulcon.ctrlC(this.logNode);
        //         data = "";
        //         return;
        //     }

        //     if(fulcon.codeMatch(data, codeMatchWhat.escape)){
        //         fulcon.end();
        //           data = "";
        //         return;
        //     }

        //     if(fulcon.codeMatch(data, codeMatchWhat.arrowRight)){
        //         snakeDir.x = 1; snakeDir.y = 0;
        //           data = "";
        //         return;
        //     }

        //     if(fulcon.codeMatch(data, codeMatchWhat.arrowLeft)){
        //         snakeDir.x = -1; snakeDir.y = 0;
        //           data = "";
        //         return;
        //     }

        //     if(fulcon.codeMatch(data, codeMatchWhat.arrowDown)){
        //         snakeDir.x = 0; snakeDir.y = -1;
        //           data = "";
        //         return;
        //     }

        //   if(fulcon.codeMatch(data, codeMatchWhat.arrowUp)){
        //         snakeDir.x = 0; snakeDir.y = 1;
        //           data = "";
        //         return;
        //     }

        //         if (data.length > 10) data = '';
        // });

        let r: Interface;

  

        // display
        await fulcon.codeAsyncAlt(async () => {
            fulcon.clearScreen();


            // @ts-ignore
            r = createInterface({input: fulcon.session.in.getStream(), output: fulcon.session.out.getStream()});
            


            while(false){
                await setTimeout(200);
                if(!fulcon.stillExecuting) break;
                physics();
                rerender();
            }

            r.close();


            
        });

        
    
    }
}, ["smplsnk"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};