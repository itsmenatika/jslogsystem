import { warn } from "../../log.js";
import { screenWrite } from "../../out.js";
import { getTerminalOPJTYPE } from "../../programdata.js";
import { consoleColors, cursorAbs } from "../../texttools.js";

/**
 * unified interface for 2D position
 */
interface pos2D{
    x: number,
    y: number
}

/**
 * allows to quickly create 2D positions
 * @param x x coordinate
 * @param y y coordinate
 * @returns 2D position
 */
function pos2D(x: number, y: number): pos2D{
    return {x, y};
}

/**
 * unified interface for 2D size
 */
interface size2D{
    width: number,
    height: number
}

/**
 * allows to quickly create 2D sizes
 * @param width width
 * @param height height
 * @returns 2D size
 */
function size2D(width: number, height: number): size2D{
    return {width, height};
}

type colors = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray";




/**
 * a standard cell style
 */
interface cellStyleProvide{
    /** blink mode */
    blink?: boolean,
    /** bright mode */
    bright?: boolean,
    /** dim mode */
    dim?: boolean,
    /** italic style */
    italic?: boolean,
    /** underscore style */
    underscore?: boolean,
    /** reserve display mode */
    reverse?: boolean,
    /**
     * background
     */
    background?: colors | null,
    /**
     * foreground
     */
    foreground?: colors | null
}

type cellStyle = Required<cellStyleProvide>;

interface cellProvide extends cellStyleProvide{
    text?: string,
} 

type cell = Required<cellProvide>;

type screenBufferType = Array<Array<cell>>;

const defaultStyle: cellStyle = {
    blink: false,
    bright: false,
    italic: false,
    underscore: false,
    reverse: false,
    dim: false,
    background: "black",
    foreground: "white"

}

/**
 * standard screen buffer
 */
class screenBuffer{
    protected buffer: screenBufferType = [];
    readonly size: size2D;
    cursorCordsObj: pos2D = {x: 0, y: 0};


    constructor(of: size2D, prealocate: boolean = true){

        this.size = of;

        if(prealocate){
            // this.#buffer = Array.from({length: of.height}, () => 
            //     Array(of.width).fill(" ")
            // );
            this.buffer = Array.from({length: of.height}, () => 
                Array.from({length: of.width}, () => {
                    return {
                        blink: false,
                        bright: false,
                        italic: false,
                        underscore: false,
                        reverse: false,
                        dim: false,
                        background: "black",
                        foreground: "white",
                        text: " "
                    }
                })
            );
        }

    }



    setBuffer(buffer: screenBufferType): typeof this{
        this.buffer = buffer;
        return this;
    }

    getBuffer(): screenBufferType{
        return this.buffer;
    }

    set(x: number, y: number, to: cell){
        this.buffer[y][x] = to;
    }

    get(x: number, y: number): cell{
        return this.buffer[y][x];
    }

    edit(x: number, y: number, to: cellProvide){
        const tmp = {...this.buffer[y][x]} as cell;

        Object.assign(tmp, to);

        this.buffer[y][x] = tmp;
    }


    // copy(){
    //     const toRet: string[][] = new Array(this.#buffer.length);

    //     for (let y = 0; y < this.#buffer.length; y++) {
    //         toRet[y] = this.#buffer[y].slice();
    //     }

    //     return new screenBuffer(this.#size2D, false).setBuffer(toRet);
    // }

    dump(withNewLines: boolean = false): string{
        const height = this.size.height;
        let toRet: string = "";

        for(let y = 0; y < height; y++){
            
            toRet += this.buffer[y].join("");
            if(withNewLines){
                toRet += "\n";
            }
        }

        return toRet;
    }

    writeToScreen(terminal: getTerminalOPJTYPE = "main"){
        screenWrite(this.dump(), terminal);
    }


    copy(): screenBuffer{
        const ns = new screenBuffer(this.size, false);
        ns.setBuffer(structuredClone(this.getBuffer()));

        return ns;
    }

    toDoubleBuffer(): screenBufferDouble{
        const ns = new screenBufferDouble(this.size, false);

        const prvbuf = this.getBuffer();

        ns.setBuffer(structuredClone(prvbuf));
        // ns.setBufferPrevious(structuredClone(prvbuf));
        
        return ns;
    }

    write(pos: pos2D, text: string, style: cellStyleProvide, nextLine: boolean = true){
        const usedStyle = {...defaultStyle, ...style};
        const newPos = {...pos};
        

        for(const letter of text){
            
            this.edit(newPos.x, newPos.y, {
                text: letter,
                ...usedStyle
            });
            
            newPos.x += 1;

            if(newPos.x >= this.size.width){
                if(!nextLine) break;
                newPos.x = 0;
                newPos.y += 1;
            }
            if(newPos.y > this.size.height - 1) break;
        }

        this.cursorCordsObj = newPos;
    }

    writeCursor(text: string, style: cellStyleProvide, nextLine = true) {
        const usedStyle = { ...defaultStyle, ...style };
        const newPos = { ...this.cursorCordsObj };

        for (const letter of text) {
            this.edit(newPos.x, newPos.y, {
                text: letter,
                ...usedStyle
            });

            newPos.x += 1;

            if (newPos.x >= this.size.width) {
                if (!nextLine) break;
                newPos.x = 0;
                newPos.y += 1;

            }

            if (newPos.y >= this.size.height) break;
        }


        this.cursorCordsObj = newPos;
    }

    cursorTo(x: number, y: number): typeof this{
        this.cursorCordsObj = {x, y};
        return this;
    }

    cursorToByObj(pos: pos2D): typeof this{
        this.cursorCordsObj = {x: pos.x, y: pos.y};
        return this;
    }

    cursorPos(): pos2D{
        return {...this.cursorCordsObj};
    }

    cursorRight(by: number = 1, goToNextLine: boolean = true, errorable: boolean = false): pos2D{
        if(by < 0){
            return this.cursorLeft(-by, goToNextLine, errorable);
        }

        const tempPos = {...this.cursorCordsObj};


        tempPos.x += by;

        if(tempPos.x >= this.size.width){
            if(errorable){
                throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to add by ${by} from ${this.cursorCordsObj.x} to ${tempPos.x}`);
            }

            if(goToNextLine){
                while(tempPos.x >= this.size.width){
                    tempPos.y += 1;
                    tempPos.x -= this.size.width;

                    if(tempPos.y >= this.size.height){
                        if(errorable){
                            throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to add by ${by} from ${this.cursorCordsObj.x} to ${tempPos.x}`);                         
                        }

                        break;
                    }
                }
            }
            else{
                tempPos.x = this.size.width - 1;
            }
        }


        return this.cursorCordsObj = tempPos;
    }

    cursorLeft(by: number = 1, goToPrevioustLine: boolean = true, errorable: boolean = false): pos2D{
       if(by < 0){
            return this.cursorRight(-by, goToPrevioustLine, errorable);
        }

        const tempPos = {...this.cursorCordsObj};

        tempPos.x -= by;

        if(tempPos.x < 0){
               if(errorable){
                    throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to remove by ${by} from ${this.cursorCordsObj.x} to ${tempPos.x}`);
                }

                if(goToPrevioustLine){
                    while(tempPos.x < 0){
                        tempPos.y -= 1;
                        tempPos.x += this.size.width;
    
                        if(tempPos.y < 0){
                            if(errorable){
                                    throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to remove by ${by} from ${this.cursorCordsObj.x} to ${tempPos.x}`);
                            }
                            break;
                        }
    
                    }
                }
                else{
                    tempPos.x = 0;
                }
         
        }

        return this.cursorCordsObj = tempPos;
    }


    cursorTop(by: number, errorable: boolean = false): pos2D{
        if(by < 0){
            return this.cursorDown(-by, errorable);
        }

        const tempPos = {...this.cursorCordsObj};

        tempPos.y -= by;
        
        if(tempPos.y < 0){
            if(errorable){
                throw new Error(`xycoordinate exceeded: ${tempPos.y} compared to ${this.size.width}x${this.size.height}. Tried to remove by ${by} from ${this.cursorCordsObj.y} to ${tempPos.y}`);                
            }

            tempPos.y = 0;
        }
        
        return this.cursorCordsObj = tempPos;
    }

    cursorDown(by: number, errorable: boolean = false): pos2D{
        if(by < 0){
            return this.cursorTop(-by, errorable);
        }

        const tempPos = {...this.cursorCordsObj};

        tempPos.y += by;
        
        if(tempPos.y >= this.size.height){
            if(errorable){
                throw new Error(`xycoordinate exceeded: ${tempPos.y} compared to ${this.size.width}x${this.size.height}. Tried to remove by ${by} from ${this.cursorCordsObj.y} to ${tempPos.y}`);                
            }

            tempPos.y = this.size.height - 1;
        }
        
        return this.cursorCordsObj = tempPos;
    }



    /**
     * draws a filled rectangle from one position to another provided position
     * 
     * @param one first position
     * @param two second position
     * @param style drawing style
     * @param usingThat used character
     */
    rectangle(one: pos2D, two: pos2D, style: cellStyleProvide, usingThat: string = " "){
        const usedStyle = { ...defaultStyle, ...style };
        const [firstX, secondX] = one.x < two.x ? [one.x, two.x] : [two.x, one.x];
        const [firstY, secondY] = one.y < two.y ? [one.y, two.y] : [two.y, one.y];

        for(let y = firstY; y <= secondY; y++){
            for(let x = firstX; x <= secondX; x++){
                this.set(x, y, {
                    text: usingThat,
                    ...usedStyle
                });
            }
        }
    }


    /**
     * draws a unfilled rectangle from one position to another provided position
     * 
     * @param one first position
     * @param two second position
     * @param style drawing style
     * @param usingThat used character
     */
    rectangleBorder(one: pos2D, two: pos2D, style: cellStyleProvide, usingThat: string = " "){
        // const usedStyle = { ...defaultStyle, ...style };
        const [firstX, secondX] = one.x < two.x ? [one.x, two.x] : [two.x, one.x];
        const [firstY, secondY] = one.y < two.y ? [one.y, two.y] : [two.y, one.y];

        // const dx = secondX - firstX;
        // const dy = secondY - firstY;

        this.line({x: firstX, y: firstY}, {x: secondX, y: firstY}, style, usingThat);
        this.line({x: secondX, y: firstY}, {x: secondX, y: secondY}, style, usingThat);
        this.line({x: firstX, y: firstY}, {x: secondX, y: secondY}, style, usingThat);
        this.line({x: firstX, y: secondY}, {x: secondX, y: secondY}, style, usingThat);
    }


    line(a: pos2D, b: pos2D, style: cellStyleProvide = {}, char = " ") {
        const usedStyle = { ...defaultStyle, ...style };

        let x0 = a.x, y0 = a.y;
        let x1 = b.x, y1 = b.y;

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;

        let err = dx - dy;

        while (true) {
            this.set(x0, y0, { text: char, ...usedStyle });

            if (x0 === x1 && y0 === y1) break;

            const e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }

            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    triangle(a: pos2D, b: pos2D, c: pos2D, style: cellStyleProvide = {}, char: string = " ") {
        this.line(a, b, style, char);
        this.line(b, c, style, char);
        this.line(c, a, style, char);
    }


    fill(char: string = " ", style: cellStyleProvide){
        const stl = this.constructStyle(style);

        for(let y = 0; y < this.size.height; y++){
            for(let x = 0; x < this.size.width; x++){
                this.set(x, y, {
                    text: char,
                    ...stl
                });
            }
        }
    }

    constructStyle(style: cellStyleProvide): cellStyle{
        const tmp = {...defaultStyle, ...style};


        return tmp;
    }

}

// interface optimizedConfigureProvide{
//     drawingAlgorithm: "simple" | "optimized" | "ultraoptimized",

// }

/**
 * double screen buffer
 */
class screenBufferDouble extends screenBuffer{
    previousBuffer: screenBufferType = [];
    // #buffer: screenBufferType = [];
    // #size: size2D;
    // #writeCursor: pos2D = {x: 0, y: 0};
    #timeTemp: number = 0;

    #screenDamageMin: Int32Array;
    #screenDamageMax: Int32Array;


    constructor(of: size2D, prealocate: boolean = true){
        super(of, prealocate);

        this.#screenDamageMin = new Int32Array(of.height);
        this.#screenDamageMax = new Int32Array(of.height);

        // this.#size = of;

        // if(prealocate){
        // //     this.previousBuffer = Array.from({length: of.height}, () => 
        // //         Array.from({length: of.width}, () => {
        // //             return {
        // //                 blink: false,
        // //                 bright: false,
        // //                 italic: false,
        // //                 underscore: false,
        // //                 reverse: false,
        // //                 dim: false,
        // //                 background: "black",
        // //                 foreground: "white",
        // //                 text: " "
        // //             }
        // //         })
        // //     );
        // // }
        // }
    }

    clearDamage(row?: number){
        if(row !== undefined){
            this.#screenDamageMax[row] = -1;
            this.#screenDamageMin[row] = -1;
        }
        else{
            this.#screenDamageMax.fill(-1);
            this.#screenDamageMin.fill(-1);
        }
    }

    isRowDamaged(row: number){
        return this.#screenDamageMin[row] != -1;
    }

    isCellDamaged(x: number, y: number){
        return this.#screenDamageMin[y] >= x && this.#screenDamageMax[y] <= x;
    }

    markDamaged(x: number, y: number){
        if(this.#screenDamageMin[y] === -1 || this.#screenDamageMin[y] > x) this.#screenDamageMin[y] = x;
        if(this.#screenDamageMax[y] === -1 || this.#screenDamageMax[y] < x) this.#screenDamageMax[y] = x;
    }

    dumpOptimized(): string{
        const height = this.size.height;
        const width = this.size.width;

        let d: string = "";

        for(let y = 0; y < height; y++){
            if(this.#screenDamageMin[y] !== -1){
                d += cursorAbs(this.#screenDamageMin[y] + 1, y + 1);

                for(let x = this.#screenDamageMin[y]; x <= this.#screenDamageMax[y]; x++){
                    d += createSignatureFromCell(this.buffer[y][x]);
                }
                
                this.#screenDamageMax[y] = -1;
                this.#screenDamageMin[y] = -1;
            }
        }




        return d;

    }

    // get size(){
    //     return this.#size;
    // }

    // setBuffer(buffer: screenBufferType): typeof this{
    //     this.#buffer = buffer;
    //     return this;
    // }

    // getBuffer(): screenBufferType{
    //     return this.#buffer;
    // }

    // setBufferPrevious(buffer: screenBufferType): typeof this{
    //     this.previousBuffer = buffer;
    //     return this;
    // }

    // getBufferPrevious(): screenBufferType{
    //     return this.previousBuffer;
    // }


    // edit(x: number, y: number, to: cellProvide){
    //     const tmp = {...this.#buffer[y][x]} as cell;

    //     Object.assign(tmp, to);

    //     this.#buffer[y][x] = tmp;
    // }


    // get(x: number, y: number): cell{
    //     return this.#buffer[y][x];
    // }

    copy(){
        const ns = new screenBufferDouble(this.size, false);
        ns.setBuffer(structuredClone(this.getBuffer()));

        return ns;
    }

    toScreenBuffer(){
        const ns = new screenBuffer(this.size, false);
        ns.setBuffer(structuredClone(this.getBuffer()));

        return ns;
    }


    set(x: number, y: number, to: cell){
        this.buffer[y][x] = to;
        this.markDamaged(x, y);
    }


    edit(x: number, y: number, to: cellProvide){
        const tmp = {...this.buffer[y][x]} as cell;

        Object.assign(tmp, to);

        this.buffer[y][x] = tmp;

        this.markDamaged(x, y);
    }


    // dumpOptimized(): string{
    //     const height = this.#size2D.height;
    //     const width = this.#size2D.width;
    //     let nxt: boolean = false;
    //     let toRet: string = "";

    //     for(let y = 0; y < height; y++){
    //        for(let x = 0; x < width; x++){
    //             const newChar = this.#buffer[y][x];
    //             if(newChar !== this.#previousBuffer[y][x]){
    //                 this.#previousBuffer[y][x] = newChar;
                    
    //                 if(nxt){
    //                     toRet += newChar;
    //                 }
    //                 else{
    //                     nxt = true;
    //                     toRet += cursorAbs(x, y);
    //                 }

    //             }
    //             else nxt = false;
    //         }         
    //     }

    //     return toRet;
    // }

    // optimizedConfigure(){

    // }

    // dumpOptimized(): string {
    //     const h = this.size.height;
    //     const w = this.size.width;

    //     let out = "";

    //     for (let y = 0; y < h; y++) {
    //         for (let x = 0; x < w; x++) {
    //             const curr = this.buffer[y][x];
    //             const prev = this.previousBuffer[y][x];

    //             if (!cellsEqual(curr, prev)) {
    //                 this.previousBuffer[y][x] = curr;
    //                 out += cursorAbs(x + 1, y + 1) + createSignatureFromCell(curr);
    //             }
    //         }
    //     }

    //     return out;
    // }

    writeToScreenOptimized(terminal: getTerminalOPJTYPE = "main"){
        screenWrite(this.dumpOptimized(), terminal);
    }

    writeToScreenOptimizedWithTime(terminal: getTerminalOPJTYPE = "main", time: number = 50){
        const curTime = Date.now();

        if(this.#timeTemp <= curTime){
            this.#timeTemp = curTime + time;
            this.writeToScreenOptimized(terminal);
        }
    }

    resetTimeToOptimizedWrite(){
        this.#timeTemp = 0;
    }


    // write(pos: pos2D, text: string, style: cellStyleProvide, nextLine: boolean = true){
    //     const usedStyle = {...defaultStyle, ...style};
    //     const newPos = {...pos};
        

    //     for(const letter of text){
            
    //         this.edit(newPos.x, newPos.y, {
    //             text: letter,
    //             ...usedStyle
    //         });
            
    //         newPos.x += 1;

    //         if(newPos.x >= this.size.width){
    //             if(!nextLine) break;
    //             newPos.x = 0;
    //             newPos.y += 1;
    //         }
    //         if(newPos.y > this.size.height - 1) break;
    //     }

    //     this.writeCursor = newPos;
    // }

    // writeCursor(text: string, style: cellStyleProvide, nextLine = true) {
    //     const usedStyle = { ...defaultStyle, ...style };
    //     const newPos = { ...this.writeCursor };

    //     for (const letter of text) {
    //         this.edit(newPos.x, newPos.y, {
    //             text: letter,
    //             ...usedStyle
    //         });

    //         newPos.x += 1;

    //         if (newPos.x >= this.size.width) {
    //             if (!nextLine) break;
    //             newPos.x = 0;
    //             newPos.y += 1;

    //         }

    //         if (newPos.y >= this.#size.height) break;
    //     }


    //     this.writeCursor = newPos;
    // }




    // cursorTo(x: number, y: number): typeof this{
    //     this.writeCursor = {x, y};
    //     return this;
    // }

    // cursorToByObj(pos: pos2D): typeof this{
    //     this.writeCursor = {x: pos.x, y: pos.y};
    //     return this;
    // }

    // cursorPos(): pos2D{
    //     return {...this.writeCursor};
    // }

    // cursorRight(by: number = 1, goToNextLine: boolean = true, errorable: boolean = false): pos2D{
    //     if(by < 0){
    //         return this.cursorLeft(-by, goToNextLine, errorable);
    //     }

    //     const tempPos = {...this.writeCursor};


    //     tempPos.x += by;

    //     if(tempPos.x >= this.size.width){
    //         if(errorable){
    //             throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to add by ${by} from ${this.writeCursor.x} to ${tempPos.x}`);
    //         }

    //         if(goToNextLine){
    //             while(tempPos.x >= this.size.width){
    //                 tempPos.y += 1;
    //                 tempPos.x -= this.size.width;

    //                 if(tempPos.y >= this.size.height){
    //                     if(errorable){
    //                         throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to add by ${by} from ${this.writeCursor.x} to ${tempPos.x}`);                         
    //                     }

    //                     break;
    //                 }
    //             }
    //         }
    //         else{
    //             tempPos.x = this.size.width - 1;
    //         }
    //     }


    //     return this.writeCursor = tempPos;
    // }

    // cursorLeft(by: number = 1, goToPrevioustLine: boolean = true, errorable: boolean = false): pos2D{
    //    if(by < 0){
    //         return this.cursorRight(-by, goToPrevioustLine, errorable);
    //     }

    //     const tempPos = {...this.writeCursor};

    //     tempPos.x -= by;

    //     if(tempPos.x < 0){
    //            if(errorable){
    //                 throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.size.width}x${this.size.height}. Tried to remove by ${by} from ${this.writeCursor.x} to ${tempPos.x}`);
    //             }

    //             if(goToPrevioustLine){
    //                 while(tempPos.x < 0){
    //                     tempPos.y -= 1;
    //                     tempPos.x += this.size.width;
    
    //                     if(tempPos.y < 0){
    //                         if(errorable){
    //                                 throw new Error(`x coordinate exceeded: ${tempPos.x} compared to ${this.#size.width}x${this.#size.height}. Tried to remove by ${by} from ${this.#writeCursor.x} to ${tempPos.x}`);
    //                         }
    //                         break;
    //                     }
    
    //                 }
    //             }
    //             else{
    //                 tempPos.x = 0;
    //             }
         
    //     }

    //     return this.writeCursor = tempPos;
    // }


    // cursorTop(by: number, errorable: boolean = false): pos2D{
    //     if(by < 0){
    //         return this.cursorDown(-by, errorable);
    //     }

    //     const tempPos = {...this.#writeCursor};

    //     tempPos.y -= by;
        
    //     if(tempPos.y < 0){
    //         if(errorable){
    //             throw new Error(`xycoordinate exceeded: ${tempPos.y} compared to ${this.#size.width}x${this.#size.height}. Tried to remove by ${by} from ${this.#writeCursor.y} to ${tempPos.y}`);                
    //         }

    //         tempPos.y = 0;
    //     }
        
    //     return this.#writeCursor = tempPos;
    // }

    // cursorDown(by: number, errorable: boolean = false): pos2D{
    //     if(by < 0){
    //         return this.cursorTop(-by, errorable);
    //     }

    //     const tempPos = {...this.#writeCursor};

    //     tempPos.y += by;
        
    //     if(tempPos.y >= this.#size.height){
    //         if(errorable){
    //             throw new Error(`xycoordinate exceeded: ${tempPos.y} compared to ${this.#size.width}x${this.#size.height}. Tried to remove by ${by} from ${this.#writeCursor.y} to ${tempPos.y}`);                
    //         }

    //         tempPos.y = this.#size.height - 1;
    //     }
        
    //     return this.#writeCursor = tempPos;
    // }




    
}

function cellsEqual(a: cell, b: cell): boolean {
    return (
        a.text === b.text &&
        a.background === b.background &&
        a.foreground === b.foreground &&
        a.blink === b.blink &&
        a.italic === b.italic &&
        a.underscore === b.underscore &&
        a.reverse === b.reverse &&
        a.dim === b.dim &&
        a.bright === b.bright
    );
}


const basicColorLookUpBg: Record<colors, string> = {
    "black": consoleColors.BgBlack,
    "blue": consoleColors.BgBlue,
    "cyan": consoleColors.BgCyan,
    "gray": consoleColors.BgGray,
    "green": consoleColors.BgGreen,
    "magenta": consoleColors.BgMagenta,
    "red": consoleColors.BgRed,
    "white": consoleColors.BgWhite,
    "yellow": consoleColors.BgYellow
};

const basicColorLookUpFg: Record<colors, string> = {
    "black": consoleColors.FgBlack,
    "blue": consoleColors.FgBlue,
    "cyan": consoleColors.FgCyan,
    "gray": consoleColors.FgGray,
    "green": consoleColors.FgGreen,
    "magenta": consoleColors.FgMagenta,
    "red": consoleColors.FgRed,
    "white": consoleColors.FgWhite,
    "yellow": consoleColors.FgYellow
};

function createSignatureFromCell(data: cell){
    let s = "";


    if(data.background && Object.hasOwn(basicColorLookUpBg, data.background)) s += basicColorLookUpBg[data.background];
    if(data.foreground && Object.hasOwn(basicColorLookUpFg, data.foreground)) s += basicColorLookUpFg[data.foreground];


    // switch(data.background){
    //     // case "black":
    //     //     s += consoleColors.BgBlack;
    //     //     break;
    //     // case "blue":
    //     //     s += consoleColors.BgBlue;
    //     //     break;
    //     // case "cyan":
    //     //     s += consoleColors.BgCyan;
    //     //     break;
    //     // case "gray":
    //     //     s += consoleColors.BgGray;
    //     //     break;
    //     // case "green":
    //     //     s += consoleColors.BgGreen;
    //     //     break;
    //     // case "magenta":
    //     //     s += consoleColors.BgMagenta;
    //     //     break;
    //     // case "red":
    //     //     s += consoleColors.BgRed;
    //     //     break;
    //     // case "white":
    //     //     s += consoleColors.BgWhite;
    //     //     break;
    //     // case "yellow":
    //     //     s += consoleColors.BgYellow;
    //     //     break;
    // }

    // switch(data.foreground){
    //     case "black":
    //         s += consoleColors.FgBlack;
    //         break;
    //     case "blue":
    //         s += consoleColors.FgBlue;
    //         break;
    //     case "cyan":
    //         s += consoleColors.FgCyan;
    //         break;
    //     case "gray":
    //         s += consoleColors.FgGray;
    //         break;
    //     case "green":
    //         s += consoleColors.FgGreen;
    //         break;
    //     case "magenta":
    //         s += consoleColors.FgMagenta;
    //         break;
    //     case "red":
    //         s += consoleColors.FgRed;
    //         break;
    //     case "white":
    //         s += consoleColors.FgWhite;
    //         break;
    //     case "yellow":
    //         s += consoleColors.FgYellow;
    //         break;
    // }

    if(data.blink) s += consoleColors.Blink;
    if(data.italic) s += consoleColors.Italic;
    if(data.underscore) s += consoleColors.Underscore;
    if(data.dim) s += consoleColors.Dim;
    if(data.bright) s += consoleColors.Bright;
    if(data.reverse) s += consoleColors.Reverse;


    return s + data.text + consoleColors.Reset;

}

// const w = new screenBuffer({width: 5, height: 5});
// const d = new screenBufferDouble({width: 5, height: 5});


const w = new screenBufferDouble(size2D(2, 5));



export {screenBuffer, screenBufferDouble, pos2D, size2D}