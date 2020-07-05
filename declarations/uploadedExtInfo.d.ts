import { WebstoreResource } from 'typed-chrome-webstore-api';

export interface IUploadedExtInfo {
    /**
     * Extension version before upload
     */
    oldVersion: WebstoreResource;
    /**
     * Extension version after upload
     */
    newVersion: WebstoreResource;
}

export { WebstoreResource } from 'typed-chrome-webstore-api';