import * as versions  from 'compare-versions';
import { LoggerWrapper } from 'webext-buildtools-utils';
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';
import { InvalidManifestVersionError, NewerVersionAlreadyUploadedError, SameVersionAlreadyUploadedError } from "../errors";
import * as webstoreApi from 'typed-chrome-webstore-api';

/**
 * @param manifestVersion
 * @param throwIfAlreadyUploaded throw if current uploaded version equal to manifestVersion
 * @param apiFacade
 * @param logWrapper
 * @return currently uploaded resource info
 */
export async function validateVersion(
    manifestVersion: string,
    throwIfAlreadyUploaded: boolean,
    apiFacade: ChromeWebstoreApiFacade,
    logWrapper: LoggerWrapper
): Promise<webstoreApi.WebstoreResource|null>
{
    if (versions.validate(manifestVersion)) {
        logWrapper.info(`New extension version is '${manifestVersion}' (from manifest input)`);
    } else {
        throw new InvalidManifestVersionError(manifestVersion);
    }

    const currentResource = await apiFacade.getCurrentlyUploadedResource();
    const currentVersion = currentResource.crxVersion;
    if (!currentVersion) {
        return null;
    }

    if (versions.validate(currentVersion)) {
        logWrapper.info(`Version of currently published extension is '${currentVersion}'`);
    } else {
        logWrapper.warn(`Invalid semver version of published crx: '${currentVersion}'`);
        return null;
    }

    if (versions.compare(manifestVersion, currentVersion, '=')) {
        if (throwIfAlreadyUploaded) {
            throw new SameVersionAlreadyUploadedError(currentVersion);
        }
        return currentResource;
    }

    if (versions.compare(manifestVersion, currentVersion, '<=')) {
        throw new NewerVersionAlreadyUploadedError(manifestVersion, currentVersion);
    }

    return null;
}