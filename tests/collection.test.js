import Collection from '../src/collection';
import fs from 'fs';

let json = JSON.parse(fs.readFileSync('./tests/examples/collection.json'));
let c = new Collection(json);
let bbox = [172.91,1.34,172.95,1.36];
let temporal = ["2020-12-11T22:38:32.125Z","2020-12-14T18:02:31.437Z"]

test('toJSON', () => {
  expect(c.toJSON()).toEqual(json);
});

test('toGeoJSON', () => {
  expect(() => c.toGeoJSON()).toThrow();
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
