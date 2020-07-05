import { PublishStatus, PublishTarget } from 'typed-chrome-webstore-api';
import { DownloadCrx } from 'typed-chrome-webstore-api';
// noinspection TypeScriptPreferShortImport
import { IWaitForWebstoreOptions } from './waitForWebstoreOptions';

export interface IChromeWebstoreApiAccessOptions {
    /**
     * Needed to access Chrome Web Store API via chrome-webstore-upload package
     * @see https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md
     */
    clientId: string;

    /**
     * Needed to access Chrome Web Store API via chrome-webstore-upload package
     * @see https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md
     */
    clientSecret: string;

    /**
     * Needed to access Chrome Web Store API via chrome-webstore-upload package
     * @see https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md
     */
    refreshToken: string;
}

export interface IChromeWebstoreUploadOptions {
    /**
     * If after upload extension gets status IN_PROGRESS, builder can repeatedly check
     * until it gets SUCCESS status
     * Specify { checkCount: XX, checkIntervalMs: XXXX } for this behavior
     * If not specified, IN_PROGRESS status will be considered as build error, and build()
     * method will throw an exception
     */
    waitForSuccess?: IWaitForWebstoreOptions;

    /**
     * If true or not specified: if the same version is already uploaded throw an UploadVersionValidationError
     * If false, do not repeat upload, just put information about uploaded version to the output asset and continue
     * @default true
     */
    throwIfVersionAlreadyUploaded?: boolean;
}

export interface IChromeWebstorePublishOptions {
    /**
     * 'default' or 'trustedTesters'
     * If not specified, 'default' will be used
     */
    target?: PublishTarget | string;

    /**
     * Array of allowed statuses, returned in publish response (if publishedExt output is required)
     * If status is in array, build is considered successful, if not, build() method will throw Error
     * If not specified, 'OK' and 'ITEM_PENDING_REVIEW' will be considered successful
     */
    allowedStatuses?: (PublishStatus | string)[];

    /**
     * Experimental option due to undocumented Webstore API behaviour
     * For example, extension had a version = '1.10.0'
     * Then we successfully published a new one with version = '1.20.0' (status = 'OK')
     * 'get upload' request returns version '1.20.0' after it. But this version is still in publishing progress
     * Now we are publishing '1.30.0' but 'publish' and request fails with 500 error, but (!) actually
     * our version have been accepted, and after some time out extension increases it's version to '1.30.0'!
     *
     * Set this option to true to consider 500 response as success'
     */
    ignore500Error?: boolean;
}

export interface IChromeWebstoreDownloadCrxOptions {
    /**
     * Output crx file path if it required as not temporary
     */
    outCrxFilePath?: string;

    /**
     * Optional param for
     * @see typed-chrome-webstore-api/downloadCrx
     * the version of Chrome, which must be 31.0.1609.0 at the very least
     */
    prodVersion?: string;

    /**
     *
     * @see typed-chrome-webstore-api/downloadCrx
     * default is ['crx2', crx3']
     */
    acceptFormat?: (DownloadCrx.CrxAcceptFormat | string)[];

    /**
     * Optional param for
     * @see typed-chrome-webstore-api/downloadCrx
     * Some extensions contain NaCl modules, that require additional query string parameters
     */
    platform?: DownloadCrx.IPlatformRequest
}

export interface IChromeWebstoreOptions {
    /**
     * Your extension id in Chrome Web Store, required for all outputs
     */
    extensionId: string;

    accessToken?: string;

    /** 
     * Required for uploadExt and publishExt outputs 
     */
    apiAccess?: IChromeWebstoreApiAccessOptions;

    /**
     * For uploadExt output, optional
     */
    upload?: IChromeWebstoreUploadOptions;

    /**
     * For publishExt output, optional
     */
    publish?: IChromeWebstorePublishOptions;

    /**
     * Required for publishedCrxBuffer and publishedCrxFile output
     */
    downloadCrx?: IChromeWebstoreDownloadCrxOptions;
}
