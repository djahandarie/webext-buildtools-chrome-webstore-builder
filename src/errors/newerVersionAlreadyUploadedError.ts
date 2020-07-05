export class NewerVersionAlreadyUploadedError extends Error {
    private readonly _extVersion: string;
    private readonly _currentVersion: string;

    constructor(extVersion: string, currentVersion: string) {
        super(`New ${extVersion} version have to be greater than the current ${currentVersion}`);
        this._extVersion = extVersion;
        this._currentVersion = currentVersion;
    }

    get extVersion(): string {
        return this._extVersion;
    }

    get currentVersion(): string {
        return this._currentVersion;
    }
}