#!/bin/bash

echo "🚀 Quick Deploy to Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy follower manager to Vercel"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository URL:"
    echo "git remote add origin https://github.com/yourusername/follower-manager.git"
    echo "git push -u origin main"
else
    echo "🚀 Pushing to GitHub..."
    git push origin main
fi

echo "✅ Done! Check your Vercel dashboard for deployment status."
