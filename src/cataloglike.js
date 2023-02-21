import STAC from './stac';

class CatalogLike extends STAC {

  constructor(data, absoluteUrl = null) {
    super(data, absoluteUrl);
  }

  getMetadata(field) {
    return this[field];
  }

  getSearchLink(method = null) {
    let links = this.getStacLinksWithRel('search');
    if (!method) {
      return links.find(link => link.method === method || (!method && !link.method));
    }
    else {
      return links[0];
    }
  }

  getApiCollectionsLink() {
    return this.getStacLinkWithRel('data');
  }

  getApiItemsLink() {
    return this.getStacLinkWithRel('items');
  }

  getChildLinks() {
    return this.getStacLinksWithRel('child');
  }

  getItemLinks() {
    return this.getStacLinksWithRel('item');
  }

}

export default CatalogLike;
