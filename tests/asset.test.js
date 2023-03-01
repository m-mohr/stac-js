import Item from '../src/item';
import Asset from '../src/asset';
import fs from 'fs';
import { isObject } from '../src/utils';

let json = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let item = new Item(json);
let asset = item.assets.analytic;
let bands = asset['eo:bands'];

describe('constructor', () => {
  test('normal', () => {
    expect(() => new Asset()).toThrow();
    expect(() => new Asset(null, "key", item)).toThrow();

    expect(() => new Asset({})).not.toThrow();
    expect(() => new Asset({}, null, item)).not.toThrow();
    expect(() => new Asset({}, "key")).not.toThrow();
    expect(() => new Asset({}, "key", null)).not.toThrow();
    expect(() => new Asset({}, "key", item)).not.toThrow();
  });

  test('clone', () => {
    expect(asset instanceof Asset).toBeTruthy();
    expect(() => new Asset(asset)).not.toThrow();
  
    let cloned = new Asset(asset);
    expect(cloned.getContext()).toBe(asset.getContext());
    expect(cloned.getKey()).toBe(asset.getKey());
    expect(cloned.toJSON()).toEqual(asset.toJSON());
  });
});

test('toJSON', () => {
  expect(asset.toJSON()).toEqual(json.assets.analytic);
});

test('getKey', () => {
  expect(asset.getKey()).toBe("analytic");
});

test('getContext', () => {
  expect(asset.getContext()).toBe(item);
});

test('getObjectType', () => {
  expect(asset.getObjectType()).toBe("Asset");
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

test('findBand', () => {
  let b1 = { name: "b1" };
  let b2 = { name: "b2", common_name: "blue" };
  let b3 = { common_name: "red" };
  let bands = [b1, b2, b3];
  let b1i = { index: 0, band: b1 };
  let b2i = { index: 1, band: b2 };
  let b3i = { index: 2, band: b3 };
  let asset = new Asset({
    "href": "ex.tif",
    "eo:bands": bands
  }, "test");

  expect(asset.findBand("b1")).toEqual(b1i);
  expect(asset.findBand("b2")).toEqual(b2i);
  expect(asset.findBand("blue", "common_name")).toEqual(b2i);
  expect(asset.findBand("red", "common_name")).toEqual(b3i);
  expect(asset.findBand(["foo", "red", "bar"], "common_name")).toEqual(b3i);

  expect(asset.findBand("green", "common_name")).toBeNull();
  expect(asset.findBand("b1", "common_name")).toBeNull();
  expect(asset.findBand("red")).toBeNull();
  expect(asset.findBand("b3")).toBeNull();
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

describe('getMinMaxValues', () => {
  test('raster:bands -> statistics', () => {
    let asset = new Asset({
      "raster:bands": [{
        "statistics": {
          "minimum": -5.1,
          "maximum": 5.1,
          "mean": 0
        },
        "data_type": "uint8"
      }]
    }, "test");
    let obj = asset.getMinMaxValues(0);
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBe(-5.1);
    expect(obj.maximum).toBe(5.1);
    expect(obj.mean).not.toBeDefined();

    let obj2 = asset.getMinMaxValues(1);
    expect(isObject(obj2)).toBeTruthy();
    expect(obj2.minimum).toBeNull();
    expect(obj2.maximum).toBeNull();
    expect(obj2.mean).not.toBeDefined();
  });

  test('classification:classes', () => {
    let asset = new Asset({
      "classification:classes": [
        {value: -1},
        {value: 0},
        {value: 1},
        {value: 2}
      ]
    }, "test");
    let obj = asset.getMinMaxValues();
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBe(-1);
    expect(obj.maximum).toBe(2);
  });

  test('file:data_type', () => {
    let asset = new Asset({
      "file:data_type": "uint8"
    }, "test");
    let obj = asset.getMinMaxValues();
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBe(0);
    expect(obj.maximum).toBe(255);
  });

  test('raster:bands, pass in as object', () => {
    let obj = asset.getMinMaxValues({
      "data_type": "int8"
    });
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBe(-128);
    expect(obj.maximum).toBe(127);
  });

  test('classification:classes', () => {
    let asset = new Asset({
      "file:values": [
        {values: [1,2]},
        {values: [0]},
        {values: [-1]}
      ]
    }, "test");
    let obj = asset.getMinMaxValues();
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBe(-1);
    expect(obj.maximum).toBe(2);
  });

  test('empty', () => {
    let asset = new Asset({"href": "example.jpg"}, "test");
    let obj = asset.getMinMaxValues();
    expect(isObject(obj)).toBeTruthy();
    expect(obj.minimum).toBeNull();
    expect(obj.maximum).toBeNull();
  });
});

describe('getNoDataValues', () => {
  test('raster:bands', () => {
    let asset = new Asset({
      "raster:bands": [{
        "nodata": "nan"
      },{
        "nodata": 0
      },{
        "name": "b3"
      }]
    }, "test");

    expect(asset.getNoDataValues(0)).toEqual([NaN]);
    expect(asset.getNoDataValues(1)).toEqual([0]);
    expect(asset.getNoDataValues(2)).toEqual([]);
    expect(asset.getNoDataValues(3)).toEqual([]);
  });

  test('classification:classes', () => {
    let asset = new Asset({
      "classification:classes": [{
        value: 0,
        nodata: true
      },{
        value: 1
      },]
    }, "test");

    expect(asset.getNoDataValues()).toEqual([0]);
  });

  test('file:data_type', () => {
    let asset = new Asset({
      "file:nodata": [-1, -3]
    }, "test");
    expect(asset.getNoDataValues(0)).toEqual([-1, -3]);
  });

  test('raster:bands, pass in as object', () => {
    expect(asset.getNoDataValues({})).toEqual([]);
    expect(asset.getNoDataValues({"nodata": "-inf"})).toEqual([-Infinity]);
    expect(asset.getNoDataValues({"nodata": "+inf"})).toEqual([+Infinity]);
  });
});

test('canBrowserDisplayImage', () => {
  expect(item.assets.thumbnail.canBrowserDisplayImage()).toBeTruthy();
  expect(item.assets.analytic.canBrowserDisplayImage()).toBeFalsy();
});
