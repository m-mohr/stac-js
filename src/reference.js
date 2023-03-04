import { toAbsolute } from './http.js';
import STACObject from './object.js';

/**
 * A STAC reference as base for Assets and Links.
 * 
 * Don't instantiate this class!
 * 
 * @interface
 * @property {string} href
 * @property {?string} type
 * 
 * @param {Object} data The STAC API Collection object
 * @param {STAC|null} context The object that contains the link
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
class STACReference extends STACObject {

  constructor(data, context = null, keyMap = {}, privateKeys = []) {
    super(data, keyMap, ['_context'].concat(privateKeys));
    if (!this._context) {
      this._context = context;
    }
  }

  /**
   * Gets the URL of the reference as absolute URL.
   * 
   * @param {boolean} stringify 
   * @returns {string|null}
   */
  getAbsoluteUrl(stringify = true) {
    if (this._context) {
      return toAbsolute(this.href, this._context.getAbsoluteUrl(), stringify);
    }
    else if (this.href.includes('://')) {
      return this.href;
    }
    return null;
  }

  /**
   * Returns the STAC entity that contains the reference.
   * 
   * @returns {STAC|null}
   */
  getContext() {
    return this._context;
  }
  
}

export default STACReference;
