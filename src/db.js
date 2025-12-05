const DB_NAME = 'OfflineTasksDB';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const QUEUE_STORE = 'queue';

let db = null;

// Initialize IndexedDB
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Tasks store
      if (!database.objectStoreNames.contains(TASKS_STORE)) {
        const taskStore = database.createObjectStore(TASKS_STORE, { keyPath: 'id' });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('dueDate', 'due_date', { unique: false });
      }

      // Queue store for sync operations
      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = database.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('type', 'type', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Get database instance
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

// Tasks operations
export const tasksDB = {
  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([TASKS_STORE], 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async get(id) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([TASKS_STORE], 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async save(task) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.put({
        ...task,
        synced: task.synced !== false, // Default to true if server ID exists
        local_id: task.local_id || task.id
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
};

// Sync queue operations
export const syncQueue = {
  async add(operation) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.add({
        ...operation,
        timestamp: Date.now(),
        retries: 0
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async getPendingCount() {
    const all = await this.getAll();
    return all.length;
  },

  async remove(id) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async update(id, updates) {
    return new Promise((resolve, reject) => {
      const transaction = getDB().transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          Object.assign(item, updates);
          const updateRequest = store.put(item);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
    });
  },

  async flush() {
    const { initAPI } = await import('./api.js');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const api = initAPI(API_BASE_URL);

    const queue = await this.getAll();
    const results = [];

    for (const item of queue) {
      try {
        let result;
        const payload = item.payload || {};

        switch (item.type) {
          case 'CREATE_TASK':
            result = await api.createTask(payload);
            if (result) {
              // Update local task with server ID
              const localTask = await tasksDB.get(item.local_id);
              if (localTask) {
                await tasksDB.save({ ...localTask, id: result.id, synced: true });
              }
              await this.remove(item.id);
            }
            break;

          case 'UPDATE_TASK':
            result = await api.updateTask(item.task_id, payload);
            if (result) {
              await tasksDB.save({ ...result, synced: true });
              await this.remove(item.id);
            }
            break;

          case 'DELETE_TASK':
            await api.deleteTask(item.task_id);
            await this.remove(item.id);
            break;

          case 'UPLOAD_FILE':
            // Note: File objects can't be stored in IndexedDB
            // This operation should be handled directly in the UI
            // For now, we'll skip it and let the UI handle retries
            console.warn('File upload queued but needs to be handled by UI');
            await this.remove(item.id);
            break;

          default:
            console.warn('Unknown queue operation type:', item.type);
        }

        results.push({ success: true, item });
      } catch (error) {
        console.error('Sync operation failed:', error);
        // Increment retry count
        await this.update(item.id, { retries: (item.retries || 0) + 1 });
        results.push({ success: false, item, error });
      }
    }

    return results;
  }
};

