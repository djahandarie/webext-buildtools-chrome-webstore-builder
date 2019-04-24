import * as webstoreApi from 'typed-chrome-webstore-api';

export interface IUploadedExtInfo {
    extId: string;
    extVersion?: string;
    apiResource?: webstoreApi.IWebstoreResource;
}