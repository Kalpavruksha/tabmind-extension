// TabMind Settings JavaScript

class SettingsManager {
    constructor() {
        this.defaultSettings = {
            enableMentalState: true,
            enableNudges: true,
            enableAutoGroup: false,
            enableSuspension: true,
            suspendAfter: 30,
            overwhelmedThreshold: 30,
            distractionSensitivity: 10
        };
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
    }

    async loadSettings() {
        const stored = await chrome.storage.local.get('settings');
        const settings = stored.settings || this.defaultSettings;

        // Set toggle switches
        document.getElementById('enableMentalState').checked = settings.enableMentalState;
        document.getElementById('enableNudges').checked = settings.enableNudges;
        document.getElementById('enableAutoGroup').checked = settings.enableAutoGroup;
        document.getElementById('enableSuspension').checked = settings.enableSuspension;

        // Set sliders
        document.getElementById('suspendAfter').value = settings.suspendAfter;
        document.getElementById('suspendAfterValue').textContent = `${settings.suspendAfter} min`;

        document.getElementById('overwhelmedThreshold').value = settings.overwhelmedThreshold;
        document.getElementById('overwhelmedThresholdValue').textContent = `${settings.overwhelmedThreshold} tabs`;

        document.getElementById('distractionSensitivity').value = settings.distractionSensitivity;
        document.getElementById('distractionSensitivityValue').textContent = `${settings.distractionSensitivity}/min`;
    }

    async loadStats() {
        const data = await chrome.storage.local.get(['tabData', 'sessions', 'archivedTabs']);

        const tabDataCount = data.tabData ? Object.keys(data.tabData).length : 0;
        const snapshotsCount = data.sessions ? data.sessions.length : 0;
        const archivedCount = data.archivedTabs ? data.archivedTabs.length : 0;

        document.getElementById('totalTabsTracked').textContent = tabDataCount;
        document.getElementById('totalSnapshots').textContent = snapshotsCount;
        document.getElementById('totalArchivedTabs').textContent = archivedCount;

        // Calculate storage used
        const storageSize = new Blob([JSON.stringify(data)]).size;
        const storageSizeKB = (storageSize / 1024).toFixed(2);
        document.getElementById('storageUsed').textContent = `${storageSizeKB} KB`;
    }

    setupEventListeners() {
        // Slider updates
        const sliders = [
            { id: 'suspendAfter', valueId: 'suspendAfterValue', suffix: ' min' },
            { id: 'overwhelmedThreshold', valueId: 'overwhelmedThresholdValue', suffix: ' tabs' },
            { id: 'distractionSensitivity', valueId: 'distractionSensitivityValue', suffix: '/min' }
        ];

        sliders.forEach(({ id, valueId, suffix }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(valueId);

            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value + suffix;
            });
        });

        // Save button
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Clear data
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearData();
        });
    }

    async saveSettings() {
        const settings = {
            enableMentalState: document.getElementById('enableMentalState').checked,
            enableNudges: document.getElementById('enableNudges').checked,
            enableAutoGroup: document.getElementById('enableAutoGroup').checked,
            enableSuspension: document.getElementById('enableSuspension').checked,
            suspendAfter: parseInt(document.getElementById('suspendAfter').value),
            overwhelmedThreshold: parseInt(document.getElementById('overwhelmedThreshold').value),
            distractionSensitivity: parseInt(document.getElementById('distractionSensitivity').value)
        };

        await chrome.storage.local.set({ settings });
        this.showNotification('Settings saved successfully!', 'success');
    }

    async exportData() {
        const data = await chrome.storage.local.get(null);
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tabmind-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }

    async clearData() {
        const confirmed = confirm(
            'Are you sure you want to clear all TabMind data?\n\n' +
            'This will delete:\n' +
            '- All tab tracking data\n' +
            '- All saved snapshots\n' +
            '- All archived tabs\n' +
            '- All settings\n\n' +
            'This action cannot be undone!'
        );

        if (confirmed) {
            await chrome.storage.local.clear();
            this.showNotification('All data cleared!', 'success');

            // Reload settings with defaults
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize settings manager
new SettingsManager();
