import Migrate from '@radiantearth/stac-migrate';
import { isGdalVfsUri } from './http';
import { canBrowserDisplayImage, isMediaType, stacMediaTypes } from './mediatypes';
import { hasText, isObject, mergeObjectArrays } from './utils';
import Asset from './asset';
import URI from 'urijs';

class STAC {

  constructor(data, absoluteUrl = null, migrate = true) {
    // Update to the latest version
    if (migrate) {
      data = Migrate.stac(data);
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

  getGeoJSON() {
    return null;
  }

  getBoundingBox() {
    return this.getBoundingBoxes()[0] || null;
  }

  getBoundingBoxes() {
    return [];
  }

  getTemporalExtent() {
    return null;
  }

  getSelfLink() {
    return this.getStacLinkWithRel('self');
  }

  getMetadata(/*field*/) {
    return;
  }

  getBands() {
    return mergeObjectArrays([
      this.getMetadata('eo:bands'),
      this.getMetadata('raster:bands')
    ]);
  }

  toAbsolute(obj, stringify = true) {
    let 
    // Convert vsicurl URLs to normal URLs
    if (typeof href === 'string' && href.startsWith('/vsicurl/')) {
      href = href.replace(/^\/vsicurl\//, '');
    }
    // Parse URL and make absolute, if required
    let uri = URI(href);
    if (this._url && uri.is("relative") && !isGdalVfsUri(href)) { // Don't convert GDAL VFS URIs: https://github.com/radiantearth/stac-browser/issues/116
      // Avoid that baseUrls that have a . in the last parth part will be removed (e.g. https://example.com/api/v1.0 )
      let baseUri = URI(this._url);
      let baseUriPath = baseUri.path();
      if (!baseUriPath.endsWith('/') && !baseUriPath.endsWith('.json')) {
        baseUri.path(baseUriPath + '/');
      }
      uri = uri.absoluteTo(baseUri);
    }
    // Normalize URL and remove trailing slash from path
    // to avoid handling the same resource twice
    uri.normalize();
    if (noParams) {
      uri.query("");
      uri.fragment("");
    }
    return stringify ? uri.toString() : uri;
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

  static isStacMediaType(type, allowEmpty = false) {
    return isMediaType(type, stacMediaTypes, allowEmpty);
  }

}

export default STAC;