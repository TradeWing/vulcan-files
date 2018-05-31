import SimpleSchema from 'simpl-schema';
import merge from 'lodash/merge';
import pickBy from 'lodash/pickBy';

/**
 * Generates schema for a file field.
 *
 * Note that this function returns a valid document schema that contains the
 * required file fields. This allows for this function to be spread to another
 * schema (see example).
 *
 * @example Single file field
 *  const schema = {
 *    otherField: {},
 *    ...generateFieldSchemaBase({
 *      fieldName: 'fileId',
 *      fieldSchema: {
 *        label: 'My field label',
 *        // ...other Vulcan schema options
 *      },
 *      resolverName: 'file',
 *      resolverType: 'JSON',
 *      resolver: () => null, // resolve file from FSCollection
 *    },
 *  };
 * @param {Object} options Options
 * @param {String} options.fieldName
 *  Field name
 * @param {Object} options.fieldSchema
 *  Field schema that will be merged with the autogenerated schema
 * @param {*=} options.fieldType=String
 *  Field type. This defines how the file will be actually stored in the collection.
 *  Defaults to `String` to store the id of the document in the files collection
 * @param {String} options.resolverName
 *  Resolver name. Shortcut to `fieldSchema.resolveAs.fieldName`, will override it
 * @param {String} options.resolverType
 *  Resolver type. This defines how the file will be exposed in GraphQL, and it is
 *  a shortcut for `fieldSchema.resolveAs.type`, so it can be matched with the `multiple`
 *  option
 * @param {Function} options.resolver
 *  How the field is resolved.
 * @param {Boolean=} options.multiple=false Whether the field is multiple or not
 * @return {Object}
 * @function generateFieldSchemaBase
 */
export default (options = {}) => {
  const {
    fieldName,
    fieldSchema = {},
    fieldType = String,
    resolverName,
    resolverType,
    resolver,
    multiple = false,
  } = options;

  const FileOrType = SimpleSchema.oneOf(
    // accept generic object so SimpleSchema does not coerce the file object
    // to the specified `fieldType`
    { type: Object, blackbox: true },
    fieldType,
  );

  return pickBy({
    [fieldName]: merge(
      {
        viewableBy: ['guests'],
        insertableBy: ['members'],
        editableBy: ['members'],
        control: 'Upload',
      },
      fieldSchema,
      {
        type: multiple ? Array : FileOrType,
        resolveAs: {
          fieldName: resolverName,
          type: multiple ? `[${resolverType}]` : resolverType,
          resolver,
          addOriginalField: true,
        },
      }
    ),
    [`${fieldName}.$`]: multiple ? { type: FileOrType } : null,
  });
};