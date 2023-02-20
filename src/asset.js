import { cogMediaTypes, geotiffMediaTypes, isMediaType } from "./mediatypes";
import { hasText, mergeArraysOfObjects } from "./utils";

class Asset {

  constructor(data, parent) {
    this._parent = parent;

    for (let key in data) {
      if (typeof this[key] === 'undefined') {
        this[key] = data[key];
      }
    }
  }

  getMetadata(field) {
    if (typeof this[field] !== 'undefined') {
      return this[field];
    }
    return this._parent.getMetadata(field);
  }

  getBands() {
    return mergeArraysOfObjects([
      this['eo:bands'],
      this['raster:bands']
    ]);
  }

  isType(types) {
    return hasText(this.type) && isMediaType(types) && hasText(this.href);
  }

  isGeoTiff() {
    return this.isType(geotiffMediaTypes);
  }

  isCOG() {
    return this.isGeoTiff(cogMediaTypes);
  }

  toJSON() {
    let obj = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' || key === '_parent') {
        return;
      }
      obj[key] = this[key];
    });
    return obj;
  }

}

export default Asset;