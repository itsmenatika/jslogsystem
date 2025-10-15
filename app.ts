import { commandDividerInternal, consoleUltraRawWrite, consoleWrite, generateAnsiColor, getLegacyInformation, keepProcessAlive, LogType, newConsole, pipeDividerInternal, registerCommand, replaceConsole, setLegacyInformation, smartArgs, useWith } from "./logSystem";


replaceConsole();

// setLegacyInformation("pipes", false);

registerCommand("test", {callback: (preargs: any[]) => {
    // consoleWrite("meow!", generateAnsiColor(20, 20, 20))
    newConsole.log(generateAnsiColor(100, 52, 100) + "meow!");

    return;
}});

// console.log(commandDividerInternal("aha<test.txt|meow>sraka.txt"));

// it will keep the process alive even though there's no error for it to be kept alive
keepProcessAlive();