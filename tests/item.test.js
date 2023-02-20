import Item from '../src/item';
import fs from 'fs';

let json = JSON.parse(fs.readFileSync('./tests/examples/item.json'));
let item = new Item(json);
let bbox = [172.91,1.34,172.95,1.36];
let dt = "2020-12-14T18:02:31Z";

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
  expect(item.properties.datetime).toBe(dt);
});

test('getMetadata', () => {
  expect(item.getMetadata("datetime")).toBe(dt);
});

test('getTemporalExtent', () => {
  expect(item.getTemporalExtent()).toEqual([dt, dt]);
});

test('getTemporalExtents', () => {
  expect(item.getTemporalExtents()).toEqual([[dt, dt]]);
});
