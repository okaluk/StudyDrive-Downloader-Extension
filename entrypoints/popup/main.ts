interface DocumentData {
  downloadLink: string;
  fileName: string;
  url: string;
  timestamp: number;
}

document.addEventListener('DOMContentLoaded', () => {
  const states: Record<string, HTMLElement | null> = {
    loading: document.getElementById('loadingState'),
    noDocument: document.getElementById('noDocumentState'),
    documentAvailable: document.getElementById('documentAvailableState'),
    downloading: document.getElementById('downloadingState'),
    error: document.getElementById('errorState'),
  };

  const elements = {
    downloadButton: document.getElementById('downloadButton') as HTMLButtonElement,
    retryButton: document.getElementById('retryButton') as HTMLButtonElement,
    documentName: document.getElementById('documentName') as HTMLElement,
  };

  let currentDocumentData: DocumentData | null = null;

  // Start with "noDocument" instead of loading.
  showState('noDocument');
  initialize();

  async function initialize() {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.url || !tab.url.includes('studydrive.net')) {
        showState('noDocument');
        return;
      }

      // First: try the cached status from the background script.
      const cached: any = await browser.runtime.sendMessage({
        action: 'getCurrentDocumentStatus',
        tabId: tab.id,
      });

      if (cached && cached.data) {
        currentDocumentData = cached.data;
        showDocumentAvailable(cached.data);
        return;
      }

      // Fallback: ask the content script directly.
      try {
        const contentResponse: any = await browser.tabs.sendMessage(tab.id!, {
          action: 'getDocumentData',
        });
        if (contentResponse && contentResponse.data) {
          currentDocumentData = contentResponse.data;
          showDocumentAvailable(contentResponse.data);
        } else {
          showState('noDocument');
        }
      } catch {
        // Content script not ready / not injected on this page.
        showState('noDocument');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      showState('error');
    }
  }

  function showState(stateName: string) {
    Object.values(states).forEach((state) => {
      if (state) state.style.display = 'none';
    });
    if (states[stateName]) {
      states[stateName]!.style.display = 'block';
    }
  }

  function showDocumentAvailable(documentData: DocumentData) {
    elements.documentName.textContent = documentData.fileName;
    showState('documentAvailable');
  }

  elements.downloadButton.addEventListener('click', async () => {
    if (!currentDocumentData) {
      showState('error');
      return;
    }

    try {
      showState('downloading');

      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const response: any = await browser.tabs.sendMessage(tab.id!, {
        action: 'downloadDocument',
      });

      if (response && response.success) {
        // Briefly show success, then return to the available state.
        setTimeout(() => {
          showDocumentAvailable(currentDocumentData!);
        }, 1000);
      } else {
        console.error('Download failed:', response?.error);
        showState('error');
      }
    } catch (error) {
      console.error('Download error:', error);
      showState('error');
    }
  });

  elements.retryButton.addEventListener('click', () => {
    initialize();
  });

  // Listen for live updates from the content script.
  browser.runtime.onMessage.addListener((request: any) => {
    if (request.action === 'documentDataUpdated') {
      if (request.data) {
        currentDocumentData = request.data;
        showDocumentAvailable(request.data);
      } else {
        currentDocumentData = null;
        showState('noDocument');
      }
    }
  });
});
