# stac-js

Simple drop-in JavaScript classes with utilities for working with data from STAC objects in a read-only manner.
It is basically just a wrapper/facade on top of a single STAC object deserialized from JSON.
It doesn't handle relationships between files, actually this library is completely unaware of any files and doesn't even handle loading them from HTTP or a file system.
As such the library works in principle both in the browser and in NodeJS.
This library won't help you if you want to create or update a STAC catalog (like PySTAC would).

- **Package version:** 0.1.0
- **STAC versions:** >= 0.6.0 (through [stac-migrate](https://github.com/stac-utils/stac-migrate)).
- **Documentation:** <https://m-mohr.github.io/stac-js/latest/>

## Usage

Automatically instantiate the right class through the factory:
```js
import create from 'stac-js';

const stac = {
  stac_version: "1.0.0",
  type: "Collection",
  id: "example",
  // ...
};
const obj = create(stac); // Migrates data to the latest version
```

Directly instantiate through the class constructors:
```js
import { Collection } from 'stac-js'; // or Catalog or Item

const stac = {
  stac_version: "1.0.0",
  type: "Collection",
  id: "example",
  // ...
};
const obj = new Collection(stac); // Does NOT migrate to the latest version
```

You can then use the object, check whether it's STAC and call some methods, for example:
```js
import { STAC } from 'stac-js';

if (obj instanceof STAC) {
  obj.isCollection();
  obj.getBoundingBox();
  obj.getTemporalExtent();
  obj.getThumbnails();
  obj.getItemLinks();
  obj.getDefaultGeoTIFF();
  // ...
}
```

The classes are drop-in replacements, which means you can still access the objects as before:
```js
console.log(stac.id === obj.id);
```

**Note:** This library is purely written based on ES6 classes and doesn't do any transpiling etc.
If you use this library, your environment either needs to support ES6 classes or you need to take measures yourself to transpile back to whatever is supported by your environment (e.g. through Babel for the browser).
