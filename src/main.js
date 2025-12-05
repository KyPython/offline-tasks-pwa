import { initDB } from './db.js';
import { initAPI } from './api.js';
import { initUI } from './ui.js';
import { registerServiceWorker } from './sw-register.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Initialize app
async function init() {
  console.log('Initializing Offline Tasks PWA...');

  // Initialize IndexedDB
  await initDB();

  // Initialize API client
  const api = initAPI(API_BASE_URL);

  // Initialize UI
  initUI(api);

  // Register service worker
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }

  // Monitor online/offline status
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial sync
  syncTasks();
}

function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  if (isOnline) {
    statusDot.className = 'status-dot';
    statusText.textContent = 'Online';
    syncTasks();
  } else {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Offline';
  }
}

async function syncTasks() {
  const syncStatus = document.getElementById('syncStatus');
  const statusDot = document.getElementById('statusDot');

  if (!navigator.onLine) {
    syncStatus.textContent = 'Offline - changes will sync when online';
    return;
  }

  try {
    statusDot.className = 'status-dot syncing';
    syncStatus.textContent = 'Syncing...';

    const { syncQueue } = await import('./db.js');
    const pendingCount = await syncQueue.getPendingCount();

    if (pendingCount > 0) {
      syncStatus.textContent = `${pendingCount} item(s) pending sync`;
      await syncQueue.flush();
    } else {
      syncStatus.textContent = 'All changes synced';
    }

    statusDot.className = 'status-dot';
  } catch (error) {
    console.error('Sync error:', error);
    syncStatus.textContent = 'Sync error - will retry';
    statusDot.className = 'status-dot offline';
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Periodic sync check
setInterval(syncTasks, 30000); // Every 30 seconds

