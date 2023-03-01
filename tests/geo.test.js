import { isBoundingBox, unionBoundingBox } from '../src/geo';

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
  expect(isBoundingBox([360,-90,0,90])).toBeFalsy();
  expect(isBoundingBox([0,-90,360,90])).toBeFalsy();
  expect(isBoundingBox([180,90,-180,-90])).toBeFalsy();

  expect(isBoundingBox([172.91,1.34,172.95,1.36])).toBeTruthy();
  expect(isBoundingBox([-180,-90,180,90])).toBeTruthy();
});

test('unionBoundingBox', () => {
  let bbox1 = [172.91,1.34,0,172.95,1.36,10];
  let bbox2 = [-180,-85,180,85];
  expect(unionBoundingBox([bbox1, bbox2, null])).toEqual(bbox2);
});
