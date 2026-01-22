// TabMind Popup JavaScript

class PopupUI {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('openSidePanelBtn').addEventListener('click', async () => {
            try {
                // Check if sidePanel API is available (Chrome 114+)
                if (chrome.sidePanel && chrome.sidePanel.open) {
                    const window = await chrome.windows.getCurrent();
                    await chrome.sidePanel.open({ windowId: window.id });
                    window.close();
                } else {
                    // Fallback: Open in new tab if side panel not available
                    chrome.tabs.create({ url: 'sidepanel.html' });
                    window.close();
                }
            } catch (error) {
                console.error('Error opening side panel:', error);
                // Fallback to opening in new tab
                chrome.tabs.create({ url: 'sidepanel.html' });
                window.close();
            }
        });

        document.getElementById('saveSnapshotPopupBtn').addEventListener('click', async () => {
            try {
                await chrome.runtime.sendMessage({ action: 'saveSnapshot' });
                this.showNotification('Snapshot saved!');
                await this.loadData();
            } catch (error) {
                console.error('Error saving snapshot:', error);
                this.showNotification('Error saving snapshot');
            }
        });

        document.getElementById('autoGroupPopupBtn').addEventListener('click', async () => {
            try {
                const suggestions = await chrome.storage.local.get('groupSuggestions');
                const groupSuggestions = suggestions.groupSuggestions || [];

                if (groupSuggestions.length === 0) {
                    this.showNotification('No grouping suggestions available');
                    return;
                }

                // Apply first suggestion
                const suggestion = groupSuggestions[0];
                const tabIds = suggestion.tabs.map(t => t.id);
                const groupId = await chrome.tabs.group({ tabIds });
                await chrome.tabGroups.update(groupId, {
                    title: suggestion.name,
                    color: suggestion.color
                });
                this.showNotification(`Grouped ${tabIds.length} tabs`);
            } catch (error) {
                console.error('Error grouping tabs:', error);
                this.showNotification('Failed to create group');
            }
        });

        document.getElementById('closeDuplicatesPopupBtn').addEventListener('click', async () => {
            try {
                const response = await chrome.runtime.sendMessage({ action: 'closeDuplicates' });
                if (response && response.success) {
                    this.showNotification(`Closed ${response.count} duplicates`);
                    await this.loadData();
                } else {
                    this.showNotification('No duplicates found');
                }
            } catch (error) {
                console.error('Error closing duplicates:', error);
                this.showNotification('Error closing duplicates');
            }
        });

        document.getElementById('settingsLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'settings.html' });
        });
    }

    async loadData() {
        try {
            // Update mental state
            const mentalState = await chrome.runtime.sendMessage({ action: 'getMentalState' });
            if (mentalState && mentalState.state) {
                const { state, reason } = mentalState;

                const icon = document.getElementById('popupMentalStateIcon');
                const title = document.getElementById('popupMentalStateTitle');
                const message = document.getElementById('popupMentalStateMessage');

                if (icon && title && message) {
                    icon.className = 'mental-state-icon';
                    icon.classList.add(state);

                    const icons = {
                        focused: '🎯',
                        distracted: '😵',
                        overwhelmed: '😰',
                        procrastinating: '🎮'
                    };
                    icon.textContent = icons[state] || '🧠';
                    title.textContent = state.charAt(0).toUpperCase() + state.slice(1);
                    message.textContent = reason || 'Keep going!';
                }
            }

            // Update stats
            const tabs = await chrome.tabs.query({});
            const sessions = await chrome.runtime.sendMessage({ action: 'getSessions' });
            const duplicates = await chrome.storage.local.get('duplicates');

            const tabsCount = document.getElementById('popupTabsCount');
            const dupsCount = document.getElementById('popupDuplicates');
            const snapsCount = document.getElementById('popupSnapshots');

            if (tabsCount) tabsCount.textContent = tabs.length;
            if (dupsCount) dupsCount.textContent = duplicates.duplicates?.length || 0;
            if (snapsCount) snapsCount.textContent = sessions?.sessions?.length || 0;
        } catch (error) {
            console.error('Error loading popup data:', error);
            // Set default values on error
            const tabsCount = document.getElementById('popupTabsCount');
            const dupsCount = document.getElementById('popupDuplicates');
            const snapsCount = document.getElementById('popupSnapshots');

            if (tabsCount) tabsCount.textContent = '0';
            if (dupsCount) dupsCount.textContent = '0';
            if (snapsCount) snapsCount.textContent = '0';
        }
    }

    showNotification(message) {
        // Simple alert for popup
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border-radius: 6px;
      font-size: 0.875rem;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize popup
new PopupUI();
