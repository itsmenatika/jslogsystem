/**
 * allows you to quickly return the array in organized style
 * @param data array
 * @returns undefined if length is 0, the first element if length 1 and the data if the length is above
 */
function cleanReturner<T>(data: T[]): undefined | T | T[]{

    if(data.length === 0) return undefined;
    else if(data.length === 1) return data[0];
    else return data;
}

export {cleanReturner}