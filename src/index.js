import Catalog from './catalog';
import Collection from './collection';
import Item from './item';
import STAC from './stac';

export default function create(data, migrate = true) {
  if (data.type === 'Feature') {
    return new Item(data, migrate);
  }
  else if (data.type === 'Collection' || typeof data.extent !== 'undefined' || typeof data.license !== 'undefined') {
    return new Collection(data, migrate);
  }
  else {
    return new Catalog(data, migrate);
  }
}

export {
  Catalog,
  Collection,
  Item,
  STAC
};