interface DocumentData {
  downloadLink: string;
  fileName: string;
  url: string;
  timestamp: number;
}

export default defineBackground(() => {
  // Cache of the latest document status per tab id.
  const documentStatus: Record<number, DocumentData | null> = {};

  // Handle messages from content scripts and the popup.
  browser.runtime.onMessage.addListener((request: any, sender: any) => {
    if (request.action === 'updateDocumentStatus') {
      const tabId = sender.tab?.id;
      if (tabId != null) {
        documentStatus[tabId] = request.data;
        updateBadge(tabId, request.data);
      }
      return; // no response expected
    }

    if (request.action === 'getCurrentDocumentStatus') {
      const status = documentStatus[request.tabId] ?? null;
      return Promise.resolve({ data: status });
    }
  });

  // Cleanup on tab close.
  browser.tabs.onRemoved.addListener((tabId) => {
    delete documentStatus[tabId];
  });

  // Refresh the badge when switching tabs.
  browser.tabs.onActivated.addListener((activeInfo) => {
    updateBadge(activeInfo.tabId, documentStatus[activeInfo.tabId] ?? null);
  });

  function updateBadge(tabId: number, data: DocumentData | null | undefined) {
    if (data) {
      browser.action.setBadgeText({ text: '✓', tabId });
      browser.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
      browser.action.setTitle({
        title: `StudyDrive Downloader - Document available: ${data.fileName}`,
        tabId,
      });
    } else {
      browser.action.setBadgeText({ text: '', tabId });
      browser.action.setTitle({ title: 'StudyDrive Downloader', tabId });
    }
  }
});
