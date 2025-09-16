let documentStatus = {};

// Listen for updates from Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateDocumentStatus') {
        const tabId = sender.tab?.id;
        if (tabId) {
            documentStatus[tabId] = request.data;
            updateBadge(tabId, request.data);
        }
    }
});

// Cleanup on tab closing
chrome.tabs.onRemoved.addListener((tabId) => {
    delete documentStatus[tabId];
});

// Badge update on tab switch
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tabId = activeInfo.tabId;
    const status = documentStatus[tabId];
    updateBadge(tabId, status);
});

function updateBadge(tabId, data) {
    if (data) {
        // Document available
        chrome.action.setBadgeText({
            text: '✓',
            tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#4CAF50',
            tabId: tabId
        });
        chrome.action.setTitle({
            title: `StudyDrive Downloader - Document available: ${data.fileName}`,
            tabId: tabId
        });
    } else {
        // No document
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
        chrome.action.setTitle({
            title: 'StudyDrive Downloader',
            tabId: tabId
        });
    }
}

// Expose document status for Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCurrentDocumentStatus') {
        const tabId = request.tabId;
        const status = documentStatus[tabId] || null;
        sendResponse({ data: status });
    }
});