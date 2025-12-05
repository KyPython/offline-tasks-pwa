# Architecture Overview

## Offline-First Design

This PWA implements a true offline-first architecture where:

1. **All operations work offline** - Users can create, edit, and delete tasks without network connectivity
2. **Automatic sync** - When back online, queued operations are automatically synced
3. **Background sync** - Service Worker handles sync even when the app is closed
4. **Optimistic UI** - Changes appear immediately, then sync in the background

## Data Flow

### Creating a Task (Offline)

```
User creates task
    ↓
Save to IndexedDB immediately (with local_id)
    ↓
Show in UI immediately
    ↓
Queue operation in sync queue
    ↓
[When online] Sync queue processes:
    - Call API to create task
    - Update IndexedDB with server ID
    - Remove from sync queue
```

### Creating a Task (Online)

```
User creates task
    ↓
Save to IndexedDB immediately
    ↓
Call API immediately
    ↓
On success: Update IndexedDB with server response
On failure: Queue for retry
```

## Storage Layers

### IndexedDB (Client-Side)

**Tasks Store:**
- Stores all task data locally
- Key: `id` (server ID or local_id)
- Indexes: `status`, `due_date`
- Fields: All task fields + `synced` flag + `local_id`

**Queue Store:**
- Stores pending sync operations
- Auto-incrementing key
- Indexes: `type`, `timestamp`
- Operations: CREATE_TASK, UPDATE_TASK, DELETE_TASK, UPLOAD_FILE

### Service Worker Cache

**Precache:**
- Static assets (HTML, CSS, JS bundles)
- App shell for instant loading

**Runtime Cache:**
- API responses (NetworkFirst strategy)
- Active Storage files (CacheFirst strategy)

## Sync Strategy

### Foreground Sync

- Triggered when app comes online
- Triggered periodically (every 30 seconds)
- Processes queue synchronously
- Updates UI with sync status

### Background Sync

- Triggered by Service Worker when network is available
- Uses Workbox BackgroundSyncPlugin
- Retries failed operations automatically
- Works even when app is closed

## File Upload Limitations

**Important:** File objects cannot be stored in IndexedDB. The current implementation:

1. **Online:** Uploads immediately
2. **Offline:** Shows error message, user must retry when online

**Future improvements:**
- Use File System Access API (Chrome)
- Store file as Blob in IndexedDB (with size limits)
- Use Background Fetch API for large files

## API Design

### RESTful Endpoints

All endpoints follow REST conventions:
- `GET /api/v1/tasks` - List
- `GET /api/v1/tasks/:id` - Show
- `POST /api/v1/tasks` - Create
- `PATCH /api/v1/tasks/:id` - Update
- `DELETE /api/v1/tasks/:id` - Delete

### File Operations

- `POST /api/v1/tasks/:id/attach_file` - Upload file
- `GET /api/v1/tasks/:id/list_files` - List files
- `DELETE /api/v1/tasks/:id/files/:file_id` - Delete file

### Response Format

```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "due_date": "2025-01-15T10:00:00Z",
  "files_count": 2,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

## Error Handling

### Network Errors

- Caught in API client
- Operations queued for retry
- User sees sync status indicator

### Validation Errors

- Returned from API as JSON
- Displayed to user
- Task remains in local storage

### Sync Failures

- Increment retry count
- Max retries: Unlimited (with exponential backoff in production)
- User can manually retry

## Security Considerations

### Current (MVP)

- No authentication (stubbed for MVP)
- CORS configured for development
- File uploads accepted without validation

### Production Recommendations

- Add JWT authentication
- Validate file types and sizes
- Rate limiting on API
- CSRF protection
- Input sanitization
- File virus scanning (via Sidekiq job)

## Performance Optimizations

1. **IndexedDB Indexing:** Fast queries by status and due_date
2. **Service Worker Caching:** Reduces network requests
3. **Optimistic Updates:** Immediate UI feedback
4. **Batch Sync:** Processes queue in order
5. **Lazy Loading:** Service worker registered asynchronously

## Browser Compatibility

### Required Features

- IndexedDB
- Service Workers
- Fetch API
- ES6+ JavaScript

### Supported Browsers

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Mobile browsers with PWA support

## Deployment Architecture

### Backend

- Rails API server (Puma)
- PostgreSQL database
- Active Storage (local or cloud)
- Optional: Sidekiq for background jobs

### Frontend

- Static files (Vite build output)
- Served via CDN or static hosting
- Service Worker handles caching
- No server-side rendering needed

## Monitoring & Debugging

### Development

- Browser DevTools → Application tab
- Check IndexedDB stores
- View Service Worker status
- Network tab for API calls

### Production

- Log sync queue size
- Track sync failures
- Monitor API response times
- Track offline usage patterns

