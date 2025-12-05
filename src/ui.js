import { tasksDB, syncQueue } from './db.js';

let currentEditingTask = null;
let api = null;

export function initUI(apiClient) {
  api = apiClient;

  const form = document.getElementById('taskForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  // Form submission
  form.addEventListener('submit', handleFormSubmit);

  // Cancel button
  cancelBtn.addEventListener('click', () => {
    resetForm();
  });

  // Load and display tasks
  loadTasks();

  // Set up periodic refresh
  setInterval(loadTasks, 10000); // Every 10 seconds
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById('taskTitle').value.trim(),
    description: document.getElementById('taskDescription').value.trim(),
    status: document.getElementById('taskStatus').value,
    due_date: document.getElementById('taskDueDate').value || null
  };

  if (!formData.title) {
    alert('Title is required');
    return;
  }

  const taskId = document.getElementById('taskId').value;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (taskId) {
      // Update existing task
      await updateTask(taskId, formData);
    } else {
      // Create new task
      await createTask(formData);
    }

    resetForm();
    await loadTasks();
  } catch (error) {
    console.error('Error saving task:', error);
    alert('Failed to save task. It will be synced when online.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = currentEditingTask ? 'Update Task' : 'Create Task';
  }
}

async function createTask(taskData) {
  // Generate local ID
  const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const localTask = {
    id: localId,
    local_id: localId,
    ...taskData,
    synced: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Save to IndexedDB immediately
  await tasksDB.save(localTask);

  // Try to sync if online
  if (navigator.onLine) {
    try {
      const serverTask = await api.createTask(taskData);
      // Update with server ID
      await tasksDB.save({ ...localTask, id: serverTask.id, synced: true });
    } catch (error) {
      // Queue for later sync
      await syncQueue.add({
        type: 'CREATE_TASK',
        payload: taskData,
        local_id: localId
      });
    }
  } else {
    // Queue for later sync
    await syncQueue.add({
      type: 'CREATE_TASK',
      payload: taskData,
      local_id: localId
    });
  }
}

async function updateTask(taskId, taskData) {
  // Update in IndexedDB immediately
  const existingTask = await tasksDB.get(taskId);
  if (existingTask) {
    await tasksDB.save({
      ...existingTask,
      ...taskData,
      updated_at: new Date().toISOString(),
      synced: false
    });
  }

  // Try to sync if online
  if (navigator.onLine) {
    try {
      const serverTask = await api.updateTask(taskId, taskData);
      await tasksDB.save({ ...serverTask, synced: true });
    } catch (error) {
      // Queue for later sync
      await syncQueue.add({
        type: 'UPDATE_TASK',
        task_id: taskId,
        payload: taskData
      });
    }
  } else {
    // Queue for later sync
    await syncQueue.add({
      type: 'UPDATE_TASK',
      task_id: taskId,
      payload: taskData
    });
  }
}

async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  // Remove from IndexedDB immediately
  await tasksDB.delete(taskId);

  // Try to sync if online
  if (navigator.onLine) {
    try {
      await api.deleteTask(taskId);
    } catch (error) {
      // Queue for later sync
      await syncQueue.add({
        type: 'DELETE_TASK',
        task_id: taskId
      });
    }
  } else {
    // Queue for later sync
    await syncQueue.add({
      type: 'DELETE_TASK',
      task_id: taskId
    });
  }

  await loadTasks();
}

function resetForm() {
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('formTitle').textContent = 'Create New Task';
  document.getElementById('submitBtn').textContent = 'Create Task';
  document.getElementById('cancelBtn').style.display = 'none';
  currentEditingTask = null;
}

function editTask(task) {
  currentEditingTask = task;
  document.getElementById('taskId').value = task.id;
  document.getElementById('taskTitle').value = task.title || '';
  document.getElementById('taskDescription').value = task.description || '';
  document.getElementById('taskStatus').value = task.status || 'pending';
  document.getElementById('taskDueDate').value = task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '';
  document.getElementById('formTitle').textContent = 'Edit Task';
  document.getElementById('submitBtn').textContent = 'Update Task';
  document.getElementById('cancelBtn').style.display = 'block';

  // Scroll to form
  document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
}

async function loadTasks() {
  try {
    // Load from IndexedDB first (offline-first)
    let tasks = await tasksDB.getAll();

    // If online, try to sync with server
    if (navigator.onLine) {
      try {
        const serverTasks = await api.getTasks();
        // Merge server data with local
        for (const serverTask of serverTasks) {
          await tasksDB.save({ ...serverTask, synced: true });
        }
        tasks = await tasksDB.getAll();
      } catch (error) {
        console.warn('Failed to fetch from server, using local data:', error);
      }
    }

    renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

function renderTasks(tasks) {
  const container = document.getElementById('tasksList');
  
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No tasks yet</h2>
        <p>Create your first task above</p>
      </div>
    `;
    return;
  }

  // Sort by created_at descending
  tasks.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });

  container.innerHTML = tasks.map(task => renderTask(task)).join('');
  
  // Attach event listeners
  tasks.forEach(task => {
    const card = document.querySelector(`[data-task-id="${task.id}"]`);
    if (card) {
      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');
      
      if (editBtn) {
        editBtn.addEventListener('click', () => editTask(task));
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
      }

      // File upload
      const fileInput = card.querySelector('.file-input');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileUpload(task.id, e.target.files[0]));
      }
    }
  });
}

function renderTask(task) {
  const statusClass = task.status || 'pending';
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : null;
  const syncedIcon = task.synced === false ? '⏳' : '✓';
  const syncedText = task.synced === false ? ' (pending sync)' : '';

  return `
    <div class="task-card" data-task-id="${task.id}">
      <div class="task-header">
        <div>
          <div class="task-title">${escapeHtml(task.title)}</div>
          <span class="task-status ${statusClass}">${statusClass.replace('_', ' ')}</span>
        </div>
        <div class="task-actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn btn-danger">Delete</button>
        </div>
      </div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <div>
          ${dueDate ? `Due: ${dueDate}` : 'No due date'}
          <span style="margin-left: 10px;">${syncedIcon}${syncedText}</span>
        </div>
        <div>Created: ${new Date(task.created_at).toLocaleDateString()}</div>
      </div>
      <div class="file-upload">
        <label>
          <input type="file" class="file-input" style="display: none;">
          <button type="button" style="font-size: 12px; padding: 6px 12px;">📎 Attach File</button>
        </label>
        <div class="file-list" data-files-container="${task.id}"></div>
      </div>
    </div>
  `;
}

async function handleFileUpload(taskId, file) {
  if (!file) return;

  const container = document.querySelector(`[data-files-container="${taskId}"]`);
  const fileId = `file_${Date.now()}`;
  
  // Show file in UI immediately
  container.innerHTML += `
    <div class="file-item" data-file-id="${fileId}">
      <span>${escapeHtml(file.name)}</span>
      <span class="file-status queued">Queued</span>
    </div>
  `;

  // Store file reference in a Map for later retrieval
  if (!window.pendingFileUploads) {
    window.pendingFileUploads = new Map();
  }
  window.pendingFileUploads.set(fileId, { taskId, file });

  // Try to upload if online
  if (navigator.onLine) {
    await attemptFileUpload(fileId, taskId, file, container);
  } else {
    // Store file info for retry (we can't store File object in IndexedDB)
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    
    // Store in localStorage as fallback (limited storage)
    const uploadQueue = JSON.parse(localStorage.getItem('fileUploadQueue') || '[]');
    uploadQueue.push({ fileId, taskId, fileInfo });
    localStorage.setItem('fileUploadQueue', JSON.stringify(uploadQueue));
    
    // Note: User will need to re-select file when back online
    // For a production app, consider using File System Access API or other storage
    const statusEl = container.querySelector(`[data-file-id="${fileId}"] .file-status`);
    statusEl.textContent = 'Offline - please retry when online';
    statusEl.className = 'file-status failed';
  }
}

async function attemptFileUpload(fileId, taskId, file, container) {
  const statusEl = container.querySelector(`[data-file-id="${fileId}"] .file-status`);
  
  try {
    statusEl.textContent = 'Uploading...';
    statusEl.className = 'file-status uploading';

    await api.uploadFile(taskId, file);
    
    statusEl.textContent = 'Uploaded';
    statusEl.className = 'file-status uploaded';
    
    // Remove from pending uploads
    if (window.pendingFileUploads) {
      window.pendingFileUploads.delete(fileId);
    }
  } catch (error) {
    statusEl.textContent = 'Failed - click to retry';
    statusEl.className = 'file-status failed';
    
    // Make it clickable to retry
    statusEl.style.cursor = 'pointer';
    statusEl.onclick = () => attemptFileUpload(fileId, taskId, file, container);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

