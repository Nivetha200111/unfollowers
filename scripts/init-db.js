const fs = require('fs')
const path = require('path')

// Create data directory and initialize database
const dataDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'database.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('Created data directory')
}

if (!fs.existsSync(dbPath)) {
  const initialData = {
    users: [],
    followers: [],
    userSettings: [],
    removals: []
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2))
  console.log('Initialized local database')
} else {
  console.log('Local database already exists')
}

console.log('Database initialized at:', dbPath)
