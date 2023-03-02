import Asset from './asset.js';
import CatalogLike from './cataloglike.js';
import { isoToDate } from './datetime.js';
import { isBoundingBox, toGeoJSON } from './geo.js';
import { hasText } from './utils.js';

/**
 * A STAC Collection.
 * 
 * You can access all properties of the given STAC Collection object directly, e.g. `collection.title`.
 * 
 * @class
 * @param {Object} data The STAC Collection object
 * @param {?string} absoluteUrl Absolute URL of the STAC Collection
 */
class Collection extends CatalogLike {

  constructor(data, absoluteUrl = null) {
    const keyMap = {
      assets: Asset.fromAssets,
      item_assets: Asset.fromAssets
    };
    super(data, absoluteUrl, keyMap);
  }

  /**
   * Returns a GeoJSON Feature for this STAC Collection.
   * 
   * The Feature contains a Polygon or MultiPolygon based on the given number of valid bounding boxes.
   * 
   * @returns {Object|null} GeoJSON object or `null`
   */
  toGeoJSON() {
    let geojson = toGeoJSON(this.getBoundingBoxes());
    if (geojson) {
      geojson.id = this.id;
    }
    return geojson;
  }

  /**
   * Returns a single union bounding box for the whole collection.
   * 
   * @returns {BoundingBox|null}
   */
  getBoundingBox() {
    let bboxes = this.getRawBoundingBoxes();
    if (bboxes.length > 0 && isBoundingBox(bboxes[0])) {
      return bboxes[0];
    }
    return null;
  }

  /**
   * Returns the individual bounding boxes for the collection,
   * without the union bounding box if multiple bounding boxes are given.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getBoundingBoxes() {
    let bboxes = this.getRawBoundingBoxes();
    if (bboxes.length === 1 && isBoundingBox(bboxes[0])) {
      return bboxes;
    }
    else if (bboxes.length > 1) {
      return bboxes.filter((bbox, i) => i > 0 && isBoundingBox(bbox));
    }
    return [];
  }

  /**
   * Returns all bounding boxes from the collection, including the union bounding box.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getRawBoundingBoxes() {
    let extents = this.extent?.spatial?.bbox;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents;
    }
    return [];
  }

  /**
   * Returns a single temporal extent for the STAC Collection.
   * 
   * @returns {Array.<Date|null>|null}
   */
  getTemporalExtent() {
    return this.getTemporalExtents()[0] || null;
  }

  /**
   * Returns the temporal extent(s) for the STAC Collection.
   * 
   * @returns {Array.<Array.<Date|null>>}
   */
  getTemporalExtents() {
    let extents = this.extent?.temporal?.interval;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents
        .filter(extent => Array.isArray(extent) && (hasText(extent[0]) || hasText(extent[1])))
        .map(interval => interval.map(datetime => isoToDate(datetime)));
    }
    return [];
  }
  
}

export default Collection;
