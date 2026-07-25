# StudyDrive Downloader for free without premium ⭐

<div align="center">
  <h2>📥 StudyDrive Downloader Extension</h2>
  <p><em>Download documents from StudyDrive — now available for Chrome, Edge and Firefox.</em></p>

  <p>
    <a href="https://github.com/okaluk/StudyDrive-Downloader-Extension/releases/latest">
      <img src="https://img.shields.io/github/v/release/okaluk/StudyDrive-Downloader-Extension?label=latest%20release" alt="Latest release">
    </a>
  </p>
</div>

---

## ✅ Supported Browsers

| Browser | Manifest | Status |
|---------|----------|--------|
| Google Chrome | MV3 | ✅ Supported |
| Microsoft Edge | MV3 | ✅ Supported |
| Mozilla Firefox | MV2 | ✅ Supported |

All builds are produced from a single codebase with [WXT](https://wxt.dev) and
published as ready-to-install `.zip` files on the
[**Releases**](https://github.com/okaluk/StudyDrive-Downloader-Extension/releases/latest)
page.

---

## 🚀 Installation

### 1. Download your browser's build

Go to the [**latest release**](https://github.com/okaluk/StudyDrive-Downloader-Extension/releases/latest)
and download the zip for your browser:

- `studydrive-downloader-chrome.zip`
- `studydrive-downloader-edge.zip`
- `studydrive-downloader-firefox.zip`

Extract the zip into a folder of your choice.

<!-- SCREENSHOT: the Releases page assets list. Capture the "Assets" section of the latest release. -->

### 2. Load the extension

<details open>
<summary><strong>🟢 Chrome</strong></summary>

<br>

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the extracted folder

<div align="center">
  <img src="https://github.com/Hamidchkms/StudyDrive-Downloader-Extension/assets/85966772/05b39353-2380-4f89-8e96-706e6ff91d43" alt="Enable Developer Mode and Load unpacked" width="600">
  <br><em>Enable Developer Mode and click "Load unpacked"</em>
</div>

<div align="center">
  <img src="https://github.com/Hamidchkms/StudyDrive-Downloader-Extension/assets/85966772/bd577211-d9ff-4b37-adc8-1372fd8cd0a2" alt="Select the extracted folder" width="600">
  <br><em>Select the folder containing the extracted files</em>
</div>

</details>

<details>
<summary><strong>🔵 Microsoft Edge</strong></summary>

<br>

1. Open `edge://extensions`
2. Enable **Developer mode** (left-hand toggle)
3. Click **Load unpacked** and select the extracted folder

<!-- SCREENSHOT: edge://extensions with Developer mode on and "Load unpacked". -->

</details>

<details>
<summary><strong>🟠 Firefox</strong></summary>

<br>

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select the `manifest.json` inside the extracted folder (or the zip itself)

> ⚠️ **Note:** Temporary add-ons are removed when Firefox restarts. For a
> permanent install the extension must be signed by Mozilla (AMO).

<!-- SCREENSHOT: about:debugging "Load Temporary Add-on" screen. -->

</details>

### 3. Pin the extension (recommended)

Pin the extension to your toolbar so you can see when a download is available.

<div align="center">
  <img src="https://github.com/user-attachments/assets/f0569a75-10bf-4c2b-94d5-c8a018e48633" alt="Extensions icon" width="300">
  <br><em>Click the puzzle-piece icon, then pin the extension</em>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/4e58175f-c3cd-4aa3-8058-b7c732cb4fbf" alt="Extension pinned" width="400">
  <br><em>The StudyDrive Downloader icon is now visible in your toolbar</em>
</div>

> 🎉 **Done!** The extension is installed and ready to use.

---

## 📖 Usage

1. Navigate to a **StudyDrive document page** (`https://www.studydrive.net/.../doc/...`).
2. When a document is available, the extension icon shows a green ✓ badge.

<div align="center">
  <img src="https://github.com/user-attachments/assets/3858c281-3b4e-43e0-986a-33c9d5803492" alt="Extension shows a document is available" width="400">
  <br><em>The badge appears when a document can be downloaded</em>
</div>

3. Click the extension icon and press **Download** in the popup.

<div align="center">
  <img src="https://github.com/user-attachments/assets/12021e7b-5726-48a4-97a9-75000a33c88e" alt="Download button in the popup" width="300">
  <br><em>Click "Download" to save the document</em>
</div>

---

## 🛠️ For Developers

Built with [WXT](https://wxt.dev); all entrypoints live under `entrypoints/`.

```bash
npm install
npm run dev            # live-reload dev build (Chrome)
npm run dev:firefox    # live-reload dev build (Firefox)
npm run build:all      # production build: chrome + firefox + edge
npm run zip:all        # packaged .zip artifacts in .output/
npm run compile        # type check
```

Load a dev build via **Load unpacked** pointing at `.output/chrome-mv3` (or the
matching browser directory).

### Releasing

Packaged zips are published automatically as **GitHub Releases** by the
[`Release` workflow](.github/workflows/release.yml). To cut a release, bump
`version` in `package.json`, then tag and push:

```bash
git tag v2.1.0
git push origin v2.1.0
```

> The workflow creates the release and its notes. Don't pre-create the release
> in the GitHub UI, or the notes will be duplicated.

---

## 📋 Notes

- 🆓 **Free access**: download StudyDrive documents without a premium subscription.
- 🔧 **Developer mode** must stay enabled for manually-loaded (unpacked) extensions.
- 🧩 Chrome/Edge use Manifest V3; Firefox uses Manifest V2.

---

<div align="center">
  <p><strong>🎉 Enjoy free access to StudyDrive documents! 🎉</strong></p>
</div>
