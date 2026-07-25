import { defineConfig } from 'wxt';

// WXT config — https://wxt.dev/api/config.html
// description/version are pulled from package.json; name is overridden here
// because the package name is kebab-case and not a good display name.
export default defineConfig({
  // Use the Mozilla webextension-polyfill so `browser.*` works
  // consistently across Chrome, Edge and Firefox.
  extensionApi: 'webextension-polyfill',
  manifest: ({ browser }) => ({
    name: 'StudyDrive Downloader Extension',
    permissions: ['activeTab'],
    icons: {
      128: 'icon.png',
    },
    action: {
      default_icon: 'icon.png',
    },
    // Firefox-only: required for signing/publishing on Firefox Add-ons (AMO).
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'studydrive-downloader@okaluk.github.io',
              strict_min_version: '109.0',
            },
          },
        }
      : {}),
  }),
});
