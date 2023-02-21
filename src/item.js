import { isBoundingBox } from './geo';
import STAC from './stac';
import { hasText } from './utils';

/**
 * A STAC Item.
 * 
 * You can access all properties of the given STAC Item object directly, e.g. `item.id` or `item.properties.datetime`.
 * 
 * @class
 * @param {Object} data The STAC Item object
 * @param {?string} absoluteUrl Absolute URL of the STAC Item
 */
class Item extends STAC {
  
  constructor(data, absoluteUrl = null) {
    super(data, absoluteUrl);
  }

  toGeoJSON() {
    return this.toJSON();
  }

  getBoundingBox() {
    return isBoundingBox(this.bbox) ? this.bbox : null;
  }

  getBoundingBoxes() {
    return isBoundingBox(this.bbox) ? [this.bbox] : [];
  }

  getTemporalExtents() {
    if (hasText(this.properties.start_datetime) || hasText(this.properties.end_datetime)) {
      return [[this.properties.start_datetime || null, this.properties.end_datetime || null]];
    }
    else if (hasText(this.properties.datetime)) {
      return [[this.properties.datetime, this.properties.datetime]];
    }
    return [];
  }

  getMetadata(field) {
    return this.properties[field];
  }

}

export default Item;
