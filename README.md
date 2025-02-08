# jslogsystem - Easy javascript logging system for node programs

## What is it?

The purpose of that thing is to allow easy logging from applications while still allowing the use of the console


![the image that shows how does it look](https://github.com/itsmenatika/jslogsystem/blob/main/docs/run.png?raw=true)

the logging system allows you to add your own commands via simple API


## how to use

you can use it either with or without typescript. The choice is yours, but i would recommed using typescript, or even as imported thing.
I will also assume that you have git installed, because you're on their website.

### typescript (standalone)

with typescript you need to run following commands to install (it will compile program again): 
```
cmd
git clone https://github.com/itsmenatika/jslogsystem.git
cd jslogsystem
npm install
tsc
node logSystem.js
```

you can later run it while being in the correct directory by using: ```node logSystem.js```

### without typescript (standalone)

it will only install that repository without compiling (the repository already has it up to date): 
```
cmd
git clone https://github.com/itsmenatika/jslogsystem.git
cd jslogsystem
npm install
node logSystem.js
```
you can later run it while being in the correct directory by using: ```node logSystem.js```

### as files

1. first either clone it (by using ```git clone https://github.com/itsmenatika/jslogsystem.git```) or download it via this website.
2. move logSystem.js (and logSystem.ts if you're using typescript) into your own project
3. import it via ES Modules (```import "logSystem"``` or something. It depends where you've moved the files) or via NODE require (not recommended)
4. change config if you need to
5. import things that you actually need (if you want)
6. compile or run your program as usual

### via npm

IT WILL BE POSSIBLE IN THE FUTURE



## CONFIG

you can configure that thing in the top of file:
![the image that shows config](https://github.com/itsmenatika/jslogsystem/blob/main/docs/config.png?raw=true)

I don't know what to say more
