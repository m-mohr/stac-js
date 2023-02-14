export const geojsonMediaType = "application/geo+json";

export const stacMediaTypes = [
  'application/json',
  geojsonMediaType,
  'text/json'
];

export const browserImageTypes = [
  'image/gif',
  'image/jpg',
  'image/jpeg',
  'image/apng',
  'image/png',
  'image/webp'
];

export const cogMediaTypes = [
  "image/tiff; application=geotiff; profile=cloud-optimized",
  "image/vnd.stac.geotiff; cloud-optimized=true"
];

export const geotiffMediaTypes = [
  "application/geotiff",
  "image/tiff; application=geotiff",
  "image/vnd.stac.geotiff",
].concat(cogMediaTypes);

export const imageMediaTypes = browserImageTypes.concat(geotiffMediaTypes);

export function isMediaType(type, allowedTypes, allowEmpty = false) {
  if (!Array.isArray(allowedTypes)) {
    allowedTypes = [allowedTypes];
  }
  if (allowEmpty && !type) {
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

export function canBrowserDisplayImage(img, allowEmpty = false) {
  if (!isObject(img) || typeof img.href !== 'string') {
    return false;
  }
  else if (typeof img.type === 'undefined') {
    return allowEmpty;
  }
  let uri = new URI(img.href);
  let protocol = uri.protocol().toLowerCase();
  if (protocol && !browserProtocols.includes(protocol)) {
    return false;
  }
  else if (browserImageTypes.includes(img.type)) {
    return true;
  }
  else if (browserImageTypes.includes('image/' + uri.suffix().toLowerCase())) {
    return true;
  }
  else {
    return false;
  }
}
