import * as webstoreApi from 'typed-chrome-webstore-api';
import { LoggerWrapper } from 'webext-buildtools-utils';    
import { IChromeWebstoreOptions } from '../../declarations/options';

class InternalValidationResult {
    public warnings: string[] = [];
    public missedFields: string[] = [];
}

export class OptionsValidator {
    protected _uploadedExtRequired: boolean;
    protected _publishedExtRequired: boolean;
    protected _downloadCrxBufferRequired: boolean;
    protected _publishedCrxFileRequirement?: boolean;

    protected _errors: string[] = [];

    constructor(
        uploadedExtRequired: boolean,
        publishedExtRequired: boolean,
        publishedCrxBufferRequired: boolean,
        publishedCrxFileRequirement?: boolean
    ) {
        this._uploadedExtRequired = uploadedExtRequired;
        this._publishedExtRequired = publishedExtRequired;
        this._downloadCrxBufferRequired = publishedCrxBufferRequired;
        this._publishedCrxFileRequirement = publishedCrxFileRequirement;
    }

    public validate(options: IChromeWebstoreOptions, logWrapper: LoggerWrapper) {
        const res = this.validateImpl(options);

        res.warnings.forEach(warning => logWrapper.warn(warning));

        if (res.missedFields.length > 0) {
            const fields = res.missedFields.join(', ');
            throw new Error(`Following options fields are not set or have invalid value: ${fields}`);
        }
    }

    protected validateImpl(options: IChromeWebstoreOptions): InternalValidationResult {
        const r = new InternalValidationResult();

        if (!options.extensionId) {
            r.missedFields.push('extensionId');
        }

        if (this._uploadedExtRequired || this._publishedExtRequired) {
            if (!options.apiAccess) {
                r.missedFields.push('apiAccess')
            }
            else {
                const missed = ['clientId', 'clientSecret', 'refreshToken']
                    .filter(field => typeof (options.apiAccess as any)[field] !== 'string')
                    .map(field => `apiAccess.${field}`);
                r.missedFields.push(...missed);
            }
        }

        if (options.publish && options.publish.target) {
            const knownPublishTargets: string[] = [
                webstoreApi.PublishTarget.DEFAULT,
                webstoreApi.PublishTarget.TRUSTED_TESTERS,
            ];
            if (!knownPublishTargets.includes(options.publish.target)) {
                r.warnings.push(`Unknown publish target: ${options.publish.target} in options`);
            }
        }

        if (options.upload && options.upload.waitForSuccess) {
            const waitForSuccess = options.upload.waitForSuccess as any;
            const missed =['checkCount', 'checkIntervalMs']
                .filter(field => typeof waitForSuccess[field] !== 'number')
                .map(field => `upload.waitForSuccess.${field}'`);
            r.missedFields.push(...missed);
        }

        if (options.publish &&
            options.publish.allowedStatuses !== undefined &&
            (!Array.isArray(options.publish.allowedStatuses) || options.publish.allowedStatuses.length === 0)
        ) {
            r.missedFields.push(`publish.allowedPublishStatuses`);
        }

        // file required as not temporary
        if (this._publishedCrxFileRequirement === false &&
            (!options.downloadCrx || !options.downloadCrx.outCrxFilePath)
        ) {
            r.missedFields.push('downloadCrx.outCrxFilePath');
        }

        return r;
    }
}