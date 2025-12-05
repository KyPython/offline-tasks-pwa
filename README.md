# Offline Tasks PWA

A portfolio-quality, offline-first task management Progressive Web App built with Ruby on Rails (API) and vanilla JavaScript.

## Architecture

### Backend
- **Ruby on Rails 8.1** in API mode
- **PostgreSQL** database
- **Active Storage** for file attachments
- **Rack CORS** for cross-origin requests
- RESTful JSON API under `/api/v1`

### Frontend
- **Vanilla JavaScript (ES6+)** - no heavy frameworks
- **Vite** for bundling and development
- **Workbox** for service worker management
- **IndexedDB** for offline data storage
- **Background Sync API** for queued operations
- **PWA Manifest** for installability

## Features

- ✅ **Offline-First**: Create, edit, and delete tasks completely offline
- ✅ **Background Sync**: Automatically syncs queued operations when back online
- ✅ **File Uploads**: Attach files to tasks with offline queuing
- ✅ **Real-time Status**: Online/offline indicator and sync status
- ✅ **Mobile-Friendly**: Responsive design with touch-friendly controls
- ✅ **Installable**: Can be installed as a PWA on mobile and desktop

## Project Structure

```
offline-tasks-pwa/
├── backend/              # Rails API
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/v1/
│   │   │       └── tasks_controller.rb
│   │   ├── models/
│   │   │   └── task.rb
│   │   └── jobs/
│   │       └── file_processing_job.rb
│   ├── config/
│   │   ├── routes.rb
│   │   └── initializers/
│   │       └── cors.rb
│   └── db/
│       └── migrate/
│           └── 20250101000001_create_tasks.rb
├── src/                  # Frontend source
│   ├── main.js          # App entry point
│   ├── api.js           # API client
│   ├── db.js            # IndexedDB wrapper
│   ├── ui.js            # UI rendering and events
│   └── sw-register.js   # Service worker registration
├── public/
│   ├── sw.js            # Service worker
│   └── manifest.webmanifest
├── index.html
├── vite.config.js
└── package.json
```

## Setup Instructions

### Prerequisites

- Ruby 3.0+ and Rails 8.1
- PostgreSQL
- Node.js 18+ and npm/yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Set up database:**
   ```bash
   # Create database
   bin/rails db:create
   
   # Run migrations
   bin/rails db:migrate
   ```

4. **Start Rails server:**
   ```bash
   bin/rails server
   ```
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Vite dev server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

## How It Works

### Offline-First Architecture

1. **Data Storage**: All tasks are stored in IndexedDB immediately, regardless of network status.

2. **Operation Queue**: When offline or when API calls fail, operations are queued in IndexedDB:
   - `CREATE_TASK`: New task creation
   - `UPDATE_TASK`: Task updates
   - `DELETE_TASK`: Task deletion
   - `UPLOAD_FILE`: File uploads

3. **Background Sync**: 
   - When the app comes back online, the service worker triggers a sync
   - The main app processes the queue and attempts to sync each operation
   - Successful operations are removed from the queue
   - Failed operations are retried (with retry count tracking)

4. **Service Worker Caching**:
   - **Precaching**: Static assets (HTML, CSS, JS) are precached
   - **Runtime Caching**: API responses use NetworkFirst strategy
   - **File Caching**: Active Storage files use CacheFirst strategy

### API Endpoints

All endpoints are under `/api/v1`:

- `GET /api/v1/tasks` - List all tasks
- `GET /api/v1/tasks/:id` - Get a specific task
- `POST /api/v1/tasks` - Create a new task
- `PATCH /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete a task
- `POST /api/v1/tasks/:id/attach_file` - Attach a file to a task
- `GET /api/v1/tasks/:id/list_files` - List files for a task
- `DELETE /api/v1/tasks/:id/files/:file_id` - Delete a file

### Task Model

```ruby
Task
  - id: integer
  - title: string (required)
  - description: text (optional)
  - status: enum (pending, in_progress, completed)
  - due_date: datetime (optional)
  - created_at: datetime
  - updated_at: datetime
  - files: Active Storage attachments
```

## Development

### Running Both Servers

You'll need both the Rails API and Vite dev server running:

**Terminal 1 (Backend):**
```bash
cd backend
bin/rails server
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Testing Offline Functionality

1. Open the app in Chrome DevTools
2. Go to Network tab
3. Set throttling to "Offline"
4. Create/edit/delete tasks - they should work offline
5. Set back to "Online" - operations should sync automatically

### Service Worker Development

- Service worker is registered automatically
- Changes require a hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check "Application" tab in DevTools for service worker status

## Deployment

### Backend (Rails)

The backend can be deployed to:
- **Heroku**: Add `Procfile` with `web: bundle exec puma -C config/puma.rb`
- **Render**: Configure PostgreSQL and set build command to `bundle install && rails db:migrate`
- **Railway**: Similar to Render

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `RAILS_ENV`: Set to `production`
- `FRONTEND_ORIGIN`: Your frontend domain for CORS

### Frontend (Vite)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to:
   - **Netlify**: Connect repo, build command: `npm run build`, publish directory: `dist`
   - **Vercel**: Similar setup
   - **GitHub Pages**: Deploy `dist/` folder
   - **Any static hosting**: Upload `dist/` folder contents

3. **Update API URL**: Set `VITE_API_URL` environment variable to your backend URL

## Future Enhancements

- [ ] User authentication (JWT or Devise)
- [ ] Real-time sync with Action Cable
- [ ] Task categories/tags
- [ ] Task search and filtering
- [ ] Dark mode
- [ ] Push notifications for due tasks
- [ ] Export/import tasks
- [ ] Task sharing/collaboration

## License

MIT

## Credits

Built as a portfolio project demonstrating:
- Offline-first architecture
- Progressive Web App capabilities
- Service Worker and Background Sync
- IndexedDB for client-side storage
- Rails API design
- Modern JavaScript (ES6+)

