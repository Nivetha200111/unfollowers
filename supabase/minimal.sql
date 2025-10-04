-- Minimal schema for testing
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
