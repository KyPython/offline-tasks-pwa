# ⚠️ Critical: Check DATABASE_URL

## Current Status

Puma is starting now (good!), but Rails is failing during initialization. This is **almost certainly** because `DATABASE_URL` is missing.

## Must Do: Add DATABASE_URL

**This is the #1 issue preventing your backend from working.**

### Steps:

1. **Go to**: https://dashboard.render.com
2. **Click on**: `offline-tasks-db` (your PostgreSQL database)
3. **Find**: "Internal Database URL" section
4. **Click**: "Show" button (to reveal it)
5. **Copy** the entire connection string
   - Looks like: `postgres://offline_tasks_db_user:password@dpg-d4p5ile3jp1c73dsqflg-a:5432/offline_tasks_db`
6. **Go to**: `offline-tasks-pwa` (your web service)
7. **Click**: "Environment" tab
8. **Click**: "Add Environment Variable"
9. **Add**:
   - **Key**: `DATABASE_URL`
   - **Value**: (paste the Internal Database URL)
10. **Click**: "Save Changes"

## After Adding DATABASE_URL

- Render will automatically redeploy
- Rails will connect to the database
- Backend should start successfully
- Your app will work!

## Verify Environment Variables

In your web service Environment tab, you should have **4 variables**:

- ✅ `RAILS_ENV` = `production`
- ✅ `SECRET_KEY_BASE` = (long string)
- ✅ `FRONTEND_ORIGIN` = (your Vercel URL)
- ❌ `DATABASE_URL` = **MISSING - ADD THIS!**

## Test After Adding

```bash
curl https://offline-tasks-pwa.onrender.com/up
```

Should return: `{"status":"ok"}`

**Without DATABASE_URL, your backend cannot start. This is the final piece!** 🔑

