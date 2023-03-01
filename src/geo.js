function toObject(bbox) {
  let hasZ = bbox.length > 4;
  let west = bbox[0];
  let east = bbox[hasZ ? 3 : 2];
  let south = bbox[1];
  let north = bbox[hasZ ? 4 : 3];
  return { west, east, south, north };
}

/**
 * Checks whether the given thing is a valid bounding box.
 * 
 * A valid bounding box is an array with 4 or 6 numbers that are valid WGS84 coordinates and span a rectangle.
 * See the STAC specification for details.
 * 
 * @param {BoundingBox|Array.<number>} bbox A potential bounding box.
 * @returns {boolean} `true` if valid, `false` otherwise
 */
export function isBoundingBox(bbox) {
  if (!Array.isArray(bbox) || ![4,6].includes(bbox.length) || bbox.some(n => typeof n !== "number")) {
    return false;
  }
  let { west, east, south, north } = toObject(bbox);
  return (
    west <= east &&
    south <= north &&
    west >= -180 &&
    south >= -90 &&
    east <= 180 &&
    north <= 90
  );
}

/**
 * Compute the union of a list of bounding boxes.
 * 
 * The function ignores any invalid bounding boxes or values for the third dimension.
 * 
 * @param {Array.<BoundingBox|null>} bboxes 
 * @returns {BoundingBox|null}
 * @see {isBoundingBox}
 */
export function unionBoundingBox(bboxes) {
  if (!Array.isArray(bboxes) || bboxes.length === 0) {
    return null;
  }

  let extrema = {
    west: 180,
    south: 90,
    east: -180,
    north: -90,
  };
  bboxes.forEach(bbox => {
    if (!isBoundingBox(bbox)) {
      return;
    }
    let obj = toObject(bbox);
    let min = ['west', 'south'];
    for(let key in obj) {
      let fn = min.includes(key) ? Math.min : Math.max;
      extrema[key] = fn(extrema[key], obj[key]);
    }
  });

  let bbox = [extrema.west, extrema.south, extrema.east, extrema.north];
  return isBoundingBox(bbox) ? bbox : null;
}
