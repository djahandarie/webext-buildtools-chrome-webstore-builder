import { AxiosError } from 'axios';
import { Readable } from 'stream';
import * as webstoreApi from 'typed-chrome-webstore-api';
import { ILogMethod } from 'webext-buildtools-builder-types';
import { LoggerWrapper } from 'webext-buildtools-utils';
import { IWaitForWebstoreOptions } from '../declarations/waitForWebstoreOptions';

function delay(ms: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export class ChromeWebstoreApiFacade {
    public static async authorize(
        clientId: string,
        clientSecret: string,
        refreshToken: string,
        extensionId: string,
    ): Promise<ChromeWebstoreApiFacade> {
        const token = await webstoreApi.fetchToken(clientId, clientSecret, refreshToken);
        return new ChromeWebstoreApiFacade(token, extensionId);
    }

    protected readonly _api: webstoreApi.WebstoreApi;
    protected readonly _extensionId: string;
    protected readonly _logWrapper: LoggerWrapper;

    protected constructor(token: string, extensionId: string) {
        this._api = new webstoreApi.WebstoreApi(token);
        this._extensionId = extensionId;
        this._logWrapper = new LoggerWrapper();
    }

    public setLogMethod(logMethod?: ILogMethod) {
        this._logWrapper.logMethod = logMethod;
    }

    public async getCurrentVersion(): Promise<string|undefined> {
        this._logWrapper.info('Loading information about current ext version...');
        const current = await this._api.getUpload(this._extensionId);
        this._logWrapper.info('Finished: %o', current);

        return current.crxVersion;
    }

    public async uploadExisting(
        readStream: Buffer | Readable,
        waitForSuccess?: IWaitForWebstoreOptions
    ): Promise<webstoreApi.IWebstoreResource> {
        this._logWrapper.info(`Uploading ${this._extensionId} extension...`);
        let result;
        try {
            result = await this._api.upload(readStream, this._extensionId);
        }
        catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data) {
                this._logWrapper.info(`Error response body: %o'`, error.response.data);
            }
            throw error;
        }
        this._logWrapper.info('Finished: %o', result);

        if (!waitForSuccess || result.uploadState !== webstoreApi.UploadState.IN_PROGRESS) {
            return result;
        }

        for (let i = 1; i <= waitForSuccess.checkCount; ++i) {
            this._logWrapper.info(`Upload in progress, waiting ${waitForSuccess.checkIntervalMs} ms...`);
            await delay(waitForSuccess.checkIntervalMs);
            try {
                this._logWrapper.info(`Checking upload status...`);
                result = await this._api.getUpload(this._extensionId);

                if (result.uploadState !== webstoreApi.UploadState.IN_PROGRESS) {
                    this._logWrapper.info(`Status changed, response is: %o`, result);
                    return result;
                }
            } catch (error) {
                this._logWrapper.error(error.toString());
            }
        }

        return result;
    }

    public async publish(
        target: webstoreApi.PublishTarget | string,
    ): Promise<webstoreApi.IPublishResponse> {
        this._logWrapper.info(`Publishing ${this._extensionId} extension, target: '${target}'...`);
        try {
            const result = await this._api.publish(this._extensionId, target);
            this._logWrapper.info('Finished: %o', result);
            return result;
        }
        catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data) {
                this._logWrapper.info(`Error response body: %o'`, axiosError.response.data);
            }
            throw error;
        }
    }
}
