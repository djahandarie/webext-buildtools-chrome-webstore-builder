import { ChromeWebstoreBuilder } from './builder';

export default ChromeWebstoreBuilder;
export {
    IChromeWebstoreApiAccessOptions,
    IChromeWebstoreDownloadCrxOptions,
    IChromeWebstoreOptions,
    IChromeWebstorePublishOptions,
    IChromeWebstoreUploadOptions
} from '../declarations/options';
export {IUploadedExtInfo} from '../declarations/uploadedExtInfo';
export {IPublishedExtInfo} from '../declarations/publishedExtInfo';
export {IWaitForWebstoreOptions} from '../declarations/waitForWebstoreOptions';
export {
    ChromeWebstoreBuildResult,
    ChromeWebstoreUploadedExtAsset,
    ChromeWebstorePublishedExtAsset
} from './buildResult';
export {
    InvalidManifestVersionError,
    NewerVersionAlreadyUploadedError,
    SameVersionAlreadyUploadedError,
    UploadInReviewError
} from './errors';

export { IManifestObject } from 'webext-buildtools-utils';
export { WebstoreResource } from 'typed-chrome-webstore-api';
