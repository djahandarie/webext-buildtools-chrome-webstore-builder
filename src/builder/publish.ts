import { AxiosError } from 'axios';
import * as webstoreApi from 'typed-chrome-webstore-api';
import { PublishStatus } from 'typed-chrome-webstore-api';
import { LoggerWrapper } from 'webext-buildtools-utils';
import { IChromeWebstorePublishOptions } from '../../declarations/options';
// noinspection TypeScriptPreferShortImport
import { ChromeWebstorePublishedExtAsset } from '../buildResult';
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';

function validatePublishStatus(
    statuses: PublishStatus[],
    allowedStatuses: (PublishStatus | string)[]
) {
    const restrictedStatuses = statuses.filter(
        status => !allowedStatuses.includes(status)
    );

    if (restrictedStatuses.length > 0) {
        throw new Error(`Publish statuses ${restrictedStatuses.join(', ')} are not allowed`);
    }
}

export async function publishExt(
    extensionId: string,
    options: IChromeWebstorePublishOptions,
    logWrapper: LoggerWrapper,
    apiFacade: ChromeWebstoreApiFacade,
    extensionVersion?: string,
): Promise<ChromeWebstorePublishedExtAsset> {
    let publishResult: webstoreApi.IPublishResponse | undefined;
    const publishTarget = options.target
        ? options.target
        : webstoreApi.PublishTarget.DEFAULT;
    try {
        publishResult = await apiFacade.publish(publishTarget);
    }
    catch (error) {
        const axiosError = error as AxiosError;
        if (options.ignore500Error &&
            axiosError.response &&
            axiosError.response.status === 500
        ) {
            logWrapper.warn(
                "Publish request ended with HTTP status 500, ignoring due to 'ignorePublish500Error' option");
        }
        else {
            throw error;
        }
    }

    const allowedStatuses = options.allowedStatuses ||
        [webstoreApi.PublishStatus.OK, webstoreApi.PublishStatus.ITEM_PENDING_REVIEW];
    if (publishResult && Array.isArray(publishResult.status)) {
        validatePublishStatus(publishResult.status, allowedStatuses);
    }
    
    return new ChromeWebstorePublishedExtAsset({
        extId: extensionId,
        extVersion: extensionVersion,
        target: publishTarget,
        publishResponse: publishResult,
        error500: !publishResult
    });
}