import { ISimpleBuilder } from 'webext-buildtools-builder-types';
import { AbstractSimpleBuilder } from 'webext-buildtools-utils';
import { IChromeWebstoreOptions } from '../declarations/options';
import { downloadCrx } from './builder/downloadCrx';
import { OptionsValidator } from './builder/optionsValidator';
import { publishExt } from './builder/publish';
import { upload } from './builder/upload';
import { validateVersion } from './builder/validateVersion';
import { IWebextManifest } from './builder/webextManifest';
import { ChromeWebstoreBuildResult, ChromeWebstoreUploadedExtAsset } from './buildResult';
import { ChromeWebstoreApiFacade } from './chromeWebstoreApiFacade';

// noinspection JSUnusedGlobalSymbols
/**
 * ISimpleBuilder wrapper for publishing extensions to Chrome Webstore
 */
export class ChromeWebstoreBuilder
    extends AbstractSimpleBuilder<IChromeWebstoreOptions, ChromeWebstoreBuildResult>
    implements ISimpleBuilder<ChromeWebstoreBuildResult>
{
    public static readonly TARGET_NAME = 'chrome-webstore-deploy';

    protected _inputZipBuffer?: Buffer;
    protected _inputManifest?: IWebextManifest;
    protected _uploadedExtRequired: boolean = false;
    protected _publishedExtRequired: boolean = false;
    protected _publishedCrxBufferRequired: boolean = false;
    // true: as temporary, false: permanent
    protected _publishedCrxFileRequirement?: boolean;

    public getTargetName(): string {
        return ChromeWebstoreBuilder.TARGET_NAME;
    }

    // noinspection JSUnusedGlobalSymbols
    public setInputZipBuffer(buffer: Buffer): this {
        this._inputZipBuffer = buffer;
        return this;
    }

    public setInputManifest(manifest: IWebextManifest): this {
        if (!manifest.name || !manifest.version) {
            throw Error('Invalid manifest object, id and name fields are required');
        }
        this._inputManifest = manifest;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * setInputZipBuffer() and setInputManifest() should be called before build()
     */
    public requireUploadedExt(): this {
        this._uploadedExtRequired = true;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    public requirePublishedExt(): this {
        this._publishedExtRequired = true;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    public requirePublishedCrxBuffer() {
        this._publishedCrxBufferRequired = true;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    public requirePublishedCrxFile(temporary: boolean = false) {
        // noinspection PointlessBooleanExpressionJS
        this._publishedCrxFileRequirement = !!temporary;
        return this;
    }

    public async build(): Promise<ChromeWebstoreBuildResult> {
        const optionsValidator = new OptionsValidator(
            this._uploadedExtRequired,
            this._publishedExtRequired,
            this._publishedCrxBufferRequired,
            this._publishedCrxFileRequirement
        );
        optionsValidator.validate(this._options, this._logWrapper);

        if (this._uploadedExtRequired && !this._inputZipBuffer) {
            throw Error('Input zip buffer is required to upload extension to WebStore');
        }

        const result = new ChromeWebstoreBuildResult();
        if (!this._uploadedExtRequired &&
            !this._publishedExtRequired &&
            !this._publishedCrxBufferRequired &&
            this._publishedCrxFileRequirement === undefined
        ) {
            this._logWrapper.warn('No outputs are required, do nothing');
            return result;
        }

        if ((this._uploadedExtRequired || this._publishedExtRequired) && this._options.apiAccess) {
            let apiFacade: ChromeWebstoreApiFacade|null;
            try {
                apiFacade = await ChromeWebstoreApiFacade.authorize(
                    this._options.apiAccess.clientId,
                    this._options.apiAccess.clientSecret,
                    this._options.apiAccess.refreshToken,
                    this._options.extensionId,
                );
            } catch (error) {
                throw new Error(error.message + ': ' + JSON.stringify(error.response.data));
            }
            apiFacade.setLogMethod(this._logWrapper.logMethod);

            if (this._uploadedExtRequired) {
                if (this._inputManifest && this._inputManifest.version) {
                    const throwIfVersionAlreadyUploaded = !(this._options.upload &&
                        this._options.upload.throwIfVersionAlreadyUploaded === false);

                    const currentlyUploaded = await validateVersion(
                        this._inputManifest.version,
                        throwIfVersionAlreadyUploaded,
                        apiFacade,
                        this._logWrapper,
                    );

                    if (!throwIfVersionAlreadyUploaded && currentlyUploaded) {
                        result.getAssets().uploadedExt = new ChromeWebstoreUploadedExtAsset({
                            extId: currentlyUploaded.id,
                            extVersion: currentlyUploaded.crxVersion,
                            apiResource: currentlyUploaded
                        });
                    }
                }
                if (!result.getAssets().uploadedExt) {
                    result.getAssets().uploadedExt = await upload(
                        this._inputZipBuffer as Buffer,
                        this._options.upload || {},
                        apiFacade,
                        this._inputManifest
                    );
                }
            }

            if (this._publishedExtRequired) {
                const uploadedExtAsset = result.getAssets().uploadedExt;
                result.getAssets().publishedExt = await publishExt(
                    this._options.extensionId,
                    this._options.publish || {},
                    this._logWrapper,
                    apiFacade,
                    uploadedExtAsset ? uploadedExtAsset.getValue().extVersion : undefined
                )
            }
        }
        
        if (this._publishedCrxBufferRequired || this._publishedCrxFileRequirement !== undefined) {
            await downloadCrx(
                this._options.extensionId,
                this._publishedCrxBufferRequired,
                this._publishedCrxFileRequirement,
                this._options.downloadCrx || {},
                result,
                this._logWrapper
            );
        }

        return Promise.resolve(result);
    }


}
