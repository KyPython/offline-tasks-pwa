# Create GitHub Repository - Quick Guide

## Step 1: Create Repository on GitHub

1. **Go to**: https://github.com/new
2. **Repository name**: `offline-tasks-pwa`
3. **Description**: `Offline-first Task Management PWA`
4. **Visibility**: Choose Public or Private
5. **⚠️ IMPORTANT**: 
   - ❌ DO NOT check "Add a README file"
   - ❌ DO NOT add .gitignore
   - ❌ DO NOT add a license
   - (We already have all these files!)
6. **Click**: "Create repository"

## Step 2: Push Your Code

After creating the repo, run:

```bash
./PUSH_TO_GITHUB.sh
```

Or manually:

```bash
git remote add origin https://github.com/KyPython/offline-tasks-pwa.git
git branch -M main
git push -u origin main
```

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create offline-tasks-pwa --public --source=. --remote=origin --push
```

This creates the repo and pushes in one command!

## Troubleshooting

**"Repository not found" error:**
- Make sure you created the repo on GitHub first
- Check the repository name matches exactly
- Verify your GitHub username is correct

**Authentication errors:**
- Use GitHub CLI: `gh auth login`
- Or set up SSH keys
- Or use a personal access token

**"Permission denied" error:**
- Make sure you own the repository
- Check you're logged into the correct GitHub account

