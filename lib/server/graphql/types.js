import { addGraphQLSchema } from 'meteor/vulcan:core';

export const FILE = 'FSFile';
addGraphQLSchema(`
  input DynamicImageInput {
    w: Int
    h: Int
    crop: String
    fit: String
    facepad: Float
  }
  
  type ${FILE} {
    _id: String!
    name: String!
    extension: String!
    extensionWithDot: String!
    url(version: String = "original"): String!
    meta: JSON
    type: String!
    mime: String!
    size: Int!
    userId: String
    user: User
    isVideo: Boolean
    isAudio: Boolean
    isImage: Boolean
    isText: Boolean
    isJSON: Boolean
    isPDF: Boolean
    imageProxy(input: DynamicImageInput!): String
  }
`);
