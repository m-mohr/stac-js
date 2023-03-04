import STACHypermedia from './hypermedia.js';

/**
 * A STAC API Collection (i.e. an ItemCollection or a CollectionCollection)
 * 
 * You can access all properties of the given STAC Catalog object directly, e.g. `collection.links`.
 * 
 * Don't instantiate this class!
 * 
 * @abstract
 * @class APICollection
 * @param {Object} data The STAC API Collection object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Item Collection
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
class APICollection extends STACHypermedia {

  constructor(data, absoluteUrl = null, keyMap = {}, privateKeys = []) {
    super(data, absoluteUrl, keyMap, privateKeys);
  }

}

export default APICollection;
