# Quick Setup Guide

## Prerequisites

- Ruby 3.0+ (check with `ruby -v`)
- Rails 8.1 (will be installed via bundle)
- PostgreSQL (check with `psql --version`)
- Node.js 18+ (check with `node -v`)
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend

# Install Ruby dependencies
bundle install

# Create and setup database
bin/rails db:create
bin/rails db:migrate

# (Optional) Seed some test data
# bin/rails db:seed

# Start the Rails server
bin/rails server
```

The API will be available at `http://localhost:3000`

### 2. Frontend Setup

Open a new terminal:

```bash
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Create PWA Icons (Required for PWA installation)

You need to create two icon files in the `public/` directory:

- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

See `ICONS.md` for details on generating these icons.

### 4. Test the App

1. Open `http://localhost:5173` in your browser
2. Create a task
3. Test offline mode:
   - Open Chrome DevTools
   - Go to Network tab
   - Set throttling to "Offline"
   - Create/edit tasks - they should work
   - Set back to "Online" - tasks should sync

## Troubleshooting

### Backend Issues

**Database connection error:**
- Make sure PostgreSQL is running: `pg_isready`
- Check `config/database.yml` for correct database name
- Create database manually: `createdb backend_development`

**Port 3000 already in use:**
- Change port: `bin/rails server -p 3001`
- Update frontend API URL in `src/main.js`

**CORS errors:**
- Check `config/initializers/cors.rb` is uncommented
- Restart Rails server after changing CORS config

### Frontend Issues

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

**Service worker not registering:**
- Check browser console for errors
- Clear browser cache and hard refresh (Cmd+Shift+R)
- Check Application tab in DevTools

**API calls failing:**
- Ensure Rails server is running on port 3000
- Check browser console for CORS errors
- Verify API URL in `src/main.js`

## Production Build

### Backend

```bash
cd backend
RAILS_ENV=production bundle install
RAILS_ENV=production bin/rails db:migrate
RAILS_ENV=production bin/rails assets:precompile  # if needed
```

### Frontend

```bash
npm run build
```

The built files will be in the `dist/` directory. Deploy this to any static hosting service.

## Environment Variables

### Backend

- `DATABASE_URL`: PostgreSQL connection string (production)
- `RAILS_ENV`: Set to `production` for production
- `FRONTEND_ORIGIN`: Frontend domain for CORS (production)

### Frontend

- `VITE_API_URL`: Backend API URL (defaults to `http://localhost:3000/api/v1`)

Set these in your hosting platform's environment variables.

