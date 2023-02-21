import URI from 'urijs';
import { hasText, isObject } from './utils';
import { browserProtocols } from './http';

/**
 * The GeoJSON media type.
 * 
 * @type {string}
 */
export const geojsonMediaType = 'application/geo+json';

/**
 * All STAC media types (JSON + GeoJSON).
 * 
 * @type {Array.<string>}
 */
export const stacMediaTypes = [
  'application/json',
  geojsonMediaType,
  'text/json'
];

/**
 * All image media types that Web Browsers can show (GIF, JPEG, PNG, WebP).
 * 
 * @type {Array.<string>}
 */
export const browserImageTypes = [
  'image/gif',
  'image/jpeg',
  'image/apng',
  'image/png',
  'image/webp'
];

/**
 * All Cloud Optimized GeoTiff media types.
 * 
 * @type {Array.<string>}
 */
export const cogMediaTypes = [
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff; cloud-optimized=true'
];

/**
 * All GeoTiff media types (including COG media types).
 * 
 * @type {Array.<string>}
 */
export const geotiffMediaTypes = [
  'application/geotiff',
  'image/tiff; application=geotiff',
  'image/vnd.stac.geotiff',
].concat(cogMediaTypes);

/**
 * All image media types combined (Web Browser + GeoTiff).
 * 
 * @type {Array.<string>}
 */
export const imageMediaTypes = browserImageTypes.concat(geotiffMediaTypes);

/**
 * Checks whether a given media type is in the list of media types.
 * 
 * @param {string|undefined} type The potential media type.
 * @param {string|Array.<string>} allowedTypes A list of allowed media types (or a single media type as string).
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if the media type is allowed, `false` otherwise.
 */
export function isMediaType(type, allowedTypes, allowUndefined = false) {
  if (!Array.isArray(allowedTypes)) {
    allowedTypes = [allowedTypes];
  }
  if (allowUndefined && typeof type === 'undefined') {
    return true;
  }
  else if (typeof type !== 'string') {
    return false;
  }
  else {
    allowedTypes = allowedTypes.map(type => type.toLowerCase());
    return allowedTypes.includes(type.toLowerCase());
  }
}

/**
 * Checks whether the given media type is a STAC media type (JSON or GeoJSON).
 * 
 * @param {string|undefined} type The potential media type.
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if the media type is a STAC media type, `false` otherwise.
 */
export function isStacMediaType(type, allowUndefined = false) {
  return isMediaType(type, stacMediaTypes, allowUndefined);
}

/**
 * Checks whether a given Link or Asset object can be displayed by a browser.
 * 
 * A browser can usually display an image if it is a specific file format (e.g. JPEG, PNG, ...) and is served over HTTP(S).
 * 
 * @param {Link|Asset} img The potential image as Link or Asset object.
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if a browser can display the given thing, `false` otherwise.
 */
export function canBrowserDisplayImage(img, allowUndefined = false) {
  if (!isObject(img) || typeof img.href !== 'string') {
    return false;
  }
  else if (!allowUndefined && typeof img.type === 'undefined') {
    return false;
  }
  let uri = new URI(img.href);
  let protocol = uri.protocol().toLowerCase();
  let extension = uri.suffix().toLowerCase();
  if (hasText(protocol) && !browserProtocols.includes(protocol)) {
    return false;
  }
  else if (hasText(img.type) && browserImageTypes.includes(img.type.toLowerCase())) {
    return true;
  }
  else if (typeof img.type === 'undefined' && hasText(extension) && (extension === 'jpg' || browserImageTypes.includes('image/' + extension))) {
    return true;
  }
  else {
    return false;
  }
}
