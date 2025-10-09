# Notifications Database Schema

This document outlines the database schema needed for the notification system.

## Table: `notifications`

Create this table in your Supabase database:

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: CMS can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id::text);
```

## Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `title` | VARCHAR(255) | Notification title |
| `message` | TEXT | Notification message/body |
| `type` | VARCHAR(50) | Type: `general`, `delivery`, `promotion`, `alert` |
| `priority` | VARCHAR(20) | Priority: `low`, `normal`, `high` |
| `read` | BOOLEAN | Whether notification has been read |
| `read_at` | TIMESTAMP | When the notification was read |
| `scheduled_for` | TIMESTAMP | When to send (null for immediate) |
| `sent_at` | TIMESTAMP | When the notification was sent |
| `created_at` | TIMESTAMP | When the notification was created |
| `updated_at` | TIMESTAMP | When the notification was last updated |

## Integration with Mobile/Web App

### Fetch User Notifications
```javascript
// Get all notifications for a user
GET /api/notifications/user/:userId

// Get only unread notifications
GET /api/notifications/user/:userId?unreadOnly=true

// Response
{
  "success": true,
  "data": [
    {
      "id": "notif-123",
      "title": "Your meal is ready!",
      "message": "Your lunch is being prepared",
      "type": "delivery",
      "priority": "normal",
      "read": false,
      "created_at": "2025-10-08T12:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Mark Notification as Read
```javascript
PUT /api/notifications/:notificationId/read

// Response
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Push Notification Integration (Optional)

To enable real push notifications to mobile devices, integrate with one of these services:

### Firebase Cloud Messaging (FCM)
```bash
npm install firebase-admin
```

### OneSignal
```bash
npm install onesignal-node
```

### Expo Push Notifications (for React Native)
```bash
npm install expo-server-sdk
```

Then update the `/api/notifications/send` endpoint to call the push service after saving to the database.

## Future Enhancements

- [ ] Add notification templates
- [ ] Support rich media (images, actions)
- [ ] Add notification scheduling/cron jobs
- [ ] Implement notification preferences per user
- [ ] Add notification analytics (open rates, click rates)
- [ ] Support deep linking to app sections
- [ ] Add notification sound/vibration settings

