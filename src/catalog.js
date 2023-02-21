import CatalogLike from './cataloglike';

/**
 * A STAC Catalog.
 * 
 * You can access all properties of the given STAC Catalog object directly, e.g. `catalog.title`.
 * 
 * @class
 * @param {Object} data The STAC Catalog object
 * @param {?string} absoluteUrl Absolute URL of the STAC Catalog
 */
class Catalog extends CatalogLike {

  constructor(data, absoluteUrl = null) {
    super(data, absoluteUrl);
  }

}

export default Catalog;
