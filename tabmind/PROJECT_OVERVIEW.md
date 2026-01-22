# 🧠 TabMind - Project Overview

## 📁 Project Structure

```
tabmind/
├── manifest.json          # Chrome extension manifest (Manifest V3)
├── background.js          # Service worker - Core intelligence engine
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── sidepanel.html        # Main dashboard UI
├── sidepanel.js          # Dashboard logic
├── settings.html         # Settings page UI
├── settings.js           # Settings logic
├── styles.css            # Global styles (glassmorphism design)
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md             # Full documentation
└── INSTALL.md            # Quick installation guide
```

## 🎯 Core Features

### 1. Mental State Detection 🧠
**File**: `background.js` → `analyzeMentalState()`

Analyzes tab usage patterns to detect:
- **Focused** (< 10 tabs, low switching)
- **Distracted** (rapid tab switching)
- **Overwhelmed** (> 30 tabs)
- **Procrastinating** (multiple entertainment sites)

**Psychology-based**: Uses behavioral patterns to understand user state

### 2. Intelligent Tab Grouping 📁
**File**: `background.js` → `suggestGrouping()`

- Groups by domain (3+ tabs from same site)
- Groups by topic (Development, Research, Shopping, etc.)
- Keyword-based topic detection
- Color-coded suggestions

### 3. Session Snapshots 💾
**File**: `background.js` → `saveSnapshot()`, `restoreSnapshot()`

- Save current tab layout
- Restore entire sessions
- Preserves mental state context
- Multiple saved sessions

### 4. Tab Suspension 😴
**File**: `background.js` → `suspendInactiveTabs()`

- Auto-suspend after 30 minutes (configurable)
- Excludes active and pinned tabs
- Frees up memory
- Instant restore on click

### 5. Duplicate Detection 🔄
**File**: `background.js` → `detectDuplicates()`

- Normalizes URLs (ignores query params)
- Finds exact duplicates
- One-click close all duplicates

### 6. Time Tracking ⏱️
**File**: `background.js` → Tab tracking system

- Tracks time spent per tab
- Access count per tab
- Domain-level aggregation
- Visual insights

## 🎨 UI Components

### Popup (`popup.html`)
- Quick stats dashboard
- Mental state indicator
- Quick action buttons
- Minimal, fast interface

### Side Panel (`sidepanel.html`)
- Full dashboard
- 4 tabs: All Tabs, Snapshots, Insights, Suggestions
- Search functionality
- Real-time updates every 5 seconds

### Settings (`settings.html`)
- Toggle features on/off
- Adjust thresholds
- Data management
- Export/Import data

## 🔧 Technical Architecture

### Background Service Worker (`background.js`)
**Class**: `TabMindEngine`

**Key Methods**:
- `init()` - Initialize engine, load data
- `setupListeners()` - Set up Chrome API listeners
- `onTabCreated()` - Track new tabs
- `onTabActivated()` - Update time tracking
- `analyzeMentalState()` - Detect user state
- `detectDuplicates()` - Find duplicate tabs
- `suggestGrouping()` - Generate grouping suggestions
- `suspendInactiveTabs()` - Suspend old tabs
- `saveSnapshot()` - Save current session

**Data Storage**:
- `tabData` - Map of tab ID → tab info
- `sessions` - Array of saved snapshots
- `archivedTabs` - Closed tab history

**Alarms**:
- Every 5 min: Analyze state, detect duplicates, suggest groups
- Every 15 min: Suspend inactive tabs
- Every 2 min: Save data to storage

### UI Layer (`sidepanel.js`, `popup.js`)
**Class**: `TabMindUI`, `PopupUI`

**Communication**:
- Uses `chrome.runtime.sendMessage()` to communicate with background
- Real-time updates via polling (5 second interval)
- Event-driven UI updates

### Styling (`styles.css`)
**Design System**:
- CSS Variables for theming
- Glassmorphism effects
- Smooth animations
- Dark mode (default)
- Responsive layout

## 📊 Data Flow

```
User Action → UI (popup/sidepanel)
              ↓
         chrome.runtime.sendMessage()
              ↓
         Background Service Worker
              ↓
         Process & Update Data
              ↓
         chrome.storage.local.set()
              ↓
         Response to UI
              ↓
         Update Display
```

## 🔐 Privacy & Security

- **100% Local**: All data stored locally using `chrome.storage.local`
- **No External Calls**: No network requests, no tracking
- **No Permissions Abuse**: Only uses necessary permissions
- **Open Source**: Code is transparent and auditable

## 🚀 Performance

- **Lightweight**: < 100KB total size
- **Fast**: Vanilla JS, no frameworks
- **Efficient**: Background worker uses alarms, not constant polling
- **Memory**: Tab suspension reduces memory usage

## 🎯 Unique Selling Points

1. **Psychology-Driven**: First tab manager to detect mental state
2. **Gentle Nudges**: Non-intrusive productivity hints
3. **Context-Aware**: Understands work modes and contexts
4. **Beautiful UI**: Modern glassmorphism design
5. **Privacy-First**: No data collection, fully local
6. **Smart Grouping**: AI-like topic detection without AI

## 🔮 Future Enhancements

### v1.1
- [ ] Visual suspension page (custom HTML for suspended tabs)
- [ ] Import snapshots from JSON
- [ ] Keyboard shortcuts for more actions
- [ ] Tab relationship graph visualization

### v1.2
- [ ] Machine learning for better state detection
- [ ] Collaborative workspaces (share snapshots)
- [ ] Calendar integration (auto-switch contexts)
- [ ] Browser history search

### v2.0
- [ ] Cross-browser support (Firefox, Edge)
- [ ] Mobile companion app
- [ ] Cloud sync (optional)
- [ ] Natural language commands

## 🐛 Known Limitations

1. **Tab Suspension**: Currently just marks tabs, doesn't create visual suspend page
2. **Mental State**: Basic algorithm, could be improved with ML
3. **Favicon Loading**: Some favicons may not load correctly
4. **Side Panel**: Requires Chrome 114+

## 💡 Development Tips

### Testing
1. Load extension in Chrome
2. Open multiple tabs
3. Check background service worker console: `chrome://extensions/` → TabMind → "service worker"
4. Use `chrome.storage.local.get(null)` in console to inspect data

### Debugging
- Background errors: Check service worker console
- UI errors: Right-click popup/sidepanel → Inspect
- Storage: Chrome DevTools → Application → Storage → Extension Storage

### Adding Features
1. Add logic to `background.js`
2. Add UI to `sidepanel.html` or `popup.html`
3. Add event handlers to `sidepanel.js` or `popup.js`
4. Add message handler in `background.js`
5. Test thoroughly!

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Tab Groups API](https://developer.chrome.com/docs/extensions/reference/tabGroups/)

## 🙌 Credits

- **Design Inspiration**: Modern productivity apps, Notion, Linear
- **Psychology**: Flow state research, attention management
- **Icons**: Custom generated brain icon
- **Fonts**: Inter (Google Fonts)

---

**Built with passion for productive minds! 🧠✨**
