import Collection from './collection.js';
import { unionDateTime } from './datetime.js';
import { unionBoundingBox } from './geo.js';
import STAC from './stac.js';

/**
 * Represents an Collections containing Collections.
 * 
 * @class CollectionCollection
 * @param {Object} data The STAC API Collections object
 * @param {?string} absoluteUrl Absolute URL of the STAC Item Collection
 */
class CollectionCollection extends STAC {

  constructor(data, absoluteUrl = null) {
    const keyMap = {
      collections: collections => collections.map(collection => new Collection(collection))
    };
    super(data, absoluteUrl, keyMap);
  }

  /**
   * Returns the type of the STAC object.
   * 
   * @returns {string}
   */
  getObjectType() {
    return "CollectionCollection";
  }

  /**
   * Check whether this given object is a STAC Collection of Collections (i.e. API Collections).
   * 
   * @returns {boolean} `true` if the object is a STAC CollectionCollection, `false` otherwise.
   */
  isCollectionCollection() {
    return true;
  }

  /**
   * Returns all collections.
   * 
   * @returns {Array.<Collection>} All STAC Collections
   */
  getCollections() {
    return this.collections;
  }

  /**
   * Returns a GeoJSON Feature Collection for this STAC object.
   * 
   * @returns {Object|null} GeoJSON object or `null`
   */
  toGeoJSON() {
    let features = this.collections
      .map(collection => collection.toGeoJSON())
      .filter(geojson => geojson !== null);
    return {
      type: "FeatureCollection",
      features
    };
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
   * Returns a single bounding box for all the STAC collections.
   * 
   * @returns {BoundingBox|null}
   */
  getBoundingBox() {
    return unionBoundingBox(this.getBoundingBoxes());
  }

  /**
   * Returns a list of bounding boxes for all the STAC collections.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getBoundingBoxes() {
    return this.collections.map(collection => collection.getBoundingBox());
  }

  /**
   * Returns a single temporal extent for the all the STAC collections.
   * 
   * @returns {Array.<Date|null>|null}
   */
  getTemporalExtent() {
    return unionDateTime(this.getTemporalExtents());
  }

  /**
   * Returns the temporal extent(s) for the all the STAC collections.
   * 
   * @returns {Array.<Array.<string|null>>}
   */
  getTemporalExtents() {
    return this.collections.map(collection => collection.getTemporalExtent());
  }

}

export default CollectionCollection;
