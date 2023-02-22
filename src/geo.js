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
  return (
    Array.isArray(bbox) &&
    (bbox.length === 4 || bbox.length === 6) &&
    bbox.every(n => typeof n === "number") &&
    bbox[0] <= bbox[2] &&
    bbox[1] <= bbox[3] &&
    bbox[0] >= -180 &&
    bbox[1] >= -90 &&
    bbox[2] <= 180 &&
    bbox[3] <= 90
  );
}
