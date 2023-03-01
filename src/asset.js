import { browserProtocols } from "./http.js";
import { canBrowserDisplayImage, cogMediaTypes, geotiffMediaTypes, isMediaType } from "./mediatypes.js";
import { getMaxForDataType, getMinForDataType, hasText, isObject, mergeArraysOfObjects } from "./utils.js";

/**
 * A STAC Asset or Item Asset Definition.
 * 
 * You can access all properties of the given STAC Asset object directly, e.g. `asset.href`.
 * 
 * @class
 * @param {Object} data The STAC Asset object
 * @param {string} key The asset key
 * @param {Collection|Item|null} context The object that contains the asset
 */
class Asset {

  constructor(data, key = null, context = null) {
    if (data instanceof Asset) {
      this._context = data._context;
      this._key = data._key;
      data = data.toJSON();
    }
    else {
      this._context = context;
      this._key = key;
    }

    if (!isObject(data)) {
      throw new Error("Asset is not an object");
    }

    for (let key in data) {
      if (typeof this[key] === 'undefined') {
        this[key] = data[key];
      }
    }
  }

  /**
   * Returns the type of the STAC object.
   * 
   * @returns {string}
   */
  getObjectType() {
    return "Asset";
  }

  /**
   * Gets the URL of the asset as absolute URL.
   * 
   * @param {boolean} stringify 
   * @returns {string|null}
   */
  getAbsoluteUrl(stringify = true) {
    if (!this.isDefintion() && this._context) {
      return this._context.toAbsolute(this, stringify).href;
    }
    else if (!this.isDefintion() && this.href.includes('://')) {
      return this.href;
    }
    return null;
  }

  /**
   * Returns the key of the asset.
   * 
   * @returns {string|null} Key of the asset
   */
  getKey() {
    return this._key;
  }

  /**
   * Returns the STAC entity that contains the asset.
   * 
   * @returns {Collection|Item|null}
   */
  getContext() {
    return this._context;
  }

  /**
   * Returns the metadata for the given field name.
   * 
   * Returns the metadata from the asset, if present.
   * Otherwise, returns the metadata from calling `getMetadata()` on the STAC entity that contains the asset.
   * 
   * @param {string} field Field name
   * @returns {*} The value of the field
   */
  getMetadata(field) {
    if (typeof this[field] !== 'undefined') {
      return this[field];
    }
    if (this._context) {
      return this._context.getMetadata(field);
    }
    return undefined;
  }

  /**
   * Checks whether the asset can be displayed by a browser.
   * 
   * @returns {boolean} `true` if a browser can display the given asset, `false` otherwise.
   * @see {canBrowserDisplayImage}
   */
  canBrowserDisplayImage() {
    return canBrowserDisplayImage(this);
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
  * @property {BandWithIndex} red The red band with its index
  * @property {BandWithIndex} green The green band with its index
  * @property {BandWithIndex} blue The blue band with its index
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
   * Returns the band for the given criteria.
   * 
   * Searches the given `property` (default: `name`) for the given value(s).
   * 
   * @param {*} value A single value to find or a list of values to find one of.
   * @param {string} property The property in the bands to match against.
   * @param {Array.<Object>} bands For performance reasons you can provide a list of merged bands from `getBands()`.
   * @returns {BandWithIndex|null}
   * @see {getBands}
   */
  findBand(value, property = 'name', bands = null) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    if (!isObject(bands)) {
      bands = this.getBands();
    }
    let index = bands.findIndex(band => isObject(band) && value.includes(band[property]));
    if (index >= 0) {
      return { index, band: bands[index] };
    }
    return null;
  }

  /**
   * Returns the band for the given band index.
   * 
   * Passes through the (band) objects.
   * 
   * @param {integer|Object} band
   * @returns {Object|null}
   * @see {getBands}
   */
  getBand(band) {
    if (isObject(band) || band === null) {
      return band;
    }
    let bands = this.getBands();
    return bands[band] || null;
  }

  /**
   * Gets the reported minimum and maximum values for an asset (or band).
   * 
   * Searches through different extension fields in raster, claasification, and file.
   * 
   * @param {Object|integer} band
   * @returns {Statistics}
   */
  getMinMaxValues(band = null) {
    band = this.getBand(band);

    /**
     * Statistics
     * 
     * @typedef {Object} Statistics
     * @property {number|null} minimum Minimum value
     * @property {number|null} maximum Maximum value
     */
    const stats = {
      minimum: null,
      maximum: null
    };

    // Checks whether the stats object is completely filled
    const isComplete = obj => obj.minimum !== null && obj.maximum !== null;

    // data sources: raster (statistics, histogram, data_type), classification, file (values, data_type)
    if (band) {
      if (isObject(band.statistics)) {
        if (typeof band.statistics.minimum === 'number') {
          stats.minimum = band.statistics.minimum;
        }
        if (typeof band.statistics.maximum === 'number') {
          stats.maximum = band.statistics.maximum;
        }
        if (isComplete(stats)) {
          return stats;
        }
      }

      if (isObject(band.histogram)) {
        if (typeof band.histogram.min === 'number') {
          stats.minimum = band.histogram.min;
        }
        if (typeof band.histogram.max === 'number') {
          stats.maximum = band.histogram.max;
        }
        if (isComplete(stats)) {
          return stats;
        }
      }
    }

    let classification = this.getMetadata("classification:classes");
    if (Array.isArray(classification)) {
      classification.reduce((obj, cls) => {
        obj.minimum = Math.min(obj.minimum, cls.value);
        obj.maximum = Math.max(obj.maximum, cls.value);
        return obj;
      }, stats);
      if (isComplete(stats)) {
        return stats;
      }
    }

    let values = this.getMetadata("file:values");
    if (Array.isArray(values)) {
      values.reduce((obj, map) => {
        obj.minimum = Math.min(obj.minimum, ...map.values);
        obj.maximum = Math.max(obj.maximum, ...map.values);
        return obj;
      }, stats);
      if (isComplete(stats)) {
        return stats;
      }
    }

    let data_type = (isObject(band) && band.data_type) || this.getMetadata("file:data_type");
    if (data_type) {
      stats.minimum = getMinForDataType(data_type);
      stats.maximum = getMaxForDataType(data_type);
    }

    return stats;
  }

  /**
   * Gets the reported no-data values for an asset (or band).
   * 
   * Searches through different extension fields in raster, claasification, and file.
   * 
   * @param {Object|integer} band 
   * @returns {Array.<*>}
   */
  getNoDataValues(band = null) {
    band = this.getBand(band);
    // data sources: raster (nodata), classification (nodata flag), file (nodata)
    let nodata = [];
    if (band && typeof band.nodata !== 'undefined') {
      nodata.push(band.nodata);
    }
    else {
      let file = this.getMetadata("file:nodata");
      if (typeof file !== 'undefined') {
        nodata = file;
      }
      else {
        let classification = this.getMetadata("classification:classes");
        if (Array.isArray(classification)) {
          nodata = classification
            .filter(cls => Boolean(cls.nodata))
            .map(cls => cls.value);
        }
      }
    }

    return nodata.map(value => {
      if (value === "nan") {
        return NaN;
      }
      else if (value === "+inf") {
        return +Infinity;
      }
      else if (value === "-inf") {
        return -Infinity;
      }
      else {
        return value;
      }
    });
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
   * @param {boolean} includeKey Also returns `true` if the asset key equals to one of the given roles.
   * @returns {boolean} `true` is this asset is one of the given roles (or key), `false` otherwise.
   */
  hasRole(roles, includeKey = false) { // string or array of strings
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    if (includeKey && roles.includes(this.getKey())) {
      return true;
    }
    return Array.isArray(this.roles) && (Boolean(this.roles.find(role => roles.includes(role))));
  }

  /**
   * Returns a plain object for JSON export.
   * 
   * @returns {Object} Plain object
   */
  toJSON() {
    let obj = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' || key === '_context' || key === '_key') {
        return;
      }
      obj[key] = this[key];
    });
    return obj;
  }

  /**
   * Converts an object of STAC Assets into an object of stac-js Assets.
   * 
   * @param {Object.<string, Object>} assets Assets
   * @param {Collection|Item|null} context The object that contains the assets
   * @returns {Object.<string, Asset>} Improved Assets
   */
  static fromAssets(assets, context = null) {
    let newAssets = {};
    if(isObject(assets)) {
      for(let key in assets) {
        newAssets[key] = new Asset(assets[key], key, context);
      }
    }
    return newAssets;
  }

}

export default Asset;
