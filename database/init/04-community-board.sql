-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Lost & Found', 'Event', 'General'
    attachments TEXT[], -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering
CREATE INDEX idx_community_posts_building_id ON community_posts (building_id);
CREATE INDEX idx_community_posts_created_at ON community_posts (created_at);

-- Trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at BEFORE
UPDATE ON community_posts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();
