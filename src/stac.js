import { toAbsolute } from './http';
import { canBrowserDisplayImage, geotiffMediaTypes, isMediaType, isStacMediaType } from './mediatypes';
import { hasText, isObject, mergeArraysOfObjects } from './utils';
import Asset from './asset';

/**
 * Base class for STAC entities.
 * 
 * Don't instantiate this class!
 * 
 * @class STAC
 * @param {Object} data The STAC object
 * @param {?string} absoluteUrl Absolute URL of the STAC object
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 */
class STAC {

  constructor(data, absoluteUrl = null, keyMap = {}) {
    if (data instanceof STAC) {
      this._url = data._url;
      this._keyMap = data._keyMap;
      data = data.toJSON();
    }

    // Assign the data to the object
    for (let key in data) {
      if (typeof this[key] === 'undefined') {
        if (key in keyMap) {
          this[key] = keyMap[key](data[key], this);
        }
        else {
          this[key] = data[key];
        }
      }
    }

    // Map with functions that convert properties to stac-js objects
    this._keyMap = keyMap;

    // Set or detect the URL of the STAC entity
    if (!this._url) {
      this._url = absoluteUrl;
      if (!this._url) {
        let self = this.getSelfLink();
        if (self) {
          this._url = self.href;
        }
      }
    }
  }

  /**
   * Check whether this given object is a STAC Item.
   * 
   * @returns {boolean} `true` if the object is a STAC Item, `false` otherwise.
   */
  isItem() {
    return this.type === 'Feature';
  }

  /**
   * Check whether this given object is a STAC Catalog.
   * 
   * @returns {boolean} `true` if the object is a STAC Catalog, `false` otherwise.
   */
  isCatalog() {
    return this.type === 'Catalog';
  }

  /**
   * Check whether this given object is "catalog-like", i.e. a Catalog or Collection.
   * 
   * @returns {boolean} `true` if the object is a "catalog-like", `false` otherwise.
   */
  isCatalogLike() {
    return this.isCatalog() || this.isCollection();
  }

  /**
   * Check whether this given object is a STAC Collection.
   * 
   * @returns {boolean} `true` if the object is a STAC Collection, `false` otherwise.
   */
  isCollection() {
    return this.type === 'Collection';
  }

  /**
   * Check whether this given object is a STAC ItemCollection.
   * 
   * @returns {boolean} `true` if the object is a STAC ItemCollection, `false` otherwise.
   */
  isItemCollection() {
    return this.type === 'FeatureCollection';
  }

  /**
   * Gets the absolute URL of the STAC entity (if provided explicitly or available from the self link).
   * 
   * @returns {string|null} Absolute URL
   */
  getAbsoluteUrl() {
    return this._url;
  }

  /**
   * Sets the absolute URL of the STAC entity.
   * 
   * @param {string} url Absolute URL
   */
  setAbsoluteUrl(url) {
    this._url = url;
  }

  /**
   * Returns a GeoJSON object for this STAC object.
   * 
   * @returns {Object|null} GeoJSON object or `null`
   */
  toGeoJSON() {
    return null;
  }

  /**
   * Returns a single bounding box for the STAC entity.
   * 
   * @returns {BoundingBox|null}
   */
  getBoundingBox() {
    return this.getBoundingBoxes()[0] || null;
  }

  /**
   * Returns a list of bounding boxes for the STAC entity.
   * 
   * @returns {Array.<BoundingBox>}
   */
  getBoundingBoxes() {
    return [];
  }

  /**
   * Returns a single temporal extent for the STAC entity.
   * 
   * @returns {Array.<Date|null>|null}
   */
  getTemporalExtent() {
    return this.getTemporalExtents()[0] || null;
  }

  /**
   * Returns the temporal extent(s) for the STAC entity.
   * 
   * @returns {Array.<Array.<string|null>>}
   */
  getTemporalExtents() {
    return [];
  }

  /**
   * Returns the self link, if present.
   * 
   * @returns {Link|null} The self link
   */
  getSelfLink() {
    return this.getStacLinkWithRel('self');
  }

  /**
   * Returns the root link, if present.
   * 
   * @returns {Link|null} The root link
   */
  getRootLink() {
    return this.getStacLinkWithRel('root');
  }

  /**
   * Returns the parent link, if present.
   * 
   * @returns {Link|null} The parent link
   */
  getParentLink() {
    return this.getStacLinkWithRel('parent');
  }

  /**
   * Returns the metadata for the STAC entity.
   * 
   * @param {string} field Field name
   * @returns {*}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  getMetadata(field) {
    return undefined;
  }

  /**
   * Returns the bands.
   * 
   * This is usually a merge of eo:bands and raster:bands.
   * 
   * @returns {Array.<Object>}
   */
  getBands() {
    return mergeArraysOfObjects(this.getMetadata('eo:bands'), this.getMetadata('raster:bands'));
  }

  /**
   * 
   * @todo
   * @param {Link|Asset} obj 
   * @param {boolean} stringify 
   * @returns {Link|Asset}
   */
  toAbsolute(obj, stringify = true) {
    if (obj instanceof Asset) {
      // Clone so that we don't alter the href in the original object
      obj = new Asset(obj);
    }
    else {
      obj = Object.assign({}, obj);
    }
    obj.href = toAbsolute(obj.href, this._url, stringify);
    return obj;
  }

  /**
   * 
   * @todo
   * @param {boolean} allowUndefined 
   * @returns {Array.<Link>}
   */
  getIcons(allowUndefined = true) {
    return this.getLinksWithRels(['icon'])
      .filter(img => canBrowserDisplayImage(img, allowUndefined))
      .map(img => this.toAbsolute(img));
  }

  /**
   * Get the thumbnails from the assets and links in a STAC entity.
   * 
   * All URIs are converted to be absolute.
   * 
   * @param {boolean} browserOnly - Return only images that can be shown in a browser natively (PNG/JPG/GIF/WEBP + HTTP/S).
   * @param {?string} prefer - If not `null` (default), prefers a role over the other. Either `thumbnail` or `overview`.
   * @returns {Array.<Asset|Link>}
   */
  getThumbnails(browserOnly = true, prefer = null) {
    let thumbnails = this.getAssetsWithRoles(['thumbnail', 'overview'], true);
    if (prefer && thumbnails.length > 1) {
      thumbnails.sort(a => a.roles.includes(prefer) ? -1 : 1);
    }
    // Get from links only if no assets are available as they should usually be the same as in assets
    if (thumbnails.length === 0) {
      thumbnails = this.getLinksWithRels(['preview']);
    }
    if (browserOnly) {
      // Remove all images that can't be displayed in a browser
      thumbnails = thumbnails.filter(img => canBrowserDisplayImage(img));
    }
    return thumbnails.map(img => this.toAbsolute(img));
  }

  /**
   * Determines the default GeoTiff asset for visualization.
   * 
   * @returns {Asset} Default GeoTiff asset
   * @see {rankGeoTIFFs}
   */
  getDefaultGeoTIFF(httpOnly = true) {
    let scores = this.rankGeoTIFFs(httpOnly);
    return scores[0]?.asset;
  }

  /**
   * Object with an asset and the corresponding score.
   * 
   * @typedef {Object} AssetScore
   * @property {Asset} asset
   * @property {integer} score
   */

  /**
   * Ranks the GeoTiff assets for visualization purposes.
   * 
   * The score factors can be found below:
   * - Roles:
   *   - overview => 3
   *   - thumbnail => 2
   *   - visual => 1
   *   - data => 0
   *   - none of the above => -1
   * - Other factors:
   *   - media type is COG: +2
   *   - has RGB bands: +1
   * @param {boolean} httpOnly Return only GeoTiffs that can be accessed via HTTP(S)
   * @returns {Array.<AssetScore>} GeoTiff assets sorted by score in descending order.
   */
  rankGeoTIFFs(httpOnly = true) {
    let scores = [];
    let assets = this.getAssetsByTypes(geotiffMediaTypes);
    if (httpOnly) {
      assets = assets.filter(asset => asset.isHTTP());
    }
    let rolePrio = ["data", "visual", "thumbnail", "overview"]; // low to high
    for(let asset of assets) {
      let score = rolePrio.findIndex(role => Array.isArray(asset.roles) && asset.roles.includes(role));
      if (asset.isCOG()) {
        score += 2;
      }
      if (asset.findVisualBands()) {
        score += 1;
      }
      scores.push({asset, score});
    }
    scores.sort((a,b) => b.score - a.score);
    return scores;
  }

  /**
   * 
   * @todo
   * @param {string} rel 
   * @param {boolean} allowUndefined 
   * @returns {Array.<Link>}
   */
  getStacLinksWithRel(rel, allowUndefined = true) {
    return this.getLinksWithRels([rel])
      .filter(link => isStacMediaType(link.type, allowUndefined));
  }

  /**
   * 
   * @todo
   * @param {string} rel 
   * @param {boolean} allowUndefined 
   * @returns {Link} 
   */
  getStacLinkWithRel(rel, allowUndefined = true) {
    const links = this.getStacLinksWithRel(rel, allowUndefined);
    if (links.length > 0) {
      return links[0];
    }
    else {
      return null;
    }
  }
  
  /**
   * 
   * @todo
   * @returns {Array.<Link>}
   */
  getLinks() {
    return Array.isArray(this.links) ? this.links.filter(link => isObject(link) && hasText(link.href)) : [];
  }

  /**
   * 
   * @todo
   * @param {string} rel 
   * @returns {Link} 
   */
  getLinkWithRel(rel) {
    return this.getLinks().find(link => link.rel === rel) || null;
  }

  /**
   * 
   * @todo
   * @param {Array.<string>} rels 
   * @returns {Array.<Link>} 
   */
  getLinksWithRels(rels) {
    return this.getLinks().filter(link => rels.includes(link.rel));
  }

  /**
   * 
   * @todo
   * @param {Array.<string>} rels 
   * @returns {Array.<Link>} 
   */
  getLinksWithOtherRels(rels) {
    return this.getLinks().filter(link => !rels.includes(link.rel));
  }

  /**
   * 
   * @todo
   * @returns {Array.<Asset>}
   */
  getAssets() {
    if (!isObject(this.assets)) {
      return [];
    }
    return Object.values(this.assets);
  }

  /**
   * 
   * @todo
   * @param {Array.<string>} roles 
   * @param {boolean} includeKey 
   * @returns {Array.<Asset>}
   */
  getAssetsWithRoles(roles, includeKey = false) {
    return this.getAssets().filter(asset => asset.hasRole(roles) || (includeKey && roles.includes(asset.getKey())));
  }

  /**
   * 
   * @todo
   * @param {Array.<string>} types 
   * @returns {Array.<Asset>}
   */
  getAssetsByTypes(types) {
    return this.getAssets().filter(asset => isMediaType(asset.type, types));
  }

  /**
   * 
   * @todo
   * @param {*} other 
   * @returns {boolean}
   */
  equals(other) {
    if (!isObject(other)) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (this.id === other.id && this.type == other.type) {
      return true;
    }
    return false;
  }

  /**
   * Returns a plain object for JSON export.
   * 
   * @returns {Object} Plain object
   */
  toJSON() {
    let obj = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' || key === '_url' || key === '_keyMap') {
        return;
      }
      let v = this[key];
      if (key in this._keyMap) {
        let v2 = Array.isArray(v) ? [] : {};
        for(let key in v) {
          v2[key] = v[key].toJSON();
        }
        v = v2;
      }
      obj[key] = v;
    });
    return obj;
  }

}

export default STAC;
