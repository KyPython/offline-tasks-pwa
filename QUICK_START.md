# Quick Start - See It In Action!

## 🚀 Local Testing (5 minutes)

### Step 1: Backend Setup

```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails server
```

✅ Backend running at: **http://localhost:3000**

### Step 2: Frontend Setup (new terminal)

```bash
npm install
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

### Step 3: Open in Browser

1. **Open** http://localhost:5173
2. **Create a task** - Type title, click "Create Task"
3. **Edit a task** - Click "Edit" button
4. **Delete a task** - Click "Delete" button

### Step 4: Test Offline Mode

1. **Open Chrome DevTools** (F12 or Cmd+Option+I)
2. **Go to Network tab**
3. **Set throttling dropdown to "Offline"**
4. **Create/edit/delete tasks** - They should work! ✅
5. **Set back to "Online"** - Tasks sync automatically! ✅

### Step 5: Test PWA Installation

1. **Look for install icon** in browser address bar
2. **Or**: Chrome menu → "Install Offline Tasks"
3. **App opens in standalone window** - Works like a native app! ✅

## 🎯 What to Test

### ✅ Core Features
- [x] Create task
- [x] Edit task
- [x] Delete task
- [x] Change task status
- [x] Add due date
- [x] Upload file (when online)

### ✅ Offline Features
- [x] Create task offline
- [x] Edit task offline
- [x] Delete task offline
- [x] See sync status indicator
- [x] Auto-sync when back online

### ✅ PWA Features
- [x] Installable as PWA
- [x] Works offline
- [x] Service worker registered
- [x] Fast loading (cached assets)

## 🔍 Check Service Worker

1. **DevTools → Application tab**
2. **Service Workers** (left sidebar)
3. **Should see**: "activated and is running"
4. **Check "Offline"** to test offline mode

## 📱 Mobile Testing

1. **Find your local IP**: `ifconfig | grep "inet "` (Mac) or `ipconfig` (Windows)
2. **On phone**: Connect to same WiFi
3. **Open**: `http://YOUR_IP:5173` on phone
4. **Test touch interactions** and responsive design

## 🐛 Troubleshooting

**Backend not starting?**
- Check PostgreSQL is running: `pg_isready`
- Check port 3000 is free: `lsof -i :3000`

**Frontend not starting?**
- Delete `node_modules` and run `npm install` again
- Check port 5173 is free

**CORS errors?**
- Make sure backend is running on :3000
- Check `config/initializers/cors.rb` is uncommented
- Restart Rails server after CORS changes

**Service worker not working?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache: DevTools → Application → Clear storage

## 📸 Screenshots for Portfolio

Take screenshots of:
1. **Main task list** with tasks
2. **Offline mode** (Network tab showing offline)
3. **PWA installation prompt**
4. **Standalone PWA window**
5. **Service Worker status** in DevTools

