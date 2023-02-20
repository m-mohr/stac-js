import Migrate from '@radiantearth/stac-migrate';
import CatalogLike from './cataloglike';
import { hasText } from './utils';

class Collection extends CatalogLike {

  constructor(data, absoluteUrl = null, migrate = true, updateVersionNumber = false) {
    if (migrate) {
      data = Migrate.collection(data, updateVersionNumber);
    }

    super(data, absoluteUrl);
  }

  toGeoJSON() {
    throw new Error("Not implemented yet");
  }

  getBoundingBox() {
    return this.getBoundingBoxes()[0] || null;
  }

  getBoundingBoxes() {
    let extents = this.extent?.spatial?.bbox;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents.filter(extent => Array.isArray(extent) && extent.length >= 4);
    }
    return [];
  }

  getTemporalExtents() {
    let extents = this.extent?.temporal?.interval;
    if (Array.isArray(extents) && extents.length > 0) {
      return extents.filter(extent => Array.isArray(extent) && (hasText(extent[0]) || hasText(extent[1])));
    }
    return [];
  }
  
}

export default Collection;