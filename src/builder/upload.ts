import * as webstoreApi from 'typed-chrome-webstore-api';
import { IChromeWebstoreUploadOptions } from '../../declarations/options';
// noinspection TypeScriptPreferShortImport
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';
import { UploadInReviewError } from "../errors";
import { IManifestObject } from 'webext-buildtools-utils';
import { WebstoreResource } from "typed-chrome-webstore-api";

export async function upload(
    inputZipBuffer: Buffer,
    options: IChromeWebstoreUploadOptions,
    currentWebstoreVersion: string|undefined,
    apiFacade: ChromeWebstoreApiFacade,
    inputManifest?: IManifestObject,
): Promise<WebstoreResource> {
    let uploadResult: webstoreApi.WebstoreResource;
    try {
        uploadResult = await apiFacade.uploadExisting(
            inputZipBuffer as Buffer,
            options.waitForSuccess
        );
    } catch (error) {
        throw new Error(`Can't upload extension. ${error.toString()}`);
    }

    if (uploadResult.uploadState === webstoreApi.UploadState.SUCCESS) {
        if (!uploadResult.crxVersion && inputManifest) {
            uploadResult.crxVersion = inputManifest.version;
        }

        return uploadResult;
    }

    const uploadErrorMsg = "Can't upload extension. " + (
        Array.isArray(uploadResult.itemError)
            ? uploadResult.itemError
                .map(err => err.error_detail)
                .join('. ')
            : `Upload has ${uploadResult.uploadState} state`
    );

    if (uploadResult.isFailedBecauseOfPendingReview()) {
        throw new UploadInReviewError(uploadErrorMsg, currentWebstoreVersion);
    }
    throw new Error(uploadErrorMsg);
}