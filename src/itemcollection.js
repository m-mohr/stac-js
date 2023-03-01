import { unionDateTime } from './datetime.js';
import { unionBoundingBox } from './geo.js';
import Item from './item.js';
import STAC from './stac.js';

/**
 * Represents an ItemCollection containing Items.
 * 
 * @class ItemCollection
 * @param {Object} data The STAC Item Collection object
 * @param {?string} absoluteUrl Absolute URL of the STAC Item Collection
 */
class ItemCollection extends STAC {

  constructor(data, absoluteUrl = null) {
    const keyMap = {
      features: features => features.map(feature => new Item(feature))
    };
    super(data, absoluteUrl, keyMap);
  }

  /**
   * Returns the type of the STAC object.
   * 
   * @returns {string}
   */
  getObjectType() {
    return "ItemCollection";
  }

  /**
   * Returns all items.
   * 
   * @returns {Array.<Item>} All STAC Items
   */
  getItems() {
    return this.features;
  }

  /**
   * Returns a GeoJSON FeatureCollection for this STAC object.
   * 
   * @returns {Object|null} GeoJSON object or `null`
   */
  toGeoJSON() {
    return this.toJSON();
  }

  /**
   * Returns the metadata for the STAC ItemCollection.
   * 
   * @param {string} field Field name
   * @returns {*}
   * @abstract
   */
  getMetadata(field) {
    return this[field];
  }

  /**
   * Returns a single bounding box for all the STAC items.
   * 
   * @returns {BoundingBox|null}
   */
  getBoundingBox() {
    return unionBoundingBox(this.getBoundingBoxes());
  }

  /**
   * Returns a list of bounding boxes for all the STAC items.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getBoundingBoxes() {
    return this.features.map(item => item.getBoundingBox());
  }

  /**
   * Returns a single temporal extent for all the STAC items.
   * 
   * @returns {Array.<Date|null>|null}
   */
  getTemporalExtent() {
    return unionDateTime(this.getTemporalExtents());
  }

  /**
   * Returns the temporal extent(s) for all the STAC items.
   * 
   * @returns {Array.<Array.<string|null>>}
   */
  getTemporalExtents() {
    return this.features.map(item => item.getTemporalExtent());
  }

}

export default ItemCollection;
