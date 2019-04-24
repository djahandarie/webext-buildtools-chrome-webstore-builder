import * as semver from 'semver';
import { LoggerWrapper } from 'webext-buildtools-utils';
import { ChromeWebstoreApiFacade } from '../chromeWebstoreApiFacade';

export async function validateVersion(
    manifestVersion: string,
    apiFacade: ChromeWebstoreApiFacade,
    logWrapper: LoggerWrapper
) {
    if (semver.valid(manifestVersion)) {
        logWrapper.info(`New extension version is '${manifestVersion}' (from manifest input)`);
    } else {
        logWrapper.warn(`New extension semver version is invalid: '${manifestVersion}'`);
        return;
    }

    const currentVersion = await apiFacade.getCurrentVersion();
    if (currentVersion) {
        if (semver.valid(currentVersion) && semver) {
            logWrapper.info(`Version of currently published extension is '${currentVersion}'`);
        } else {
            logWrapper.warn(`Invalid semver version of published crx: '${currentVersion}'`);
        }

        if (semver.lte(manifestVersion, currentVersion)) {
            throw new Error(`New ${manifestVersion} version have to be ` +
                `greater than the current ${currentVersion}`);
        }
    }
}