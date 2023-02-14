import Migrate from '@radiantearth/stac-migrate';
import CatalogLike from './cataloglike';
import { hasText } from './utils';

class Collection extends CatalogLike {

  constructor(data, migrate = true) {
    if (migrate) {
      data = Migrate.collection(data, updateVersionNumber);
    }

    super(data);
  }

  getGeoJSON() {
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

  getTemporalExtent() {
    let extents = this.extent?.temporal?.interval;
    if (Array.isArray(extents) && extents.length > 0) {
      let extent = extents[0];
      if (Array.isArray(extent) && (hasText(extent[0]) || hasText(extent[1]))) {
        return extent;
      }
    }
    return null;
  }
  
}

export default Collection;