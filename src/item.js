import Migrate from '@radiantearth/stac-migrate';
import STAC from './stac';
import { hasText } from './utils';

class Item extends STAC {
  
  constructor(data, absoluteUrl = null, migrate = true, updateVersionNumber = false) {
    if (migrate) {
      data = Migrate.item(data, null, updateVersionNumber);
    }

    super(data, absoluteUrl, false);
  }

  toGeoJSON() {
    return this.toJSON();
  }

  getBoundingBox() {
    return this.bbox || null;
  }

  getBoundingBoxes() {
    return [this.bbox];
  }

  getTemporalExtents() {
    if (hasText(this.properties.start_datetime) || hasText(this.properties.end_datetime)) {
      return [[this.properties.start_datetime || null, this.properties.end_datetime || null]];
    }
    else if (hasText(this.properties.datetime)) {
      return [[this.properties.datetime, this.properties.datetime]];
    }
    return [];
  }

  getMetadata(field) {
    return this.properties[field];
  }

}

export default Item;