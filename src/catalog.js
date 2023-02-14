import Migrate from '@radiantearth/stac-migrate';
import CatalogLike from './cataloglike';

class Catalog extends CatalogLike {

  constructor(data, migrate = true) {
    if (migrate) {
      data = Migrate.catalog(data);
    }

    super(data);
  }

}

export default Catalog;