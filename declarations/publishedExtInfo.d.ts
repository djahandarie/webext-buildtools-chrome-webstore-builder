import * as webstoreApi from 'typed-chrome-webstore-api';

export interface IPublishedExtInfo {
    extId: string;
    extVersion?: string;
    target: webstoreApi.PublishTarget | string;

    /** Normally should be filled, but in special cases
     * error500 === true and response is undefined
     * @see comment for ignorePublish500Error option
     */
    publishResponse?: webstoreApi.IPublishResponse;
    error500: boolean;
}