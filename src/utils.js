/**
 * Checks whether a variable is a string and contains at least one character.
 * 
 * @param {*} string - A variable to check.
 * @returns {boolean} - `true` is the given variable is an string with length > 0, `false` otherwise.
 */
export function hasText(string) {
  return (typeof string === 'string' && string.length > 0);
}

/**
 * Checks whether a variable is a real object or not.
 * 
 * This is a more strict version of `typeof x === 'object'` as this example would also succeeds for arrays and `null`.
 * This function only returns `true` for real objects and not for arrays, `null` or any other data types.
 * 
 * @param {*} obj - A variable to check.
 * @returns {boolean} - `true` is the given variable is an object, `false` otherwise.
 */
export function isObject(obj) {
  return (typeof obj === 'object' && obj === Object(obj) && !Array.isArray(obj));
}

/**
 * Merges any number of arrays of objects.
 * 
 * @param  {...Array.<object>} bands 
 * @returns {Array.<object>}
 */
export function mergeArraysOfObjects(...bands) {
  bands = bands.filter(arr => Array.isArray(arr));
  if (bands.length > 1) {
    let length = Math.max(...bands.map(arr => arr.length));
    let merged = [];
    for(let i = 0; i < length; i++) {
      merged.push(Object.assign({}, ...bands.map(band => band[i])));
    }
    return merged;
  }
  else if (bands.length === 1) {
    return bands[0];
  }
  return [];
}
