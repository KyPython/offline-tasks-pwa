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
    echo "📝 IMPORTANT: Create the repository on GitHub FIRST!"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: offline-tasks-pwa"
    echo "3. Description: Offline-first Task Management PWA"
    echo "4. Choose: Public or Private"
    echo "5. ⚠️  DO NOT check 'Add a README file'"
    echo "6. ⚠️  DO NOT add .gitignore or license"
    echo "7. Click 'Create repository'"
    echo ""
    read -p "Press ENTER after you've created the repository on GitHub..."
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    echo ""
    
    if [ -n "$GITHUB_USER" ]; then
        echo "🔗 Adding remote..."
        git remote add origin "https://github.com/${GITHUB_USER}/offline-tasks-pwa.git" 2>/dev/null || git remote set-url origin "https://github.com/${GITHUB_USER}/offline-tasks-pwa.git"
        git branch -M main
        
        echo "📤 Pushing to GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to GitHub!"
            echo ""
            echo "🌐 Repository URL: https://github.com/${GITHUB_USER}/offline-tasks-pwa"
            echo ""
            echo "🚀 Next: Deploy to Render and Vercel"
            echo "   See DEPLOY_NOW.md for instructions"
        else
            echo ""
            echo "❌ Push failed. Common issues:"
            echo ""
            echo "1. Repository doesn't exist yet:"
            echo "   → Go to https://github.com/new and create it first"
            echo ""
            echo "2. Authentication issue:"
            echo "   → Check: git config --global user.name"
            echo "   → Check: git config --global user.email"
            echo "   → Or use: gh auth login (GitHub CLI)"
            echo ""
            echo "3. Wrong repository name:"
            echo "   → Make sure repo name is exactly: offline-tasks-pwa"
            echo ""
            echo "Try again after fixing the issue above."
        fi
    else
        echo "❌ No username provided"
    fi
fi

