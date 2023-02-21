import { isGdalVfsUri, toAbsolute } from '../src/http';

test('isGdalVfsUri', () => {
  expect(isGdalVfsUri(null)).toBeFalsy();
  expect(isGdalVfsUri("")).toBeFalsy();
  expect(isGdalVfsUri("/vsicurl/example")).toBeFalsy();
  expect(isGdalVfsUri("http://example.com/vsis3/example")).toBeFalsy();

  expect(isGdalVfsUri("/vsis3/example")).toBeTruthy();
});

test('toAbsolute', () => {
  expect(toAbsolute("./example.gif", "https://x.com/catalog.json")).toBe("https://x.com/example.gif");
  expect(toAbsolute("./", "https://x.com/catalog.json")).toBe("https://x.com/");
  expect(toAbsolute("/api/example.gif", "https://x.com/api")).toBe("https://x.com/api/example.gif");
  // expect(toAbsolute("./example.gif", "https://x.com/api")).toBe("https://x.com/api/example.gif");
  expect(toAbsolute("./example.gif", "https://x.com/api")).toBe("https://x.com/api/example.gif");
  expect(toAbsolute("./example.gif", "https://x.com/api/")).toBe("https://x.com/api/example.gif");
  expect(toAbsolute("./example.gif", "https://x.com/catalog.json/")).toBe("https://x.com/catalog.json/example.gif");
  expect(toAbsolute("http://y.de/test", "https://x.com/catalog.json")).toBe("http://y.de/test");
  expect(toAbsolute("/vsicurl/http://y.de/test", "https://x.com/catalog.json")).toBe("http://y.de/test");
  // todo
});

