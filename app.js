"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logSystem_1 = require("./logSystem");
logSystem_1.newConsole.log("hello!");
// (async () => {
//     while(true){
//         newConsole.log("test");
//         await new Promise((res) => setTimeout(res, 200));
//     }
// })();
logSystem_1.newConsole.commands.registerCommand("test", {
    callback: async (args) => {
        await new Promise((res) => setTimeout(res, 600));
        logSystem_1.newConsole.log("test");
        return true;
    },
    async: true
});
logSystem_1.newConsole.commandInterface.registerCommand("testdrugi", {
    isAlias: true,
    aliasName: "test",
    hidden: false
});
(0, logSystem_1.keepProcessAlive)();
