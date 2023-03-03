import { isAntimeridianBoundingBox, isBoundingBox, toGeoJSON, unionBoundingBox } from '../src/geo';

test('isBoundingBox', () => {
  expect(isBoundingBox(undefined)).toBeFalsy();
  expect(isBoundingBox(null)).toBeFalsy();
  expect(isBoundingBox({})).toBeFalsy();
  expect(isBoundingBox(["a"])).toBeFalsy();
  expect(isBoundingBox(123)).toBeFalsy();
  expect(isBoundingBox("")).toBeFalsy();
  expect(isBoundingBox([0,0,0,"0"])).toBeFalsy();
  expect(isBoundingBox([0,0,0,0,0])).toBeFalsy();
  expect(isBoundingBox([-180,-91,180,90])).toBeFalsy();
  expect(isBoundingBox([-180,-90,180,91])).toBeFalsy();
  expect(isBoundingBox([180,90,-180,-90])).toBeFalsy();
  expect(isBoundingBox([360,-90,0,90])).toBeFalsy();
  expect(isBoundingBox([0,-90,360,90])).toBeFalsy();

  expect(isBoundingBox([172.91,1.34,172.95,1.36])).toBeTruthy();
  expect(isBoundingBox([-180,-90,180,90])).toBeTruthy();
  expect(isBoundingBox([-179,-1,179,1])).toBeTruthy();
  expect(isBoundingBox([179,-1,-179,1])).toBeTruthy();
  expect(isBoundingBox([180,-90,-180,90])).toBeTruthy();
});

test('isAntimeridianBoundingBox', () => {
  expect(isAntimeridianBoundingBox([-180,-90,180,90])).toBeFalsy();
  expect(isAntimeridianBoundingBox([-179,-1,179,1])).toBeFalsy();

  expect(isAntimeridianBoundingBox([179,-1,-179,1])).toBeTruthy();
});

test('unionBoundingBox', () => {
  let bbox1 = [172.91,1.34,0,172.95,1.36,10];
  let bbox2 = [-180,-85,180,85];
  expect(unionBoundingBox([bbox1, bbox2, null])).toEqual(bbox2);
});


test('toGeoJSON', () => {
  let make = (type, coordinates) => {
    return {
      type: "Feature",
      geometry: {
        type,
        coordinates
      },
      properties: {}
    };
  };
  expect(toGeoJSON([-180,-90,180,90])).toEqual(make(
    "Polygon",
    [[[-180,90],[-180,-90],[180,-90],[180,90],[-180,90]]]
  ));
  expect(toGeoJSON([-179,-1,179,1])).toEqual(make(
    "Polygon",
    [[[-179,1],[-179,-1],[179,-1],[179,1],[-179,1]]]
  ));
  expect(toGeoJSON([179,-1,-179,1])).toEqual(make(
    "MultiPolygon",
    [[[[-180,1],[-180,-1],[-179,-1],[-179,1],[-180,1]]],[[[179,1],[179,-1],[180,-1],[180,1],[179,1]]]]
  ));
});
