import Item from '../src/item';
import ItemCollection from '../src/itemcollection';
import fs from 'fs';

let item = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let json = {type: "FeatureCollection", features: [item]};
let ic = new ItemCollection(json);
let dt = new Date(Date.UTC(2020, 11, 14, 18, 2, 31));

test('Basics', () => {
  expect(ic.type).toBe("FeatureCollection");
  expect(ic.getAbsoluteUrl()).toBe(null);
});

test('is...', () => {
  expect(ic.isItem()).toBeFalsy();
  expect(ic.isCatalog()).toBeFalsy();
  expect(ic.isCatalogLike()).toBeFalsy();
  expect(ic.isCollection()).toBeFalsy();
  expect(ic.isItemCollection()).toBeTruthy();
  expect(ic.isCollectionCollection()).toBeFalsy();
});

test('getObjectType', () => {
  expect(ic.getObjectType()).toBe("ItemCollection");
});

test('toJSON', () => {
  expect(ic.toJSON()).toEqual(json);
});

test('toGeoJSON', () => {
  expect(ic.toGeoJSON()).toEqual(json);
});

test('getBoundingBox', () => {
  expect(ic.getBoundingBox()).toEqual(item.bbox);
});

test('getBoundingBoxes', () => {
  expect(ic.getBoundingBoxes()).toEqual([item.bbox]);
});

test('getMetadata', () => {
  expect(ic.getMetadata("id")).toBeUndefined();
  expect(ic.getMetadata("type")).toBe("FeatureCollection");
});

test('getTemporalExtent', () => {
  expect(ic.getTemporalExtent()).toEqual([dt, dt]);
});

test('getTemporalExtents', () => {
  expect(ic.getTemporalExtents()).toEqual([[dt, dt]]);
});

test('getItems', () => {
  expect(ic.getItems()).toEqual([new Item(item)]);
});
