import { setTimeout } from "timers/promises";
import { expectedError } from "../apis/allApis.js";
import { askForFullControl, codeMatchWhat } from "../apis/terminal/fullControl.js";
import { consoleUltraRawWrite, consoleWrite, screenWrite } from "../out.js";
import { consoleColors, cursorAbs, multiLineConstructor } from "../texttools.js";
import { removeInternalArguments, smartArgs } from "../tools/argsManipulation.js";
import { cmdTableToCommandCompounts, quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { createInterface, Interface } from "readline/promises";
import { emitKeypressEvents } from "readline";

interface pos{
    x: number,
    y: number
}

function centerText(text: string, width: number) {
    const left = Math.floor((width - text.length) / 2);
    const right = width - text.length - left;

    return " ".repeat(left) + text + " ".repeat(right);
}


const commandTable = quickCmdWithAliases("simplesnake", {
    usageinfo: "simplesnake [<-e>] [<-w>] [<--apples AMOUNT>] [<--maxwait TIME>]",
    desc: "a simple snake game",
    longdesc: multiLineConstructor(
        "a simple snake game",
        "",
        "a demo for demonstrating purposes of fullcontroller",
        "",
        "use -e to enable enchanced visuals",
        "use -w to enable collisions with walls",
        "use --apples AMOUNT to set the maximum amount of apples",
        "use --maxwait TIME to set the maximum awaiting time for a new apple (in miliseconds)"
    ),
    hidden: false,
    changeable: false,
    isAlias: false,
    async: true,
    categories: ["game", "demo"],
    async callback(preargs: any[]): Promise<any>{
        const args = smartArgs(preargs, this);

        const enchanced = args.dashCombined.includes("e");
        const doubleBuffer = args.dashCombined.includes("d");
        const disableWalls = args.dashCombined.includes("w");
        const maxApples = args.argsWithDoubleDash['apples'];
        const maxApplesInt = maxApples ? Number(maxApples) : 1;
        const maxwaittime = args.argsWithDoubleDash['maxwait'] || 6000;

        // typescript no, you're not right. It could be not a number and i want to check for it!
        // @ts-expect-error
        if(maxApplesInt === NaN || maxApplesInt < 1){
            return expectedError("The amount of apples is not compatible with the app");
        }
        

        const fruit = enchanced ? "🍎" : "$"
        const wall = enchanced ? "⏹" : "█";

       const fulcon = askForFullControl(this);

       const maxX = 49;
       const maxY = 29;
       let startTime = Date.now();



       let snake: pos[] = [
        {
            x: 0,
            y: 0
        },
       ];

       const snakeDir: pos = {
            x: 1,
            y: 0
       };
       

       let fruits: pos[] = [
           {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            } 
       ]

       let snakeSize = 3;
       let toNextFruit: number = maxApplesInt > 1 ? 10 : Infinity;
       let gameLoop: boolean = true;
       let gameOver: boolean = false;
       let lastDir: string = "right";

       let stream;

   
    //    fulcon.addListener("in", "keypress", (data: any) => {
    //     screenWrite(data, this.sessionName);
    //    });

    //    fulcon.addListener("in", "data", (data: any) => {
    //         if(fulcon.codeMatch(data, codeMatchWhat.ctrlc)){
    //             fulcon.ctrlC();
    //         }
            
            
    //         if(fulcon.codeMatch(data, codeMatchWhat.arrowLeft)){
    //             snakeDir.x = -1;
    //         }
    //         else if(fulcon.codeMatch(data, codeMatchWhat.arrowRight)){
    //             snakeDir.x = 1;
    //         }

    //         if(fulcon.codeMatch(data, codeMatchWhat.arrowUp)){
    //             snakeDir.y = 1;
    //         }
    //         else if(fulcon.codeMatch(data, codeMatchWhat.arrowDown)){
    //             snakeDir.y = -1;
    //         }




    //    });
    
       stream = fulcon.getNewListener_in_raw();
       
       emitKeypressEvents(stream);


       stream.on("keypress", (str: any, key: any) => {
            if(key.name === "c" && key.ctrl){
                fulcon.ctrlC();
                return;
            }

            if(key.name === "escape"){
                fulcon.end();
                return;
            }

            if(key.name === "up" && lastDir != "down"){
                snakeDir.x = 0;
                snakeDir.y = -1;
                lastDir = "up";
            }
            else if(key.name === "down" && lastDir != "up"){
                snakeDir.x = 0;
                snakeDir.y = 1;
                lastDir = "down";
            }

             if(key.name === "right" && lastDir != "left"){
                snakeDir.y = 0;
                snakeDir.x = 1;
                lastDir = "right";
            }
            else if(key.name === "left" && lastDir != "right"){
                snakeDir.y = 0;
                snakeDir.x = -1;
                lastDir = "left";
            }           


            if(key.name === "h" && !gameLoop && gameOver){
                setupSnake();
                return;
            }

            if(key.name === "p" && !gameOver){
                gameLoop = !gameLoop;

                if(gameLoop){
                     screenWrite(
                        cursorAbs(maxX + 4, 20)
                        + consoleColors.Reset +
                        consoleColors.BgGreen
                        + consoleColors.Blink
                        + centerText("PLAYING", 20)
                        + consoleColors.Reset
                        + "                 "
                        + cursorAbs(maxX + 4, 21)
                        + "PRESS P TO PAUSE    ",
                        this.sessionName
                     );
                }
                else{
                    screenWrite(
                        cursorAbs(maxX + 4, 20)
                        + consoleColors.Reset +
                        consoleColors.BgRed
                        + consoleColors.Blink
                        + centerText("PAUSED", 20)
                        + consoleColors.Reset
                        + "                 "
                        + cursorAbs(maxX + 4, 21)
                        + "PRESS P TO UNPAUSE    ",
                        this.sessionName
                     );
                }
                return;
            }
       })

       fulcon.addListener("internal", "afterEnd", () => {
            fulcon.removeNewListener_in_raw(stream);
       })

       const setupSnake = () => {
            startTime = Date.now();
            snake = [
                {
                    x: 0,
                    y: 0
                },
            ];
            fruits = [];

            snakeDir.x = 1;
            snakeDir.y = 0;
            lastDir = "right";
            snakeSize = 3;
            generateFruit();
            fulcon.clearScreen();
            borderDraw();
            screenWrite(
                cursorAbs(maxX + 4, 20)
                + consoleColors.Reset +
                consoleColors.BgGreen
                + consoleColors.Blink
                + centerText("PLAYING", 20)
                + consoleColors.Reset
                + "                 "
                + cursorAbs(maxX + 4, 21)
                + "PRESS P TO PAUSE    ",
                this.sessionName
            );
            gameLoop = true;
            gameOver = false;

       }

       const gameover = () => {
            gameLoop = false;
            gameOver = true;
            screenWrite(cursorAbs(0,0) + consoleColors.FgRed + `GAME OVER\n ${consoleColors.FgYellow}SCORE: ${consoleColors.Bright} ${score()}\n${consoleColors.Reset}${consoleColors.Blink}ESCAPE TO EXIT. H TO RESTART`);
            screenWrite(
                cursorAbs(maxX + 4, 20)
                + consoleColors.Reset +
                consoleColors.BgGray
                + consoleColors.Blink
                + centerText("BUSTED", 20)
                + consoleColors.Reset
                + "                 "
                + cursorAbs(maxX + 4, 21)
                + "PRESS H TO RESET    ",
                this.sessionName
            );
       }

       const borderDraw = () => {

            let toPrint: string[] = [cursorAbs(0, maxY + 1)];


            for(let i = 0; i < maxX + 1; i += enchanced ? 2 : 1){
                toPrint.push(wall);
                if(enchanced) toPrint.push(" ");
            }

            for(let i = 0; i < maxY + 1; i++){
                toPrint.push(cursorAbs(maxX + 1, i));
                toPrint.push(wall);
            }

            screenWrite(
                toPrint.join(""),
                this.sessionName
            );
       }

       const generateFruit = () => {
            while(true){
                const fruitCandidate = {
                                x: Math.floor(Math.random() * maxX),
                                y: Math.floor(Math.random() * maxY)
                            };

                // check whether it's in the snake

                let itsNot: boolean = true;
                for(const part of snake){
                    if(part.x === fruitCandidate.x && part.y === fruitCandidate.y){
                        itsNot = false;
                        break;
                    }
                }

                if(itsNot){
                    fruits.push(fruitCandidate);
                    break;
                }
            }
       }

       const moveSnake = () => {
            const moveCandidate = {
                        x: (snake.at(0) as {x: number, y: number}).x + snakeDir.x,
                        y: (snake.at(0) as {x: number, y: number}).y + snakeDir.y
                    };


            for(const part of snake){
                if(moveCandidate.x === part.x && moveCandidate.y === part.y){
                    gameover();
                    return;
                }
            }

            snake.unshift(moveCandidate);

            if(snake.length > snakeSize){
                snake.pop();
            }

            if(snake[0].x > maxX){
                if(disableWalls) gameover();
                else
                snake[0].x = 0;
            }
            else if(snake[0].x < 0){
                if(disableWalls) gameover();
                else
                snake[0].x = maxX;
            }

            if(snake[0].y > maxY){
                if(disableWalls) gameover();
                else
                snake[0].y = 0;
            }
            else if(snake[0].y < 0){
                if(disableWalls) gameover();
                else
                snake[0].y = maxY;
            }
       }

       const drawText = () => {
           let toPrint: string[] = [cursorAbs(maxX + 4, 5)];

            toPrint.push(`Score: `);
            toPrint.push(String(score()));
            toPrint.push(" pkt");
            toPrint.push("         ");
            toPrint.push(cursorAbs(maxX + 4, 6));
            toPrint.push("alive for: ");
            toPrint.push(String(Math.floor((Date.now() - startTime) / 1000)));
            toPrint.push(" seconds");
            toPrint.push("         ");
            toPrint.push(cursorAbs(maxX + 4, 7));
            toPrint.push("length: ");
            toPrint.push(String(snakeSize));
            toPrint.push("         ");
            toPrint.push(cursorAbs(maxX + 4, 8));
            toPrint.push("fruits: ");
            toPrint.push(String(fruits.length));
            toPrint.push("/");
            toPrint.push(String(maxApplesInt))
            toPrint.push("         ");
            toPrint.push(cursorAbs(maxX + 4, 9));
            toPrint.push("next fruit in: ");
            toPrint.push(toNextFruit === Infinity ? "?" : String(Math.floor((toNextFruit - Date.now()) / 100) / 10));
            toPrint.push("         ");





            screenWrite(
                toPrint.join(""),
                this.sessionName
            );         
       }


       const score = () => {
        return Math.floor(snakeSize * 25 + 2.5 * Math.floor(((Date.now() - startTime) / 100)));
       }

       const drawIntialText = () => {
            screenWrite(
                cursorAbs(maxX + 4, 20)
                + consoleColors.Reset +
                consoleColors.BgGreen
                + consoleColors.Blink
                + centerText("PLAYING", 20)
                + consoleColors.Reset
                + "                 "
                + cursorAbs(maxX + 4, 21)
                + "PRESS P TO PAUSE    ",
                this.sessionName
            );


       }
    

       // display
       await fulcon.codeAsyncAlt(async () => {
           fulcon.clearScreen();
           borderDraw();
           drawIntialText();


        
            while(fulcon.stillExecuting){
                await setTimeout(120);
                if(!fulcon.stillExecuting) break;
                if(gameLoop){
                    for(const point of snake){
                        screenWrite(cursorAbs(point.x, point.y) + " ", this.sessionName);
                    }
                    for(const point of fruits){
                        screenWrite(cursorAbs(point.x, point.y) + " ", this.sessionName);
                    }

                    moveSnake();
                    if(!gameLoop) continue;

                    for(const fruit of fruits){
                        if(fruit.x === snake[0].x && fruit.y === snake[0].y){
                            snakeSize += 1;
                            fruits = fruits.filter(
                                (fruit) => !(fruit.x === snake[0].x && fruit.y === snake[0].y)
                            );
                            break;
                        }
                    }

                    if(fruits.length === 0){
                        generateFruit();
                    }

                    if(toNextFruit !== Infinity){
                        const curTime = Date.now();
                        if(toNextFruit < curTime){
                            toNextFruit = fruits.length < maxApplesInt - 1 ? Math.floor(curTime + 100 + Math.random() * maxwaittime) : Infinity;
                            generateFruit();
                        }
                    }
                    else if(fruits.length < maxApplesInt){
                         toNextFruit = Math.floor(Date.now() + 100 + Math.random() * maxwaittime);
                    }


                    if(!gameLoop) continue;

                    for(const point of fruits){
                            screenWrite(cursorAbs(point.x, point.y) + fruit, this.sessionName);
                        }

                    
                    screenWrite(cursorAbs(snake[0].x, snake[0].y) + "@", this.sessionName);
                    let s: string[] = [];
                    for(let i = 1; i < snake.length; i++){
                            s.push(
                                cursorAbs(snake[i].x, snake[i].y) 
                                + ((i > 5) ? consoleColors.Bright : "")
                                + ( i > 15 ? consoleColors.FgGray : "") + ( i > 20 ? consoleColors.Dim : "") + 
                                ( i > 25 ? consoleColors.Blink : "") + "*"
                                + consoleColors.Reset
                            ); 
                    }
                    screenWrite(s.join(""), this.sessionName);

                    drawText();
                }

               

            }

            


            
        });

        
    
    }
}, ["smplsnk"])


const compounds = cmdTableToCommandCompounts(commandTable)

export {commandTable, compounds};