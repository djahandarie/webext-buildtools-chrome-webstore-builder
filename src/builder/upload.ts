import * as webstoreApi from 'typed-chrome-webstore-api';
import { IChromeWebstoreUploadOptions } from '../../declarations/options';
// noinspection TypeScriptPreferShortImport
import { ChromeWebstoreUploadedExtAsset } from '../buildResult';
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';
import { IWebextManifest } from './webextManifest';
import { UploadInReviewError } from "../errors";
import { WebstoreResource } from "typed-chrome-webstore-api";

export async function upload(
    inputZipBuffer: Buffer,
    options: IChromeWebstoreUploadOptions,
    apiFacade: ChromeWebstoreApiFacade,
    inputManifest?: IWebextManifest,
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
        throw new UploadInReviewError(uploadErrorMsg);
    }
    throw new Error(uploadErrorMsg);
}