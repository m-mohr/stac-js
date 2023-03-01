import Asset from './asset';
import { centerDateTime, isoToDate } from './datetime';
import { isBoundingBox } from './geo';
import { hasText } from './utils';
import STAC from './stac';

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
    const keyMap = {
      assets: Asset.fromAssets
    };
    super(data, absoluteUrl, keyMap);
  }

  /**
   * Returns the type of the STAC object.
   * 
   * @returns {string}
   */
  getObjectType() {
    return "Item";
  }

  /**
   * Returns a GeoJSON Feature for this STAC object.
   * 
   * @returns {Object|null} GeoJSON object or `null`
   */
  toGeoJSON() {
    return this.toJSON();
  }

  /**
   * Returns a single bounding box for the item.
   * 
   * @returns {BoundingBox|null}
   */
  getBoundingBox() {
    return isBoundingBox(this.bbox) ? this.bbox : null;
  }

  /**
   * Returns bounding boxes for the item.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getBoundingBoxes() {
    return isBoundingBox(this.bbox) ? [this.bbox] : [];
  }

  /**
   * Returns the datetime of the STAC Item.
   * 
   * @param {boolean} force Enforce a datetime by computing the center datetime if needed.
   * @returns {Date|null}
   */
  getDateTime(force = false) {
    let dt = isoToDate(this.properties.datetime);
    if (!dt && force) {
      let start = isoToDate(this.properties.start_datetime);
      let end = isoToDate(this.properties.end_datetime);
      if (start && end) {
        return centerDateTime(start, end);
      }
      else {
        return start || end;
      }
    }
    return dt;
  }

  /**
   * Returns a single temporal extent for the STAC Item.
   * 
   * @returns {Array.<Date|null>|null}
   */
  getTemporalExtent() {
    return this.getTemporalExtents()[0] || null;
  }

  /**
   * Returns the temporal extent(s) for the STAC Item.
   * 
   * @returns {Array.<Array.<Date|null>>}
   */
  getTemporalExtents() {
    let dates = [];
    if (hasText(this.properties.start_datetime) || hasText(this.properties.end_datetime)) {
      dates = [[this.properties.start_datetime || null, this.properties.end_datetime || null]];
    }
    else if (hasText(this.properties.datetime)) {
      dates = [[this.properties.datetime, this.properties.datetime]];
    }
    return dates.map(interval => interval.map(datetime => isoToDate(datetime)));
  }

  /**
   * Returns metadata from the Item properties for the given field name.
   * 
   * @param {string} field Field name
   * @returns {*} The value of the field
   */
  getMetadata(field) {
    return this.properties[field];
  }

  /**
   * Returns the collection link, if present.
   * 
   * @returns {Link|null} The collection link
   */
  getCollectionLink() {
    return this.getStacLinkWithRel('collection');
  }

}

export default Item;
