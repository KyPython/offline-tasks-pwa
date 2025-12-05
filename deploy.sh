#!/bin/bash
# Deployment helper script

echo "🚀 Offline Tasks PWA - Deployment Helper"
echo "=========================================="
echo ""

# Check if git remote exists
if ! git remote | grep -q origin; then
    echo "⚠️  No GitHub remote found!"
    echo ""
    echo "To push to GitHub, run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/offline-tasks-pwa.git"
    echo "  git push -u origin main"
    echo ""
    read -p "Do you want to add a GitHub remote now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub username: " GITHUB_USER
        git remote add origin "https://github.com/${GITHUB_USER}/offline-tasks-pwa.git"
        echo "✅ Remote added!"
    fi
fi

# Push to GitHub if remote exists
if git remote | grep -q origin; then
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo "✅ Pushed to GitHub successfully!"
        echo ""
        echo "🌐 Next steps for deployment:"
        echo ""
        echo "1. VERCEL (Frontend):"
        echo "   - Go to https://vercel.com"
        echo "   - Import your GitHub repo"
        echo "   - Framework: Other"
        echo "   - Build: npm run build"
        echo "   - Output: dist"
        echo "   - Add env: VITE_API_URL=https://your-backend.onrender.com/api/v1"
        echo ""
        echo "2. RENDER (Backend):"
        echo "   - Go to https://dashboard.render.com"
        echo "   - New → Web Service → Connect GitHub"
        echo "   - Root Directory: backend"
        echo "   - Build: bundle install && bin/rails db:migrate"
        echo "   - Start: bundle exec puma -C config/puma.rb"
        echo "   - Add PostgreSQL database"
        echo "   - Add env: RAILS_ENV=production, FRONTEND_ORIGIN=your-vercel-url"
        echo ""
    else
        echo "❌ Failed to push. Check your GitHub credentials."
    fi
else
    echo "⚠️  No remote configured. Skipping push."
fi

echo ""
echo "✅ Setup complete! See DEPLOYMENT.md for detailed instructions."

