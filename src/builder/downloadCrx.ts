import { Readable } from 'stream';
import { DownloadCrx } from 'typed-chrome-webstore-api';
import { BufferBuildAsset, FileBuildAsset, LoggerWrapper } from 'webext-buildtools-utils';
import { IChromeWebstoreDownloadCrxOptions } from '../../declarations/options';
import { ChromeWebstoreBuildResult } from '../buildResult';

function writeAndCreateFileAsset(
    stream: Readable,
    temporary: boolean,
    tmpDirPrefix: string,
    tmpFileName: string,
    persistentFilePath?: string,
): Promise<FileBuildAsset>
{
    if (temporary) {
        return FileBuildAsset.writeAndCreateTemporary(
            tmpDirPrefix,
            tmpFileName,
            stream
        );
    }
    if (persistentFilePath) {
        return FileBuildAsset.writeAndCreatePersistent(
            persistentFilePath,
            stream
        );
    }
    throw new Error('invalid arguments');
}

export async function downloadCrx(
    extensionId: string,
    requireBuffer: boolean,
    fileRequirement: boolean | undefined, // true: temp, false: persistent
    options: IChromeWebstoreDownloadCrxOptions,
    result: ChromeWebstoreBuildResult,
    logWrapper: LoggerWrapper,
) {
    logWrapper.info(`Downloading crx file for '${extensionId}' extension...`);
    const downloadCrxApi = DownloadCrx.downloadCrx;
    const readStream = await downloadCrxApi(
        extensionId,
        options.prodVersion,
        options.acceptFormat,
        options.platform
    );
    const waitFor: Promise<any>[] = [];
    
    if (requireBuffer) {
        const bufferCreating = BufferBuildAsset.createFromStream(readStream);
        waitFor.push(bufferCreating
            .then(asset => result.getAssets().publishedCrxBuffer = asset)
            .catch(err => logWrapper.error(`Writing to buffer failed: ${err.toString()}`))
        );
    }
    
    if (fileRequirement !== undefined) {
        const fileCreating = writeAndCreateFileAsset(
            readStream,
            fileRequirement,
            'published_crx',
            extensionId + '.crx',
            options.outCrxFilePath
        );
        waitFor.push(fileCreating
            .then(asset => result.getAssets().publishedCrxFile = asset)
            .catch(err => logWrapper.error(`Writing to file failed: ${err.toString()}`))
        );
    }

    return Promise
        .all(waitFor)
        .then(() => {
            logWrapper.info(`Downloaded`);
            return result;
        });
}