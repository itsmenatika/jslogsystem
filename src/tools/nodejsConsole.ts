import { Console } from "node:console";
import { Writable } from "node:stream";
import { getTerminal, getTerminalOPJ, getTerminalOPJTYPE, terminalSession } from "../programdata.js";
import { logSystemError } from "../ultrabasic.js";
import { consoleWrite } from "../out.js";
import { consoleColors } from "../texttools.js";

/**
 * vanilia console wrapper
 * 
 * it prints to a session using consoleWrite
 * 
 * it will print stdout in a normal color
 * and stderr with a red background
 */
class NodeJsWrappedConsole extends Console {
  private $terminalName: string;


  get session(): terminalSession | undefined{
    return getTerminal(this.$terminalName);
  }

  set session(val: getTerminalOPJTYPE){
    const ses = getTerminalOPJ(val);

    if(!ses){
        throw new logSystemError("It was impossible to attach to that session");
    }

    this.$terminalName = ses.sessionName;
  }



  /**
   * creates a new instance of console wrapper of a vanillia node js console
   * 
   * NOTE: it assumes your terminal to attach to is correct!
   * 
   * CHECK IT BEFOREHAND! NOT CHECKING MAY CAUSE UNEXPECTED BEHAVIOUR
   * 
   * @param terminal the terminal to attach to
   */
  constructor(terminal: getTerminalOPJTYPE) {
    // get that session
    const ses = getTerminalOPJ(terminal) as terminalSession;

    // creates a write function
    const standardWriter = (chunk: any, _encoding: BufferEncoding, callback: any, color?: consoleColors) => {
          const session = getTerminal(this.$terminalName);
          if (!session) throw new logSystemError("no terminal attached!");

          // Convert Buffer → string
          const text = Buffer.isBuffer(chunk)
            ? chunk.toString("utf8")
            : String(chunk);

          // Write synchronously to your console system
          consoleWrite(text, color, undefined, "", session);
          callback();
    }

    // create a stream wrappers
    const writable = new Writable({
      write: (chunk, _encoding, callback) => {
        standardWriter(chunk, _encoding, callback);
      },
    });

    const writableEr = new Writable({
      write: (chunk, _encoding, callback) => {
        standardWriter(chunk, _encoding, callback, consoleColors.BgRed);
      },
    });

    super(writable, writableEr);
    this.$terminalName = ses.sessionName;
  }
}

export {NodeJsWrappedConsole}