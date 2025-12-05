const API_BASE_URL_DEFAULT = 'http://localhost:3000/api/v1';

export function initAPI(baseUrl = API_BASE_URL_DEFAULT) {
  const API_BASE = baseUrl;

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Remove Content-Type for FormData (file uploads)
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // If offline, throw to trigger queue
      if (!navigator.onLine) {
        throw new Error('Network error: Offline');
      }
      throw error;
    }
  }

  return {
    // Tasks CRUD
    async getTasks() {
      return request('/tasks');
    },

    async getTask(id) {
      return request(`/tasks/${id}`);
    },

    async createTask(taskData) {
      return request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ task: taskData })
      });
    },

    async updateTask(id, taskData) {
      return request(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ task: taskData })
      });
    },

    async deleteTask(id) {
      return request(`/tasks/${id}`, {
        method: 'DELETE'
      });
    },

    // File operations
    async uploadFile(taskId, file) {
      const formData = new FormData();
      formData.append('file', file);

      return request(`/tasks/${taskId}/attach_file`, {
        method: 'POST',
        body: formData
      });
    },

    async getFiles(taskId) {
      return request(`/tasks/${taskId}/list_files`);
    },

    async deleteFile(taskId, fileId) {
      return request(`/tasks/${taskId}/files/${fileId}`, {
        method: 'DELETE'
      });
    }
  };
}

