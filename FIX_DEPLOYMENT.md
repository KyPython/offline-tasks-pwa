# Fix Deployment Issues

## ✅ Fixed Issues

1. **Vercel config** - Removed invalid header pattern (pushed to GitHub)
2. **Render secret key** - Need to add environment variable

## 🔧 Fix Render Backend (Do This Now)

### Add SECRET_KEY_BASE to Render

1. **Go to**: https://dashboard.render.com
2. **Open** your service: `offline-tasks-pwa`
3. **Click**: "Environment" tab
4. **Click**: "Add Environment Variable"
5. **Add**:
   ```
   Key: SECRET_KEY_BASE
   Value: a7b9e02851b246d89f2d266f4605bac2e922a721da7f834ad8f055f852268ee91cb19797bd6873927e0fe3fbb15760bf16fd97e8dd2076689c5e04bdf1367867
   ```
6. **Click**: "Save Changes"
7. **Wait** for automatic redeploy (1-2 minutes)

### Verify Backend is Working

After redeploy, test:
```bash
curl https://offline-tasks-pwa.onrender.com/up
```

Should return: `{"status":"ok"}`

## 🎨 Deploy Frontend to Vercel

### Step 1: Import Project

1. **Go to**: https://vercel.com
2. **Click**: "Add New..." → "Project"
3. **Import**: `KyPython/offline-tasks-pwa`

### Step 2: Configure

**Project Name**: `offline-tasks-pwa`

**Framework Preset**: `Other`

**Root Directory**: `./` (root)

**Build Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables**:
- **Key**: `VITE_API_URL`
- **Value**: `https://offline-tasks-pwa.onrender.com/api/v1`

### Step 3: Deploy

1. **Click**: "Deploy"
2. **Wait** for build (1-2 minutes)
3. **Copy** your Vercel URL

### Step 4: Connect Backend and Frontend

1. **Go back to Render**
2. **Update** `FRONTEND_ORIGIN` environment variable:
   - Value: `https://your-vercel-app.vercel.app`
   - (Use your actual Vercel URL)
3. **Save** - Render will redeploy

## ✅ Final Checklist

- [ ] SECRET_KEY_BASE added to Render
- [ ] Backend deployed successfully
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] FRONTEND_ORIGIN set in Render
- [ ] Test creating a task
- [ ] Test offline mode

## 🎉 Success!

Once both are deployed and connected, your app is live!

**Your URLs:**
- Frontend: `https://offline-tasks-pwa.vercel.app` (or similar)
- Backend: `https://offline-tasks-pwa.onrender.com`

