import CatalogLike from './cataloglike';
import { isBoundingBox } from './geo';
import { hasText } from './utils';

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
    super(data, absoluteUrl);
  }

  toGeoJSON() {
    let coordinates = this.getBoundingBoxes().map(bbox => {
      let hasZ = bbox.length > 4;
      let west = bbox[0];
      let east = bbox[hasZ ? 3 : 2];
      let south = bbox[1];
      let north = bbox[hasZ ? 4 : 3];
      return [
        [
          [west, north],
          [west, south],
          [east, south],
          [east, north],
          [west, north]
        ]
      ];
    });
    if (coordinates.length === 0) {
      return null;
    }
    else if (coordinates.length === 1) {
      return {
        type: "Polygon",
        coordinates: coordinates[0]
      };
    }
    else {
      return {
        type: "MultiPolygon",
        coordinates
      };
    }
  }

  getBoundingBox() {
    let bboxes = this.getRawBoundingBoxes();
    if (bboxes.length > 0 && isBoundingBox(bboxes[0])) {
      return bboxes[0];
    }
    return null;
  }

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

  getRawBoundingBoxes() {
    let extents = this.extent?.spatial?.bbox;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents;
    }
    return [];
  }

  getTemporalExtents() {
    let extents = this.extent?.temporal?.interval;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents.filter(extent => Array.isArray(extent) && (hasText(extent[0]) || hasText(extent[1])));
    }
    return [];
  }
  
}

export default Collection;
