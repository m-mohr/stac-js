import Item from './item';
import STAC from './stac';

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
   * Returns all items.
   * 
   * @returns {Array.<Item>} All STAC Items
   */
  getItems() {
    return this.features;
  }

  /**
   * Returns a GeoJSON object for this STAC object.
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

}

export default ItemCollection;
