// Popup script for Chrome Extension

let currentUrl = '';
let currentDomain = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentTab();
    await updateVisitCount();
    await loadTop10Chart();
    await loadHistory();
    
    // Event listeners
    document.getElementById('clear-btn').addEventListener('click', async () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử truy cập?')) {
            await clearHistory();
            await updateVisitCount();
            await loadTop10Chart();
            await loadHistory();
        }
    });
    
    document.getElementById('filter-select').addEventListener('change', async () => {
        await loadHistory();
    });
});

// Get current active tab
async function loadCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            currentUrl = tab.url;
            currentDomain = new URL(tab.url).hostname;
            document.getElementById('current-url').textContent = currentDomain;
        } else {
            document.getElementById('current-url').textContent = 'Không có trang nào';
        }
    } catch (error) {
        console.error('Error loading current tab:', error);
        document.getElementById('current-url').textContent = 'Lỗi tải trang';
    }
}

// Update visit count for current site
async function updateVisitCount() {
    try {
        const result = await chrome.storage.local.get(['visitHistory']);
        const visitHistory = result.visitHistory || {};
        
        const count = visitHistory[currentDomain] ? visitHistory[currentDomain].count : 0;
        document.getElementById('visit-count').textContent = count;
    } catch (error) {
        console.error('Error updating visit count:', error);
    }
}

// Load and display history
async function loadHistory() {
    const historyList = document.getElementById('history-list');
    const filter = document.getElementById('filter-select').value;
    
    historyList.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const result = await chrome.storage.local.get(['visitHistory']);
        const visitHistory = result.visitHistory || {};
        
        let historyItems = [];
        
        // Convert visitHistory object to array
        for (const [domain, data] of Object.entries(visitHistory)) {
            if (filter === 'current' && domain !== currentDomain) {
                continue;
            }
            
            historyItems.push({
                domain: domain,
                count: data.count,
                lastVisit: data.lastVisit,
                visits: data.visits || []
            });
        }
        
        // Sort by last visit time (most recent first)
        historyItems.sort((a, b) => {
            return new Date(b.lastVisit) - new Date(a.lastVisit);
        });
        
        if (historyItems.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div>Chưa có lịch sử truy cập</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        historyItems.forEach(item => {
            const historyItem = createHistoryItem(item);
            historyList.appendChild(historyItem);
        });
        
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<div class="empty-state">Lỗi tải lịch sử</div>';
    }
}

// Create history item element
function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const lastVisit = new Date(item.lastVisit);
    const timeString = formatDateTime(lastVisit);
    
    div.innerHTML = `
        <div class="history-item-header">
            <div class="history-item-url" title="${item.domain}">${item.domain}</div>
            <div class="history-item-time">${timeString}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="history-item-count">${item.count} lượt truy cập</div>
            <button class="btn-details" data-domain="${item.domain}" style="
                padding: 4px 8px;
                font-size: 11px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Chi tiết</button>
        </div>
    `;
    
    // Add click handler for details button
    const detailsBtn = div.querySelector('.btn-details');
    detailsBtn.addEventListener('click', () => {
        showVisitDetails(item);
    });
    
    return div;
}

// Show visit details modal
function showVisitDetails(item) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        width: 500px;
    `;
    
    const visitsList = item.visits
        .sort((a, b) => new Date(b) - new Date(a))
        .map(visit => {
            const date = new Date(visit);
            return `<div style="padding: 8px; border-bottom: 1px solid #eee;">
                ${formatDateTime(date)}
            </div>`;
        }).join('');
    
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 15px; color: #667eea;">${item.domain}</h2>
        <div style="margin-bottom: 15px;">
            <strong>Tổng số lượt truy cập:</strong> ${item.count}
        </div>
        <h3 style="margin-bottom: 10px; font-size: 14px;">Lịch sử chi tiết:</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${visitsList || '<div style="padding: 20px; text-align: center; color: #999;">Chưa có lịch sử chi tiết</div>'}
        </div>
        <button id="close-modal" style="
            margin-top: 15px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
        ">Đóng</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    modalContent.querySelector('#close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Clear all history
async function clearHistory() {
    try {
        await chrome.storage.local.set({ visitHistory: {} });
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('Lỗi khi xóa lịch sử');
    }
}

// Load and display top 10 chart
async function loadTop10Chart() {
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const result = await chrome.storage.local.get(['visitHistory']);
        const visitHistory = result.visitHistory || {};
        
        // Convert to array and sort by count
        let sites = [];
        for (const [domain, data] of Object.entries(visitHistory)) {
            sites.push({
                domain: domain,
                count: data.count
            });
        }
        
        // Sort by count (descending) and take top 10
        sites.sort((a, b) => b.count - a.count);
        sites = sites.slice(0, 10);
        
        if (sites.length === 0) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div>Chưa có dữ liệu</div>
                </div>
            `;
            return;
        }
        
        // Find max count for scaling
        const maxCount = sites[0].count;
        
        // Create chart
        chartContainer.innerHTML = '';
        const chart = document.createElement('div');
        chart.className = 'chart';
        
        sites.forEach((site, index) => {
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar-container';
            
            const percentage = (site.count / maxCount) * 100;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = truncateDomain(site.domain, 25);
            label.title = site.domain;
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'chart-bar-wrapper';
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.width = `${percentage}%`;
            bar.style.background = getBarColor(index);
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = site.count;
            
            barWrapper.appendChild(bar);
            barWrapper.appendChild(value);
            
            barContainer.appendChild(label);
            barContainer.appendChild(barWrapper);
            
            chart.appendChild(barContainer);
        });
        
        chartContainer.appendChild(chart);
        
    } catch (error) {
        console.error('Error loading chart:', error);
        chartContainer.innerHTML = '<div class="empty-state">Lỗi tải biểu đồ</div>';
    }
}

// Get color for bar based on index
function getBarColor(index) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)'
    ];
    return colors[index % colors.length];
}

// Truncate domain name if too long
function truncateDomain(domain, maxLength) {
    if (domain.length <= maxLength) {
        return domain;
    }
    return domain.substring(0, maxLength - 3) + '...';
}

// Format date and time
function formatDateTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'Vừa xong';
    } else if (minutes < 60) {
        return `${minutes} phút trước`;
    } else if (hours < 24) {
        return `${hours} giờ trước`;
    } else if (days < 7) {
        return `${days} ngày trước`;
    } else {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

