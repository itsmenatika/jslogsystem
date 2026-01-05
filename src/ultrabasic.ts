import { Socket } from "node:net";
import { Duplex, Writable } from "node:stream";
import type { terminalSession } from "./programdata.js";


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



class streamWrapper<T extends (
    Writable | ReadableStream | allRoutes | Duplex | Socket | undefined
)>{
    session?: terminalSession;
    private stream?: T;
    #history: any[] = [];
    private listeners: [string, CallableFunction][] = [];


    constructor(stream?: T){
        this.stream = stream;
    }

    write(
        this: streamWrapper<withWriteFunc>,
        chunk: any, callback?: any
    ){
 

        if(this.stream) this.stream.write(chunk, callback);
        else if(callback) callback();
        this.#history.push(chunk);
    }

    rewrite(
        this: streamWrapper<withWriteFunc>,
        clean: boolean = false, expectStream: boolean = false
    ){
        if(expectStream && !this.stream){
            throw new logSystemError("no stream attached!");
        }

        // for(const chunk of this.history){
        //     (this.stream as Writable).write(chunk);
        // }

        for(let i = 0; i < this.#history.length; i++){
            (this.stream as Writable).write(this.#history[i]);
        }

        if(clean) this.#history = [];
    }

    getHistory(asCopy: boolean = false): Readonly<any[]>{
        if(asCopy){
            return [...this.#history];
        }

        return this.#history;
    }

    setHistory(data: any[] | Readonly<any[]> = []){
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

    addListener<W extends certainEvents<T>>(
        this: streamWrapper<Writable | allRoutes | undefined>,
        event: W, listener: (...args: eventArgsMap[W]) => void
    ): void{
        if(this.stream){
            this.stream?.addListener(event, listener);
            this.listeners.push([event, listener]);
        }
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
}



export {uptimeVar, logSystemError, pseudoStreamWriteAble, pseudoStreamWriteAbleListenable, streamWrapper}
export type {withWriteFunc}