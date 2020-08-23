import { registerTerminatingLink } from 'meteor/vulcan:lib';
import { createUploadLink } from 'apollo-upload-client';

registerTerminatingLink(createUploadLink({
  uri: '/graphql2',
}));

export * from '../modules';
export { default as generateFieldSchema } from './generateFieldSchemaStub';
export { default as createFSCollection } from './createFSCollectionStub';

