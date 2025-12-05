import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js', { type: 'module' });

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('Service Worker updated');
        // Optionally show a notification to the user
      } else {
        console.log('Service Worker installed');
      }
    });

    wb.addEventListener('activated', (event) => {
      if (event.isUpdate) {
        console.log('Service Worker activated');
      }
    });

    wb.addEventListener('waiting', () => {
      console.log('Service Worker waiting - new version available');
      // Optionally prompt user to reload
    });

    wb.register().then(() => {
      console.log('Service Worker registered');
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

    return wb;
  }
}

