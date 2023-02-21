import URI from 'urijs';
import { hasText, isObject } from './utils';
import { browserProtocols } from './http';

export const geojsonMediaType = 'application/geo+json';

export const stacMediaTypes = [
  'application/json',
  geojsonMediaType,
  'text/json'
];

export const browserImageTypes = [
  'image/gif',
  'image/jpeg',
  'image/apng',
  'image/png',
  'image/webp'
];

export const cogMediaTypes = [
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff; cloud-optimized=true'
];

export const geotiffMediaTypes = [
  'application/geotiff',
  'image/tiff; application=geotiff',
  'image/vnd.stac.geotiff',
].concat(cogMediaTypes);

export const imageMediaTypes = browserImageTypes.concat(geotiffMediaTypes);

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

export function isStacMediaType(type, allowUndefined = false) {
  return isMediaType(type, stacMediaTypes, allowUndefined);
}

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
