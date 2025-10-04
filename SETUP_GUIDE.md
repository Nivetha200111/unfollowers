# Quick Setup Guide - Follower Manager

## Option 1: Manual Table Creation (Easiest)

### Step 1: Go to Supabase Dashboard
1. Open [supabase.com](https://supabase.com)
2. Sign in to your account
3. Go to your project (or create a new one if needed)

### Step 2: Create Tables Manually
1. Click **"Table Editor"** in the left sidebar
2. Click **"New Table"** 
3. Create each table one by one:

#### Table 1: Users
- Click "New Table"
- Name: `users`
- Add these columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `username` (varchar, unique, not null)
  - `platform_id` (varchar, unique, not null)
  - `platform` (varchar, default: 'twitter')
  - `access_token` (text, not null)
  - `refresh_token` (text)
  - `profile_data` (jsonb)
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())
  - `last_login_at` (timestamptz)
- Click "Save"

#### Table 2: User Settings
- Click "New Table"
- Name: `user_settings`
- Add these columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `user_id` (uuid, foreign key to users.id)
  - `min_follower_threshold` (integer, default: 100)
  - `max_following_ratio` (decimal, default: 10.0)
  - `bot_detection_enabled` (boolean, default: true)
  - `mutual_only_mode` (boolean, default: false)
  - `email_notifications` (boolean, default: false)
  - `removal_confirmations` (boolean, default: true)
  - `data_retention_days` (integer, default: 30)
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())
- Click "Save"

#### Table 3: Followers
- Click "New Table"
- Name: `followers`
- Add these columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `user_id` (uuid, foreign key to users.id)
  - `platform_id` (varchar, not null)
  - `username` (varchar, not null)
  - `display_name` (varchar)
  - `bio` (text)
  - `avatar_url` (text)
  - `follower_count` (integer, default: 0)
  - `following_count` (integer, default: 0)
  - `is_verified` (boolean, default: false)
  - `is_private` (boolean, default: false)
  - `is_mutual` (boolean, default: false)
  - `bot_score` (decimal, default: 0.0)
  - `last_analyzed` (timestamptz, default: now())
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())
- Click "Save"

#### Table 4: Removals
- Click "New Table"
- Name: `removals`
- Add these columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `user_id` (uuid, foreign key to users.id)
  - `follower_ids` (text array, not null)
  - `reason` (varchar, not null)
  - `count` (integer, not null)
  - `timestamp` (timestamptz, default: now())
- Click "Save"

### Step 3: Get Your Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key

### Step 4: Update Environment Variables
1. Copy `env.example` to `.env.local`
2. Update with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL="https://your-project-id.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="your-anon-key-here"
TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"
JWT_SECRET="your-super-secret-jwt-key-here"
ENCRYPTION_KEY="your-encryption-key-here"
```

### Step 5: Test the App
```bash
npm install
npm run dev
```

## Option 2: Copy-Paste SQL (If Manual Doesn't Work)

If the manual approach doesn't work, try this:

1. Go to **SQL Editor** in Supabase
2. Copy this simple SQL and paste it:

```sql
-- Simple schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  platform_id VARCHAR(100) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'twitter',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_id VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_mutual BOOLEAN DEFAULT false,
  bot_score DECIMAL(3,2) DEFAULT 0.0,
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform_id)
);

CREATE TABLE removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_ids TEXT[] NOT NULL,
  reason VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Click "Run"

## That's It!

Once you have the tables created and your environment variables set up, the app should work! The manual approach is the most reliable way to get started.

Let me know if you need help with any specific step!
