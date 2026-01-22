# 🧪 TabMind - Testing & Demo Guide

## Quick Test Scenarios

### 1. Test Mental State Detection

#### Scenario A: Focused State
1. Open only 3-5 tabs
2. Stay on one tab for a while
3. Open TabMind popup or side panel
4. **Expected**: Mental state shows "Focused 🎯"

#### Scenario B: Distracted State
1. Open 10+ tabs
2. Rapidly switch between tabs (click different tabs quickly)
3. Open TabMind popup
4. **Expected**: Mental state shows "Distracted 😵"

#### Scenario C: Overwhelmed State
1. Open 30+ tabs
2. Open TabMind popup
3. **Expected**: Mental state shows "Overwhelmed 😰"

#### Scenario D: Procrastinating State
1. Open 3+ tabs from: YouTube, Reddit, Twitter, Facebook
2. Open TabMind popup
3. **Expected**: Mental state shows "Procrastinating 🎮"

### 2. Test Tab Grouping

#### Test Domain Grouping
1. Open 3+ tabs from GitHub (github.com/...)
2. Open 3+ tabs from Stack Overflow
3. Open side panel → Go to "Suggestions" tab
4. **Expected**: See suggestions to group GitHub tabs and Stack Overflow tabs
5. Click "Apply" on a suggestion
6. **Expected**: Tabs are grouped with colored tab groups

#### Test Topic Grouping
1. Open tabs with these keywords in title/URL:
   - "programming", "code", "developer" (Development)
   - "news", "breaking", "cnn" (News)
   - "youtube", "video", "music" (Entertainment)
2. Open side panel → "Suggestions"
3. **Expected**: See topic-based grouping suggestions

### 3. Test Session Snapshots

#### Save Snapshot
1. Open 5-10 interesting tabs
2. Click TabMind icon → "Save Snapshot"
3. **Expected**: Notification "Snapshot saved!"
4. Open side panel → "Snapshots" tab
5. **Expected**: See your saved snapshot with timestamp

#### Restore Snapshot
1. Close all tabs
2. Open side panel → "Snapshots"
3. Click "Restore" on a saved snapshot
4. **Expected**: New window opens with all saved tabs

#### Delete Snapshot
1. Open side panel → "Snapshots"
2. Click "Delete" on a snapshot
3. Confirm deletion
4. **Expected**: Snapshot removed from list

### 4. Test Duplicate Detection

1. Open the same URL in multiple tabs (e.g., google.com in 3 tabs)
2. Open TabMind popup
3. **Expected**: "Duplicates" count shows 2 (or more)
4. Click "Close Duplicates"
5. **Expected**: Only one tab remains, others closed

### 5. Test Time Tracking

1. Open several tabs
2. Spend time on different tabs (switch between them)
3. Wait a few minutes
4. Open side panel → "Insights" tab
5. **Expected**: See time bars showing time spent per domain
6. Go to "All Tabs" tab
7. **Expected**: Each tab shows time spent and view count

### 6. Test Search

1. Open 10+ tabs with different titles
2. Open side panel
3. Type in search box (e.g., "github")
4. **Expected**: Only tabs matching "github" are shown
5. Clear search
6. **Expected**: All tabs shown again

### 7. Test Settings

1. Right-click TabMind icon → Manage Extension → Options
   (Or click "Settings" in popup)
2. Toggle "Enable Mental State Detection" off
3. Click "Save Settings"
4. **Expected**: Notification "Settings saved!"
5. Adjust "Suspend After" slider to 10 minutes
6. Save settings
7. **Expected**: Tabs will now suspend after 10 minutes instead of 30

### 8. Test Data Export

1. Open settings page
2. Scroll to "Data & Privacy"
3. Click "Export" button
4. **Expected**: JSON file downloads with all your TabMind data
5. Open the JSON file
6. **Expected**: See your tab data, snapshots, etc.

## 🎬 Demo Flow (For Showing to Others)

### 5-Minute Demo Script

**1. Introduction (30 seconds)**
- "This is TabMind, an intelligent tab manager that understands your mental state"
- Show the beautiful icon and popup

**2. Mental State Detection (1 minute)**
- Open popup, show current mental state
- Open 30+ tabs quickly
- Refresh popup, show "Overwhelmed" state
- "TabMind detects when you're overwhelmed and suggests actions"

**3. Smart Grouping (1.5 minutes)**
- Open side panel
- Show "Suggestions" tab with grouping suggestions
- Click "Apply" to create a tab group
- "TabMind automatically suggests how to organize your tabs"

**4. Session Snapshots (1 minute)**
- Click "Save Snapshot"
- Show saved snapshot in "Snapshots" tab
- Close some tabs
- Restore the snapshot
- "Save your work context and restore it later"

**5. Insights (1 minute)**
- Go to "Insights" tab
- Show time tracking charts
- "See where your time actually goes"
- Go to "All Tabs" tab
- Show individual tab stats

**6. Wrap Up (30 seconds)**
- "TabMind helps you stay focused and organized"
- "All data stays local, privacy-first"
- "Open source and free!"

## 🐛 Troubleshooting Tests

### Test 1: Extension Not Loading
1. Go to `chrome://extensions/`
2. Check for errors on TabMind card
3. Click "Errors" if any
4. **Common Fix**: Reload extension

### Test 2: Side Panel Not Opening
1. Check Chrome version (need 114+)
2. Try keyboard shortcut: Ctrl+Shift+T
3. Try clicking popup → "Open Dashboard"
4. **Common Fix**: Restart Chrome

### Test 3: Data Not Persisting
1. Open DevTools on background service worker
2. Run: `chrome.storage.local.get(null, console.log)`
3. Check if data is being saved
4. **Common Fix**: Check storage permissions in manifest

### Test 4: Icons Not Showing
1. Check `icons/` folder exists
2. Verify icon files are present
3. **Common Fix**: Reload extension

## 📊 Performance Tests

### Memory Usage Test
1. Open 50+ tabs
2. Wait 30 minutes (for suspension to kick in)
3. Check Chrome Task Manager (Shift+Esc)
4. **Expected**: Suspended tabs use less memory

### Speed Test
1. Open side panel
2. Open 100+ tabs
3. Check if UI remains responsive
4. **Expected**: UI updates within 1-2 seconds

### Storage Test
1. Save 10+ snapshots
2. Open settings → Data & Privacy
3. Check "Storage Used"
4. **Expected**: < 1 MB for typical usage

## ✅ Acceptance Criteria

Before considering TabMind "complete", verify:

- [ ] Mental state detection works for all 4 states
- [ ] Tab grouping suggestions appear with 3+ similar tabs
- [ ] Snapshots save and restore correctly
- [ ] Duplicate detection finds and closes duplicates
- [ ] Time tracking shows accurate data
- [ ] Search filters tabs correctly
- [ ] Settings save and apply correctly
- [ ] Data export works
- [ ] UI is responsive and beautiful
- [ ] No console errors in normal usage

## 🎯 Edge Cases to Test

1. **Empty State**: No tabs open
2. **Single Tab**: Only one tab open
3. **100+ Tabs**: Extreme tab count
4. **Rapid Actions**: Click buttons very quickly
5. **Extension Reload**: Reload extension while using it
6. **Browser Restart**: Close and reopen Chrome
7. **Multiple Windows**: Test with multiple Chrome windows
8. **Incognito Mode**: Test in incognito (should work separately)

## 📝 Test Checklist

```
[ ] Mental State: Focused
[ ] Mental State: Distracted
[ ] Mental State: Overwhelmed
[ ] Mental State: Procrastinating
[ ] Domain Grouping
[ ] Topic Grouping
[ ] Save Snapshot
[ ] Restore Snapshot
[ ] Delete Snapshot
[ ] Duplicate Detection
[ ] Time Tracking
[ ] Search Tabs
[ ] Settings: Toggle Features
[ ] Settings: Adjust Sliders
[ ] Settings: Export Data
[ ] Settings: Clear Data
[ ] Popup UI
[ ] Side Panel UI
[ ] All Tabs View
[ ] Snapshots View
[ ] Insights View
[ ] Suggestions View
```

---

**Happy Testing! 🧪✨**

Found a bug? That's great! It means TabMind is getting better! 🐛→🦋
