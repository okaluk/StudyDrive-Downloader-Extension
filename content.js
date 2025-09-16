
(function() {
    const urlPattern = /^https:\/\/www\.studydrive\.net\/[a-z]{2}\/doc\//i;
    let currentDocumentData = null;
    let lastExtractedData = null;
    let extractionTimeout = null;

    if (urlPattern.test(window.location.href)) {
        // Initial extraction
        extractDocumentData();
        
        // Monitor page changes (with debouncing)
        const observer = new MutationObserver(function(mutations) {
            // Debounce to avoid too frequent executions
            if (extractionTimeout) {
                clearTimeout(extractionTimeout);
            }
            extractionTimeout = setTimeout(() => {
                extractDocumentData();
            }, 500);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

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
        // Not on StudyDrive document page
        updateDocumentStatus(null);
    }

    async function extractDocumentData() {
        try {
            const result = await fetch(window.location.href);
            const html = await result.text();

            const parsedLink = getDownloadLink(html);
            const fileName = getFileName(html);

            const newData = (parsedLink && fileName) ? {
                downloadLink: parsedLink,
                fileName: fileName,
                url: window.location.href,
                timestamp: Date.now()
            } : null;

            // Only send updates when data has changed
            const hasChanged = !lastExtractedData || 
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

    function updateDocumentStatus(data) {
        currentDocumentData = data;
        
        // Send update to extension (for badge)
        chrome.runtime.sendMessage({
            action: 'updateDocumentStatus',
            data: data
        }).catch(() => {
            // Ignore errors when no listeners are available
        });

        // Also send to open popups
        chrome.runtime.sendMessage({
            action: 'documentDataUpdated',
            data: data
        }).catch(() => {
            // Ignore errors when no listeners are available
        });
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getDocumentData') {
            sendResponse({ data: currentDocumentData });
        } else if (request.action === 'downloadDocument') {
            if (currentDocumentData) {
                downloadDocument(currentDocumentData);
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'No document data available' });
            }
        }
    });

    async function downloadDocument(docData) {
        try {
            const downloadResult = await fetch(docData.downloadLink);
            const blob = await downloadResult.blob();
            downloadFile(blob, docData.fileName);
        } catch (error) {
            console.error('[StudyDrive Download] Download failed:', error);
        }
    }

    function getDownloadLink(html) {
        const linkMatch = /"file_preview":("[^"]*")/.exec(html);
        if (!linkMatch) {
            return null;
        }
        return JSON.parse(linkMatch[1]);
    }

    function getFileName(html) {
        const fileNameMatch = /"filename":("[^"]*")/.exec(html);
        if (!fileNameMatch) {
            return "preview.pdf";
        }
        let fileName = JSON.parse(fileNameMatch[1]);

        // this removes file extension docx and adds pdf file extension.
        if (fileName.endsWith('.docx')) {
            fileName = fileName.slice(0, -5) + '.pdf';
        }

        // this is to ensure only pdfs are downloaded.
        if (!fileName.endsWith('.pdf')) {
            return null;
        }

        return fileName;
    }

    function downloadFile(blob, fileName) {
        var link = document.createElement('a');
        link.download = fileName;
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank";
        link.click();
    }
})();
