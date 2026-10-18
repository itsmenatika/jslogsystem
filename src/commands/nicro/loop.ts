import { hideCursorCODE } from "../../texttools.js";
import { cursorBlink, intialDraw, standardRender } from "./render.js";
import { fullNicroData } from "./types.js";

async function loop(data: fullNicroData){
    if(data.instantClose){
        return;
    }

    if(data.maxtime){
        (
            async () => {
                await data.fulcon.wait(data.maxtimenum);
                data.fulcon.end();
            }
        )();
    }

    await data.fulcon.codeAsyncAlt(async () => {

        // set cursor
        if(data.fulcon.session.out.isTty){
            data.fulcon.session.out.write(hideCursorCODE);
        }


        intialDraw(data);
        standardRender(data);
        cursorBlink(data);
        await data.fulcon.dontClose();
    });

    if(data.forcereturnthing !== undefined){
        return data.forcereturnthing;
    }
}



export {loop}