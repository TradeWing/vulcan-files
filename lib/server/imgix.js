import ImgixClient from 'imgix-core-js';
import axios from 'axios';

export const imgixResolver = async (parent, { input }, context) => {
  if (
    !(
      process.env.IMGIX_HOSTNAME &&
      process.env.IMGIX_TOKEN &&
      process.env.IMGIX_WEB_PROXY_HOSTNAME &&
      process.env.IMGIX_WEB_PROXY_TOKEN
    )
  ) {
    if (!process.env.IMGIX_HOSTNAME) {
      logger.warn(
        'IMGIX_HOSTNAME env is not defined, the imgix proxy image service will not be available.',
      );
    }
    if (!process.env.IMGIX_TOKEN) {
      logger.warn(
        'IMGIX_TOKEN env is not defined, the imgix proxy image service will not be available.',
      );
    }
    if (!process.env.IMGIX_WEB_PROXY_HOSTNAME) {
      logger.warn(
        'IMGIX_WEB_PROXY_HOSTNAME env is not defined, the imgix proxy image service will not be available.',
      );
    }
    if (!process.env.IMGIX_WEB_PROXY_HOSTNAME) {
      logger.warn(
        'IMGIX_WEB_PROXY_TOKEN env is not defined, the imgix proxy image service will not be available.',
      );
    }
    return null;
  }

  const FSCollection = context[parent._collectionName];

  const parentFSDocumentId = parent._id;
  if (!parentFSDocumentId) return null;

  const fullParentFSFile = FSCollection.findOne({
    _id: parentFSDocumentId,
  });
  if (!fullParentFSFile) return null;

  const awsKey =
    fullParentFSFile &&
    fullParentFSFile.versions &&
    fullParentFSFile.versions.original &&
    fullParentFSFile.versions.original.meta &&
    fullParentFSFile.versions.original.meta.s3Key;

  // If the s3Key is undefined, the file hasn't been uploaded to s3 yet
  if (!awsKey) {
    const imgixProxyClient = new ImgixClient({
      domain: process.env.IMGIX_WEB_PROXY_HOSTNAME,
      secureURLToken: process.env.IMGIX_WEB_PROXY_TOKEN,
    });
    const twUrl = fullParentFSFile.link();

    // Enable serving from localhost webapp if using ngrox
    const imgixUrl = imgixProxyClient.buildURL(
      process.env.NGROX_PROXY_HOST && process.env.ROOT_URL
        ? twUrl.replace(process.env.ROOT_URL, process.env.NGROX_PROXY_HOST)
        : twUrl,
      input,
    );

    // Populate the imgix cdns and block so waiting on the client side happens during submit
    try {
      await axios.get(imgixUrl, { timeout: 10000 });
    } catch (error) {
      //logger.error(error);
      return null;
    }
    return imgixUrl;
  }

  const imgixClient = new ImgixClient({
    domain: process.env.IMGIX_HOSTNAME,
    secureURLToken: process.env.IMGIX_TOKEN,
  });

  return imgixClient.buildURL(awsKey, input);
};
