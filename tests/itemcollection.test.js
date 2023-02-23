import Item from '../src/item';
import ItemCollection from '../src/itemcollection';
import fs from 'fs';

let item = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let json = {type: "FeatureCollection", features: [item]};
let ic = new ItemCollection(json);

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
});

test('toJSON', () => {
  expect(ic.toJSON()).toEqual(json);
});

test('toGeoJSON', () => {
  expect(ic.toGeoJSON()).toEqual(json);
});

test('getBoundingBox', () => {
  expect(ic.getBoundingBox()).toBeNull();
});

test('getBoundingBoxes', () => {
  expect(ic.getBoundingBoxes()).toEqual([]);
});

test('getMetadata', () => {
  expect(ic.getMetadata("id")).toBeUndefined();
  expect(ic.getMetadata("type")).toBe("FeatureCollection");
});

test('getTemporalExtent', () => {
  expect(ic.getTemporalExtent()).toBeNull();
});

test('getItems', () => {
  expect(ic.getItems()).toEqual([new Item(item)]);
});
