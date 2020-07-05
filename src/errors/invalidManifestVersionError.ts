export class InvalidManifestVersionError extends Error {
    private readonly _manifestVersion: string;

    constructor(manifestVersion: string) {
        super('Extension version is invalid: ' + manifestVersion);
        this._manifestVersion = manifestVersion;
    }

    get manifestVersion(): string {
        return this._manifestVersion;
    }
}