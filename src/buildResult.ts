import { BaseBuildResult, BasicTypeBuildAsset, BufferBuildAsset, FileBuildAsset } from 'webext-buildtools-utils';
import { IPublishedExtInfo } from '../declarations/publishedExtInfo';
import { IUploadedExtInfo } from '../declarations/uploadedExtInfo';

export class ChromeWebstoreUploadedExtAsset extends BasicTypeBuildAsset<IUploadedExtInfo> {}
export class ChromeWebstorePublishedExtAsset extends BasicTypeBuildAsset<IPublishedExtInfo> {}

export class ChromeWebstoreBuildResult extends BaseBuildResult<{
    uploadedExt?: ChromeWebstoreUploadedExtAsset;
    publishedExt?: ChromeWebstorePublishedExtAsset;
    publishedCrxBuffer?: BufferBuildAsset;
    publishedCrxFile?: FileBuildAsset;
    }>
{
}
