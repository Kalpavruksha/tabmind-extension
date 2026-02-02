// TabMind Background Service Worker
// Handles tab tracking, mental state detection, and intelligent grouping

class TabMindEngine {
    constructor() {
        this.tabData = new Map();
        this.sessions = [];
        this.mentalState = 'focused';
        this.lastActivityTime = Date.now();
        this.init();
    }

    async init() {
        // Load saved data
        const data = await chrome.storage.local.get(['tabData', 'sessions', 'settings']);
        if (data.tabData) this.tabData = new Map(Object.entries(data.tabData));
        if (data.sessions) this.sessions = data.sessions;

        // Set up listeners
        this.setupListeners();
 
        // Start periodic tasks
        chrome.alarms.create('analyzeState', { periodInMinutes: 5 });
        chrome.alarms.create('suspendInactive', { periodInMinutes: 15 });
        chrome.alarms.create('saveData', { periodInMinutes: 2 });
    }

    setupListeners() {
        // Tab events
        chrome.tabs.onCreated.addListener((tab) => this.onTabCreated(tab));
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.onTabUpdated(tabId, changeInfo, tab));
        chrome.tabs.onActivated.addListener((activeInfo) => this.onTabActivated(activeInfo));
        chrome.tabs.onRemoved.addListener((tabId) => this.onTabRemoved(tabId));

        // Alarms
        chrome.alarms.onAlarm.addListener((alarm) => this.onAlarm(alarm));

        // Commands
        chrome.commands.onCommand.addListener((command) => this.onCommand(command));

        // Idle detection
        chrome.idle.onStateChanged.addListener((state) => this.onIdleStateChanged(state));
    }

    onTabCreated(tab) {
        const tabInfo = {
            id: tab.id,
            url: tab.url,
            title: tab.title,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            timeSpent: 0,
            domain: this.extractDomain(tab.url),
            suspended: false,
            parentTab: null // For tracking tab relationships
        };

        this.tabData.set(tab.id, tabInfo);
        this.detectTabRelationship(tab);
    }

    onTabUpdated(tabId, changeInfo, tab) {
        if (!this.tabData.has(tabId)) {
            this.onTabCreated(tab);
            return;
        }

        const tabInfo = this.tabData.get(tabId);

        if (changeInfo.url) {
            tabInfo.url = changeInfo.url;
            tabInfo.domain = this.extractDomain(changeInfo.url);
        }

        if (changeInfo.title) {
            tabInfo.title = changeInfo.title;
        }

        this.tabData.set(tabId, tabInfo);
    }

    async onTabActivated(activeInfo) {
        const tabId = activeInfo.tabId;
        const now = Date.now();

        // Update previous tab's time spent
        if (this.currentTabId && this.tabData.has(this.currentTabId)) {
            const prevTab = this.tabData.get(this.currentTabId);
            prevTab.timeSpent += now - this.lastActivityTime;
        }

        // Update current tab
        if (this.tabData.has(tabId)) {
            const tabInfo = this.tabData.get(tabId);
            tabInfo.lastAccessed = now;
            tabInfo.accessCount++;
            this.tabData.set(tabId, tabInfo);
        }

        this.currentTabId = tabId;
        this.lastActivityTime = now;

        // Analyze mental state based on tab switching patterns
        this.analyzeMentalState();
    }

    onTabRemoved(tabId) {
        if (this.tabData.has(tabId)) {
            const tabInfo = this.tabData.get(tabId);
            // Archive tab data for history
            this.archiveTab(tabInfo);
            this.tabData.delete(tabId);
        }
    }

    async onAlarm(alarm) {
        switch (alarm.name) {
            case 'analyzeState':
                await this.analyzeMentalState();
                await this.detectDuplicates();
                await this.suggestGrouping();
                break;
            case 'suspendInactive':
                await this.suspendInactiveTabs();
                break;
            case 'saveData':
                await this.saveData();
                break;
        }
    }

    async onCommand(command) {
        switch (command) {
            case 'save-snapshot':
                await this.saveSnapshot();
                break;
            case 'open-sidepanel':
                await chrome.sidePanel.open();
                break;
        }
    }

    onIdleStateChanged(state) {
        if (state === 'idle' || state === 'locked') {
            // User is away, update time tracking
            if (this.currentTabId && this.tabData.has(this.currentTabId)) {
                const tab = this.tabData.get(this.currentTabId);
                tab.timeSpent += Date.now() - this.lastActivityTime;
            }
        } else if (state === 'active') {
            this.lastActivityTime = Date.now();
        }
    }

    // === INTELLIGENT FEATURES ===

    async analyzeMentalState() {
        const tabs = await chrome.tabs.query({});
        const recentSwitches = this.getRecentTabSwitches(60000); // Last minute

        let state = 'focused';
        let reason = '';

        // Too many tabs = overwhelmed
        if (tabs.length > 30) {
            state = 'overwhelmed';
            reason = `You have ${tabs.length} tabs open. Consider saving some as a snapshot.`;
        }
        // Rapid tab switching = distracted
        else if (recentSwitches > 10) {
            state = 'distracted';
            reason = 'Frequent tab switching detected. Take a deep breath and focus on one task.';
        }
        // Multiple social media tabs = procrastinating
        else if (this.detectProcrastination(tabs)) {
            state = 'procrastinating';
            reason = 'Multiple entertainment sites detected. Ready to get back to work?';
        }
        // Few tabs, low switching = focused
        else if (tabs.length < 10 && recentSwitches < 3) {
            state = 'focused';
            reason = 'Great focus! Keep it up! 🎯';
        }

        this.mentalState = state;

        // Store state for UI
        await chrome.storage.local.set({
            mentalState: { state, reason, timestamp: Date.now() }
        });

        // Send notification if state changed significantly
        if (state === 'overwhelmed' || state === 'procrastinating') {
            this.sendGentleNudge(reason);
        }
    }

    detectProcrastination(tabs) {
        const procrastinationDomains = [
            'youtube.com', 'netflix.com', 'reddit.com', 'twitter.com',
            'facebook.com', 'instagram.com', 'tiktok.com', 'twitch.tv'
        ];

        const procrastinationTabs = tabs.filter(tab =>
            procrastinationDomains.some(domain => tab.url?.includes(domain))
        );

        return procrastinationTabs.length >= 3;
    }

    getRecentTabSwitches(timeWindow) {
        // Count how many tabs were accessed in the time window
        const cutoff = Date.now() - timeWindow;
        let count = 0;

        for (const [_, tabInfo] of this.tabData) {
            if (tabInfo.lastAccessed > cutoff) {
                count++;
            }
        }

        return count;
    }

    async detectDuplicates() {
        const tabs = await chrome.tabs.query({});
        const urlMap = new Map();
        const duplicates = [];

        for (const tab of tabs) {
            const url = this.normalizeUrl(tab.url);
            if (urlMap.has(url)) {
                duplicates.push({
                    original: urlMap.get(url),
                    duplicate: tab
                });
            } else {
                urlMap.set(url, tab);
            }
        }

        if (duplicates.length > 0) {
            await chrome.storage.local.set({ duplicates });
        }

        return duplicates;
    }

    async suggestGrouping() {
        const tabs = await chrome.tabs.query({});
        const domainGroups = new Map();
        const topicGroups = new Map();

        // Group by domain
        for (const tab of tabs) {
            const domain = this.extractDomain(tab.url);
            if (!domainGroups.has(domain)) {
                domainGroups.set(domain, []);
            }
            domainGroups.get(domain).push(tab);
        }

        // Group by topic (using keywords in title/URL)
        const topics = this.detectTopics(tabs);

        const suggestions = [];

        // Suggest domain groups with 3+ tabs
        for (const [domain, domainTabs] of domainGroups) {
            if (domainTabs.length >= 3) {
                suggestions.push({
                    type: 'domain',
                    name: domain,
                    tabs: domainTabs,
                    color: this.getColorForDomain(domain)
                });
            }
        }

        // Suggest topic groups
        for (const [topic, topicTabs] of topics) {
            if (topicTabs.length >= 3) {
                suggestions.push({
                    type: 'topic',
                    name: topic,
                    tabs: topicTabs,
                    color: this.getColorForTopic(topic)
                });
            }
        }

        await chrome.storage.local.set({ groupSuggestions: suggestions });
        return suggestions;
    }

    detectTopics(tabs) {
        const topics = new Map();
        const keywords = {
            'Development': ['github', 'stackoverflow', 'code', 'programming', 'developer', 'api', 'documentation'],
            'Research': ['wikipedia', 'scholar', 'research', 'paper', 'study', 'article'],
            'Shopping': ['amazon', 'ebay', 'shop', 'buy', 'cart', 'product'],
            'Social': ['facebook', 'twitter', 'instagram', 'linkedin', 'social'],
            'Entertainment': ['youtube', 'netflix', 'spotify', 'video', 'music', 'game'],
            'News': ['news', 'cnn', 'bbc', 'times', 'post', 'breaking']
        };

        for (const tab of tabs) {
            const text = `${tab.title} ${tab.url}`.toLowerCase();

            for (const [topic, words] of Object.entries(keywords)) {
                if (words.some(word => text.includes(word))) {
                    if (!topics.has(topic)) {
                        topics.set(topic, []);
                    }
                    topics.get(topic).push(tab);
                    break; // Only assign to first matching topic
                }
            }
        }

        return topics;
    }

    async suspendInactiveTabs() {
        const settings = await chrome.storage.local.get('settings');
        const suspendAfter = settings.settings?.suspendAfter || 30; // minutes
        const cutoff = Date.now() - (suspendAfter * 60 * 1000);

        const tabs = await chrome.tabs.query({});

        for (const tab of tabs) {
            if (tab.active || tab.pinned) continue; // Don't suspend active or pinned tabs

            const tabInfo = this.tabData.get(tab.id);
            if (!tabInfo) continue;

            if (tabInfo.lastAccessed < cutoff && !tabInfo.suspended) {
                // Suspend tab (we'll create a placeholder page)
                await this.suspendTab(tab.id, tabInfo);
            }
        }
    }

    async suspendTab(tabId, tabInfo) {
        // Store tab info for restoration
        tabInfo.suspended = true;
        tabInfo.suspendedUrl = tabInfo.url;
        tabInfo.suspendedTitle = tabInfo.title;

        this.tabData.set(tabId, tabInfo);

        // Note: In a real implementation, we'd navigate to a custom suspend page
        // For now, we'll just mark it as suspended
        console.log(`Suspended tab: ${tabInfo.title}`);
    }

    detectTabRelationship(tab) {
        // Detect if this tab was opened from another tab (parent-child relationship)
        // This helps understand browsing flow
        if (tab.openerTabId) {
            const tabInfo = this.tabData.get(tab.id);
            if (tabInfo) {
                tabInfo.parentTab = tab.openerTabId;
                this.tabData.set(tab.id, tabInfo);
            }
        }
    }

    async saveSnapshot() {
        const tabs = await chrome.tabs.query({ currentWindow: true });

        const snapshot = {
            id: Date.now(),
            name: `Session ${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            tabs: tabs.map(tab => ({
                url: tab.url,
                title: tab.title,
                pinned: tab.pinned,
                groupId: tab.groupId
            })),
            mentalState: this.mentalState
        };

        this.sessions.push(snapshot);
        await chrome.storage.local.set({ sessions: this.sessions });

        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Snapshot Saved!',
            message: `Saved ${tabs.length} tabs. You can close them now.`
        });
    }

    async restoreSnapshot(snapshotId) {
        const snapshot = this.sessions.find(s => s.id === snapshotId);
        if (!snapshot) return;

        // Create new window with tabs
        const window = await chrome.windows.create({ focused: true });

        for (const tabData of snapshot.tabs) {
            await chrome.tabs.create({
                windowId: window.id,
                url: tabData.url,
                pinned: tabData.pinned,
                active: false
            });
        }

        // Remove the default blank tab
        const tabs = await chrome.tabs.query({ windowId: window.id });
        if (tabs[0].url === 'chrome://newtab/') {
            await chrome.tabs.remove(tabs[0].id);
        }
    }

    sendGentleNudge(message) {
        // Don't spam notifications
        const lastNudge = this.lastNudgeTime || 0;
        if (Date.now() - lastNudge < 600000) return; // 10 minutes

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'TabMind Insight',
            message: message,
            priority: 0
        });

        this.lastNudgeTime = Date.now();
    }

    async archiveTab(tabInfo) {
        const data = await chrome.storage.local.get('archivedTabs');
        const archivedTabs = data.archivedTabs || [];

        archivedTabs.push({
            ...tabInfo,
            closedAt: Date.now()
        });

        // Keep only last 1000 archived tabs
        if (archivedTabs.length > 1000) {
            archivedTabs.splice(0, archivedTabs.length - 1000);
        }

        await chrome.storage.local.set({ archivedTabs });
    }

    async saveData() {
        const tabDataObj = Object.fromEntries(this.tabData);
        await chrome.storage.local.set({
            tabData: tabDataObj,
            sessions: this.sessions
        });
    }

    // === UTILITY FUNCTIONS ===

    extractDomain(url) {
        if (!url) return 'unknown';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }

    normalizeUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            // Remove query params and hash for duplicate detection
            return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        } catch {
            return url;
        }
    }

    getColorForDomain(domain) {
        const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
        const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }

    getColorForTopic(topic) {
        const colorMap = {
            'Development': 'blue',
            'Research': 'purple',
            'Shopping': 'orange',
            'Social': 'pink',
            'Entertainment': 'red',
            'News': 'cyan'
        };
        return colorMap[topic] || 'grey';
    }
}

// Initialize the engine
const tabMind = new TabMindEngine();

// Message handler for popup/sidepanel communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        switch (request.action) {
            case 'getTabData':
                const tabDataArray = Array.from(tabMind.tabData.entries()).map(([id, data]) => ({
                    id,
                    ...data
                }));
                sendResponse({ tabData: tabDataArray });
                break;

            case 'getSessions':
                sendResponse({ sessions: tabMind.sessions });
                break;

            case 'saveSnapshot':
                await tabMind.saveSnapshot();
                sendResponse({ success: true });
                break;

            case 'restoreSnapshot':
                await tabMind.restoreSnapshot(request.snapshotId);
                sendResponse({ success: true });
                break;

            case 'deleteSnapshot':
                tabMind.sessions = tabMind.sessions.filter(s => s.id !== request.snapshotId);
                await chrome.storage.local.set({ sessions: tabMind.sessions });
                sendResponse({ success: true });
                break;

            case 'groupTabs':
                await tabMind.groupTabsByDomain();
                sendResponse({ success: true });
                break;

            case 'closeDuplicates':
                const duplicates = await tabMind.detectDuplicates();
                for (const dup of duplicates) {
                    await chrome.tabs.remove(dup.duplicate.id);
                }
                sendResponse({ success: true, count: duplicates.length });
                break;

            case 'getMentalState':
                const state = await chrome.storage.local.get('mentalState');
                sendResponse(state.mentalState || { state: 'unknown', reason: '' });
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    })();

    return true; // Keep channel open for async response
});
