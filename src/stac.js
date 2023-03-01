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
   * Check whether this given object is a STAC Collection of Collections (i.e. API Collections).
   * 
   * @returns {boolean} `true` if the object is a STAC CollectionCollection, `false` otherwise.
   */
  isCollectionCollection() {
    return false;
  }

  /**
   * Returns the type of the STAC object.
   * 
   * One of:
   * - Catalog
   * - Collection
   * - CollectionCollection
   * - Item
   * - ItemCollections
   * @returns {string}
   */
  getObjectType() {
    return this.type;
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
   * Returns a GeoJSON Feature or FeatureCollection for this STAC object.
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
    return null;
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
    return null;
  }

  /**
   * Returns the temporal extent(s) for the STAC entity.
   * 
   * @returns {Array.<Array.<Date|null>>}
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
   * Get the icons from the links in a STAC entity.
   * 
   * All URIs are converted to be absolute.
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
   * All links are converted to Asset objects.
   * All URIs are converted to be absolute.
   * 
   * @param {boolean} browserOnly - Return only images that can be shown in a browser natively (PNG/JPG/GIF/WEBP + HTTP/S).
   * @param {?string} prefer - If not `null` (default), prefers a role over the other. Either `thumbnail` or `overview`.
   * @returns {Array.<Asset>}
   */
  getThumbnails(browserOnly = true, prefer = null) {
    let thumbnails = this.getAssetsWithRoles(['thumbnail', 'overview'], true);
    if (prefer && thumbnails.length > 1) {
      thumbnails.sort(a => a.roles.includes(prefer) ? -1 : 1);
    }
    // Get from links only if no assets are available as they should usually be the same as in assets
    if (thumbnails.length === 0) {
      thumbnails = this.getLinksWithRels(['preview']).map(link => new Asset(link, null, this));
    }
    if (browserOnly) {
      // Remove all images that can't be displayed in a browser
      thumbnails = thumbnails.filter(img => img.canBrowserDisplayImage());
    }
    return thumbnails;
  }

  /**
   * Determines the default GeoTiff asset for visualization.
   * 
   * @param {boolean} httpOnly Return only GeoTiffs that can be accessed via HTTP(S)
   * @param {boolean} cogOnly Return only COGs
   * @returns {Asset} Default GeoTiff asset
   * @see {rankGeoTIFFs}
   */
  getDefaultGeoTIFF(httpOnly = true, cogOnly = false) {
    let scores = this.rankGeoTIFFs(httpOnly, cogOnly);
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
   * A function that can influence the score.
   * 
   * Returns a relative addition to the score.
   * Negative values subtract from the score.
   * 
   * @callback STAC~rankGeoTIFFs
   * @param {Asset} asset The asset to calculate the score for.
   */

  /**
   * Ranks the GeoTiff assets for visualization purposes.
   * 
   * The score factors can be found below:
   * - Roles/Keys (by default) - if multiple roles apply only the highest score is added:
   *   - overview => +3
   *   - thumbnail => +2
   *   - visual => +2
   *   - data => +1
   *   - none of the above => no change
   * - Other factors:
   *   - media type is COG: +2 (if cogOnly = false)
   *   - has RGB bands: +1
   *   - additionalCriteria: +/- a custom value
   * 
   * @param {boolean} httpOnly Return only GeoTiffs that can be accessed via HTTP(S)
   * @param {boolean} cogOnly Return only COGs
   * @param {Object.<string, integer>} roleScores Roles (and keys) considered for the scoring. They key is the role name, the value is the score. Higher is better. Defaults to the roles and scores detailed above. An empty object disables role-based scoring.
   * @param {STAC~rankGeoTIFFs} additionalCriteria A function to customize the score by adding/subtracting.
   * @returns {Array.<AssetScore>} GeoTiff assets sorted by score in descending order.
   */
  rankGeoTIFFs(httpOnly = true, cogOnly = false, roleScores = null, additionalCriteria = null) {
    if (!isObject(roleScores)) {
      roleScores = {
        data: 1, 
        visual: 2,
        thumbnail: 2,
        overview: 3
      };
    }
    let scores = [];
    let assets = this.getAssetsByTypes(geotiffMediaTypes);
    if (httpOnly) {
      assets = assets.filter(asset => asset.isHTTP() && (!cogOnly || asset.isCOG()));
    }
    let roles = Object.entries(roleScores);
    for(let asset of assets) {
      let score = 0;
      if (roles.length > 0) {
        let result = roles
          .filter(([role]) => asset.hasRole(role, true)) // Remove all roles that don't exist in the asset
          .map(([,value]) => value); // Map to the scores
        if (result.length > 0) {
          score += Math.max(...result); // Add the highest of the scores
        }
      }
      if (!cogOnly && asset.isCOG()) {
        score += 2;
      }
      if (asset.findVisualBands()) {
        score += 1;
      }
      if (typeof additionalCriteria === 'function') {
        score += additionalCriteria(asset);
      }

      scores.push({asset, score});
    }
    scores.sort((a,b) => b.score - a.score);
    return scores;
  }

  /**
   * The single-band assets for RGB composites.
   * 
  * @typedef {Object} VisualAssets
  * @property {BandWithIndex} red The red band with its index
  * @property {BandWithIndex} green The green band with its index
  * @property {BandWithIndex} blue The blue band with its index
  */

  /**
   * Find the single-band assets for RGB.
   * 
   * @returns {VisualAssets|null} Object with the RGB bands or null
   */
  findVisualAssets() {
    let rgb = {
      red: false,
      green: false,
      blue: false
    };
    let names = Object.keys(rgb);
    let assets = this.getAssets();
    for(let asset of assets) {
      let bands = asset.getBands();
      if (bands.length !== 1) {
        continue;
      }
      let result = asset.findBand(names, 'common_name', bands);
      if (result) {
        rgb[result.band.common_name] = asset;
      }
    }
    let complete = Object.values(rgb).every(o => Boolean(o));
    return complete ? rgb : null;
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
   * Returns all assets that contain at least one of the given roles.
   * 
   * @param {string|Array.<string>} roles One or more roles.
   * @param {boolean} includeKey Also returns `true` if the asset key equals to one of the given roles.
   * @returns {Array.<Asset>} The assets with the given roles.
   */
  getAssetsWithRoles(roles, includeKey = false) {
    return this.getAssets().filter(asset => asset.hasRole(roles, includeKey));
  }

  /**
   * 
   * @todo
   * @param {string} role 
   * @param {boolean} includeKey 
   * @returns {Asset|null}
   */
  getAssetWithRole(role, includeKey = false) {
    let assets = this.getAssetsWithRoles([role], includeKey);
    return assets[0] || null;
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
