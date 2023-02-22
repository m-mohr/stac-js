import Item from '../src/item';
import Asset from '../src/asset';
import fs from 'fs';

let json = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let item = new Item(json);
let asset = item.assets.analytic;
let bands = asset['eo:bands'];

test('constructor', () => {
  expect(() => new Asset()).toThrow();
  expect(() => new Asset({})).toThrow();
  expect(() => new Asset(null, "key", item)).toThrow();
  expect(() => new Asset({}, null, item)).toThrow();

  expect(() => new Asset({}, "key")).not.toThrow();
  expect(() => new Asset({}, "key", null)).not.toThrow();
  expect(() => new Asset({}, "key", item)).not.toThrow();
});

test('clone constructor', () => {
  expect(asset instanceof Asset).toBeTruthy();
  expect(() => new Asset(asset)).not.toThrow();

  let cloned = new Asset(asset);
  expect(cloned.getParent()).toBe(asset.getParent());
  expect(cloned.getKey()).toBe(asset.getKey());
  expect(cloned.toJSON()).toEqual(asset.toJSON());
});

test('toJSON', () => {
  expect(asset.toJSON()).toEqual(json.assets.analytic);
});

test('getKey', () => {
  expect(asset.getKey()).toBe("analytic");
});

test('getParent', () => {
  expect(asset.getParent()).toBe(item);
});

test('getMetadata', () => {
  // undefined
  expect(asset.getMetadata("foo")).not.toBeDefined();
  // Get from asset
  expect(asset.getMetadata("roles")).toEqual(["data"]);
  // Get from item properties
  expect(asset.getMetadata("proj:epsg")).toBe(32659);
});

test('getAbsoluteUrl', () => {
  expect(asset.getAbsoluteUrl()).toBe("https://example.com/20201211_223832_CS2/20201211_223832_CS2_analytic.tif");
});

test('isGeoTIFF', () => {
  expect(asset.isGeoTIFF()).toBeTruthy();
});

test('isCOG', () => {
  expect(asset.isCOG()).toBeTruthy();
});

test('isDefintion', () => {
  expect(asset.isDefintion()).toBeFalsy();
});

test('isType', () => {
  expect(asset.isType("image/tiff")).toBeFalsy();
  expect(asset.isType("image/tiff; application=geotiff; profile=cloud-optimized")).toBeTruthy();
});

test('isHTTP', () => {
  expect(asset.isHTTP()).toBeTruthy();
});

test('getBands', () => {
  expect(asset.getBands()).toEqual(bands);
});

test('hasRole', () => {
  expect(asset.hasRole("data")).toBeTruthy();
  expect(asset.hasRole(["data", "foo"])).toBeTruthy();
  expect(asset.hasRole("foo")).toBeFalsy();
  expect(asset.hasRole(["bar"])).toBeFalsy();
});

test('findVisualBands', () => {
  let getBand = name => {
    let index = bands.findIndex(b => b.common_name === name);
    let band = bands[index];
    return { index, band };
  };
  expect(asset.findVisualBands()).toEqual({
    red: getBand('red'),
    green: getBand('green'),
    blue: getBand('blue')
  });
});

