# 🧠 TabMind - Intelligent Tab Manager

> A psychology-driven Chrome extension that understands your work patterns and mental state to help you manage browser tabs intelligently.

![TabMind Logo](icons/icon128.png)

## ✨ Unique Features
 
### 🎯 Mental State Detection
TabMind analyzes your tab usage patterns to detect your current mental state:
- **Focused** 🎯 - Few tabs, minimal switching
- **Distracted** 😵 - Rapid tab switching detected
- **Overwhelmed** 😰 - Too many tabs open
- **Procrastinating** 🎮 - Multiple entertainment sites detected

Get gentle nudges and insights to help you stay productive!

### 🤖 AI-Powered Tab Grouping
- **Smart Domain Grouping** - Automatically groups tabs from the same domain
- **Topic Detection** - Groups tabs by content type (Development, Research, Shopping, etc.)
- **Relationship Tracking** - Understands parent-child tab relationships
- **One-Click Apply** - Apply grouping suggestions instantly

### 💾 Session Snapshots
- **Save & Restore** - Save your current tab layout and restore it later
- **Context Preservation** - Remembers your mental state when you saved
- **Multiple Sessions** - Save different work contexts (Work, Research, Personal)
- **Quick Switch** - Switch between different work modes seamlessly

### 😴 Smart Tab Suspension
- **Auto-Suspend Inactive Tabs** - Free up memory by suspending tabs you haven't used
- **Customizable Timeout** - Set how long before tabs are suspended
- **Smart Exclusions** - Never suspends active or pinned tabs
- **Instant Restore** - Click to restore suspended tabs

### 🔍 Duplicate Detection
- **Find Duplicates** - Automatically detects duplicate tabs
- **Smart Matching** - Ignores query parameters for better detection
- **One-Click Close** - Close all duplicates with one click

### 📊 Time Tracking & Insights
- **Time Spent Per Domain** - See where your time goes
- **Access Count** - Track how often you visit each tab
- **Visual Charts** - Beautiful visualizations of your browsing patterns
- **Daily Reports** - Understand your productivity patterns

### 🔎 Smart Search
- **Search All Tabs** - Find any tab instantly
- **Search History** - Search through closed tabs too
- **Fuzzy Matching** - Find tabs even with typos

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"**
5. **Select the `tabmind` folder**
6. **Done!** The TabMind icon should appear in your toolbar

### Method 2: Chrome Web Store (Coming Soon)
We're working on publishing TabMind to the Chrome Web Store!

## 📖 How to Use

### Quick Start
1. **Click the TabMind icon** in your toolbar to see quick stats
2. **Open the side panel** (Ctrl+Shift+T or click "Open Dashboard")
3. **Let TabMind analyze** your tabs and provide insights

### Keyboard Shortcuts
- `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`) - Save current snapshot
- `Ctrl+Shift+T` (Mac: `Cmd+Shift+T`) - Open side panel

### Features Walkthrough

#### 💾 Saving a Snapshot
1. Open the side panel or popup
2. Click "Save Snapshot"
3. Your current tabs are saved with timestamp
4. Close tabs you don't need right now
5. Restore the snapshot later when you need those tabs again

#### 📁 Auto-Grouping Tabs
1. Open the side panel
2. Go to the "Suggestions" tab
3. Review grouping suggestions
4. Click "Apply" to create tab groups
5. Or click "Auto Group" in Quick Actions for instant grouping

#### 😴 Suspending Tabs
TabMind automatically suspends tabs that haven't been used in 30 minutes (configurable).
- Suspended tabs free up memory
- Click a suspended tab to restore it instantly
- Pinned and active tabs are never suspended

#### 🔄 Closing Duplicates
1. Click "Close Duplicates" in Quick Actions
2. TabMind finds and closes duplicate tabs
3. Keeps the most recently accessed version

## 🎨 Screenshots

### Side Panel Dashboard
![Dashboard](screenshots/dashboard.png)

### Mental State Detection
![Mental State](screenshots/mental-state.png)

### Tab Grouping Suggestions
![Grouping](screenshots/grouping.png)

### Time Insights
![Insights](screenshots/insights.png)

## ⚙️ Settings (Coming Soon)

Customize TabMind to your preferences:
- **Suspension Timeout** - How long before tabs are suspended
- **Mental State Sensitivity** - Adjust detection thresholds
- **Notification Frequency** - Control how often you get nudges
- **Theme** - Light/Dark mode (currently dark only)

## 🧪 Technical Details

### Built With
- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No frameworks, pure performance
- **Chrome APIs** - tabs, tabGroups, storage, alarms, idle
- **Modern CSS** - Glassmorphism, gradients, animations

### Architecture
- **Background Service Worker** - Handles tab tracking and analysis
- **Side Panel** - Main dashboard interface
- **Popup** - Quick access to stats and actions
- **Storage** - Local storage for tab data and sessions

### Privacy
- **100% Local** - All data stays on your device
- **No Tracking** - We don't collect any data
- **No External Servers** - Everything runs locally
- **Open Source** - Inspect the code yourself

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Ideas for Contributions
- [ ] Settings page
- [ ] Export/Import snapshots
- [ ] Cloud sync for snapshots
- [ ] More mental state detection algorithms
- [ ] Custom tab grouping rules
- [ ] Integration with productivity tools
- [ ] Light theme
- [ ] Multi-language support

## 🐛 Known Issues

- Tab suspension currently just marks tabs (visual suspension page coming soon)
- Some favicons may not load correctly
- Mental state detection is basic (will improve with ML)

## 📝 Roadmap

### v1.1
- [ ] Visual suspension page for suspended tabs
- [ ] Settings page
- [ ] Export/Import snapshots
- [ ] Improved mental state detection

### v1.2
- [ ] Cloud sync (optional)
- [ ] Collaborative workspaces
- [ ] Tab recommendations based on context
- [ ] Integration with calendar for work modes

### v2.0
- [ ] Machine learning for better predictions
- [ ] Natural language commands
- [ ] Cross-browser support (Firefox, Edge)
- [ ] Mobile companion app

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- Inspired by the psychology of productivity and focus
- Built with love for developers and knowledge workers
- Thanks to the Chrome Extensions community

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/tabmind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tabmind/discussions)
- **Email**: support@tabmind.app (coming soon)

## 🌟 Show Your Support

If you find TabMind helpful, please:
- ⭐ Star this repository
- 🐦 Share on Twitter
- 📝 Write a review
- 🤝 Contribute to the project

---

**Made with 🧠 and ❤️ for productive minds**

*TabMind - Because your tabs deserve better management*
