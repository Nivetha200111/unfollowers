-- Complete SQL Schema for Follower Manager App
-- This schema uses gen_random_uuid() which is more reliable than uuid_generate_v4()

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
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

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create removals table
CREATE TABLE removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_ids TEXT[] NOT NULL,
  reason VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_rate_limits table
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX idx_followers_created_at ON followers(created_at);
CREATE INDEX idx_removals_user_id ON removals(user_id);
CREATE INDEX idx_removals_timestamp ON removals(timestamp);
CREATE INDEX idx_removals_reason ON removals(reason);
CREATE INDEX idx_api_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);
CREATE INDEX idx_api_rate_limits_window_start ON api_rate_limits(window_start);
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
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_followers_updated_at 
  BEFORE UPDATE ON followers
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_rate_limits_updated_at 
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO users (username, platform_id, access_token, profile_data) VALUES 
('test_user', '123456789', 'sample_token', '{"displayName": "Test User", "followerCount": 1000}');

INSERT INTO user_settings (user_id, min_follower_threshold, bot_detection_enabled) 
SELECT id, 100, true FROM users WHERE username = 'test_user';

-- Create a function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache_entries WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_followers BIGINT,
  mutual_followers BIGINT,
  non_mutual_followers BIGINT,
  verified_followers BIGINT,
  bot_followers BIGINT,
  total_removals BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM followers WHERE user_id = user_uuid) as total_followers,
    (SELECT COUNT(*) FROM followers WHERE user_id = user_uuid AND is_mutual = true) as mutual_followers,
    (SELECT COUNT(*) FROM followers WHERE user_id = user_uuid AND is_mutual = false) as non_mutual_followers,
    (SELECT COUNT(*) FROM followers WHERE user_id = user_uuid AND is_verified = true) as verified_followers,
    (SELECT COUNT(*) FROM followers WHERE user_id = user_uuid AND bot_score > 0.6) as bot_followers,
    (SELECT COUNT(*) FROM removals WHERE user_id = user_uuid) as total_removals;
END;
$$ language 'plpgsql';

-- Create a function to get follower analytics
CREATE OR REPLACE FUNCTION get_follower_analytics(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  followers_added BIGINT,
  followers_removed BIGINT,
  net_change BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * days_back,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date
  ),
  daily_additions AS (
    SELECT 
      created_at::DATE as date,
      COUNT(*) as added
    FROM followers 
    WHERE user_id = user_uuid 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY created_at::DATE
  ),
  daily_removals AS (
    SELECT 
      timestamp::DATE as date,
      SUM(count) as removed
    FROM removals 
    WHERE user_id = user_uuid 
      AND timestamp >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY timestamp::DATE
  )
  SELECT 
    ds.date,
    COALESCE(da.added, 0) as followers_added,
    COALESCE(dr.removed, 0) as followers_removed,
    COALESCE(da.added, 0) - COALESCE(dr.removed, 0) as net_change
  FROM date_series ds
  LEFT JOIN daily_additions da ON ds.date = da.date
  LEFT JOIN daily_removals dr ON ds.date = dr.date
  ORDER BY ds.date;
END;
$$ language 'plpgsql';

-- Create a view for easy follower analysis
CREATE VIEW follower_analysis AS
SELECT 
  f.id,
  f.user_id,
  f.username,
  f.display_name,
  f.follower_count,
  f.following_count,
  f.is_verified,
  f.is_private,
  f.is_mutual,
  f.bot_score,
  CASE 
    WHEN f.bot_score > 0.8 THEN 'High Bot Probability'
    WHEN f.bot_score > 0.6 THEN 'Moderate Bot Probability'
    WHEN f.bot_score > 0.4 THEN 'Low Bot Probability'
    ELSE 'Very Low Bot Probability'
  END as bot_risk_level,
  CASE 
    WHEN f.following_count = 0 THEN 0
    ELSE ROUND((f.follower_count::DECIMAL / f.following_count), 2)
  END as follower_ratio,
  f.last_analyzed,
  f.created_at
FROM followers f;

-- Create a view for removal statistics
CREATE VIEW removal_stats AS
SELECT 
  r.user_id,
  r.reason,
  COUNT(*) as removal_sessions,
  SUM(r.count) as total_removed,
  AVG(r.count) as avg_per_session,
  MAX(r.timestamp) as last_removal,
  MIN(r.timestamp) as first_removal
FROM removals r
GROUP BY r.user_id, r.reason;

-- Add comments to tables for documentation
COMMENT ON TABLE users IS 'Stores user account information and OAuth tokens';
COMMENT ON TABLE user_settings IS 'User preferences and configuration settings';
COMMENT ON TABLE followers IS 'Follower data with bot detection scores and analysis';
COMMENT ON TABLE removals IS 'History of follower removal operations';
COMMENT ON TABLE api_rate_limits IS 'Rate limiting tracking for API calls';
COMMENT ON TABLE cache_entries IS 'Cached data with expiration timestamps';

COMMENT ON COLUMN followers.bot_score IS 'Bot detection score from 0.0 to 1.0';
COMMENT ON COLUMN followers.is_mutual IS 'Whether the follower also follows the user back';
COMMENT ON COLUMN removals.follower_ids IS 'Array of follower IDs that were removed';
COMMENT ON COLUMN cache_entries.expires_at IS 'When the cached data expires and should be cleaned up';
