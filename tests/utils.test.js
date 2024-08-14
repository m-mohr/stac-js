import { hasText, isObject, mergeArraysOfObjects } from '../src/utils';

test('hasText', () => {
  expect(hasText(undefined)).toBeFalsy();
  expect(hasText(null)).toBeFalsy();
  expect(hasText({})).toBeFalsy();
  expect(hasText(["a"])).toBeFalsy();
  expect(hasText(123)).toBeFalsy();
  expect(hasText("")).toBeFalsy();
  expect(hasText(" ")).toBeTruthy();
  expect(hasText("a")).toBeTruthy();
  expect(hasText("123")).toBeTruthy();
});

test('isObject', () => {
  expect(isObject(null)).toBe(false); // null
  expect(isObject(true)).toBe(false); // boolean
  expect(isObject([])).toBe(false); // array
  expect(isObject(123)).toBe(false); // number
  expect(isObject(Math.min)).toBe(false); // function
  expect(isObject({})).toBe(true); // plain object
  class Test {}
  expect(isObject(new Test())).toBe(true); // object instance
});

test('mergeArraysOfObjects', () => {
  expect(mergeArraysOfObjects()).toEqual([]);
  expect(mergeArraysOfObjects([])).toEqual([]);
  expect(mergeArraysOfObjects({a: 1})).toEqual([]);
  expect(mergeArraysOfObjects([{a: 1}, {b: 1}], [{a: 2}, {c: 3}])).toEqual([{a: 2}, {b:1, c: 3}]);
  expect(mergeArraysOfObjects([{a: 1}, {b: 1}, {c: 1}], [{a: 2, d: 2}], [{a: 3}, {b: 3}])).toEqual([{a: 3, d: 2}, {b: 3}, {c: 1}]);
});
