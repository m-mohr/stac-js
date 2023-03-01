import STAC from './stac.js';

/**
 * Class for common parts of Catalogs and Collections.
 * 
 * Don't instantiate this class!
 * 
 * @class
 * @abstract
 * @param {Object} data The STAC Catalog or Collection object
 * @param {?string} absoluteUrl Absolute URL of the STAC Catalog or Collection
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 */
class CatalogLike extends STAC {

  constructor(data, absoluteUrl = null, keyMap = {}) {
    super(data, absoluteUrl, keyMap);
  }

  /**
   * Returns metadata from the Item properties for the given field name.
   * 
   * @param {string} field Field name
   * @returns {*} The value of the field
   */
  getMetadata(field) {
    return this[field];
  }

  /**
   * Returns the search link, if present.
   * 
   * If a specific method is provied, can exclude other methods from being returned.
   * 
   * @returns {Link|null} The search link
   */
  getSearchLink(method = null) {
    let links = this.getStacLinksWithRel('search');
    if (!method) {
      return links.find(link => link.method === method || (!method && !link.method)) || null;
    }
    else {
      return links[0] || null;
    }
  }

  /**
   * Returns the link for API collections, if present.
   * 
   * @returns {Link|null} The API collections link
   */
  getApiCollectionsLink() {
    return this.getStacLinkWithRel('data');
  }

  /**
   * Returns the link for API items, if present.
   * 
   * @returns {Link|null} The API items link
   */
  getApiItemsLink() {
    return this.getStacLinkWithRel('items');
  }

  /**
   * Returns all child links.
   * 
   * @returns {Array.<Link>} The child links
   */
  getChildLinks() {
    return this.getStacLinksWithRel('child');
  }

  /**
   * Returns all item links.
   * 
   * @returns {Array.<Link>} The child links
   */
  getItemLinks() {
    return this.getStacLinksWithRel('item');
  }

}

export default CatalogLike;
