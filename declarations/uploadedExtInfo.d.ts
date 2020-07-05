import { WebstoreResource } from 'typed-chrome-webstore-api';

export interface IUploadedExtInfo {
    extId: string;
    extVersion?: string;
    apiResource?: WebstoreResource;
}

export { WebstoreResource } from 'typed-chrome-webstore-api';