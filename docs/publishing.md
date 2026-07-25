# Publishing & Automated Deployment

The extension is built with [WXT](https://wxt.dev) and published to the
Chrome Web Store, Firefox Add-ons (AMO) and Edge Add-ons automatically via the
[`PlasmoHQ/bpp`](https://github.com/PlasmoHQ/bpp) GitHub Action.

## How a release works

1. Bump the `version` in `package.json` (stores reject re-uploading an existing version).
2. Commit, then tag and push:
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```
3. The `.github/workflows/publish.yml` workflow builds all targets and uploads
   each to its store. You can also trigger it manually from the **Actions** tab.

`ci.yml` runs on every push/PR to type-check and build (no publishing).

## Required repository secret: `BPP_KEYS`

Add a single secret named `BPP_KEYS` (Settings → Secrets and variables → Actions)
containing JSON with credentials for each store. Omit a store's block to skip it.

```json
{
  "$schema": "https://raw.githubusercontent.com/PlasmoHQ/bms/main/assets/schema.json",
  "chrome": {
    "extId": "your-chrome-extension-id",
    "clientId": "google-oauth-client-id",
    "clientSecret": "google-oauth-client-secret",
    "refreshToken": "google-oauth-refresh-token"
  },
  "firefox": {
    "extId": "studydrive-downloader@okaluk.github.io",
    "apiKey": "amo-jwt-issuer",
    "apiSecret": "amo-jwt-secret"
  },
  "edge": {
    "productId": "edge-product-id",
    "clientId": "edge-api-client-id",
    "apiKey": "edge-api-key"
  }
}
```

### Getting the credentials

**Chrome Web Store**
- Create the item once manually in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) to get its `extId`.
- Enable the Chrome Web Store API in Google Cloud, create an OAuth client (type "Desktop"), and generate a refresh token. See the [chrome-webstore-upload docs](https://github.com/fregante/chrome-webstore-upload/blob/main/How-to-generate-Google-API-keys.md).

**Firefox Add-ons (AMO)**
- Generate API credentials at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/en-US/developers/addon/api/key/) → `apiKey` (issuer) + `apiSecret`.
- `extId` must match the `gecko.id` in `wxt.config.ts` (`studydrive-downloader@okaluk.github.io`).
- AMO requires source code for bundled extensions — the workflow uploads WXT's generated `sources.zip` automatically.

**Edge Add-ons**
- Create the item once in [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge) to get its `productId`.
- Create API credentials under Publish API settings → `clientId` + `apiKey`.

## Local commands

```bash
npm run dev            # live-reload dev build (Chrome)
npm run dev:firefox    # live-reload dev build (Firefox)
npm run build:all      # production build for chrome + firefox + edge
npm run zip:all        # zipped artifacts in .output/
npm run compile        # type check
```

## Notes

- The first submission to each store is usually done manually (to create the
  listing, upload screenshots, set descriptions). Automation handles every
  version thereafter.
- Store review policies may reject an extension whose stated purpose is to
  bypass a paywall — factor this into release planning.
