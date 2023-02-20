import Migrate from '@radiantearth/stac-migrate';
import { toAbsolute } from './http';
import { canBrowserDisplayImage, isMediaType, stacMediaTypes } from './mediatypes';
import { hasText, isObject, mergeArraysOfObjects } from './utils';
import Asset from './asset';

class STAC {

  constructor(data, absoluteUrl = null, migrate = true, updateVersionNumber = false) {
    // Update to the latest version
    if (migrate) {
      data = Migrate.stac(data, updateVersionNumber);
    }

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
        if (key === 'assets') {
          this.assets = {};
          for(let key2 in data.assets) {
            this.assets[key2] = new Asset(data.assets[key2], this);
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
   * @returns 
   */
  getThumbnails(browserOnly = false, prefer = null) { // prefer can be either 
    let thumbnails = this.getAssetsWithRoles(['thumbnail', 'overview']);
    if (prefer && thumbnails.length > 1) {
      thumbnails.sort(a => a.roles.includes(prefer) ? -1 : 1);
    }
    // Get from links only if no assets are available as they should usually be the same as in assets
    if (thumbnails.length === 0) {
      thumbnails = this.getLinksWithRels(['preview']);
    }
    // Some old catalogs use just an asset key
    if (thumbnails.length === 0 && Utils.isObject(this.assets) && Utils.isObject(this.assets.thumbnail)) {
      thumbnails = [this.assets.thumbnail];
    }
    if (browserOnly) {
      // Remove all images that can't be displayed in a browser
      thumbnails = thumbnails.filter(img => canBrowserDisplayImage(img));
    }
    return thumbnails.map(img => this.toAbsolute(img));
  }

  getStacLinksWithRel(rel, allowEmpty = true) {
    return this.getLinksWithRels(this.links, [rel])
      .filter(link => STAC.isStacMediaType(link.type, allowEmpty));
  }

  getStacLinkWithRel(rel, allowEmpty = true) {
    const links = this.getStacLinksWithRel(rel, allowEmpty);
    if (links.length > 0) {
      return links[0];
    }
    else {
      return null;
    }
  }

  getLinkWithRel(rel) {
    return Array.isArray(this.links) ? this.links.find(link => isObject(link) && hasText(link.href) && link.rel === rel) : null;
  }

  getLinksWithRels(rels) {
    return Array.isArray(this.links) ? this.links.filter(link => isObject(link) && hasText(link.href) && rels.includes(link.rel)) : [];
  }

  getLinksWithOtherRels(rels) {
    return Array.isArray(this.links) ? this.links.filter(link => isObject(link) && hasText(link.href) && !rels.includes(link.rel)) : [];
  }

  getAssetsWithRoles(roles) {
    let matches = [];
    if (isObject(this.assets)) {
      for (let key in this.assets) {
        let asset = this.assets[key];
        if (isObject(asset) && hasText(asset.href) && Array.isArray(asset.roles) && asset.roles.find(role => roles.includes(role))) {
          matches.push(asset);
        }
      }
    }
    return matches;
  }

  equals(other) {
    if (!Utils.isObject(other)) {
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
      if (key === 'assets') {
        let assets = {};
        Object.keys(v).forEach(key => assets[key] = v[key].toJSON());
        v = assets;
      }
      obj[key] = v;
    });
    return obj;
  }

  static isStacMediaType(type, allowEmpty = false) {
    return isMediaType(type, stacMediaTypes, allowEmpty);
  }

}

export default STAC;