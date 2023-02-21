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
 */
class STAC {

  constructor(data, absoluteUrl = null) {
    if (data instanceof STAC) {
      this._url = data._url;
      data = data.toJSON();
    }

    // Assign the data to the object
    for (let key in data) {
      if (typeof this[key] === 'undefined') {
        if (key === 'assets' || key === 'item_assets') {
          this[key] = {};
          for(let key2 in data[key]) {
            this[key][key2] = new Asset(data[key][key2], key2, this);
          }
        }
        else {
          this[key] = data[key];
        }
      }
    }

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
   * Gets the absolute URL of the STAC entity (if provided explicitly or available from the self link).
   * 
   * @returns {?string} Absolute URL
   */
  getAbsoluteUrl() {
    return this._url;
  }

  toGeoJSON() {
    return null;
  }

  getBoundingBox() {
    return this.getBoundingBoxes()[0] || null;
  }

  getBoundingBoxes() {
    return [];
  }

  getTemporalExtent() {
    return this.getTemporalExtents()[0] || null;
  }

  getTemporalExtents() {
    return [];
  }

  /**
   * Returns the self link, if present.
   * 
   * @returns {?Link} The self link
   */
  getSelfLink() {
    return this.getStacLinkWithRel('self');
  }

  getMetadata(/*field*/) {
    return;
  }

  getBands() {
    return mergeArraysOfObjects(this.getMetadata('eo:bands'), this.getMetadata('raster:bands'));
  }

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

  getIcons(allowEmpty = true) {
    return this.getLinksWithRels(['icon'])
      .filter(img => canBrowserDisplayImage(img, allowEmpty))
      .map(img => this.toAbsolute(img));
  }

  /**
   * Get the thumbnails from the assets and links in a STAC entity.
   * 
   * All URIs are converted to be absolute.
   * 
   * @param {boolean} browserOnly - Return only images that can be shown in a browser natively (PNG/JPG/GIF/WEBP + HTTP/S).
   * @param {?string} prefer - If not `null` (default), prefers a role over the other. Either `thumbnail` or `overview`.
   * @returns {Array.<Object>}
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

  getStacLinksWithRel(rel, allowUndefined = true) {
    return this.getLinksWithRels([rel])
      .filter(link => isStacMediaType(link.type, allowUndefined));
  }

  getStacLinkWithRel(rel, allowUndefined = true) {
    const links = this.getStacLinksWithRel(rel, allowUndefined);
    if (links.length > 0) {
      return links[0];
    }
    else {
      return null;
    }
  }

  getLinks() {
    return Array.isArray(this.links) ? this.links.filter(link => isObject(link) && hasText(link.href)) : [];
  }

  getLinkWithRel(rel) {
    return this.getLinks().find(link => link.rel === rel) || null;
  }

  getLinksWithRels(rels) {
    return this.getLinks().filter(link => rels.includes(link.rel));
  }

  getLinksWithOtherRels(rels) {
    return this.getLinks().filter(link => !rels.includes(link.rel));
  }

  getAssets() {
    if (!isObject(this.assets)) {
      return [];
    }
    return Object.values(this.assets);
  }

  getAssetsWithRoles(roles, includeKey = false) {
    return this.getAssets().filter(asset => asset.hasRole(roles) || (includeKey && roles.includes(asset.getKey())));
  }

  getAssetsByTypes(types) {
    return this.getAssets().filter(asset => isMediaType(asset.type, types));
  }

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

  toJSON() {
    let obj = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' || key === '_url') {
        return;
      }
      let v = this[key];
      if (key === 'assets' || key === 'item_assets') {
        let assets = {};
        Object.keys(v).forEach(key => assets[key] = v[key].toJSON());
        v = assets;
      }
      obj[key] = v;
    });
    return obj;
  }

}

export default STAC;
