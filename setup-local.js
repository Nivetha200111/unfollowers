const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Follower Manager for local use...\n')

// Create data directory
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('✅ Created data directory')
}

// Create initial database
const dbPath = path.join(dataDir, 'database.json')
if (!fs.existsSync(dbPath)) {
  const initialData = {
    users: [],
    followers: [],
    userSettings: [],
    removals: []
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2))
  console.log('✅ Initialized local database')
}

// Create .env.local if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  const envContent = `# Local Database (no configuration needed)
# Data is stored in ./data/database.json

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# Encryption Key (for storing sensitive tokens)
ENCRYPTION_KEY="your-encryption-key-here"

# Twitter OAuth Credentials
TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"

# Application
NODE_ENV="development"
PORT=3000
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
}

console.log('\n🎉 Setup complete!')
console.log('\nNext steps:')
console.log('1. Update your .env.local with your Twitter OAuth credentials')
console.log('2. Run: npm install')
console.log('3. Run: npm run dev')
console.log('\nYour data will be stored locally in ./data/database.json')
console.log('No external database required! 🎯')
