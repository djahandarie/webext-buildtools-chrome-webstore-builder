import * as webstoreApi from 'typed-chrome-webstore-api';
import { IChromeWebstoreUploadOptions } from '../../declarations/options';
// noinspection TypeScriptPreferShortImport
import { ChromeWebstoreUploadedExtAsset } from '../buildResult';
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';
import { IWebextManifest } from './webextManifest';

export async function upload(
    inputZipBuffer: Buffer,
    options: IChromeWebstoreUploadOptions,
    apiFacade: ChromeWebstoreApiFacade,
    inputManifest?: IWebextManifest,
): Promise<ChromeWebstoreUploadedExtAsset> {
    let uploadResult: webstoreApi.IWebstoreResource;
    try {
        uploadResult = await apiFacade.uploadExisting(
            inputZipBuffer as Buffer,
            options.waitForSuccess
        );
    } catch (error) {
        throw new Error(`Can't upload extension. ${error.toString()}`);
    }

    if (uploadResult.uploadState === webstoreApi.UploadState.SUCCESS) {
        let version = uploadResult.crxVersion;
        if (!version && inputManifest && inputManifest.version) {
            version = inputManifest.version;
        }
        return new ChromeWebstoreUploadedExtAsset({
            extId: uploadResult.id,
            extVersion: version,
            apiResource: uploadResult
        });
    }

    const uploadErrorMsg = Array.isArray(uploadResult.itemError)
        ? uploadResult.itemError
            .map(err => err.error_detail)
            .join('. ')
        : `Upload has ${uploadResult.uploadState} state`;
    throw new Error(`Can't upload extension. ${uploadErrorMsg}`);
}