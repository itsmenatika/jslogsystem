# changelog

## 1.3X

### 1.3.3

added new styles:
  * classic
commands changed:
  * version command now has a branch, edition and isExperimental shown up
  * help now has --regex option
added:
  * new command return type expectedError
  * new entries for styles
  * config, colors and styles were added to this in commands
  * terminalApi has now styles and colors getters
  * verApi has now a branch, edition and isExperimental
  * filter in command Collection
  * cleanReturner -> allows to simply return the array if needed
fixed:
  * multiline commands are now properly supported as new typing system was introduced
  * wrongly written inputbox in logs
added commands:
  * base64 - decodes and encodes base64 data
  * color -> colorizes data

There's now a suggestion about commands that were not found

new depedencies:
    "chalk": "^5.6.2",
    "string-width": "^8.1.0",
    "strip-ansi": "^7.1.2"

compatibility:
* cursor is now hidden by a default
* strikeThrough was renamed to StrikeThrough due to the lack of consistency in that manner

### 1.3.2

added:
* more styling options
* in-built styles:
  * clean
  * minecraft
  * clean_signs
* "default" styles was offically changed to a style
* added NoColor
* commands:
  * sleep -> sleeps for a duration of time

changes:
  * terminal -> added styleName/sn option to print a style self-identificator
  * it's now impossible to write a new input during an async execution

bugfixes:
* addGlobalAs and useAddGlobalAs now work properly
* OnlyToRedirect now properly handles pipes. It used to not change the result at all and preserve it from the previous command.

### 1.3.1

bugfixes:
* terminal uptime now works properly

added:
* command categories
* help command now shows the amount of command found

changed:
* some inworkings of commands

removed:
* session.currentUptime. Use import instead

### 1.3

The whole system was rebuilt from the ground up

changes:
* commands were added:
  * parameter -> to isolate parameters
  * terminal -> for managing terminals
  * reverse -> reversing the flow of the arguments
  * objecttoarray -> converting an object to an array of objects
  * getonlinedataservice -> allows fetching data from the web
  * json -> allows converting from and to json strings
  * internal -> internal command that is not included by default
  * powershell -> allows you to execute powershell commands
  * timer -> allows you to manage session timers
  * environment -> allows you manage session environment variables
  * spacetoarguments -> allows you to create an array of arguments from string
* commands were reintroduced:
  * info -> it has been mistakely removed from the preview versions
* commands were rewritten:
  * bind -> it is not is solely based on the new pipe system
  * echo -> it supports a lot of new parameters and the whole color system
  * uptime -> it was just mostly rewritten, no that much of changes
  * inspect -> it was completely rewritten and it is not not deprecated, because of this
* commands changes:
  * hide -> it now supports a custom hide message
  * eval -> it now uses silent tasks without logging
  * cmd -> it now uses silent tasks without logging. $imp and $args were introduced. Imp stores all imported arguments from other commands and args is the list of all arguments
  * string -> it now accepts more types
  * logs -> it can now read gzipped files
* '--' argument can now be used for indicating that the next stuff are not dashed parameters
* quotas can now be used to pass arguments with space as one
* terminal sessions were added
* added terminalApi
* added bindApi
* added legacyApi
* added terminalMiddleApi
* added quickSetup
* added more options to config (it was practically rewritten)
* showCursor, hideCursor and printViewTextbox and replaceConsole have been deprecated
* It's now impossible to force the old style of registering commands
* command collections were added
* command groups were introduced:
  * all
  * othershells
  * pipeGroup
  * processCommands
  * streams
  * thatShell
  * webGroup
* command creator tools were added: quickCmdWithAliases cmdTableToCommandCompounts, commandCompoundsToCmdTable
* useWith has now options
* nodeJsConsole was added (it uses orginal node.js front-end of console and sends output to the jslogsystem)
* newConsole structure was changed into consoleShortHand which has 100% compatibility with node.js console (instead of maybe 85%?)
* some changes in the position of arguments (I don't rembember which ones exactly)
* consoleUltraRawWrite was added
* legacy system was rewritten
* it is now possible to run jslogsystem standalone without importing it
* async commands now work properly instead of just returning true
* -§ is now sent instead of -§ to the last command
* command context was added (as this)
* command binds can now take parameters properly
* a lot of bugs with binds was fixed
* logs are now compressed by default
* added templates and colors that you can change via config
* added environment (session specific) apis

bugfixes:
* returned null now doesn't crash a program
* nonexisting file while reading from one now doesn't cause a crash

compatibility:
* some commands may suffer from change in the position of arguments, but it's very rare and for rarely used parameters
* showCursor, hideCursor and printViewTextbox has been deprecated
* consoleShortHand is 100% compatible with node.js console
* nodeJsConsole is a easy tool to replace node.js console using the orginal node.js console class
* timers now use "DEFAULT" if label is not specified
* -§ is now sent instead of -§ to the last command


## 1.2X

### 1.2.7

changes:
* config has been moved to a new file
* 'bind' finally works without any issues
* removeInternalArgs has been fixed

### 1.2.6

BUGFIX:
* 'bind' command now works correctly

### 1.2.1 - 1.2.5

versions 1.2.1 - 1.2.5 were used as testing ground for NPM Packages

Also LICENSE was changed to modified MIT LICENSE

### 1.2

**changes:**
* the logsystem now uses ESM modules instead of commonJS node modules
* it's now possible to change the starting working directory
* it's now possible to replace long welcome screen with one quick log via changing quickHello to true
* CTRL C and SIGNINT are now handled the same way. SIGINT was ignored before
* commands can now return almost anything, not only boolean. The result is displayed. If returned result is undefined, it won't be.
* added pipe system inspired by linux. It supports: "|", "||", "&&", "<", ">", ">>", ";". It makes chaining commands possible.
 * \ can be used to not use those characters as special characters. For example: "\|"
 * the last command in the chain will receive "-t" argument showing that it's the last in the chain. It can be used to color the output.
 * you can disable -t by legacy settings
 * you can disable pipes by legacy settings (-t will still be sent)
* new command aliases:
 * exit -> stop, halt
 * directory -> cd, pwd
 * arguments -> args
 * argumentslength -> argslen, arglen
 * string -> str
 * number -> num
 * eval -> js, javascript
 * version -> v (v can be changed into another command though!)
 * cmd -> execute
* those commands got rewritten:
  * exit
  * inspect
  * eval
  * version
  * cmd
  * uptime
* added aliasCache
* help now also shows aliases (even hidden ones) when asked about particular command
* added onlyToRedirect(VAL) which will cause to not output anything if it's not the last in the chain (doesn't relay on -t argument)
 * for example: clear() uses now it and will output true if used in chain and it's not the last one
* added smartArgs() for easier argument detection
* all commands are now handling -t properly
* added new commands:
 * directory -> changes directory if argument is provided and outputs the current directory
 * logs -> a tool to manage logs (listing, deleting them or viewing them)
 * arguments -> lists all provided arguments, including -t and the command name
 * argumentslength -> outputs the number of arguments provided, including -t and the command name
 * string -> forced the input to be changed into a string and outputs it
 * number -> forces the input to be changed into a number and outputs it
 * true -> outputs true, no matter what
 * false -> outputs false, no matter what
 * nil -> eats entire input, and outputs nothing
* the usage of 'inspect' command now is less important and may be removed in the future (in the long future)
* eval now exposes $newConsole variable that is a reference to newConsole interface
* added multiline constructor that allows for easily creating multiline command descriptions
* bind command seperation by ';' got removed. it is now handled completely by pipe system (the legacy system can't restore it!)
* new legacy modes and better legacy typing
* legacy modes can now show warnings
* added pipeHalt() {STOP PIPE} explicitUndefined() {PRINT UNDEFINED} onlyToRedirect() {ONLY IF PIPED} to manage pipe system via command callback (returning them does the job.
* added consoleUltraWrite api
* added createAnsiColor which allows to create color by their RGB value
* added end argument to consoleWrite
* added silent mode to useWith
* added toRawString() on multiDisplayer

bugfixes:
 * cmd now properly uses utf8 and works on linux
 * 'upt' alias now properly points to 'uptime' command instead to 'clear' command
 * random color characters in log files

 known issues:
  * stack overflow on binding bind to bind

 compatibility:
  * change module type to ESM from commonjs
 

## 1.1X



### 1.171

**changes:**
* keepProcessAlive() now accepts the time for the fake task. It defaults to 20ms

### 1.17

**changes:**

* Changes in internal command handling
* Results from eval are now inspected using node.js utils
* new command: inspect (alias: insp) to manually trigger a JSON struct inspection
* you can now get a template from a set bind using `bind bindexecutorname`
* added commandInterface.exec("commandString") that allows to execute commands manually from the code

**COMPATIBILITY:**

*FULL COMPATIBILITY WITH PREVIOUS VERSION*

### 1.16

changes:

* fixed a bug that allowed you to check the command history for undefined if there was no occurances of anything
* aliases now can be properly displayed on help command
* ech no longer points improperly to "clear"
* there's now displayed a welcome message at the start
* types are better verified during command registering (typescript wise)

### 1.15

release date: 12.09.2025

The timers and groups UPDATE

changes:

* removed no longer used comments
* added "autoadd to globalThis" configurations options that can be used instead of replaceConsole:
  * useAddToGlobalAs
  * addToGlobalAs
* added time() (also as logTimeStart), timeEnd() (also as logTimeEnd), timeStamp() (also as logTimeStamp)
* added group() (also as logGroup), groupEnd() (also as logGroupEnd()
* added configuration options for groups:
  * lastLogGroupText
  * singleLogGroupText

### 1.14

The legacy and binding update.

changes:

* new commands:
  * bind -> it allows you to bind command to execute command(-s). Alias is b
  * write -> it's the copy of previous "echo". Alias is wtr
* new functions:
  * getLegacyInformation -> gets information about compability settings
  * setLegacyInformation -> allows you to manually set compatibility settings
  * validateLegacyProperty -> it's more internal, but it also exported to help moders. It validates whether setLegacy will produce error if given that value
  * registerCommandShort -> allows you to register a command using commandCompound (shorthand for commandRegister)
  * multiCommandRegister -> allows you to register a list of commands using an array of commandCompounds (shorthand for commandRegister)
* command changes:
  * hide -> it now has an argument "-h" that hides the message that is displayed
  * echo -> it now supports \n
* removed unncessary comments that wasted 2kbs of space
* handling commands is now possible in silent mode (though it's mostly internal)

bugfixes:
* echo -> it now displays the correct description instead of the wrong one

### 1.13

* bugfix: you can now write "/" in console

compatibility: full compatibility

download: [TS](old/1.13/logSystem.ts) [JS](old/1.13/logSystem.js)

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

## 1.0

The first public release
download: [TS](old/1.0/logSystem.ts) [JS](old/1.0/logSystem.js)
