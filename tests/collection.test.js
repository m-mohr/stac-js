import Collection from '../src/collection';
import fs from 'fs';

let json = JSON.parse(fs.readFileSync('./tests/examples/collection.json'));
let url = "https://example.com/api";
let c = new Collection(json, url);
let bbox = [172.91,1.34,172.95,1.36];
let temporal = [new Date(Date.UTC(2020, 11, 11, 22, 38, 32, 125)), new Date(Date.UTC(2020, 11, 14, 18, 2, 31, 437))];

test('Basics', () => {
  expect(c.stac_version).toBe("1.0.0");
  expect(c.getMetadata("stac_version")).toBe("1.0.0");
  expect(c.getAbsoluteUrl()).toBe(url);
});

test('is...', () => {
  expect(c.isItem()).toBeFalsy();
  expect(c.isCatalog()).toBeFalsy();
  expect(c.isCatalogLike()).toBeTruthy();
  expect(c.isCollection()).toBeTruthy();
});

test('toJSON', () => {
  expect(c.toJSON()).toEqual(json);
});

test('toGeoJSON', () => {
  let geojson = c.toGeoJSON();
  expect(geojson).not.toBeNull();
  expect(geojson.type).toBe("Polygon");
  expect(geojson.coordinates.length).toBe(1);
});

test('getBoundingBox', () => {
  expect(c.getBoundingBox()).toEqual(bbox);
});

test('getBoundingBoxes', () => {
  expect(c.getBoundingBoxes()).toEqual([bbox]);
});

test('getTemporalExtent', () => {
  expect(c.getTemporalExtent()).toEqual(temporal);
});

test('getTemporalExtents', () => {
  expect(c.getTemporalExtents()).toEqual([temporal]);
});
