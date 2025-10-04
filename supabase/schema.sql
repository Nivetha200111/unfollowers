-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  min_follower_threshold INTEGER DEFAULT 100,
  max_following_ratio DECIMAL(5,2) DEFAULT 10.0,
  bot_detection_enabled BOOLEAN DEFAULT true,
  mutual_only_mode BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT false,
  removal_confirmations BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create followers table
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create removals table
CREATE TABLE removals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_ids TEXT[] NOT NULL,
  reason VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_rate_limits table
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Create cache_entries table
CREATE TABLE cache_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_followers_user_id ON followers(user_id);
CREATE INDEX idx_followers_platform_id ON followers(platform_id);
CREATE INDEX idx_followers_username ON followers(username);
CREATE INDEX idx_followers_bot_score ON followers(bot_score);
CREATE INDEX idx_followers_is_mutual ON followers(is_mutual);
CREATE INDEX idx_followers_follower_count ON followers(follower_count);
CREATE INDEX idx_removals_user_id ON removals(user_id);
CREATE INDEX idx_removals_timestamp ON removals(timestamp);
CREATE INDEX idx_api_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);
CREATE INDEX idx_cache_entries_key ON cache_entries(key);
CREATE INDEX idx_cache_entries_expires_at ON cache_entries(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_followers_updated_at BEFORE UPDATE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Followers policies
CREATE POLICY "Users can manage own followers" ON followers
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Removals policies
CREATE POLICY "Users can manage own removals" ON removals
  FOR ALL USING (auth.uid()::text = user_id::text);

-- API rate limits policies
CREATE POLICY "Users can manage own rate limits" ON api_rate_limits
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Cache entries are public (for now)
CREATE POLICY "Cache entries are public" ON cache_entries
  FOR ALL USING (true);
