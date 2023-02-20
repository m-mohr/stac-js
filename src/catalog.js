import Migrate from '@radiantearth/stac-migrate';
import CatalogLike from './cataloglike';

class Catalog extends CatalogLike {

  constructor(data, absoluteUrl = null, migrate = true, updateVersionNumber = false) {
    if (migrate) {
      data = Migrate.catalog(data, updateVersionNumber);
    }

    super(data, absoluteUrl);
  }

}

export default Catalog;