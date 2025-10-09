-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- This table stores all push notifications sent to users

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE notifications IS 'Stores push notifications sent to app users';
COMMENT ON COLUMN notifications.id IS 'Primary key';
COMMENT ON COLUMN notifications.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN notifications.title IS 'Notification title/heading';
COMMENT ON COLUMN notifications.message IS 'Notification message body';
COMMENT ON COLUMN notifications.type IS 'Type: general, delivery, promotion, alert';
COMMENT ON COLUMN notifications.priority IS 'Priority level: low, normal, high';
COMMENT ON COLUMN notifications.read IS 'Whether user has read the notification';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was read';
COMMENT ON COLUMN notifications.scheduled_for IS 'When to send (null for immediate)';
COMMENT ON COLUMN notifications.sent_at IS 'When notification was actually sent';
COMMENT ON COLUMN notifications.created_at IS 'When notification was created in system';

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- ============================================
-- Uncomment these if you want to enable RLS

-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own notifications
-- CREATE POLICY "Users can view own notifications"
--   ON notifications FOR SELECT
--   USING (auth.uid()::bigint = user_id);

-- Policy: Service role can insert notifications (for CMS)
-- CREATE POLICY "Service role can insert notifications"
--   ON notifications FOR INSERT
--   WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
-- CREATE POLICY "Users can update own notifications"
--   ON notifications FOR UPDATE
--   USING (auth.uid()::bigint = user_id);

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample notifications

-- INSERT INTO notifications (user_id, title, message, type, priority, sent_at) VALUES
-- (1, 'Welcome to Habibi Fitness!', 'Thank you for joining us. Your personalized meal plan is ready!', 'general', 'normal', now()),
-- (1, 'Your meal is ready!', 'Your lunch is being prepared and will arrive in 30 minutes.', 'delivery', 'high', now()),
-- (1, 'Special Offer: 20% Off', 'Get 20% off on your next week subscription. Limited time offer!', 'promotion', 'normal', now());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the table was created correctly

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'notifications'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'notifications';

-- Count notifications
-- SELECT COUNT(*) as total_notifications FROM notifications;

-- Get recent notifications with user info
-- SELECT n.id, n.title, n.type, n.priority, n.read, u.name as user_name
-- FROM notifications n
-- JOIN users u ON n.user_id = u.id
-- ORDER BY n.created_at DESC
-- LIMIT 10;

