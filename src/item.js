import Migrate from '@radiantearth/stac-migrate';
import STAC from './stac';
import { hasText } from './utils';

class Item extends STAC {
  
  constructor(data, migrate = true) {
    if (migrate) {
      data = Migrate.catalog(data);
    }

    super(data, false);
  }

  getGeoJSON() {
    return this;
  }

  getBoundingBox() {
    return this.bbox || null;
  }

  getBoundingBoxes() {
    return [this.bbox];
  }

  getTemporalExtent() {
    if (hasText(this.start_datetime) || hasText(this.end_datetime)) {
      return [this.start_datetime, this.end_datetime];
    }
    else if (hasText(this.datetime)) {
      return this.datetime;
    }
    return null;
  }

  getMetadata(field) {
    return this.properties[field];
  }

}

export default Item;