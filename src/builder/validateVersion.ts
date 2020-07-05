import * as versions  from 'compare-versions';
import { LoggerWrapper } from 'webext-buildtools-utils';
import { InvalidManifestVersionError, NewerVersionAlreadyUploadedError, SameVersionAlreadyUploadedError } from "../errors";
import * as webstoreApi from 'typed-chrome-webstore-api';

export function validateVersion(
    manifestVersion: string,
    oldWebstoreResource: webstoreApi.WebstoreResource,
    throwIfAlreadyUploaded: boolean,
    logWrapper: LoggerWrapper
): boolean
{
    if (versions.validate(manifestVersion)) {
        logWrapper.info(`New extension version is '${manifestVersion}' (from manifest)`);
    } else {
        throw new InvalidManifestVersionError(manifestVersion);
    }

    const currentVersion = oldWebstoreResource.crxVersion;
    if (!currentVersion) {
        return false;
    }

    if (versions.validate(currentVersion)) {
        logWrapper.info(`Version of currently published extension is '${currentVersion}'`);
    } else {
        logWrapper.warn(`Invalid semver version of published crx: '${currentVersion}'`);
        return false;
    }

    if (versions.compare(manifestVersion, currentVersion, '=')) {
        if (throwIfAlreadyUploaded) {
            throw new SameVersionAlreadyUploadedError(currentVersion);
        }
        return false;
    }

    if (versions.compare(manifestVersion, currentVersion, '<=')) {
        throw new NewerVersionAlreadyUploadedError(manifestVersion, currentVersion);
    }

    return true;
}