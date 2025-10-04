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
