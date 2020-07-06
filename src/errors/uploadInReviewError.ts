export class UploadInReviewError extends Error {
    private readonly _currentVersion: string|undefined;

    constructor(message: string, currentVersion: string|undefined) {
        super(message);
        this._currentVersion = currentVersion;
    }

    get currentVersion(): string|undefined {
        return this._currentVersion;
    }
}