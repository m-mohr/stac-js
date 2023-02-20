import { canBrowserDisplayImage, isMediaType } from '../src/mediatypes';
import { geotiffMediaTypes } from '../src/mediatypes';

test('canBrowserDisplayImage', () => {
  let link = type => ({href: 'example.jpg', type});

  expect(canBrowserDisplayImage(undefined)).toBeFalsy();
  expect(canBrowserDisplayImage(null)).toBeFalsy();
  expect(canBrowserDisplayImage("")).toBeFalsy();
  expect(canBrowserDisplayImage("image/jpeg")).toBeFalsy();
  expect(canBrowserDisplayImage(link(undefined))).toBeFalsy();
  expect(canBrowserDisplayImage(link("image/jpg"))).toBeFalsy();
  expect(canBrowserDisplayImage(link("image/bmp"))).toBeFalsy();
  expect(canBrowserDisplayImage(link("image/tiff"))).toBeFalsy();
  expect(canBrowserDisplayImage(link("png"))).toBeFalsy();
  expect(canBrowserDisplayImage(link("jpg"))).toBeFalsy();
  
  expect(canBrowserDisplayImage(link("image/gif"))).toBeTruthy();
  expect(canBrowserDisplayImage(link("image/jpeg"))).toBeTruthy();
  expect(canBrowserDisplayImage(link("image/apng"))).toBeTruthy();
  expect(canBrowserDisplayImage(link("image/png"))).toBeTruthy();
  expect(canBrowserDisplayImage(link("image/webp"))).toBeTruthy();
  expect(canBrowserDisplayImage(link("IMAGE/WEBP"))).toBeTruthy();

  expect(canBrowserDisplayImage({href: 'https://example.com/image.jpg'}, true)).toBeTruthy();
  expect(canBrowserDisplayImage({href: 'http://example.com/image.jpg'}, true)).toBeTruthy();
  expect(canBrowserDisplayImage({href: 'HTTP://EXAMPLE.COM/IMAGE.JPEG'}, true)).toBeTruthy();
  expect(canBrowserDisplayImage({href: './image.jpg'}, true)).toBeTruthy();

  expect(canBrowserDisplayImage({href: 'https://example.com/image.bmp'}, true)).toBeFalsy();
  expect(canBrowserDisplayImage({href: 's3://example.com/image.jpg'}, true)).toBeFalsy();

  expect(canBrowserDisplayImage(link(undefined), true)).toBeTruthy();
  expect(canBrowserDisplayImage(link("image/jpeg"), true)).toBeTruthy();

  expect(canBrowserDisplayImage(link(null), true)).toBeFalsy();
  expect(canBrowserDisplayImage(link(""), true)).toBeFalsy();
  expect(canBrowserDisplayImage(link("image/jpg"), true)).toBeFalsy();
  
});

test('isMediaType', () => {
  expect(isMediaType(undefined, geotiffMediaTypes)).toBeFalsy();
  expect(isMediaType("", geotiffMediaTypes)).toBeFalsy();
  expect(isMediaType("", geotiffMediaTypes)).toBeFalsy();
  expect(isMediaType("image/tiff", geotiffMediaTypes)).toBeFalsy();
  expect(isMediaType("image/tiff", [])).toBeFalsy();

  expect(isMediaType("image/png", "image/png")).toBeTruthy();
  expect(isMediaType("image/tiff; application=geotiff", geotiffMediaTypes)).toBeTruthy();
  // expect(isMediaType("image/tiff;application=geotiff", ["image/tiff; application=geotiff"])).toBeTruthy(); // todo: Should this work?

  expect(isMediaType(undefined, geotiffMediaTypes, true)).toBeTruthy();
});
