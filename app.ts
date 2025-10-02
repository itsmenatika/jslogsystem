/**

MIN version wasn't orginally SHIPPED WITH 1.16!

**/

import { keepProcessAlive, newConsole } from "./logSystem";



newConsole.log("hello!");


// (async () => {
//     while(true){
//         newConsole.log("test");
//         await new Promise((res) => setTimeout(res, 200));
//     }
// })();

newConsole.commands.registerCommand("test", {

    callback: async (args: string[]) => {
        await new Promise((res) => setTimeout(res, 600));
        newConsole.log("test");

        return true;
    },
    async: true
});

newConsole.commandInterface.registerCommand("secondtest", {
    isAlias: true,
    aliasName: "test",
    hidden: false
});

keepProcessAlive();