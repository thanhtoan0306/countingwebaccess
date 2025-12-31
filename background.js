// Background service worker for Chrome Extension

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only track when page is fully loaded
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            await trackVisit(tab.url);
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }
});

// Track visit to a URL
async function trackVisit(url) {
    try {
        // Parse URL to get domain
        let domain;
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch (e) {
            // If URL is invalid (e.g., chrome://, about:), skip tracking
            return;
        }
        
        // Skip chrome internal pages
        if (url.startsWith('chrome://') || 
            url.startsWith('chrome-extension://') || 
            url.startsWith('about:') ||
            url.startsWith('edge://')) {
            return;
        }
        
        // Get existing visit history
        const result = await chrome.storage.local.get(['visitHistory']);
        const visitHistory = result.visitHistory || {};
        
        const now = new Date().toISOString();
        
        // Initialize domain entry if it doesn't exist
        if (!visitHistory[domain]) {
            visitHistory[domain] = {
                count: 0,
                lastVisit: now,
                visits: [],
                urls: [] // Store full URLs
            };
        }
        
        // Update visit count and history
        visitHistory[domain].count += 1;
        visitHistory[domain].lastVisit = now;
        
        // Add to visits array with URL (keep last 100 visits per domain)
        if (!visitHistory[domain].visits) {
            visitHistory[domain].visits = [];
        }
        // Always store full URL with each visit
        visitHistory[domain].visits.push({
            timestamp: now,
            url: url // Store complete URL including path, query, etc.
        });
        
        // Add full URL to unique urls array (for quick reference)
        if (!visitHistory[domain].urls) {
            visitHistory[domain].urls = [];
        }
        if (!visitHistory[domain].urls.includes(url)) {
            visitHistory[domain].urls.push(url);
        }
        
        // Keep only last 100 visits per domain to avoid storage bloat
        if (visitHistory[domain].visits.length > 100) {
            visitHistory[domain].visits = visitHistory[domain].visits.slice(-100);
        }
        
        // Keep only last 50 unique URLs per domain
        if (visitHistory[domain].urls.length > 50) {
            visitHistory[domain].urls = visitHistory[domain].urls.slice(-50);
        }
        
        // Save to storage
        await chrome.storage.local.set({ visitHistory: visitHistory });
        
        console.log(`Tracked visit to ${domain} (Total: ${visitHistory[domain].count})`);
    } catch (error) {
        console.error('Error in trackVisit:', error);
    }
}

// Listen for storage changes (for debugging)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.visitHistory) {
        console.log('Visit history updated');
    }
});

