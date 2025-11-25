import { consoleMultiWrite } from "../out.js";
import { getTerminalOPJTYPE } from "../programdata.js";
import { consoleColor, consoleColorRGB, consoleColors, consoleColorsMulti } from "../texttools.js";

/**
 * class to easily write colored stuff to the stream
 */
class multiDisplayer{
    private texts: string[] = [];
    private colors: Array<consoleColor | consoleColorsMulti | consoleColorRGB> = [];

    constructor(){}

    // static fromReadyString(text: string){
    //     const toReturn = new multiDisplayer();

    //     const codes = [];

    //     const ansiRegex = /\u001b\[[0-9;]*m/g;

    //     toReturn.colors = text.match(ansiRegex) || [];

    //     toReturn.texts = text.split(ansiRegex).filter(s => s);

    //     return toReturn;
    // }

    /**
     * adds the new characters (and) colors to displayer
     * 
     * for adding at the beginning, check: unshift()
     * 
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    push(text: string, colors?: consoleColor | consoleColorsMulti){
        this.texts.push(text);

        if(colors)
            this.colors.push(colors);
        else
            this.colors.push("");
    }

    /**
     * adds the new characters (and) colors to displayer at the beginning
     * 
     * for adding at the last place, check: push()
     * 
     * @param text the text to be added
     * @param colors colors|color of that text
     */
    unshift(text: string, colors?: consoleColor | consoleColorsMulti){
        this.texts.unshift(text);

        if(colors)
            this.colors.unshift(colors);
        else
            this.colors.unshift("");
    }

    /**
     * pops the last element and returns it
     * @returns the popped element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    pop(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
        return [this.texts.pop(), this.colors.pop()];
    }

    /**
     * shifts the first element and returns it
     * @returns the shifted element in format like: [string, consoleColor | consoleColorsMulti] or [undefined, undefined] if there wasnt any object
     */
    shift(): [undefined | string, undefined | consoleColor | consoleColorsMulti]{
        return [this.texts.shift(), this.colors.shift()];
    }

    /**
     * returns the string without color table
     * @returns the raw string
     */
    toRawString(): string {
        return this.texts.join("");
    }


    /**
     * returns the formated string
     * 
     * 
     * @returns the formated string
     */
    getWhole(): string {
        let ret: string = "";

        for(let i = 0; i < this.texts.length; i++){
            ret += this.colors[i];
            ret += this.texts[i];
            ret += consoleColors.Reset;
        }

        return ret;
    }

    /**
     * allows you to use finally consoleWrite. It's required because js has no constructors
     * @param writeToFile parameter to be passed to consoleWrite. Leave it as undefined to leave it as default
     * @param clearObj whether to clear the arrays on that objects. Defaults to true
     */
    useConsoleWrite(
        writeToFile: boolean | undefined = true, 
        clearObj: boolean = true,
        terminal: getTerminalOPJTYPE = "main"
    ){
        // default of writeToFile
        if(writeToFile === undefined) writeToFile = true;

        // use consoleMultiWrite
        consoleMultiWrite(this.texts, this.colors, terminal, writeToFile);

        // clear objs
        if(clearObj){
            this.texts = [];
            this.colors = [];
        }
    }

    /**
     * clears the whole array
     */
    clear(){
        this.texts = [];
        this.colors = [];
    }
}


export {multiDisplayer}