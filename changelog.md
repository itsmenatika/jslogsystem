# changelog

## 1.X

### 1.12

it's overall very small update

changes:
* more comments
* added registerCommandLegacy() for legacy reasons and registerCommandLegacyForceUse() to force using it, even tho it technically shouldn't (THIS IS ONLY FOR LEGACY REASONS)
	* NOTE: editing commands is disabled with commands legacy
* added combineColors() to combine colors. It is to increase the compatibility in the future. We recommend using it
* commands can finally be edited properly and attribute "changeable" is not ignored anymore
* some small changes not worth mentioning

compatibility: it actually increased

download: [TS](old/1.12/logSystem.ts) [JS](old/1.12/logSystem.js)

### 1.11

just small changes :3

changes:
* command "info" now works (i forgot to add it to a new system)
* info has been rebuilded and it now uses colors and says information about logical processors
* added aliases for "info" -> sysinf, sysinfo, inf
* added getCurrentVersionOfLogSystem()

download: [TS](old/1.11/logSystem.ts) [JS](old/1.11/logSystem.js)

### 1.1

changes:
* more colors
* new register system (it now uses object, instead of a lot of arguments)
* added new command parameters:
	- changeable -> if the command can be later edited (all built-in commands has that set to false)
	- hidden -> if the command should be shown on the command list
	- isAlias -> if the command is alias (isAlias will make the command register ignore all parameters except for: changeable, hidden and aliasName)
	- aliasName -> the orginal command name
* built in commands are now also registered, not in switch
* certain parts got rewritten completely
* added commands:
	- meow -> meows
	- eval (alias: e) -> allows you to execute a javascript code in the global scope
	- cmd (alias: sys) -> allows you to execute a systme code
	- echo (alias: ech) -> allows you to print characters
	- uptime (alias: up) -> allows you to see the current uptime
	- version (alias: ver) -> shows the current version
* added aliases (that were not specified before):
	* crash -> exit
	* cls -> clear (it worked before but it was hardcoded)
	* ? -> help (it worked before but it was hardcoded)
	* miau -> meow
	* miau~ -> meow
	* meow~ -> meow
* help can now display information about a command using "help <command Name>". The long description is finally used here
* added an new alias system
* added automatic crash reports (unexpected error handling)
* commands are now sandboxed
* added consoleWriteMulti() that allows you to print more stuff with colors more easily.
* added multiDisplayer class that allows you to use consoleWriteMulti like an array that allows you to easily write everything at once
* added command history that saves up to 50 commands written. You can browse it using up and down keys
* you can now move cursor left or right using arrows to write something in the middle of the current command
* almost all of commands got rewritten to include colors
* the bug with including colors in log files is now fixed
* you can now combine colors in consoleWrite() (background + foreground)
* added a lot of defaults to command register. So it's no longer required to specify all arguments to make it work properly
* added colorTable that stores the style of "console". It's not designed to be customized though.
* added useWith that is to "sandbox tasks" with easy logging
* added log node system that allows you to easily show the log source via class inheritance (class is named logNode)
* added actualCrash() that not only logs it but actually does it
* added the configurable version info that can be set by the developer
* added hide and show cursor functions
* added replaceConsole() function that replace the vannilia console api with the new one that sides in the object newConsole
* added keepProcessAlive() that creates a fake async task that forces the log system to be kept alive, even if the process does nothing (it's only for the testing purposes)


compatibility:
the whole thing is mostly compatible with the previous version. The only exception being registering the commands. You have to change it there!

TODO:
* optimizations
* more code comments and code

a lot of interesting improvements

download: [TS](old/1.1/logSystem.ts) [JS](old/1.1/logSystem.js)

### 1.0 

The first public release
download: [TS](old/1.0/logSystem.ts) [JS](old/1.0/logSystem.js)
