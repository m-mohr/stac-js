import { browserProtocols } from "./http";
import { cogMediaTypes, geotiffMediaTypes, isMediaType } from "./mediatypes";
import { hasText, isObject, mergeArraysOfObjects } from "./utils";

class Asset {

  constructor(data, key, parent) {
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
    if (!this._parent) {
      throw new Error("No parent specified");
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

  getAbsoluteUrl(stringify = true) {
    if (this.isDefintion()) {
      return null;
    }
    return this._parent.toAbsolute(this, stringify).href;
  }

  getKey() {
    return this._key;
  }

  getParent() {
    return this._parent;
  }

  getMetadata(field) {
    if (typeof this[field] !== 'undefined') {
      return this[field];
    }
    return this._parent.getMetadata(field);
  }

  getBands() {
    return mergeArraysOfObjects(this['eo:bands'], this['raster:bands']);
  }

  findVisualBands() { // Find the RGB bands
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

  isDefintion() { // Is an Item Asset definition (i.e. doesn't have an href)
    return !hasText(this.href);
  }

  isType(types) { // string or array of strings
    return hasText(this.type) && isMediaType(this.type, types);
  }

  isGeoTIFF() {
    return this.isType(geotiffMediaTypes);
  }

  isCOG() {
    return this.isType(cogMediaTypes);
  }

  isHTTP() { // Checks whether the asset is accessible via HTTP or HTTPS (null for item asset definitions)
    if (this.isDefintion()) {
      return null;
    }
    let uri = this.getAbsoluteUrl(false);
    let protocol = uri.protocol().toLowerCase();
    return hasText(protocol) && browserProtocols.includes(protocol);
  }

  hasRole(roles) { // string or array of strings
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return Array.isArray(this.roles) && Boolean(this.roles.find(role => roles.includes(role)));
  }

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
