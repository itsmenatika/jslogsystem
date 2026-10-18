function ensureArray(data: unknown): Array<any>{
    if(Array.isArray(data)) return data;
    else return [data];
}


export {ensureArray}