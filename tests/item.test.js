import Item from '../src/item';
import fs from 'fs';

let json = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let item = new Item(json);
let bbox = [172.91,1.34,172.95,1.36];
let dtStr = "2020-12-14T18:02:31Z";
let dtDate = new Date(Date.UTC(2020, 11, 14, 18, 2, 31));

test('Basics', () => {
  expect(item.id).toBe("20201211_223832_CS2");
  expect(item.getMetadata("id")).toBeUndefined();
  expect(item.getAbsoluteUrl()).toBe("https://example.com/20201211_223832_CS2/item.json");
});

test('is...', () => {
  expect(item.isItem()).toBeTruthy();
  expect(item.isCatalog()).toBeFalsy();
  expect(item.isCatalogLike()).toBeFalsy();
  expect(item.isCollection()).toBeFalsy();
  expect(item.isItemCollection()).toBeFalsy();
});

test('toJSON', () => {
  expect(item.toJSON()).toEqual(json);
});

test('toGeoJSON', () => {
  expect(item.toGeoJSON()).toEqual(json);
});

test('getBoundingBox', () => {
  expect(item.getBoundingBox()).toEqual(bbox);
});

test('getBoundingBoxes', () => {
  expect(item.getBoundingBoxes()).toEqual([bbox]);
});

test('datetime', () => {
  expect(item.properties.datetime).toBe(dtStr);
});

test('getMetadata', () => {
  expect(item.getMetadata("datetime")).toBe(dtStr);
});

test('getDateTime', () => {
  expect(item.getDateTime()).toEqual(dtDate);
});

test('getTemporalExtent', () => {
  expect(item.getTemporalExtent()).toEqual([dtDate, dtDate]);
});

describe('rankGeoTIFFs', () => {
  test('default', () => {
    let ranks = item.rankGeoTIFFs();
    expect(ranks.length).toBe(3);
    expect(ranks.map(r => r.asset.getKey())).toEqual(["visual", "analytic", "udm"]);
    expect(ranks.map(r => r.score)).toEqual([5, 4, 0]);
  });

  test('not httpOnly', () => {
    let ranks = item.rankGeoTIFFs(false);
    expect(ranks.length).toBe(4);
    expect(ranks.map(r => r.asset.getKey())).toEqual(["visual", "analytic", "s3", "udm"]);
    expect(ranks.map(r => r.score)).toEqual([5, 4, 3, 0]);
  });

  test('cogOnly', () => {
    let ranks = item.rankGeoTIFFs(true, true);
    expect(ranks.length).toBe(2);
    expect(ranks.map(r => r.asset.getKey())).toEqual(["visual", "analytic"]);
    expect(ranks.map(r => r.score)).toEqual([3, 2]);
  });
  
  test('with different roles', () => {
    let ranks = item.rankGeoTIFFs(true, false, {analytic: 5});
    expect(ranks.length).toBe(3);
    expect(ranks.map(r => r.asset.getKey())).toEqual(["analytic", "visual", "udm"]);
    expect(ranks.map(r => r.score)).toEqual([8, 3, 0]);
  });
  
  test('with callback', () => {
    let ranks = item.rankGeoTIFFs(true, false, null, asset => Array.isArray(asset['eo:bands']) ? 5 : -5);
    expect(ranks.length).toBe(3);
    expect(ranks.map(r => r.asset.getKey())).toEqual(["visual", "analytic", "udm"]);
    expect(ranks.map(r => r.score)).toEqual([10, 9, -5]);
  });

  test('getDefaultGeoTIFF', () => {
    let asset = item.getDefaultGeoTIFF();
    expect(asset).not.toBeNull();
    expect(asset.getKey()).toEqual("visual");
    expect(asset.href).toEqual("./20201211_223832_CS2.tif");
    expect(asset.getAbsoluteUrl()).toEqual("https://example.com/20201211_223832_CS2/20201211_223832_CS2.tif");
  });
});

