[![npm-publish](https://github.com/cardinalby/webext-buildtools-chrome-webstore-builder/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/cardinalby/webext-buildtools-chrome-webstore-builder/actions/workflows/npm-publish.yml)

### Introduction
*webext-buildtools* builder which allows you to upload, publish and download crx file from Chrome Web Store.

If you need a **complete solution** for Web Extension build/deploy, go to 
[webext-buildtools-integrated-builder](https://github.com/cardinalby/webext-buildtools-integrated-builder) repo.  

To read what are *webext-buildtools* and *builders* go to 
[webext-buildtools-builder-types](https://github.com/cardinalby/webext-buildtools-builder-types) repo.

### Installation
`npm install webext-buildtools-chrome-webstore-builder`

### Purpose
Builder is based on [typed-chrome-webstore-api](https://github.com/cardinalby/typed-chrome-webstore-api) 
package and allows you to upload and publish your Web Extension to Chrome Web Store and then download published crx file.

Builder doesn't allow publish a new extension, only update the existing one (specified by `extensionId` in options) 
with new version.  

### Usage example
```js
const ChromeWebstoreBuilder = require('webext-buildtools-chrome-webstore-builder').default;
const fs = require('fs-extra');

const options = { ... }; // see description below
const logMethod = console.log;
const builder = new ChromeWebstoreBuilder(options, logMethod);

// You can omit this, manifest will be extracted from zip file
builder.setInputManifest(await fs.readJson('./ext_dir/package.json'));
builder.setInputZipBuffer(await fs.read('./packed.zip'));

builder.requireUploadedExt();
builder.requirePublishedExt();
builder.requirePublishedCrxFile();

const buildResult = await builder.build();
``` 

### Options
Options object described in [declarations/options.d.ts](declarations/options.d.ts)

[See](https://github.com/cardinalby/webext-buildtools-integrated-builder/blob/master/logMethod.md) how to get `logMethod` for pretty output.

#### apiAccess
To setup API access you need to specify `clientId`, `clientSecret` and `refreshToken` in `options.apiAccess`.
To find out how to obtain them you can read:
* [Using the Chrome Web Store Publish API](https://developer.chrome.com/webstore/using_webstore_api) 
* [How to generate Google API keys](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md)

Alternatively, you can directly set valid `options.accessToken` (be sure it's not expired). 

### Inputs
1. **`setInputManifest(...)`**. Optional. Object with parsed extension's `package.json`. Will be extracted from zip if not specified.
2. **`setInputZipBuffer(...)`**. Buffer with zipped extension dir. Required to upload extension.

You can use [webext-buildtools-dir-reader-mw](https://www.npmjs.com/package/webext-buildtools-dir-reader-mw)
to generate needed inputs from extension directory.

### Outputs

#### uploaded ext
Require to upload extension to Chrome Web Store (first step before publish)<br>

*Required options:* `extensionId`, `apiAccess` or `accessToken` <br>
*Require methods:* `requireUploadedExt()` <br>
*Assets:* <br> 
`const uploadInfo = buildResult.getAssets().uploadedExt.getValue()`
Contains information about extension before and after upload
[upload info definition](declarations/uploadedExtInfo.d.ts)

#### published ext
Require to publish extension to Chrome Web Store (second step). 
Normally is used with `requireUploadedExt()`, but can be used to publish already uploaded version <br>

*Required options:* `extensionId`, `apiAccess` or `accessToken`<br>
*Require methods:* `requirePublishedExt()` <br>
*Assets:* <br> 
`const publishInfo = buildResult.getAssets().publishedExt.getValue()` 
[publish info definition](declarations/publishedExtInfo.d.ts)

#### published crx file
Download published crx file from Chrome Web Store (undocumented feature). Normally is
used together with `requireUploadedExt()` and  `requirePublishedExt()`, but can be used
separately to download crx file for `extensionId` specified in options. 

*Required options:* `downloadCrx.outCrxFilePath` (for not temporary file), `extensionId` <br>
*Require methods:* `requirePublishedCrxFile()`, `requirePublishedCrxBuffer()` <br>
*Assets:* <br>
`const crxFilePath = buildResult.getAssets().publishedCrxFile.getValue()`<br>
`const crxBuffer = buildResult.getAssets().publishedCrxBuffer.getValue()`

### Errors
`builder.build()` call can be rejected with general `Error` or the following specific errors if 
extension upload was required:
* `InvalidManifestVersionError` if manifest file has invalid extension version.
* `NewerVersionAlreadyUploadedError` if currently uploaded version is greater than the version in 
the extension manifest.
* `SameVersionAlreadyUploadedError` if currently uploaded version equals to the version in 
the extension manifest.
* `UploadInReviewError` if upload failed due to item currently in the review state.