#!/bin/bash
# Script to push to GitHub

echo "🚀 Pushing Offline Tasks PWA to GitHub"
echo "======================================"
echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
    echo ""
    read -p "Push to existing remote? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to GitHub!"
            echo ""
            echo "🌐 Next: Deploy to Render and Vercel"
            echo "   See DEPLOY_NOW.md for instructions"
        fi
    fi
else
    echo "⚠️  No GitHub remote found"
    echo ""
    echo "To push to GitHub:"
    echo "1. Create a new repo at: https://github.com/new"
    echo "   Name: offline-tasks-pwa"
    echo "   (Don't initialize with README)"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    echo ""
    
    if [ -n "$GITHUB_USER" ]; then
        git remote add origin "https://github.com/${GITHUB_USER}/offline-tasks-pwa.git"
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to GitHub!"
            echo ""
            echo "🌐 Next: Deploy to Render and Vercel"
            echo "   See DEPLOY_NOW.md for instructions"
        else
            echo ""
            echo "❌ Push failed. Make sure:"
            echo "   1. Repo exists at github.com/${GITHUB_USER}/offline-tasks-pwa"
            echo "   2. You have push access"
            echo "   3. You're authenticated (git config --global user.name/email)"
        fi
    else
        echo "❌ No username provided"
    fi
fi

