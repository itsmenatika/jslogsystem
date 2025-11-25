# jslogsystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white)](#)
[![Linux](https://img.shields.io/badge/Linux-FCC624?logo=linux&logoColor=black)](#)
[![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff)](#)
[![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=fff)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)


> [!NOTE]
> For migrating from 1.2.7 check THERE

**What is it?**

jslogsystem is quick plug-in javascript (also supports typescript and it is written in typescript) module that handles logging and CLI for you

Most notable features are:
* logging (since 1.0)
* terminal sessions (since 1.3)
* pipes (since 1.2)
* user binds (since 1.14)
* built-in commands and possibility of adding your own commands (since 1.0)

## how to use

You have to create a terminal session<sup>[1]</sup> using one of available functions, for example: **quickSetup()**. That function creates 'main' terminal that will be used as an entry point.

example code:
```js
import { quickSetup } from "jslogsystem";

quickSetup();

```

and that's it, that is the simplest way to start up.


You can now type your commands and click enter to send them
also:
* CTRL + C will exit the logsystem
* CTRL + X will print the special character
* CTRL + B will go to the left on the session list
* CTRL + N will go to the right on the session list
* CTRL + M will send the command without enter

write 'help' for the list of currently available commands!
by the default, you have an access to all of them!