import { StringUtils } from '../Utils/StringUtils';

/**
 * Describes the structure of a plugin descriptor.
 */
export interface PluginDescriptor {
  name: string;
  methods: string[];
  properties: string[];
}

/**
 * Represents a plugin with a specific type.
 * @template T The type of the plugin instance.
 */
export class Plugin<T extends Object> {
  /**
   * The alias of the plugin.
   */
  public alias: string;

  /**
   * The instance of the plugin.
   * @private
   */
  private instance: T;

  /**
   * The unique identifier of the plugin.
   */
  id: string;

  /**
   * Creates an instance of Plugin.
   * @param {T} object The plugin instance.
   */
  constructor(object: T) {
    this.id = StringUtils.newGuid();
    this.alias = Reflect.getMetadata("alias", object);
    this.instance = object;
    const metaData = Reflect.getMetadataKeys(object);
    metaData.forEach(metaDataKey => {
      console.info(`Controller settings  ${metaDataKey} = `, Reflect.getOwnMetadata(metaDataKey, object));
    });
    console.info(`Created the plugin with an id of ${this.id}`);
  }

  /**
   * Gets the instance of the plugin.
   * @returns {T} The plugin instance.
   */
  getInstance(): T {
    return this.instance;
  }
}

