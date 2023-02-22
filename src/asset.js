import { browserProtocols } from "./http";
import { cogMediaTypes, geotiffMediaTypes, isMediaType } from "./mediatypes";
import { hasText, isObject, mergeArraysOfObjects } from "./utils";

/**
 * A STAC Asset or Item Asset Definition.
 * 
 * You can access all properties of the given STAC Asset object directly, e.g. `asset.href`.
 * 
 * @class
 * @param {Object} data The STAC Asset object
 * @param {string} key The asset key
 * @param {Collection|Item|null} parent The parent object of the asset
 */
class Asset {

  constructor(data, key, parent = null) {
    if (data instanceof Asset) {
      this._parent = data._parent;
      this._key = data._key;
      data = data.toJSON();
    }
    else {
      this._parent = parent;
      this._key = key;
    }

    if (!isObject(data)) {
      throw new Error("Asset is not an object");
    }
    if (typeof this._key !== 'string') {
      throw new Error("No valid key specified");
    }

    for (let key in data) {
      if (typeof this[key] === 'undefined') {
        this[key] = data[key];
      }
    }
  }

  /**
   * Gets the URL of the asset as absolute URL.
   * 
   * @param {boolean} stringify 
   * @returns {string|null}
   */
  getAbsoluteUrl(stringify = true) {
    if (!this.isDefintion() && this._parent) {
      return this._parent.toAbsolute(this, stringify).href;
    }
    else if (!this.isDefintion() && this.href.includes('://')) {
      return this.href;
    }
    return null;
  }

  /**
   * Returns the key of the asset.
   * 
   * @returns {string} Key of the asset
   */
  getKey() {
    return this._key;
  }

  /**
   * Returns the parent STAC entity for the asset.
   * 
   * @returns {Collection|Item|null}
   */
  getParent() {
    return this._parent;
  }

  /**
   * Returns the metadata for the given field name.
   * 
   * Returns the metadata from the asset, if present.
   * Otherwise, returns the metadata from calling `getMetadata()` for the parent.
   * 
   * @param {string} field Field name
   * @returns {*} The value of the field
   */
  getMetadata(field) {
    if (typeof this[field] !== 'undefined') {
      return this[field];
    }
    if (this._parent) {
      return this._parent.getMetadata(field);
    }
    return undefined;
  }

  /**
   * Returns the bands for the asset.
   * 
   * This is usually a merge of eo:bands and raster:bands.
   * 
   * @returns {Array.<Object>}
   */
  getBands() {
    return mergeArraysOfObjects(this['eo:bands'], this['raster:bands']);
  }

  /**
   * A band with the corresponding index.
   * 
  * @typedef {Object} BandWithIndex
  * @property {integer} index The index in the bands array.
  * @property {Object} band The band object
  */

  /**
   * The RGB bands.
   * 
  * @typedef {Object} VisualBands
  * @property {BandWithIndex} red The URI
  * @property {BandWithIndex} green The relation type of the link
  * @property {BandWithIndex} blue Mediy type of the link
  */

  /**
   * Find the RGB bands.
   * 
   * @returns {VisualBands|null} Object with the RGB bands or null
   */
  findVisualBands() {
    let rgb = {
      red: false,
      green: false,
      blue: false
    };
    let bands = this.getBands();
    for(let index in bands) {
      index = parseInt(index, 10); // findIndex returns number, for loop uses strings?!
      let band = bands[index];
      if (isObject(band) && hasText(band.common_name) && band.common_name in rgb) {
        rgb[band.common_name] = { index, band };
      }
    }
    let complete = Object.values(rgb).every(o => Boolean(o));
    return complete ? rgb : null;
  }

  /**
   * Returns whether this asset is an Item Asset definition (i.e. doesn't have an href) or not.
   * 
   * @returns {boolean} `true` is this asset is an Item Asset definition, `false` otherwise.
   */
  isDefintion() { // 
    return !hasText(this.href);
  }

  /**
   * Checks whether this asset is of a specific type.
   * 
   * @param {string|Array.<string>} types One or more media types.
   * @returns {boolean} `true` is this asset is one of the given types, `false` otherwise.
   */
  isType(types) { // string or array of strings
    return hasText(this.type) && isMediaType(this.type, types);
  }

  /**
   * Checks whether this asset is a GeoTiff (including COGs).
   * 
   * @returns {boolean} `true` is this asset is a GeoTiff, `false` otherwise.
   */
  isGeoTIFF() {
    return this.isType(geotiffMediaTypes);
  }

  /**
   * Checks whether this asset is a COG (excluding pure GeoTiffs).
   * 
   * @returns {boolean} `true` is this asset is a COG, `false` otherwise.
   */
  isCOG() {
    return this.isType(cogMediaTypes);
  }

  /**
   * Checks whether the asset is accessible via HTTP or HTTPS.
   * 
   * Returns `null` for item asset definitions, otherwise a `boolean` value.
   * 
   * @returns {boolean|null} `true` is this asset is available via HTTP or HTTPS, `false` or `null` otherwise.
   */
  isHTTP() {
    if (this.isDefintion()) {
      return null;
    }
    let uri = this.getAbsoluteUrl(false);
    let protocol = uri.protocol().toLowerCase();
    return hasText(protocol) && browserProtocols.includes(protocol);
  }

  /**
   * Checks whether this asset as a specific role assigned.
   * 
   * @param {string|Array.<string>} roles One or more roles.
   * @returns {boolean} `true` is this asset is one of the given roles, `false` otherwise.
   */
  hasRole(roles) { // string or array of strings
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return Array.isArray(this.roles) && Boolean(this.roles.find(role => roles.includes(role)));
  }

  /**
   * Returns a plain object for JSON export.
   * 
   * @returns {Object} Plain object
   */
  toJSON() {
    let obj = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' || key === '_parent' || key === '_key') {
        return;
      }
      obj[key] = this[key];
    });
    return obj;
  }

}

export default Asset;
