
/**
 * checks if number is numeric
 * 
 * author: 
 * https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
 * Jeremy
 * 
 * @param num to check
 * @returns true or false
 */
const isNumeric = (num: any) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num as number);

export {isNumeric}