import { toAbsolute } from './http';
import { canBrowserDisplayImage, geotiffMediaTypes, isMediaType, isStacMediaType } from './mediatypes';
import { hasText, isObject, mergeArraysOfObjects } from './utils';
import Asset from './asset';

class STAC {

  constructor(data, absoluteUrl = null) {
    // Set or detect the URL of the STAC entity
    this._url = absoluteUrl;
    if (!this._url) {
      let self = this.getSelfLink();
      if (self) {
        this._url = self.href;
      }
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
  }

  isItem() {
    return this.type === 'Feature';
  }

  isCatalog() {
    return this.type === 'Catalog';
  }

  isCatalogLike() {
    return this.isCatalog() || this.isCollection();
  }

  isCollection() {
    return this.type === 'Collection';
  }

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

  getSelfLink() {
    return this.getStacLinkWithRel('self');
  }

  getMetadata(/*field*/) {
    return;
  }

  getBands() {
    return mergeArraysOfObjects([
      this.getMetadata('eo:bands'),
      this.getMetadata('raster:bands')
    ]);
  }

  toAbsolute(obj, stringify = true) {
    return toAbsolute(obj, this._url, stringify);
  }

  getIcons(allowEmpty = true) {
    return this.getLinksWithRels(['icon'])
      .filter(img => canBrowserDisplayImage(img, allowEmpty))
      .map(img => this.toAbsolute(img));
  }

  /**
   * Get the thumbnails from the assets and links in a STAC entity.
   * 
   * @param {boolean} browserOnly - Return only images that can be shown in a browser natively (PNG/JPG/GIF/WEBP).
   * @param {?string} prefer - If not `null` (default), prefers a role over the other. Either `thumbnail` or `overview`.
   * @returns {Array.<object>}
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
   * @returns {Asset}
   */
  getDefaultGeoTiff() {
    let scores = this.rankGeoTiffs();
    return scores[0]?.asset;
  }

  rankGeoTiffs() {
    // Score calculation:
    // 
    // Roles:
    // - overview => 3
    // - thumbnail => 2
    // - visual => 1
    // - data => 0
    // - none of the above => -1
    // 
    // Media Type => COG: +2
    // Has RGB bands => +1

    let scores = [];
    let assets = this.getAssetsByTypes(geotiffMediaTypes).map(asset => this.toAbsolute(asset));
    let rolePrio = ["data", "visual", "thumbnail", "overview"]; // low to high
    for(let asset of assets) {
      let score = rolePrio.findIndex(role => asset.roles.includes(role));
      if (asset.isCOG()) {
        score += 2;
      }
      if (asset.findVisualBands()) {
        score += 1;
      }
      scores.push({asset, score});
    }
    scores.sort((a,b) => a.score - b.score);
    return scores;
  }

  getStacLinksWithRel(rel, allowUndefined = true, absolute = true) {
    return this.getLinksWithRels([rel], absolute)
      .filter(link => isStacMediaType(link.type, allowUndefined))
      .map(link => absolute ? this.toAbsolute(link) : link);
  }

  getStacLinkWithRel(rel, allowUndefined = true, absolute = true) {
    const links = this.getStacLinksWithRel(rel, allowUndefined, absolute);
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
