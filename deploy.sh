#!/bin/bash

echo "🚀 Deploying Follower Manager to Vercel..."

# Add all files
git add .

# Commit changes
git commit -m "Deploy follower manager with local database"

# Push to GitHub
git push origin main

echo "✅ Code pushed to GitHub!"
echo "🔗 Go to your Vercel dashboard to see deployment status"
echo "🔑 Don't forget to add environment variables in Vercel:"
echo "   - JWT_SECRET"
echo "   - ENCRYPTION_KEY" 
echo "   - TWITTER_CLIENT_ID"
echo "   - TWITTER_CLIENT_SECRET"
echo ""
echo "📱 Your app will be available at: https://your-project-name.vercel.app"
