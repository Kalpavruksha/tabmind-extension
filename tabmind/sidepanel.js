// TabMind Side Panel JavaScript
// Handles UI interactions and communication with background service
class TabMindUI { 
    constructor() {
        this.currentTab = 'tabs';
        this.searchQuery = '';
        this.init();
    } 
    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.startAutoRefresh();
    
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTabs();
        });

        // Quick actions
        document.getElementById('saveSnapshotBtn').addEventListener('click', () => {
            this.saveSnapshot();
        });

        document.getElementById('groupTabsBtn').addEventListener('click', () => {
            this.autoGroupTabs();
        });

        document.getElementById('closeDuplicatesBtn').addEventListener('click', () => {
            this.closeDuplicates();
        });

        document.getElementById('suspendInactiveBtn').addEventListener('click', () => {
            this.suspendInactive();
        });

        // Event delegation for dynamically created buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = parseInt(target.dataset.id);

            switch (action) {
                case 'focusTab':
                    this.focusTab(id);
                    break;
                case 'closeTab':
                    this.closeTab(id);
                    break;
                case 'restoreSnapshot':
                    this.restoreSnapshot(id);
                    break;
                case 'viewSnapshot':
                    this.viewSnapshot(id);
                    break;
                case 'deleteSnapshot':
                    this.deleteSnapshot(id);
                    break;
                case 'applyGroupSuggestion':
                    this.applyGroupSuggestion(id);
                    break;
            }
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Content`).classList.add('active');

        this.currentTab = tabName;

        // Load specific data for the tab
        if (tabName === 'snapshots') {
            this.renderSnapshots();
        } else if (tabName === 'insights') {
            this.renderInsights();
        } else if (tabName === 'suggestions') {
            this.renderSuggestions();
        }
    }

    async loadData() {
        await Promise.all([
            this.updateMentalState(),
            this.updateStats(),
            this.renderTabs()
        ]);
    }

    startAutoRefresh() {
        // Refresh data every 5 seconds
        setInterval(() => {
            this.loadData();
        }, 5000);
    }

    async updateMentalState() {
        const response = await chrome.runtime.sendMessage({ action: 'getMentalState' });

        if (response && response.state) {
            const { state, reason } = response;

            const icon = document.getElementById('mentalStateIcon');
            const title = document.getElementById('mentalStateTitle');
            const message = document.getElementById('mentalStateMessage');

            // Remove all state classes
            icon.className = 'mental-state-icon';
            icon.classList.add(state);

            // Set icon emoji
            const icons = {
                focused: '🎯',
                distracted: '😵',
                overwhelmed: '😰',
                procrastinating: '🎮'
            };
            icon.textContent = icons[state] || '🧠';

            // Set title
            title.textContent = state.charAt(0).toUpperCase() + state.slice(1);

            // Set message
            message.textContent = reason || 'Keep going!';
        }
    }

    async updateStats() {
        const tabs = await chrome.tabs.query({});
        const sessions = await chrome.runtime.sendMessage({ action: 'getSessions' });
        const duplicates = await chrome.storage.local.get('duplicates');

        document.getElementById('totalTabsCount').textContent = tabs.length;
        document.getElementById('duplicatesCount').textContent = duplicates.duplicates?.length || 0;
        document.getElementById('sessionsCount').textContent = sessions.sessions?.length || 0;
    }

    async renderTabs() {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const tabsList = document.getElementById('tabsList');
        const tabsListCount = document.getElementById('tabsListCount');

        // Filter tabs based on search
        const filteredTabs = tabs.filter(tab => {
            if (!this.searchQuery) return true;
            const searchText = `${tab.title} ${tab.url}`.toLowerCase();
            return searchText.includes(this.searchQuery);
        });

        tabsListCount.textContent = filteredTabs.length;

        if (filteredTabs.length === 0) {
            tabsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No tabs found</div>
          <div class="empty-state-message">Try a different search query</div>
        </div>
      `;
            return;
        }

        // Get tab data from background
        const response = await chrome.runtime.sendMessage({ action: 'getTabData' });
        const tabDataMap = new Map(response.tabData?.map(t => [t.id, t]) || []);

        tabsList.innerHTML = filteredTabs.map(tab => {
            const tabData = tabDataMap.get(tab.id);
            const timeSpent = tabData ? this.formatTime(tabData.timeSpent) : '0s';
            const accessCount = tabData?.accessCount || 0;

            return `
        <div class="tab-item" data-tab-id="${tab.id}">
          <img src="${tab.favIconUrl || 'icons/icon16.png'}" class="tab-favicon" onerror="this.src='icons/icon16.png'">
          <div class="tab-info">
            <div class="tab-title">${this.escapeHtml(tab.title || 'Untitled')}</div>
            <div class="tab-url">${this.escapeHtml(this.shortenUrl(tab.url))}</div>
            <div class="tab-meta">
              <span>⏱️ ${timeSpent}</span>
              <span>👁️ ${accessCount} views</span>
            </div>
          </div>
          <div class="tab-actions">
            <button class="btn btn-sm btn-ghost tooltip" data-tooltip="Focus" data-action="focusTab" data-id="${tab.id}">
              👁️
            </button>
            <button class="btn btn-sm btn-ghost tooltip" data-tooltip="Close" data-action="closeTab" data-id="${tab.id}">
              ✖️
            </button>
          </div>
        </div>
      `;
        }).join('');
    }

    async renderSnapshots() {
        const response = await chrome.runtime.sendMessage({ action: 'getSessions' });
        const sessions = response.sessions || [];
        const snapshotsList = document.getElementById('snapshotsList');

        if (sessions.length === 0) {
            snapshotsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💾</div>
          <div class="empty-state-title">No snapshots yet</div>
          <div class="empty-state-message">Save your current tabs as a snapshot to restore them later</div>
        </div>
      `;
            return;
        }

        snapshotsList.innerHTML = sessions.reverse().map(session => `
      <div class="snapshot-item">
        <div class="snapshot-header">
          <div class="snapshot-name">${this.escapeHtml(session.name)}</div>
          <span class="badge badge-${session.mentalState}">${session.mentalState}</span>
        </div>
        <div class="snapshot-meta">
          <span>📑 ${session.tabs.length} tabs</span>
          <span>🕐 ${new Date(session.timestamp).toLocaleString()}</span>
        </div>
        <div class="snapshot-actions">
          <button class="btn btn-sm btn-primary" data-action="restoreSnapshot" data-id="${session.id}">
            🔄 Restore
          </button>
          <button class="btn btn-sm btn-secondary" data-action="viewSnapshot" data-id="${session.id}">
            👁️ View
          </button>
          <button class="btn btn-sm btn-danger" data-action="deleteSnapshot" data-id="${session.id}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join('');
    }

    async renderInsights() {
        const response = await chrome.runtime.sendMessage({ action: 'getTabData' });
        const tabData = response.tabData || [];
        const timeSpentChart = document.getElementById('timeSpentChart');

        if (tabData.length === 0) {
            timeSpentChart.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">No data yet</div>
          <div class="empty-state-message">Start browsing to see insights</div>
        </div>
      `;
            return;
        }

        // Group by domain and sum time spent
        const domainTime = new Map();
        for (const tab of tabData) {
            const domain = tab.domain || 'unknown';
            const current = domainTime.get(domain) || 0;
            domainTime.set(domain, current + (tab.timeSpent || 0));
        }

        // Sort by time spent
        const sorted = Array.from(domainTime.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10

        const maxTime = sorted[0]?.[1] || 1;

        timeSpentChart.innerHTML = sorted.map(([domain, time]) => {
            const percentage = (time / maxTime) * 100;
            return `
        <div class="time-bar">
          <div class="time-bar-label">${this.escapeHtml(domain)}</div>
          <div class="time-bar-fill">
            <div class="time-bar-progress" style="width: ${percentage}%"></div>
          </div>
          <div class="time-bar-value">${this.formatTime(time)}</div>
        </div>
      `;
        }).join('');
    }

    async renderSuggestions() {
        const suggestions = await chrome.storage.local.get('groupSuggestions');
        const suggestionsList = document.getElementById('suggestionsList');
        const groupSuggestions = suggestions.groupSuggestions || [];

        if (groupSuggestions.length === 0) {
            suggestionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💡</div>
          <div class="empty-state-title">No suggestions</div>
          <div class="empty-state-message">Open more tabs to get grouping suggestions</div>
        </div>
      `;
            return;
        }

        suggestionsList.innerHTML = groupSuggestions.map((suggestion, index) => `
      <div class="tab-group-suggestion">
        <div class="group-header">
          <div class="group-name">
            <span class="group-color-dot" style="background: ${this.getColorHex(suggestion.color)}"></span>
            <span>${this.escapeHtml(suggestion.name)}</span>
          </div>
          <button class="btn btn-sm btn-primary" data-action="applyGroupSuggestion" data-id="${index}">
            ✨ Apply
          </button>
        </div>
        <div class="text-muted" style="font-size: 0.875rem;">
          ${suggestion.tabs.length} tabs • ${suggestion.type === 'domain' ? 'By Domain' : 'By Topic'}
        </div>
      </div>
    `).join('');
    }

    // Actions
    async saveSnapshot() {
        await chrome.runtime.sendMessage({ action: 'saveSnapshot' });
        this.showNotification('Snapshot saved!', 'success');
        this.updateStats();
    }

    async autoGroupTabs() {
        const suggestions = await chrome.storage.local.get('groupSuggestions');
        const groupSuggestions = suggestions.groupSuggestions || [];

        if (groupSuggestions.length === 0) {
            this.showNotification('No grouping suggestions available', 'warning');
            return;
        }

        // Apply first suggestion
        await this.applyGroupSuggestion(0);
    }

    async applyGroupSuggestion(index) {
        const suggestions = await chrome.storage.local.get('groupSuggestions');
        const suggestion = suggestions.groupSuggestions?.[index];

        if (!suggestion) return;

        try {
            // Create tab group
            const tabIds = suggestion.tabs.map(t => t.id);
            const groupId = await chrome.tabs.group({ tabIds });

            // Update group properties
            await chrome.tabGroups.update(groupId, {
                title: suggestion.name,
                color: suggestion.color
            });

            this.showNotification(`Grouped ${tabIds.length} tabs`, 'success');
        } catch (error) {
            console.error('Error applying group suggestion:', error);
            this.showNotification('Failed to create group', 'error');
        }
    }

    async closeDuplicates() {
        const response = await chrome.runtime.sendMessage({ action: 'closeDuplicates' });
        if (response.success) {
            this.showNotification(`Closed ${response.count} duplicate tabs`, 'success');
            this.updateStats();
            this.renderTabs();
        }
    }

    async suspendInactive() {
        this.showNotification('Suspending inactive tabs...', 'info');
        // The background script handles this automatically
    }

    async focusTab(tabId) {
        await chrome.tabs.update(tabId, { active: true });
    }

    async closeTab(tabId) {
        await chrome.tabs.remove(tabId);
        this.renderTabs();
        this.updateStats();
    }

    async restoreSnapshot(snapshotId) {
        await chrome.runtime.sendMessage({
            action: 'restoreSnapshot',
            snapshotId
        });
        this.showNotification('Snapshot restored!', 'success');
    }

    async viewSnapshot(snapshotId) {
        const response = await chrome.runtime.sendMessage({ action: 'getSessions' });
        const session = response.sessions?.find(s => s.id === snapshotId);

        if (session) {
            const tabsList = session.tabs.map(t => `• ${t.title}`).join('\n');
            alert(`Snapshot: ${session.name}\n\n${tabsList}`);
        }
    }

    async deleteSnapshot(snapshotId) {
        if (confirm('Are you sure you want to delete this snapshot?')) {
            await chrome.runtime.sendMessage({
                action: 'deleteSnapshot',
                snapshotId
            });
            this.renderSnapshots();
            this.updateStats();
            this.showNotification('Snapshot deleted', 'success');
        }
    }

    // Utility functions
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    shortenUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname + urlObj.search;
            if (path.length > 40) {
                path = path.substring(0, 40) + '...';
            }
            return urlObj.hostname + path;
        } catch {
            return url.substring(0, 50) + (url.length > 50 ? '...' : '');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getColorHex(colorName) {
        const colors = {
            blue: '#3b82f6',
            red: '#ef4444',
            yellow: '#eab308',
            green: '#10b981',
            pink: '#ec4899',
            purple: '#8b5cf6',
            cyan: '#06b6d4',
            orange: '#f97316',
            grey: '#6b7280'
        };
        return colors[colorName] || colors.grey;
    }

    showNotification(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize UI
const tabMindUI = new TabMindUI();
