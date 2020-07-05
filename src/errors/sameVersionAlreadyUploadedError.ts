export class SameVersionAlreadyUploadedError extends Error {
    private readonly _version: string;

    constructor(version: string) {
        super(`Extension version ${version} is already uploaded`);
        this._version = version;
    }

    get version(): string {
        return this._version;
    }
}