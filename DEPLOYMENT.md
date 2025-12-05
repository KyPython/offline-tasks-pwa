# Deployment Guide

## Quick Deploy

### Backend (Render)

1. **Push to GitHub** (see below)
2. **Go to Render Dashboard**: https://dashboard.render.com
3. **New → Web Service**
4. **Connect your GitHub repo**
5. **Configure:**
   - **Name**: `offline-tasks-backend`
   - **Environment**: `Ruby`
   - **Build Command**: `cd backend && bundle install && bin/rails db:migrate`
   - **Start Command**: `cd backend && bundle exec puma -C config/puma.rb`
   - **Plan**: Free

6. **Add Environment Variables:**
   - `RAILS_ENV` = `production`
   - `FRONTEND_ORIGIN` = `https://your-vercel-app.vercel.app` (set after Vercel deploy)

7. **Add PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `offline-tasks-db`
   - Connect to your web service

8. **Copy the backend URL** (e.g., `https://offline-tasks-backend.onrender.com`)

### Frontend (Vercel)

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure:**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable:**
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api/v1`

5. **Deploy!**

6. **Update Render Backend:**
   - Go back to Render dashboard
   - Update `FRONTEND_ORIGIN` env var to your Vercel URL

## Testing Locally

### 1. Start Backend

```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails server
```

Backend runs on: http://localhost:3000

### 2. Start Frontend (new terminal)

```bash
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

### 3. Test the App

1. **Open** http://localhost:5173 in your browser
2. **Create a task** - should work immediately
3. **Test offline mode:**
   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Set throttling to "Offline"
   - Create/edit tasks - they should work
   - Set back to "Online" - tasks should sync
4. **Test PWA:**
   - Look for "Install" button in browser
   - Or: Chrome menu → "Install Offline Tasks"
   - App should work standalone

### 4. Check Service Worker

- DevTools → Application tab → Service Workers
- Should see registered service worker
- Check "Offline" checkbox to test offline mode

## Troubleshooting

### Backend Issues

**Database connection:**
- Make sure PostgreSQL is running locally
- Check `config/database.yml`

**CORS errors:**
- Verify `FRONTEND_ORIGIN` in Render matches Vercel URL
- Check `config/initializers/cors.rb`

### Frontend Issues

**API calls failing:**
- Check `VITE_API_URL` environment variable
- Verify backend is running and accessible
- Check browser console for CORS errors

**Service Worker not working:**
- Clear browser cache
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check Application tab in DevTools

## Production URLs

After deployment, update:
- Vercel: Set `VITE_API_URL` to Render backend URL
- Render: Set `FRONTEND_ORIGIN` to Vercel frontend URL

