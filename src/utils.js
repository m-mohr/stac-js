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
 * @param  {...Array.<Object>} bands 
 * @returns {Array.<Object>}
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

/**
 * Get minimum values for the STAC data types.
 * 
 * Currently only supports int types.
 * 
 * @private
 * @todo Add float support
 * @param {string} str Data type
 * @returns {number|null} Minimum value
 */
export function getMinForDataType(str) {
  switch(str) {
    case "int8":
      return -128;
    case "int16":
      return -32768;
    case "int32":
      return -2147483648;
  }
  if (str.startsWith("u")) {
    return 0;
  }
  return null;
}

/**
 * Get maximum values for the STAC data types.
 * 
 * Currently only supports int types.
 * 
 * @private
 * @todo Add float support
 * @param {string} str Data type
 * @returns {number|null} Maximum value
 */
export function getMaxForDataType(str) {
  switch(str) {
    case "int8":
      return 127;
    case "uint8":
      return 255;
    case "int16":
      return 32767;
    case "uint16":
      return 65535;
    case "int32":
      return 2147483647;
    case "uint32":
      return 4294967295;
  }
  return null;
}
