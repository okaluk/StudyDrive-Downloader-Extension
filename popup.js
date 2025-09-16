
document.addEventListener('DOMContentLoaded', function() {
    const states = {
        loading: document.getElementById('loadingState'),
        noDocument: document.getElementById('noDocumentState'),
        documentAvailable: document.getElementById('documentAvailableState'),
        downloading: document.getElementById('downloadingState'),
        error: document.getElementById('errorState')
    };

    const elements = {
        downloadButton: document.getElementById('downloadButton'),
        retryButton: document.getElementById('retryButton'),
        documentName: document.getElementById('documentName')
    };

    let currentDocumentData = null;

    // Initialization
    showState('noDocument'); // Start with "noDocument" instead of loading
    initialize();

    async function initialize() {
        try {
            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.url.includes('studydrive.net')) {
                showState('noDocument');
                return;
            }

            // First: Try to get cached status from background script
            chrome.runtime.sendMessage({ 
                action: 'getCurrentDocumentStatus', 
                tabId: tab.id 
            }, (response) => {
                if (response && response.data) {
                    currentDocumentData = response.data;
                    showDocumentAvailable(response.data);
                } else {
                    // Fallback: Direct request to content script if no cache
                    chrome.tabs.sendMessage(tab.id, { action: 'getDocumentData' }, (contentResponse) => {
                        if (chrome.runtime.lastError) {
                            console.log('Content script not ready yet');
                            showState('noDocument');
                            return;
                        }

                        if (contentResponse && contentResponse.data) {
                            currentDocumentData = contentResponse.data;
                            showDocumentAvailable(contentResponse.data);
                        } else {
                            showState('noDocument');
                        }
                    });
                }
            });

        } catch (error) {
            console.error('Initialization error:', error);
            showState('error');
        }
    }

    function showState(stateName) {
        // Hide all states
        Object.values(states).forEach(state => {
            state.style.display = 'none';
        });
        
        // Show desired state
        if (states[stateName]) {
            states[stateName].style.display = 'block';
        }
    }

    function showDocumentAvailable(documentData) {
        elements.documentName.textContent = documentData.fileName;
        showState('documentAvailable');
    }

    // Event Listeners
    elements.downloadButton.addEventListener('click', async function() {
        if (!currentDocumentData) {
            showState('error');
            return;
        }

        try {
            showState('downloading');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { 
                action: 'downloadDocument' 
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Download error:', chrome.runtime.lastError);
                    showState('error');
                    return;
                }

                if (response && response.success) {
                    // Download successful - briefly show success, then back to available state
                    setTimeout(() => {
                        showDocumentAvailable(currentDocumentData);
                    }, 1000);
                } else {
                    console.error('Download failed:', response?.error);
                    showState('error');
                }
            });

        } catch (error) {
            console.error('Download error:', error);
            showState('error');
        }
    });

    elements.retryButton.addEventListener('click', function() {
        initialize();
    });

    // Listen for updates from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
