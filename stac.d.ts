/**
 * Checks whether a variable is a string and contains at least one character.
 *
 * @param {*} string - A variable to check.
 * @returns {boolean} - `true` is the given variable is an string with length > 0, `false` otherwise.
 */
export function hasText(string: any): boolean;
/**
 * Checks whether a variable is a real object or not.
 *
 * This is a more strict version of `typeof x === 'object'` as this example would also succeeds for arrays and `null`.
 * This function only returns `true` for real objects and not for arrays, `null` or any other data types.
 *
 * @param {*} obj - A variable to check.
 * @returns {boolean} - `true` is the given variable is an object, `false` otherwise.
 */
export function isObject(obj: any): boolean;
/**
 * Merges any number of arrays of objects.
 *
 * @param  {...Array.<Object>} bands
 * @returns {Array.<Object>}
 */
export function mergeArraysOfObjects(...bands: Array<any>[]): Array<any>;
/**
 * Get minimum values for the STAC data types.
 *
 * Currently only supports int types.
 *
 * @private
 * @todo Add float support
 * @param {string} str Data type
 * @returns {number|null} Minimum value
 */
export function getMinForDataType(str: string): number | null;
/**
 * Get maximum values for the STAC data types.
 *
 * Currently only supports int types.
 *
 * @private
 * @todo Add float support
 * @param {string} str Data type
 * @returns {number|null} Maximum value
 */
export function getMaxForDataType(str: string): number | null;
/**
 * Base class for STAC objects.
 *
 * Don't instantiate this class!
 *
 * @abstract
 * @class STACObject
 * @param {Object} data The STAC object
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class STACObject {
    constructor(data: any, keyMap?: {}, privateKeys?: any[]);
    _keyMap: {};
    _privateKeys: string[];
    /**
     * Check whether this given object is a STAC Item.
     *
     * @returns {boolean} `true` if the object is a STAC Item, `false` otherwise.
     */
    isItem(): boolean;
    /**
     * Check whether this given object is a STAC Catalog.
     *
     * @returns {boolean} `true` if the object is a STAC Catalog, `false` otherwise.
     */
    isCatalog(): boolean;
    /**
     * Check whether this given object is "catalog-like", i.e. a Catalog or Collection.
     *
     * @returns {boolean} `true` if the object is a "catalog-like", `false` otherwise.
     */
    isCatalogLike(): boolean;
    /**
     * Check whether this given object is a STAC Collection.
     *
     * @returns {boolean} `true` if the object is a STAC Collection, `false` otherwise.
     */
    isCollection(): boolean;
    /**
     * Check whether this given object is a STAC ItemCollection.
     *
     * @returns {boolean} `true` if the object is a STAC ItemCollection, `false` otherwise.
     */
    isItemCollection(): boolean;
    /**
     * Check whether this given object is a STAC Collection of Collections (i.e. API Collections).
     *
     * @returns {boolean} `true` if the object is a STAC CollectionCollection, `false` otherwise.
     */
    isCollectionCollection(): boolean;
    /**
     * Check whether this given object is a STAC Asset.
     *
     * @returns {boolean} `true` if the object is a STAC Asset, `false` otherwise.
     */
    isAsset(): boolean;
    /**
     * Check whether this given object is a STAC LInk.
     *
     * @returns {boolean} `true` if the object is a STAC Link, `false` otherwise.
     */
    isLink(): boolean;
    /**
     * Returns the type of the STAC object.
     *
     * One of:
     * - Asset
     * - Catalog
     * - Collection
     * - CollectionCollection
     * - Item
     * - ItemCollection
     * - Link
     * @returns {string}
     */
    getObjectType(): string;
    /**
     * Gets the absolute URL of the STAC entity (if provided explicitly or available from the self link).
     *
     * @returns {string|null} Absolute URL
     */
    getAbsoluteUrl(): string | null;
    /**
     * Returns the metadata for the STAC entity.
     *
     * @param {string} field Field name
     * @returns {*}
     * @abstract
     */
    getMetadata(field: string): any;
    /**
     * Returns a GeoJSON Feature or FeatureCollection for this STAC object.
     *
     * @returns {Object|null} GeoJSON object or `null`
     */
    toGeoJSON(): any | null;
    /**
     * Returns a single bounding box for the STAC entity.
     *
     * @returns {BoundingBox|null}
     */
    getBoundingBox(): BoundingBox | null;
    /**
     * Returns a list of bounding boxes for the STAC entity.
     *
     * @returns {Array.<BoundingBox>}
     */
    getBoundingBoxes(): Array<BoundingBox>;
    /**
     * Returns a plain object for JSON export.
     *
     * @returns {Object} Plain object
     */
    toJSON(): any;
}
/**
 * Checks whether a URI is a GDAL Virtual Filesystem URI.
 *
 * Such an URI usually starts with `/vsi` (except for `/vsicurl/`).
 *
 * @param {string} href
 * @returns {boolean} `true` if an GDAL Virtual Filesystem URI, `false` otherwise.
 */
export function isGdalVfsUri(href: string): boolean;
/**
 *
 * @todo
 * @param {string} href
 * @param {string} baseUrl
 * @param {boolean} stringify
 * @returns {string|URI}
 */
export function toAbsolute(href: string, baseUrl: string, stringify?: boolean): string | URI;
/**
 *
 * @todo
 * @param {string} href
 * @param {string|null} baseUrl
 * @param {boolean} noParams
 * @param {boolean} stringify
 * @returns {string|URI}
 */
export function normalizeUri(href: string, baseUrl?: string | null, noParams?: boolean, stringify?: boolean): string | URI;
/**
 * Protocols supported by browsers (http and https).
 *
 * @type {Array.<string>}
 */
export const browserProtocols: Array<string>;
/**
 * A STAC reference as base for Assets and Links.
 *
 * Don't instantiate this class!
 *
 * @abstract
 * @class STACReference
 * @param {Object} data The STAC API Collection object
 * @param {STAC|null} context The object that contains the link
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class STACReference extends STACObject {
    constructor(data: any, context?: any, keyMap?: {}, privateKeys?: any[]);
    _context: any;
    /**
     * Gets the URL of the reference as absolute URL.
     *
     * @param {boolean} stringify
     * @returns {string|null}
     */
    getAbsoluteUrl(stringify?: boolean): string | null;
    /**
     * Returns the STAC entity that contains the reference.
     *
     * @returns {STAC|null}
     */
    getContext(): STAC | null;
}
/**
 * A STAC Link object.
 *
 * You can access all properties of the given STAC Link object directly, e.g. `link.href`.
 *
 * @class Link
 * @param {Object|Link} data The STAC Link object
 * @param {STAC|null} context The object that contains the link
 */
export class Link extends STACReference {
    /**
     * Converts an array of STAC Links into an array of stac-js Links.
     *
     * @param {Array.<Object>} links Links
     * @param {STAC|null} context The object that contains the links
     * @returns {Array.<Link>} Improved Links
     */
    static fromLinks(links: Array<any>, context?: STAC | null): Array<Link>;
    constructor(data: any, context?: any);
}
/**
 * Checks whether a given media type is in the list of media types.
 *
 * @param {string|undefined} type The potential media type.
 * @param {string|Array.<string>} allowedTypes A list of allowed media types (or a single media type as string).
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if the media type is allowed, `false` otherwise.
 */
export function isMediaType(type: string | undefined, allowedTypes: string | Array<string>, allowUndefined?: boolean): boolean;
/**
 * Checks whether the given media type is a STAC media type (JSON or GeoJSON).
 *
 * @param {string|undefined} type The potential media type.
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if the media type is a STAC media type, `false` otherwise.
 */
export function isStacMediaType(type: string | undefined, allowUndefined?: boolean): boolean;
/**
 * Checks whether a given Link or Asset object can be displayed by a browser.
 *
 * A browser can usually display an image if it is a specific file format (e.g. JPEG, PNG, ...) and is served over HTTP(S).
 *
 * @param {Link|Asset} img The potential image as Link or Asset object.
 * @param {boolean} allowUndefined If set to `true`, returns `true` if `undefined` is passed as `type`.
 * @returns {boolean} `true` if a browser can display the given thing, `false` otherwise.
 */
export function canBrowserDisplayImage(img: Link | Asset, allowUndefined?: boolean): boolean;
/**
 * The GeoJSON media type.
 *
 * @type {string}
 */
export const geojsonMediaType: string;
/**
 * All STAC media types (JSON + GeoJSON).
 *
 * @type {Array.<string>}
 */
export const stacMediaTypes: Array<string>;
/**
 * All image media types that Web Browsers can show (GIF, JPEG, PNG, WebP).
 *
 * @type {Array.<string>}
 */
export const browserImageTypes: Array<string>;
/**
 * All Cloud Optimized GeoTiff media types.
 *
 * @type {Array.<string>}
 */
export const cogMediaTypes: Array<string>;
/**
 * All GeoTiff media types (including COG media types).
 *
 * @type {Array.<string>}
 */
export const geotiffMediaTypes: Array<string>;
/**
 * All image media types combined (Web Browser + GeoTiff).
 *
 * @type {Array.<string>}
 */
export const imageMediaTypes: Array<string>;
/**
 * STAC Hypermedia class for STAC objects.
 *
 * Don't instantiate this class!
 *
 * @abstract
 * @class STACHypermedia
 * @param {Object} data The STAC object
 * @param {string|null} absoluteUrl Absolute URL of the STAC object
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class STACHypermedia extends STACObject {
    constructor(data: any, absoluteUrl?: any, keyMap?: {}, privateKeys?: any[]);
    _url: any;
    /**
     * Sets the absolute URL of the STAC entity.
     *
     * @param {string} url Absolute URL
     */
    setAbsoluteUrl(url: string): void;
    /**
     *
     * @todo
     * @param {string} rel
     * @param {boolean} allowUndefined
     * @returns {Array.<Link>}
     */
    getStacLinksWithRel(rel: string, allowUndefined?: boolean): Array<Link>;
    /**
     *
     * @todo
     * @param {string} rel
     * @param {boolean} allowUndefined
     * @returns {Link}
     */
    getStacLinkWithRel(rel: string, allowUndefined?: boolean): Link;
    /**
     *
     * @todo
     * @returns {Array.<Link>}
     */
    getLinks(): Array<Link>;
    /**
     *
     * @todo
     * @param {string} rel
     * @returns {Link}
     */
    getLinkWithRel(rel: string): Link;
    /**
     *
     * @todo
     * @param {Array.<string>} rels
     * @returns {Array.<Link>}
     */
    getLinksWithRels(rels: Array<string>): Array<Link>;
    /**
     *
     * @todo
     * @param {Array.<string>} rels
     * @returns {Array.<Link>}
     */
    getLinksWithOtherRels(rels: Array<string>): Array<Link>;
    /**
     * Returns the self link, if present.
     *
     * @returns {Link|null} The self link
     */
    getSelfLink(): Link | null;
    /**
     * Returns the root link, if present.
     *
     * @returns {Link|null} The root link
     */
    getRootLink(): Link | null;
    /**
     * Returns the parent link, if present.
     *
     * @returns {Link|null} The parent link
     */
    getParentLink(): Link | null;
}
/**
 * A STAC API Collection (i.e. an ItemCollection or a CollectionCollection)
 *
 * You can access all properties of the given STAC Catalog object directly, e.g. `collection.links`.
 *
 * Don't instantiate this class!
 *
 * @abstract
 * @class APICollection
 * @param {Object} data The STAC API Collection object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Item Collection
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class APICollection extends STACHypermedia {
}
/**
 * A STAC Asset or Item Asset Definition.
 *
 * You can access all properties of the given STAC Asset object directly, e.g. `asset.href`.
 *
 * @class Asset
 * @param {Object|Asset} data The STAC Asset object
 * @param {string} key The asset key
 * @param {Collection|Item|null} context The object that contains the asset
 */
export class Asset extends STACReference {
    /**
     * Converts an object of STAC Assets into an object of stac-js Assets.
     *
     * @param {Object.<string, Object>} assets Assets
     * @param {Collection|Item|null} context The object that contains the assets
     * @returns {Object.<string, Asset>} Improved Assets
     */
    static fromAssets(assets: {
        [x: string]: any;
    }, context?: Collection | Item | null): {
        [x: string]: Asset;
    };
    constructor(data: any, key?: any, context?: any);
    _key: any;
    /**
     * Returns the key of the asset.
     *
     * @returns {string|null} Key of the asset
     */
    getKey(): string | null;
    /**
     * Checks whether the asset can be displayed by a browser.
     *
     * @returns {boolean} `true` if a browser can display the given asset, `false` otherwise.
     * @see {canBrowserDisplayImage}
     */
    canBrowserDisplayImage(): boolean;
    /**
     * Returns the bands for the asset.
     *
     * This is usually a merge of eo:bands and raster:bands.
     *
     * @returns {Array.<Object>}
     */
    getBands(): Array<any>;
    /**
     * A band with the corresponding index.
     *
    * @typedef {Object} BandWithIndex
    * @property {number} index The index in the bands array.
    * @property {Object} band The band object
    */
    /**
     * The RGB bands.
     *
    * @typedef {Object} VisualBands
    * @property {BandWithIndex} red The red band with its index
    * @property {BandWithIndex} green The green band with its index
    * @property {BandWithIndex} blue The blue band with its index
    */
    /**
     * Find the RGB bands.
     *
     * @returns {VisualBands|null} Object with the RGB bands or null
     */
    findVisualBands(): {
        /**
         * The red band with its index
         */
        red: {
            /**
             * The index in the bands array.
             */
            index: number;
            /**
             * The band object
             */
            band: any;
        };
        /**
         * The green band with its index
         */
        green: {
            /**
             * The index in the bands array.
             */
            index: number;
            /**
             * The band object
             */
            band: any;
        };
        /**
         * The blue band with its index
         */
        blue: {
            /**
             * The index in the bands array.
             */
            index: number;
            /**
             * The band object
             */
            band: any;
        };
    };
    /**
     * Returns the band for the given criteria.
     *
     * Searches the given `property` (default: `name`) for the given value(s).
     *
     * @param {*} value A single value to find or a list of values to find one of.
     * @param {string} property The property in the bands to match against.
     * @param {Array.<Object>} bands For performance reasons you can provide a list of merged bands from `getBands()`.
     * @returns {BandWithIndex|null}
     * @see {getBands}
     */
    findBand(value: any, property?: string, bands?: Array<any>): {
        /**
         * The index in the bands array.
         */
        index: number;
        /**
         * The band object
         */
        band: any;
    };
    /**
     * Returns the band for the given band index.
     *
     * Passes through the (band) objects.
     *
     * @param {number|Object} band
     * @returns {Object|null}
     * @see {getBands}
     */
    getBand(band: number | any): any | null;
    /**
     * Gets the reported minimum and maximum values for an asset (or band).
     *
     * Searches through different extension fields in raster, claasification, and file.
     *
     * @param {Object|number} band
     * @returns {Statistics}
     */
    getMinMaxValues(band?: any | number): {
        /**
         * Minimum value
         */
        minimum: number | null;
        /**
         * Maximum value
         */
        maximum: number | null;
    };
    /**
     * Gets the reported no-data values for an asset (or band).
     *
     * Searches through different extension fields in raster, claasification, and file.
     *
     * @param {Object|number} band
     * @returns {Array.<*>}
     */
    getNoDataValues(band?: any | number): Array<any>;
    /**
     * Returns whether this asset is an Item Asset definition (i.e. doesn't have an href) or not.
     *
     * @returns {boolean} `true` is this asset is an Item Asset definition, `false` otherwise.
     */
    isDefintion(): boolean;
    /**
     * Checks whether this asset is of a specific type.
     *
     * @param {string|Array.<string>} types One or more media types.
     * @returns {boolean} `true` is this asset is one of the given types, `false` otherwise.
     */
    isType(types: string | Array<string>): boolean;
    /**
     * Checks whether this asset is a GeoTiff (including COGs).
     *
     * @returns {boolean} `true` is this asset is a GeoTiff, `false` otherwise.
     */
    isGeoTIFF(): boolean;
    /**
     * Checks whether this asset is a COG (excluding pure GeoTiffs).
     *
     * @returns {boolean} `true` is this asset is a COG, `false` otherwise.
     */
    isCOG(): boolean;
    /**
     * Checks whether the asset is accessible via HTTP or HTTPS.
     *
     * Returns `null` for item asset definitions, otherwise a `boolean` value.
     *
     * @returns {boolean|null} `true` is this asset is available via HTTP or HTTPS, `false` or `null` otherwise.
     */
    isHTTP(): boolean | null;
    /**
     * Checks whether this asset as a specific role assigned.
     *
     * @param {string|Array.<string>} roles One or more roles.
     * @param {boolean} includeKey Also returns `true` if the asset key equals to one of the given roles.
     * @returns {boolean} `true` is this asset is one of the given roles (or key), `false` otherwise.
     */
    hasRole(roles: string | Array<string>, includeKey?: boolean): boolean;
}
/**
 * Class for STAC spec entities (Item, Catalog and Collection).
 *
 * Don't instantiate this class!
 *
 * @abstract
 * @class STAC
 * @param {Object} data The STAC object
 * @param {string|null} absoluteUrl Absolute URL of the STAC object
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class STAC extends STACHypermedia {
    /**
     * Returns a single temporal extent for the STAC entity.
     *
     * @returns {Array.<Date|null>|null}
     */
    getTemporalExtent(): Array<Date | null> | null;
    /**
     * Returns the temporal extent(s) for the STAC entity.
     *
     * @returns {Array.<Array.<Date|null>>}
     */
    getTemporalExtents(): Array<Array<Date | null>>;
    /**
     * Returns the bands.
     *
     * This is usually a merge of eo:bands and raster:bands.
     *
     * @returns {Array.<Object>}
     */
    getBands(): Array<any>;
    /**
     * Get the icons from the links in a STAC entity.
     *
     * All URIs are converted to be absolute.
     *
     * @todo
     * @param {boolean} allowUndefined
     * @returns {Array.<Link>}
     */
    getIcons(allowUndefined?: boolean): Array<Link>;
    /**
     * Get the thumbnails from the assets and links in a STAC entity.
     *
     * All URIs are converted to be absolute.
     *
     * @param {boolean} browserOnly - Return only images that can be shown in a browser natively (PNG/JPG/GIF/WEBP + HTTP/S).
     * @param {string|null} prefer - If not `null` (default), prefers a role over the other. Either `thumbnail` or `overview`.
     * @returns {Array.<STACReference>} Asset or Link
     */
    getThumbnails(browserOnly?: boolean, prefer?: string | null): Array<STACReference>;
    /**
     * Determines the default GeoTiff asset for visualization.
     *
     * @param {boolean} httpOnly Return only GeoTiffs that can be accessed via HTTP(S)
     * @param {boolean} cogOnly Return only COGs
     * @returns {Asset} Default GeoTiff asset
     * @see {rankGeoTIFFs}
     */
    getDefaultGeoTIFF(httpOnly?: boolean, cogOnly?: boolean): Asset;
    /**
     * Object with an asset and the corresponding score.
     *
     * @typedef {Object} AssetScore
     * @property {Asset} asset
     * @property {number} score
     */
    /**
     * A function that can influence the score.
     *
     * Returns a relative addition to the score.
     * Negative values subtract from the score.
     *
     * @callback STAC~rankGeoTIFFs
     * @param {Asset} asset The asset to calculate the score for.
     */
    /**
     * Ranks the GeoTiff assets for visualization purposes.
     *
     * The score factors can be found below:
     * - Roles/Keys (by default) - if multiple roles apply only the highest score is added:
     *   - overview => +3
     *   - thumbnail => +2
     *   - visual => +2
     *   - data => +1
     *   - none of the above => no change
     * - Other factors:
     *   - media type is COG: +2 (if cogOnly = false)
     *   - has RGB bands: +1
     *   - additionalCriteria: +/- a custom value
     *
     * @param {boolean} httpOnly Return only GeoTiffs that can be accessed via HTTP(S)
     * @param {boolean} cogOnly Return only COGs
     * @param {Object.<string, number>} roleScores Roles (and keys) considered for the scoring. They key is the role name, the value is the score. Higher is better. Defaults to the roles and scores detailed above. An empty object disables role-based scoring.
     * @param {STAC~rankGeoTIFFs} additionalCriteria A function to customize the score by adding/subtracting.
     * @returns {Array.<AssetScore>} GeoTiff assets sorted by score in descending order.
     */
    rankGeoTIFFs(httpOnly?: boolean, cogOnly?: boolean, roleScores?: {
        [x: string]: number;
    }, additionalCriteria?: any): {
        asset: Asset;
        score: number;
    }[];
    /**
     * The single-band assets for RGB composites.
     *
    * @typedef {Object} VisualAssets
    * @property {BandWithIndex} red The red band with its index
    * @property {BandWithIndex} green The green band with its index
    * @property {BandWithIndex} blue The blue band with its index
    */
    /**
     * Find the single-band assets for RGB.
     *
     * @returns {VisualAssets|null} Object with the RGB bands or null
     */
    findVisualAssets(): {
        /**
         * The red band with its index
         */
        red: BandWithIndex;
        /**
         * The green band with its index
         */
        green: BandWithIndex;
        /**
         * The blue band with its index
         */
        blue: BandWithIndex;
    };
    /**
     *
     * @todo
     * @param {string} key
     * @returns {Asset|null}
     */
    getAsset(key: string): Asset | null;
    /**
     *
     * @todo
     * @returns {Array.<Asset>}
     */
    getAssets(): Array<Asset>;
    /**
     * Returns all assets that contain at least one of the given roles.
     *
     * @param {string|Array.<string>} roles One or more roles.
     * @param {boolean} includeKey Also returns `true` if the asset key equals to one of the given roles.
     * @returns {Array.<Asset>} The assets with the given roles.
     */
    getAssetsWithRoles(roles: string | Array<string>, includeKey?: boolean): Array<Asset>;
    /**
     *
     * @todo
     * @param {string} role
     * @param {boolean} includeKey
     * @returns {Asset|null}
     */
    getAssetWithRole(role: string, includeKey?: boolean): Asset | null;
    /**
     *
     * @todo
     * @param {Array.<string>} types
     * @returns {Array.<Asset>}
     */
    getAssetsByTypes(types: Array<string>): Array<Asset>;
    /**
     *
     * @todo
     * @param {*} other
     * @returns {boolean}
     */
    equals(other: any): boolean;
}
/**
 * Class for common parts of Catalogs and Collections.
 *
 * Don't instantiate this class!
 *
 * @class
 * @abstract
 * @param {Object} data The STAC Catalog or Collection object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Catalog or Collection
 * @param {Object.<string, function>} keyMap Keys and functions that convert the values to stac-js objects.
 * @param {Array.<string>} privateKeys Keys that are private members of the stac-js objects (for cloning and export).
 */
export class CatalogLike extends STAC {
    /**
     * Returns the search link, if present.
     *
     * If a specific method is provied, can exclude other methods from being returned.
     *
     * @returns {Link|null} The search link
     */
    getSearchLink(method?: any): Link | null;
    /**
     * Returns the link for API collections, if present.
     *
     * @returns {Link|null} The API collections link
     */
    getApiCollectionsLink(): Link | null;
    /**
     * Returns the link for API items, if present.
     *
     * @returns {Link|null} The API items link
     */
    getApiItemsLink(): Link | null;
    /**
     * Returns all child links.
     *
     * @returns {Array.<Link>} The child links
     */
    getChildLinks(): Array<Link>;
    /**
     * Returns all item links.
     *
     * @returns {Array.<Link>} The child links
     */
    getItemLinks(): Array<Link>;
}
/**
 * A STAC Catalog.
 *
 * You can access all properties of the given STAC Catalog object directly, e.g. `catalog.title`.
 *
 * @class
 * @param {Object} data The STAC Catalog object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Catalog
 */
export class Catalog extends CatalogLike {
    constructor(data: any, absoluteUrl?: any);
}
/**
 * Parses a UTC-based ISO8601 date and time string to a Date object.
 *
 * Does not support timezones as all STAC datetime must be given in UTC.
 *
 * @returns {Date|null}
 */
export function isoToDate(str: any): Date | null;
/**
 * Computes the center datetime between two datetimes.
 *
 * @param {Date} start start datetime
 * @param {Date} end end datetime
 * @returns {Date} center datetime
 */
export function centerDateTime(start: Date, end: Date): Date;
/**
 * Computes a single interval from multiple temporal intervals.
 *
 * @param {Array.<Array.<Date>>} list A list of temporal intervals
 * @returns {Array.<Date>} The merged temporal interval
 */
export function unionDateTime(list: Array<Array<Date>>): Array<Date>;
/**
 * A bounding box.
 *
 * @typedef {Array.<number>} BoundingBox
 */
/**
 * Converts one or more bounding boxes to a GeoJSON Feature.
 *
 * The Feature contains a Polygon or MultiPolygon based on the given number of valid bounding boxes.
 *
 * @todo
 * @param {BoundingBox|Array.<BoundingBox>} bboxes
 * @returns {Object|null}
 */
export function toGeoJSON(bboxes: BoundingBox | Array<BoundingBox>): any | null;
/**
 * Checks whether the given thing is a valid bounding box.
 *
 * A valid bounding box is an array with 4 or 6 numbers that are valid WGS84 coordinates and span a rectangle.
 * See the STAC specification for details.
 *
 * @param {BoundingBox|Array.<number>} bbox A potential bounding box.
 * @returns {boolean} `true` if valid, `false` otherwise
 */
export function isBoundingBox(bbox: BoundingBox | Array<number>): boolean;
export function isAntimeridianBoundingBox(bbox: any): boolean;
/**
 * Compute the union of a list of bounding boxes.
 *
 * The function ignores any invalid bounding boxes or values for the third dimension.
 *
 * @param {Array.<BoundingBox|null>} bboxes
 * @returns {BoundingBox|null}
 * @see {isBoundingBox}
 */
export function unionBoundingBox(bboxes: Array<BoundingBox | null>): BoundingBox | null;
/**
 * A bounding box.
 */
export type BoundingBox = Array<number>;
/**
 * A STAC Collection.
 *
 * You can access all properties of the given STAC Collection object directly, e.g. `collection.title`.
 *
 * @class
 * @param {Object} data The STAC Collection object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Collection
 */
export class Collection extends CatalogLike {
    constructor(data: any, absoluteUrl?: any);
    /**
     * Returns all bounding boxes from the collection, including the union bounding box.
     *
     * @returns {Array.<BoundingBox>}
     */
    getRawBoundingBoxes(): Array<BoundingBox>;
}
/**
 * Represents an Collections containing Collections.
 *
 * @class CollectionCollection
 * @param {Object} data The STAC API Collections object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Item Collection
 */
export class CollectionCollection extends APICollection {
    constructor(data: any, absoluteUrl?: any);
    /**
     * Returns all collections.
     *
     * @returns {Array.<Collection>} All STAC Collections
     */
    getCollections(): Array<Collection>;
    /**
     * Returns a single temporal extent for the all the STAC collections.
     *
     * @returns {Array.<Date|null>|null}
     */
    getTemporalExtent(): Array<Date | null> | null;
    /**
     * Returns the temporal extent(s) for the all the STAC collections.
     *
     * @returns {Array.<Array.<string|null>>}
     */
    getTemporalExtents(): Array<Array<string | null>>;
}
/**
 * A STAC Item.
 *
 * You can access all properties of the given STAC Item object directly, e.g. `item.id` or `item.properties.datetime`.
 *
 * @class
 * @param {Object} data The STAC Item object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Item
 */
export class Item extends STAC {
    constructor(data: any, absoluteUrl?: any);
    /**
     * Returns the datetime of the STAC Item.
     *
     * @param {boolean} force Enforce a datetime by computing the center datetime if needed.
     * @returns {Date|null}
     */
    getDateTime(force?: boolean): Date | null;
    /**
     * Returns the collection link, if present.
     *
     * @returns {Link|null} The collection link
     */
    getCollectionLink(): Link | null;
}
/**
 * Represents an ItemCollection containing Items.
 *
 * @class ItemCollection
 * @param {Object} data The STAC Item Collection object
 * @param {string|null} absoluteUrl Absolute URL of the STAC Item Collection
 */
export class ItemCollection extends APICollection {
    constructor(data: any, absoluteUrl?: any);
    /**
     * Returns all items.
     *
     * @returns {Array.<Item>} All STAC Items
     */
    getItems(): Array<Item>;
    /**
     * Returns a single temporal extent for all the STAC items.
     *
     * @returns {Array.<Date|null>|null}
     */
    getTemporalExtent(): Array<Date | null> | null;
    /**
     * Returns the temporal extent(s) for all the STAC items.
     *
     * @returns {Array.<Array.<string|null>>}
     */
    getTemporalExtents(): Array<Array<string | null>>;
}
/**
 * Creates the corresponding object for a object that conforms to the STAC specification.
 *
 * This creates either a Catalog, a Collection or an Item instance.
 * By default it migrates the data to the latest STAC version, but doesn't update the version number.
 *
 * @param {Object} data The STAC object
 * @param {boolean} migrate `true` to migrate to the latest version, `false` otherwise
 * @param {boolean} updateVersionNumber `true` to update the version number (to the latest version), `false` otherwise. Only applies if `migrate` is set to `true`.
 * @returns {Catalog|Collection|CollectionCollection|Item|ItemCollection} The created object instance.
 */
export default function create(data: any, migrate?: boolean, updateVersionNumber?: boolean): Catalog | Collection | CollectionCollection | Item | ItemCollection;

