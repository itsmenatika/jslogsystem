import { Socket } from "node:net";
import Stream, { Duplex, Writable } from "node:stream";
import type { terminalSession } from "./programdata.js";
import { alternateBufferCODE, alternateBufferCODEExit } from "./texttools.js";


const uptimeVar = Date.now();

class logSystemError extends Error{}; // the easy error wrapper to log errors

class pseudoStreamWriteAble extends Writable{
    private saveStream: [unknown, unknown, unknown][] = [];

    constructor(){
        super({
            objectMode: true
        });
    }

    write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
        this.saveStream.push([chunk, encoding, callback]);
        // @ts-ignore
        super.write(chunk, encoding, callback);
        return true;
    }

    toArray(): string[]{
        const g: string[] = [];
        for(let i = 0; i < this.saveStream.length; i++){
            g.push(this.saveStream[i] as unknown as string);
        }

        return g;
    }
}

class pseudoStreamWriteAbleListenable extends pseudoStreamWriteAble{
    private callback?: (chunk: any) => void; 

    constructor(){
        super();
    }

    write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
        if(this.callback) this.callback(chunk);
        super.write(chunk, encoding, callback);
        return true;
    }

    onWrite(callback?: (chunk: any) => void){
        this.callback = callback;
    }
}

type ReadableEvents =
  | "data"
  | "end"
  | "error"
  | "close"
  | "readable";

type WritableEvents =
  | "drain"
  | "finish"
  | "error"
  | "close"
  | "pipe"
  | "unpipe";

type certainEvents<S> = S extends Duplex ? ReadableEvents | ReadableEvents :
S extends Writable ? WritableEvents : 
S extends ReadableStream ? ReadableEvents : never;

type eventArgsMap = {
    // common
    error: [err: Error];
    close: [];

    // writable
    drain: [];
    finish: [];
    pipe: [src: NodeJS.ReadableStream];
    unpipe: [src: NodeJS.ReadableStream];

    // readable
    data: [chunk: any];
    end: [];
    readable: [];
};

type errRoute = typeof process.stderr;
type outRoute = typeof process.stdin;
type inRoute = typeof process.stdout;
type allRoutes = errRoute | outRoute | inRoute;

type withWriteFunc = allRoutes | Writable | Duplex | Socket | undefined;


type eventMapType<T> = keyof certainEvents<(
    allRoutes
)>;

type listenerFunction<T> = (...args: eventArgsMap[certainEvents<T>]) => void;
type listenerPair<T> = [certainEvents<T>, listenerFunction<T>];
type listenersTable<T> = listenerPair<T>[];

class streamWrapper<T extends (
    Writable | ReadableStream | allRoutes | Duplex | Socket | undefined
)>{
    session?: terminalSession;
    private stream?: T;
    #history: any[] = [];
    #historyAlt: any[] = [];
    #buffer: boolean = false;
    private listeners: listenersTable<T> = [];


    constructor(stream?: T){
        this.stream = stream;
    }


    fastBufferStatusGet(): Readonly<boolean>{
        return this.#buffer;
    }


    isHistoryEmpty(bufferType?: boolean | null): boolean{
        if(bufferType === undefined) bufferType = this.#buffer; 

        if(bufferType === null){
            return this.#history.length === 0 && this.#historyAlt.length === 0
        }

        if(bufferType){
            return this.#historyAlt.length === 0
        }

        return this.#history.length === 0;
    }

    writeToHistory(data: any, bufferType?: boolean): void{
        if(bufferType === undefined) bufferType = this.#buffer; 

        if(bufferType){
            this.#historyAlt.push(data);
        }
        else{
            this.#history.push(data);
        }
    }

    clearHistory(bufferType?: boolean | null): void{
        if(bufferType === undefined) bufferType = this.#buffer; 

        else if(bufferType === null){
            this.#historyAlt = [];
            this.#history = [];
            return;
        }

        if(bufferType){
            this.#historyAlt = [];
        }
        else{
            this.#history = [];
        }
    }    

    alternateBuffer(this: streamWrapper<withWriteFunc>, status: undefined | boolean | null, callback?: any): Readonly<boolean>{
        if(status === null){
            status = !this.#buffer;
        }


        if(status !== undefined){
            if(status === this.#buffer) return this.#buffer;
            this.#buffer = status;

            const codeTouse = this.#buffer ? alternateBufferCODE : alternateBufferCODEExit;
            
            if(this.stream) this.stream.write(codeTouse, callback);
            else if(callback) callback();

        }

        return this.#buffer;
    }

    write(
        this: streamWrapper<withWriteFunc>,
        chunk: any, callback?: any, buffer?: boolean
    ){
        if(buffer === undefined) buffer = this.#buffer;

        if(buffer !== this.#buffer){
            if(buffer){
                if(this.stream) this.stream.write(alternateBufferCODEExit);
            }
            else{
                if(this.stream) this.stream.write(alternateBufferCODE);
            }
        }


        if(this.stream) this.stream.write(chunk, callback);
        else if(callback) callback();


        if(buffer !== this.#buffer){
            if(buffer){
                if(this.stream) this.stream.write(alternateBufferCODE);
            }
            else{
                if(this.stream) this.stream.write(alternateBufferCODEExit);
            }
        }

        this.writeToHistory(chunk, buffer);
    }

    rewrite(
        this: streamWrapper<withWriteFunc>,
        clean: boolean = false, expectStream: boolean = false, buffer?: boolean
    ){
        if(buffer === undefined) buffer = this.#buffer;
        if(buffer !== this.#buffer) return;

        if(expectStream && !this.stream){
            throw new logSystemError("no stream attached!");
        }

        // for(const chunk of this.history){
        //     (this.stream as Writable).write(chunk);
        // }

        for(let i = 0; i < this.#history.length; i++){
            (this.stream as Writable).write(this.#history[i]);
        }

        if(clean){
            this.clearHistory(this.#buffer);
        }
    }

    getHistory(asCopy: boolean = false, bufferType: boolean = this.#buffer): Readonly<any[]>{


        if(asCopy){
            return bufferType ? [...this.#historyAlt] : [...this.#history];
        }

        return bufferType ? this.#historyAlt : this.#history;
    }

    setHistory(data: any[] | Readonly<any[]> = [], bufferType: boolean = this.#buffer){
        if(bufferType){
            return this.#historyAlt = data as any[];
        }

        return this.#history = data as any[];
    }

    getStream(): undefined | T{
        return this.stream;
    }

    setStream(stream?: T, removeListeners: boolean = true){
        if(removeListeners){
            for(const [name, listener] of this.listeners){
                // @ts-ignore
                this.stream?.removeListener(name, listener);
            }
        }

        this.stream = stream;
    }

    addListener(
        this: streamWrapper<Writable | allRoutes | undefined>,
        event: certainEvents<T>, listener: listenerFunction<T>
    ): void{
        if(this.stream){
            this.stream?.addListener(event, listener);

            // typescript kill yourself

            // @ts-expect-error
            this.listeners.push([event, listener]);
        }
    }

    setListenersFromSavedList(
        this: streamWrapper<Writable | allRoutes>,
        data: listenersTable<T> | Readonly<listenersTable<T>>
    ): Readonly<listenersTable<T>>{
        // remove previous listeners
        this.removeAllListeners();

        // typescript kill yourself

        // @ts-expect-error
        return this.addListenersFromSavedList(data) as Readonly<listenersTable<T>>;
    }

    addListenersFromSavedList(
        this: streamWrapper<Writable | allRoutes>,
        data: listenersTable<T> | Readonly<listenersTable<T>>
    ): Readonly<listenersTable<T>>{
        
        for(const [eventName, func] of data){
            // @ts-expect-error
            this.addListener(eventName, func);
        }

        // typescript kill yourself

        // @ts-expect-error
        return this.listeners;
    }

    getAttachedListenersFromWrapper(): Readonly<listenersTable<T>>{
        return this.listeners;
    }

    removeListener<W extends certainEvents<T>>(
        this: streamWrapper<Writable | allRoutes>,
        event: W, listener: (...args: eventArgsMap[W]) => void
    ): void{
        if(this.stream){
            this.stream?.removeListener(event, listener);

            this.listeners = this.listeners.filter((obj) => {
                if(obj[0] !== event || obj[1] !== listener){
                    return true;
                }
                return false;
            })
        }
    }

    removeAllListeners<W extends certainEvents<T>>(
        this: streamWrapper<Writable | allRoutes>,
    ){
        this.stream?.removeAllListeners();

        this.listeners = [];
        
    }

    rawMode(setTo?: boolean): boolean | undefined{
        const stream = this.getStream();
        if(!stream) return undefined;

        if(setTo !== undefined){
            (stream as typeof process.stdin).setRawMode(setTo);
        }


        return (stream as typeof process.stdin).isRaw;
    }
}

type TTYLike = withWriteFunc & {
  isTTY: true
  columns?: number
};

function isTty(stream: withWriteFunc): stream is TTYLike{
    return !!stream && typeof stream === "object" && stream !== null &&
    "isTTY" in stream &&
    (stream as any).isTTY === true;
}


export {uptimeVar, logSystemError, pseudoStreamWriteAble, pseudoStreamWriteAbleListenable, streamWrapper, isTty, listenersTable, listenerFunction, listenerPair}
export type {withWriteFunc}