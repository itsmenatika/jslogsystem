import { format, inspect, InspectOptions } from "util";
import { assertConsole, log, logNode, LogType } from "../log.js";
import { connectedToSpecificTerminal, getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../programdata.js";
import { logSystemError } from "../ultrabasic.js";
import { terminalApi } from "../apis/terminal/terminalApi.js";
import { clearConsole } from "./clearConsole.js";
import { consoleWrite } from "../out.js";
import { consoleColorRGB, consoleColors } from "../texttools.js";
import { logGroup, logGroupEnd } from "../apis/console/group.js";
import { logSettings } from "../apis/console/logstyles.js";
import { counterCount, counterCountReset } from "../apis/console/counter.js";
import { Writable } from "stream";
import { Console } from "console";
import { logTimeEnd, logTimeStamp, logTimeStart } from "../apis/console/timers.js";

class consoleShortHand extends connectedToSpecificTerminal{
  type: Readonly<string> = "consoleShortHand";
  #who: undefined | string | logNode = void 0;

  get who(): Readonly<string | logNode | undefined>{
    return this.#who;
  }

  set who(val: string | logNode | undefined){
    if(
      typeof val !== "undefined" &&
      typeof val !== "string" &&
      (typeof val !== "object" || !(
        val instanceof logNode
      ))
    ){
      throw new TypeError("string, logNode or undefined was expected!");
    }
    this.#who = val;
  }

  get colors(): Readonly<typeof consoleColors>{
    return consoleColors;
  }

  get terminalApi(): Readonly<terminalApi>{
    return new terminalApi(this.sessionName);
  }

  as(own?: string | logNode): consoleShortHand{
    this.#who = own;
    return this;
  }

  getWho(): undefined | string | logNode{
    return this.#who;
  }

  constructor(from: getTerminalOPJTYPE){
    super(from);
    // const ses = getTerminalOPJ(from);

    // this.#terminalName = ses.terminalName;
  }

  useConsoleFormatting(...data: any[]): string{
    let toPr: string = "";
    if(typeof data[0] === "string"){
      toPr = format(data[0], ...data.slice(1));
    } else{
      toPr = data.map(v => format(v)).join(" ");
    }

    return toPr;
  }

  clear(clearBuf: boolean = true): consoleShortHand{
    clearConsole(this.sessionName, clearBuf);
    return this;
  }

  /**
   * writes a raw text to the console. Allows you to not use log format
   * 
   * if you want even more low level and faster api use consoleUltraRawWrite()
   * 
   * @param textToWrite the text to write
   * @param WithColor color (optional). Defaults to consoleColors.Reset
   * @param writeToFile whether it should be written to the file. defaults to true
   * @param end the end symbol. It defaults to \n
   */
  writeRaw(
    textToWrite: string, 
    WithColor: consoleColors | consoleColors[] | consoleColorRGB = consoleColors.Reset, 
    writeToFile: boolean = true,
    end: string = "\n",
  ){
    consoleWrite(textToWrite, WithColor, writeToFile, this.sessionName);
  }

  /**
   * writes a raw text to the console. Allows you to not use log format
   * 
   * if you want even more low level and faster api use consoleUltraRawWrite()
   * 
   * @param textToWrite the text to write
   * @param WithColor color (optional). Defaults to consoleColors.Reset
   * @param writeToFile whether it should be written to the file. defaults to true
   * @param end the end symbol. It defaults to \n
   */
  write(
    textToWrite: string, 
    WithColor: consoleColors | consoleColors[] | consoleColorRGB = consoleColors.Reset, 
    writeToFile: boolean = true,
    end: string = "\n",
  ){
    consoleWrite(textToWrite, WithColor, writeToFile, this.sessionName);
  }

  log(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.INFO, pr, this.#who, this.sessionName);
  }

  info(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.INFO, pr, this.#who, this.sessionName);
  }

  warn(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.WARNING, pr, this.#who, this.sessionName);   
  }

  error(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.ERROR, pr, this.#who, this.sessionName);   
  }

  init(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.INIT, pr, this.#who, this.sessionName);   
  }

  success(...data: any[]){
    let pr = this.useConsoleFormatting(...data);

    log(LogType.SUCCESS, pr, this.#who, this.sessionName);   
  }

  /**
   * allows you to write raw logs
   * @param type the type of the log
   * @param message the message
   */
  logThis(type: LogType, message: string){
    log(type, message, this.#who, this.sessionName);   
  }

  /**
   * creates (joins) a new group for that log
   * @param name the group name
   * @returns the new current group string
   */
  group(name: string, info: Omit<logSettings, "error" | "return"> = {}): string{
      return logGroup(name, {terminal: this.sessionName, messageWho: this.#who, ...info});
  }

  /**
   * creates (joins) a new group for that log
   * 
   * NOTE: it behaves in the same way as group(). It's only for compatibility purposes.
   * 
   * @param name the group name
   * @returns the new current group string
   */
  groupCollapsed(name: string, info: Omit<logSettings, "error" | "return"> = {}): string{
      return logGroup(name, {terminal: this.sessionName, messageWho: this.#who, ...info});
  }

  /**
   * leaves the group created with logGroup / group
   * @returns the new current group group string
   */
  groupEnd(info: logSettings & {return: "group"}): string;
  groupEnd(info: logSettings & {return: "logstring"}): string;
  groupEnd(info: logSettings & {return: "both"}): [string, string];
  groupEnd(info: logSettings): string | [string, string]
  {
    return logGroupEnd(
       // @ts-ignore
      {terminal: this.sessionName, messageWho: this.#who, ...info}
    );
  }

  assert(assertion: boolean, ...data: any[]){
    if(!assertion){
      
  
      this.error(...data);
    }

  }

  /**
   * counts the counter
   * @param name the name of the counter. Optional
   * @param increaseBy the increment value. Defaults to 1
   * @param startFrom the starting value of the counter if it doesn't exist. Defaults to 1
   * @returns the current name on the counter.
  */
  count(
    name: string = "DEFAULT", 
    increaseBy: number = 1, 
    startFrom: number = 1, 
  ): number{
    return counterCount(name, this.#who, increaseBy, this.sessionName, startFrom);
  }

  /**
   * removes (resets) the couter
   * @param name the counter name. Optional
   * @returns whether there was a counter with that name
   */
  countReset(name: string = "DEFAULT"){
    return counterCountReset(name, this.sessionName);
  }

  /**
   * @deprecated @todo
   * 
   * It is defacto an alias for log()
   * 
   * it is only for compatibility purposes
   * 
   * 
   * @param data the data to display
   */
  debug(...data: any[]){
    this.log(...data);
  }

  /**
   * prints an object using an inspector. It ignores custom inspectors
   * @param obj object to print
   * @param opj options
   */
  dir(obj: any, opj: InspectOptions){
    const toPr = inspect(obj, {...opj, customInspect: false});

    this.log(toPr);
  }

  /**
   * prints an object using an inspector. It ignores custom inspectors
   * 
   * An alias for: dir()
   * 
   * @param obj object to print
   * @param opj options
   */
  dirxml(obj: any, opj: InspectOptions){
    this.dir(obj, opj);
  }


  /**
   * @todo @
   * 
   * it tries to print the data in a tabular way. In the case of an error it will just log it instead
   * 
   * NOTE: It uses console node js object under the hood, so it may be slow!
   * a new implementation without relaying on node js will be created in the future
   * 
   * @param tabularData data
   * @param properties options
   */
  table(tabularData?: any, properties?: string[] | undefined){
    let toUse: string = "\n";

    const s = new Console(new Writable({
      write(chunk, encoding, callback) {
          toUse += String(chunk);
          callback();
      },
    }));

    s.table(tabularData, properties);

    this.log(toUse);
  }


  /**
   * creates a new timer with specified name
   * @param label the timer name
   * @param info configuration information
   * @returns the start time
   */
  time(
      label: string = "DEFAULT", 
      info: Omit<Omit<logSettings, "error">, "terminal" | "messageWho"> = {}
  ): number{
    return logTimeStart(label, {terminal: this.sessionName, messageWho: this.#who, ...info});
  }

  /**
   * stops a timer with specified name
   * 
   * if info.error set to true, it causes an error if there's no timer with that name, otherwise it just ignores it
   * 
   * @param label the timer name
   * @param info configuration information
   * @returns elapsed time
   */
   timeEnd(
    label: string = "DEFAULT", 
    info: Omit<logSettings, "terminal" | "messageWho"> = {}): number{
    return logTimeEnd(label, {terminal: this.sessionName, messageWho: this.#who, ...info});
  }

  /**
   * returns the current time of the timer
   * @param label the timer name
   * @param info configuration information
   * @returns the current time
   */
  timeLog(label: string = "DEFAULT", info: Omit<logSettings, "terminal" | "messageWho"> = {}): number{
    return logTimeStamp(label, {terminal: this.sessionName, messageWho: this.#who, ...info});
  }

  /**
   * prints stack trace
   * 
   * @param data additional data to print (behaves like log there)
   */
  trace(...data: any){
    const stack = "trace: \n" + new Error().stack?.split("\n").slice(1).join("\n") as string;

    let pr = this.useConsoleFormatting(...data);

    if(pr.length != 0) pr += "\n";

    // this.log(stack, "\n", ...data);

    log(LogType.INFO, stack + "\n\n" + pr, this.#who, this.sessionName);
  }
}

function getNewConsole(){
  return new consoleShortHand("main");
}

export {consoleShortHand, getNewConsole}