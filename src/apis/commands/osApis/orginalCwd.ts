

let runFromVar: string = process.cwd();

function runFrom(to?: string): string{
    if(to !== undefined){
        runFromVar = to;
    }

    return runFromVar;
}
export {runFrom, runFromVar}