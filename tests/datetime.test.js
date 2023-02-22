import { isoToDate } from "../src/datetime";

test('isoToDate', () => {
  const dt = (...x) => new Date(Date.UTC(...x));
  expect(isoToDate()).toBeNull();
  expect(isoToDate(null)).toBeNull();
  expect(isoToDate(2020)).toBeNull();
  expect(isoToDate("2020")).toBeNull();
  expect(isoToDate("2020-01-01")).toBeNull();
  expect(isoToDate("2020-01-01Tboo")).toBeNull();
  expect(isoToDate("2020-01-01T12:13:14.5+07:00")).toBeNull();

  expect(isoToDate("2020-01-01T12:13:14Z")).toEqual(dt(2020, 0, 1, 12, 13, 14));
  expect(isoToDate("2020-01-01T12:13:14.Z")).toEqual(dt(2020, 0, 1, 12, 13, 14));
  expect(isoToDate("2020-01-01T12:13:14.5Z")).toEqual(dt(2020, 0, 1, 12, 13, 14, 5));
  expect(isoToDate("2020-01-01T12:13:14.523+00:00")).toEqual(dt(2020, 0, 1, 12, 13, 14, 523));

  // These is not valid according to the spec, but let's be gentle...
  expect(isoToDate("1990-12-01T23:59:59")).toEqual(dt(1990, 11, 1, 23, 59, 59));
});
