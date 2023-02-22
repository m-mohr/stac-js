import { hasText } from "./utils";

/**
 * Parses a UTC-based ISO8601 date and time string to a Date object.
 * 
 * Does not support timezones as all STAC datetime must be given in UTC.
 * 
 * @returns {Date|null}
 */
export function isoToDate(str) {
  if (hasText(str) && str.length >= 10) {
    try {
      let strParts = str.match(/^(-?\d{1,})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)(?:\.(\d*))?(?:Z|[+-]00:00)?$/i);
      let dt = strParts.slice(1).map(n => parseInt(n, 10));
      return new Date(Date.UTC(dt[0], dt[1] - 1, dt[2], dt[3], dt[4], dt[5], dt[6] || 0));
    } catch(error) {
      return null;
    }
  }
  return null;
}

/**
 * Computes the center datetime between two datetimes.
 * 
 * @param {Date} start start datetime
 * @param {Date} end end datetime
 * @returns {Date} center datetime
 */
export function centerDateTime(start, end) {
  return new Date(start.valueOf() + ((end - start) / 2));
}
