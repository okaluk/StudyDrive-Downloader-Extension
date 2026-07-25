interface DocumentData {
  downloadLink: string;
  fileName: string;
  url: string;
  timestamp: number;
}

export default defineContentScript({
  matches: ['https://www.studydrive.net/*'],
  runAt: 'document_end',
  main() {
    const urlPattern = /^https:\/\/www\.studydrive\.net\/[a-z]{2}\/doc\//i;
    let currentDocumentData: DocumentData | null = null;
    let lastExtractedData: DocumentData | null = null;
    let extractionTimeout: ReturnType<typeof setTimeout> | null = null;

    if (urlPattern.test(window.location.href)) {
      // Initial extraction
      extractDocumentData();

      // Monitor page changes (with debouncing)
      const observer = new MutationObserver(() => {
        if (extractionTimeout) {
          clearTimeout(extractionTimeout);
        }
        extractionTimeout = setTimeout(() => {
          extractDocumentData();
        }, 500);
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Monitor URL changes (for SPA navigation)
      let currentUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          if (urlPattern.test(currentUrl)) {
            extractDocumentData();
          } else {
            updateDocumentStatus(null);
          }
        }
      }, 1000);
    } else {
      // Not on a StudyDrive document page
      updateDocumentStatus(null);
    }

    async function extractDocumentData() {
      try {
        const result = await fetch(window.location.href);
        const html = await result.text();

        const parsedLink = getDownloadLink(html);
        const fileName = getFileName(html);

        const newData: DocumentData | null =
          parsedLink && fileName
            ? {
                downloadLink: parsedLink,
                fileName,
                url: window.location.href,
                timestamp: Date.now(),
              }
            : null;

        // Only send updates when data has changed
        const hasChanged =
          !lastExtractedData ||
          JSON.stringify(lastExtractedData) !== JSON.stringify(newData);

        if (hasChanged) {
          lastExtractedData = newData;
          updateDocumentStatus(newData);
        }
      } catch (error) {
        console.error('[StudyDrive Download] Error extracting document data:', error);
        if (lastExtractedData !== null) {
          lastExtractedData = null;
          updateDocumentStatus(null);
        }
      }
    }

    function updateDocumentStatus(data: DocumentData | null) {
      currentDocumentData = data;

      // Send update to extension (for badge)
      browser.runtime
        .sendMessage({ action: 'updateDocumentStatus', data })
        .catch(() => {
          // Ignore errors when no listeners are available
        });

      // Also send to open popups
      browser.runtime
        .sendMessage({ action: 'documentDataUpdated', data })
        .catch(() => {
          // Ignore errors when no listeners are available
        });
    }

    // Listen for messages from popup
    browser.runtime.onMessage.addListener((request: any) => {
      if (request.action === 'getDocumentData') {
        return Promise.resolve({ data: currentDocumentData });
      }
      if (request.action === 'downloadDocument') {
        if (currentDocumentData) {
          downloadDocument(currentDocumentData);
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({
          success: false,
          error: 'No document data available',
        });
      }
    });

    async function downloadDocument(docData: DocumentData) {
      try {
        const downloadResult = await fetch(docData.downloadLink);
        const blob = await downloadResult.blob();
        downloadFile(blob, docData.fileName);
      } catch (error) {
        console.error('[StudyDrive Download] Download failed:', error);
      }
    }

    function getDownloadLink(html: string): string | null {
      const linkMatch = /"file_preview":("[^"]*")/.exec(html);
      if (!linkMatch) {
        return null;
      }
      return JSON.parse(linkMatch[1]);
    }

    function getFileName(html: string): string | null {
      const fileNameMatch = /"filename":("[^"]*")/.exec(html);
      if (!fileNameMatch) {
        return 'preview.pdf';
      }
      let fileName: string = JSON.parse(fileNameMatch[1]);

      // Remove the .docx extension and treat it as a .pdf.
      if (fileName.endsWith('.docx')) {
        fileName = fileName.slice(0, -5) + '.pdf';
      }

      // Ensure only PDFs are downloaded.
      if (!fileName.endsWith('.pdf')) {
        return null;
      }

      return fileName;
    }

    function downloadFile(blob: Blob, fileName: string) {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = window.URL.createObjectURL(blob);
      link.target = '_blank';
      link.click();
    }
  },
});
