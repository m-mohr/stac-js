import { cogMediaTypes, geotiffMediaTypes, isMediaType } from "./mediatypes";
import { hasText, mergeObjectArrays } from "./utils";

class Asset {

  constructor(data, parent) {
    this.parent = parent;

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
    return this.parent.getMetadata(field);
  }

  getBands() {
    return mergeObjectArrays([
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

}

export default Asset;