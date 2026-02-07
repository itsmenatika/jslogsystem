import { InspectOptions, InspectOptionsStylized, inspect } from "util";
import { cmdcallback, cmdTable, unifiedCommandTypes } from "../apis/commands/types.js";
import { ansiEscape, consoleColors } from "../texttools.js";
import { logSystemError } from "../ultrabasic.js";

interface commandCompound{
    name: string,
    data: unifiedCommandTypes
}


interface commandCollectionOptions{
    readonly?: boolean
}

type commandCollectionOptionsReq = Required<commandCollectionOptions>;


const commandCollectionOptionsReq_DEFAULT: commandCollectionOptionsReq = {
    readonly: false
}

class commandCollectionError extends logSystemError{};



type filterCallback = ((obj: unifiedCommandTypes, name: string) => boolean) | ((obj: unifiedCommandTypes) => boolean);

/**
 * a HIGH Level command Collection
 */
class commandCollection{
    #cmdTable: cmdTable = {}
    #options: commandCollectionOptionsReq;

    constructor(from: cmdTable | commandCollection = {}, options: commandCollectionOptions = {}){
        if(from instanceof commandCollection){
            Object.assign(
                this.#cmdTable, {
                    ...from.get(true)
                }
            )
        }
        else{
            Object.assign(
                this.#cmdTable,
                {
                    ...from
                }
            );
        }

        this.#options = {...commandCollectionOptionsReq_DEFAULT};
        Object.assign(this.#options, options);
    }




    /**
     * copies the command list and returns it
     * @returns the copy
     */
    copy(usedOptions: commandCollectionOptions = this.#options): commandCollection{
        return new commandCollection(this, usedOptions);
    }

    clear(): commandCollection{
        if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }

        this.#cmdTable = {};
        return this;
    }

    /**
     * filters results using a designated function
     * @param filterFunction a function that takes (name: string, obj: unifiedCommandTypes) and returns boolean
     * @returns filtered collection
     */
    filter(
        filterFunction: filterCallback
    ): commandCollection{
        const toCr: cmdTable = {};

        for(const name of Object.keys(this.#cmdTable)){

            const obj: unifiedCommandTypes = this.#cmdTable[name];
            const result: boolean = filterFunction(obj, name);

            if(result){
                toCr[name] = obj;
            }
        }

        return new commandCollection(toCr, this.#options);
    }


    /**
     * Excludes certain elements that also appears in another collection or table
     * 
     * It only checks by names!
     * 
     * NOTE: it does not return a new collection. It edites it!
     * 
     * @param that other thing to compare with
     * @returns the edited collection
     */
    exclude(
        that: commandCollection | cmdTable
    ): commandCollection{
        if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }


        let useToCompare;
        if(that instanceof commandCollection){
            useToCompare = that.get();
        }
        else useToCompare = that;


        const newObj: cmdTable = {};

        for(const name of Object.keys(this.#cmdTable)){
            if(
                Object.hasOwn(useToCompare, name)
            ) continue;

            newObj[name] = this.#cmdTable[name]
        }

        this.#cmdTable = newObj;
    
        return this;
    }

    /**
     * filters commands by name
     * @param names names to return
     * @returns collection with only those names
     */
    names(...names: string[]): commandCollection{
        const toCr: cmdTable = {};

        for(const name of Object.keys(this.#cmdTable)){
            if(names.includes(name)) toCr[name] = this.#cmdTable[name];
        }

        return new commandCollection(toCr, this.#options);
    }


    category(category: string): commandCollection{
         const toCr: cmdTable = {};

        for(const name of Object.keys(this.#cmdTable)){
            const ctgr = this.#cmdTable[name].categories || [];

            if(ctgr.includes(category)) toCr[name] = this.#cmdTable[name];
        }

        return new commandCollection(toCr, this.#options);       
    }
    categories(...listOfThem: string[]): commandCollection{
         const toCr: cmdTable = {};

        for(const name of Object.keys(this.#cmdTable)){
            const ctgr = this.#cmdTable[name].categories || [];

            let letBe: boolean = false;

            for(const one of listOfThem){
                if(ctgr.includes(one)){
                    letBe = true;
                    break;
                }
            }

            if(letBe) toCr[name] = this.#cmdTable[name];
        }

        return new commandCollection(toCr, this.#options);       
    }

    get aliases(): commandCollection{
        const toRet: cmdTable = {};

        for(const [name, data] of Object.entries(this.#cmdTable)){
            if(data.isAlias){
                toRet[name] = data;
            }
        }

        return new commandCollection(toRet, this.#options);
    }


    get orginals(): commandCollection{
        const toRet: cmdTable = {};

        for(const [name, data] of Object.entries(this.#cmdTable)){
            if(!data.isAlias){
                toRet[name] = data;
            }
        }

        return new commandCollection(toRet, this.#options);
    }

    get length(){
        return Object.keys(this.#cmdTable).length;
    }

    get(asCopy: boolean = true){
        if(asCopy)
        return {...this.#cmdTable};

        return this.#cmdTable;
    }

    /**
     * extends the collection by additional commands
     * 
     * NOTE: it does not return a new collection. It edites it!
     * 
     * @param by additional commands
     * @param edit whether to allow overwritting existing data. It defaults to true. No error is thrown
     * @returns collection
     */
    extend(by: cmdTable | commandCollection, edit: boolean = false): commandCollection{
        if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }

        if(by instanceof commandCollection){
            by = by.get();
        }

        const cp: cmdTable = {};

        for(const name of Object.keys(by)){
            if(
                !Object.hasOwn(this.#cmdTable, name) || (
                    edit &&
                    this.#cmdTable[name].changeable
                )

            ){
                cp[name] = by[name];
            }   
        }
        

        Object.assign(this.#cmdTable, cp);

        return this;
    }


    removeCommand(name: string, ignoreError: boolean = false): commandCollection{
        if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }

        if(!Object.hasOwn(this.#cmdTable, name)){
            if(!ignoreError){
                throw new logSystemError(`command named '${name}' doesn't exist`);
            }

            return this;
        }

        if(!this.#cmdTable[name].changeable){
            if(!ignoreError){
                throw new logSystemError(`command named '${name}' is not changeable!`);
            }

            return this;
        }

        delete this.#cmdTable[name];
        return this;
    }

    removeCommands(...names: string[]): commandCollection{
        if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }

        for(const name of names){
            this.removeCommand(name);
        }

        return this;
    }

    registerCommand(name: string, data: unifiedCommandTypes, edit: boolean = false, ignoreError: boolean = false): commandCollection{
            if(this.#options.readonly){
            throw new commandCollectionError("That command collection is readonly!");
        }
        
        if(Object.hasOwn(this.#cmdTable, name)){
            if(!edit){
                throw new logSystemError(`command named '${name}' does exist`);
            }

            if(!this.#cmdTable[name].changeable){
                if(!ignoreError){
                    throw new logSystemError(`command named '${name}' is not changeable!`);
                }

               return this;
            }
        }


        if(!data.isAlias && !data.callback){
            if(!ignoreError)
            throw new logSystemError("The callback must be set for no alias.");

            return this;
        }

        if(data.isAlias){
            this.#cmdTable[name] = {
                usageinfo: undefined,
                desc: undefined,
                longdesc: undefined,
                hidden: typeof data.hidden === "boolean" ? data.hidden : true,
                changeable: typeof data.changeable === "boolean" ? data.changeable : true,
                isAlias: true,
                aliasName: data.aliasName as string,
                callback: undefined,
                async: undefined,
                minver: data.minver,
                maxver: data.maxver,
                categories: data.categories || []
            }

            return this;
        }

        // it will WORK, i wont waste 5 hours to try convince typescript
        // @ts-ignore
        this.#cmdTable[name] = {
            usageinfo: data.usageinfo ? data.usageinfo : `${name} [<arguments...>] ~(usage not specified)`,
            desc: data.desc ? data.desc : "no description",
            longdesc: data.longdesc ? data.longdesc : "no long description",
            hidden: typeof data.hidden === "boolean" ? data.hidden : false,
            changeable: typeof data.changeable === "boolean" ? data.changeable : true,
            isAlias: false,
            aliasName: undefined,
            callback: data.callback,
            async: typeof data.async === "boolean" ? data.async : false,
            minver: data.minver,
            maxver: data.maxver,
            categories: data.categories || []
        };

        return this;
    }


    registerCommandShort(
        cmdCom: commandCompound, 
        edit: boolean = false,
        ignoreError: boolean = false
    ): commandCollection{
        this.registerCommand(cmdCom.name, cmdCom.data, edit, ignoreError);

        return this;
    }

    multiCommandRegister(
        data: Array<commandCompound>,
        edit: boolean = false,
        ignoreError: boolean = false
    ): commandCollection{

        for(const one of data){
            this.registerCommandShort(one, edit, ignoreError);
        }

        return this;
    }

    /**
     * @deprecated
     * 
     * legacy register command
     * 
     * DONT USE IN NEW PROJECTS
     * 
     * it doesnt allow you to edit command afterwards by default, due to compatibility reasons!
     * 
     * @param name the command name
     * @param usage the command usage
     * @param shortdesc short description
     * @param longdesc long description
     * @param callback callback
     */
    registerCommandLegacy(
        name: string,
        usage: string,
        shortdesc: string,
        longdesc: string,
        callback: cmdcallback
    ): commandCollection{
        this.registerCommand(name, {
            usageinfo: usage,
            desc: shortdesc,
            longdesc: longdesc,
            hidden: false,
            changeable: false,
            isAlias: false,
            callback: callback
        });

        return this;
    }

    [Symbol.toStringTag](){
        return "[" + Object.keys(this.#cmdTable).join(", ") + "]";
    }

    [inspect.custom](depth: number, options: InspectOptions, inspect: (value: any, opts?: InspectOptionsStylized) => string): string{
        let al = Object.keys(this.#cmdTable);

        al = al.filter(
            (s) => {
                const cmdData = this.#cmdTable[s];
                if(!cmdData) return false;

                if(cmdData.hidden && !options.showHidden) return false;
            }
        )

        al = al.slice(0, (options.maxArrayLength || 0) + 1);

        if(options.colors){
            al = al.map((s) => `${consoleColors.FgMagenta}${s}${consoleColors.Reset}`);
        
             return `${consoleColors.FgRed}CommandCollection${consoleColors.Reset}(${al.join(", ")})`;
        }

        return `CommandCollection(${al.join(", ")})`;
    }

}


export {commandCollection}