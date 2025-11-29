
import { onlyIfRedirected, onlyToRedirect } from "../apis/commands/commandSpecialTypes.js";
import { askForLegacy } from "../apis/meta/legacyApi.js";
import { consoleColors } from "../texttools.js";
import { quickCmdWithAliases } from "../tools/commandCreatorTools.js";
import { multiDisplayer } from "../tools/multiDisplayer.js";

const commandTable = quickCmdWithAliases("meow", {
        usageinfo: "meow <?>",
        desc: "meows",
        longdesc: `it really just meows~~`,
        hidden: false,
        changeable: false,
        isAlias: false,
        callback(args: string[]): onlyIfRedirected{
            let g = new multiDisplayer();

            g.push("  /\\_/\\  (\n");
            g.push(" ( ^.^ ) _)\n");
            g.push("   \\\"/  (        ");
            g.push("MEOW!\n", consoleColors.Blink);
            g.push(" ( | | )\n");
            g.push("(__d b__)\n");

            if(args.includes("-§") || !askForLegacy(this).pipes){
                g.useConsoleWrite(undefined, false, this.sessionName);
            }

            return onlyToRedirect(g.toRawString());

            // }
        }               
}, ["miau", "mrau", "meow~", ":3"]);

export {commandTable};