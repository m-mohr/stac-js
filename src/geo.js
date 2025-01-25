function toObject(bbox) {
  let hasZ = bbox.length >= 6;
  let west = bbox[0];
  let east = bbox[hasZ ? 3 : 2];
  let south = bbox[1];
  let north = bbox[hasZ ? 4 : 3];
  let obj = { west, east, south, north };
  if (hasZ) {
    obj.base = bbox[2];
    obj.height = bbox[5];
  }
  return obj;
}

function bboxToCoords(bbox) {
  let { west, east, south, north } = toObject(bbox);
  return [
    [
      [west, north],
      [west, south],
      [east, south],
      [east, north],
      [west, north]
    ]
  ];
}

/**
 * Returns the center of the STAC entity.
 * 
 * @param {BoundingBox|null} bbox 
 * @returns {Point|null}
 */
export function centerOfBoundingBox(bbox) {
  if (!isBoundingBox(bbox)) {
    return null;
  }
  let obj = toObject(bbox);
  let point = [];
  if (isAntimeridianBoundingBox(bbox)) {
    let x = (obj.west + 360 + obj.east) / 2;
    if (x > 180) {
      x -= 360;
    }
    point.push(x);
  }
  else {
    point.push((obj.west + obj.east) / 2);
  }
  point.push((obj.south + obj.north) / 2); // y
  if (typeof obj.base !== 'undefined') {
    point.push((obj.base + obj.height) / 2); // z
  }
  return point;
}

/**
 * Converts one or more bounding boxes to a GeoJSON Feature.
 * 
 * The Feature contains a Polygon or MultiPolygon based on the given number of valid bounding boxes.
 * 
 * @param {BoundingBox|Array.<BoundingBox>} bboxes 
 * @returns {Object|null}
 */
export function toGeoJSON(bboxes) {
  if (isBoundingBox(bboxes)) {
    // Wrap a single bounding into an array
    bboxes = [bboxes];
  }
  else if (Array.isArray(bboxes)) {
    // Remove invalid bounding boxes
    bboxes = bboxes.filter(bbox => isBoundingBox(bbox));
  }
  // Return if no valid bbox is given
  if (!Array.isArray(bboxes) || bboxes.length === 0) {
    return null;
  }

  let coordinates = bboxes.reduce((list, bbox) => {
    if (isAntimeridianBoundingBox(bbox)) {
      let { west, east, south, north } = toObject(bbox);
      list.push(bboxToCoords([-180, south, east, north]));
      list.push(bboxToCoords([west, south, 180, north]));
    }
    else {
      list.push(bboxToCoords(bbox));
    }
    return list;
  }, []);

  let geometry = null;
  if (coordinates.length === 1) {
    geometry = {
      type: "Polygon",
      coordinates: coordinates[0]
    };
  }
  else if (coordinates.length > 1) {
    geometry = {
      type: "MultiPolygon",
      coordinates
    };
  }
  if (geometry) {
    return {
      type: "Feature",
      geometry,
      properties: {}
    };
  }
}

/**
 * Converts a bounding box to be two-dimensional.
 * 
 * @param {BoundingBox} bbox 
 * @returns {BoundingBox}
 */
export function bbox2D(bbox) {
  if (bbox.length === 4) {
    return bbox;
  }
  else {
    let { west, east, south, north } = toObject(bbox);
    return [west, south, east, north];
  }
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
    south <= north &&
    west >= -180 && west <= 180 &&
    south >= -90 &&
    east <= 180 && east >= -180 &&
    north <= 90
  );
}

/**
 * Checks whether the given bounding box crosses the antimeridian.
 * 
 * @param {BoundingBox} bbox 
 * @returns {boolean}
 */
export function isAntimeridianBoundingBox(bbox) {
  if (!isBoundingBox(bbox)) {
    return false;
  }
  
  let { west, east } = toObject(bbox);
  return west > east;
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
