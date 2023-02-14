import { hasText } from '../src/utils';

test('hasText', () => {
  expect(hasText(undefined)).toBeFalsy();
  expect(hasText(null)).toBeFalsy();
  expect(hasText({})).toBeFalsy();
  expect(hasText(["a"])).toBeFalsy();
  expect(hasText(123)).toBeTruthy();
  expect(hasText("")).toBeFalsy();
  expect(hasText("a")).toBeTruthy();
  expect(hasText("123")).toBeTruthy();
});
