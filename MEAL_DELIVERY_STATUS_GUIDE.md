# Meal Delivery Status Tracking System

## Overview
This system allows admins to track and update meal delivery statuses in real-time. Users can see the status of their meals in both the mobile app and website.

## Features
- ✅ Real-time status updates
- ✅ Multiple status stages (Pending → Preparing → Out for Delivery → Delivered)
- ✅ User notifications on status changes
- ✅ Admin dashboard for status management
- ✅ Date-based filtering
- ✅ User search and filtering
- ✅ Delivery time tracking

## Status Types

| Status | Description | Color |
|--------|-------------|-------|
| `pending` | Meal order received, not yet started | Gray |
| `preparing` | Meal is being prepared in the kitchen | Blue |
| `out_for_delivery` | Meal is with delivery driver | Orange |
| `delivered` | Meal has been delivered to customer | Green |
| `cancelled` | Meal delivery cancelled | Red |

## Database Schema Changes

### Required Updates to `meal_schedules` table

Your current CSV structure shows meals stored in the `schedule_data` JSON column. You need to add a `status` field to each meal object.

#### Current Structure:
```json
{
  "week_1": {
    "monday": {
      "lunch_1": {
        "id": "3b8424c8-fbc8-48a7-8cb1-8424d68c0b9b",
        "name": "Chicken & Zoodle Soup",
        "calories": 280,
        "protein": 30,
        ...
      }
    }
  }
}
```

#### Updated Structure (with status):
```json
{
  "week_1": {
    "monday": {
      "lunch_1": {
        "id": "3b8424c8-fbc8-48a7-8cb1-8424d68c0b9b",
        "name": "Chicken & Zoodle Soup",
        "calories": 280,
        "protein": 30,
        "status": "pending",
        "status_updated_at": "2024-10-08T10:30:00Z",
        "estimated_delivery": "12:00 PM - 12:30 PM",
        "delivery_notes": "",
        ...
      }
    }
  }
}
```

### Migration Script

```sql
-- If using PostgreSQL/Supabase
-- Update existing records to add default status

UPDATE meal_schedules 
SET schedule_data = jsonb_set(
  schedule_data::jsonb,
  '{status}',
  '"pending"'::jsonb,
  true
)
WHERE schedule_data::jsonb ? 'meals';

-- Add index for better query performance
CREATE INDEX idx_meal_schedules_user_date ON meal_schedules(user_id, created_at);
CREATE INDEX idx_meal_schedules_updated ON meal_schedules(updated_at);
```

### New Table (Optional - for better performance)

You can optionally create a separate table for tracking delivery statuses:

```sql
CREATE TABLE meal_delivery_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  meal_id VARCHAR(255) NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  delivery_date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  estimated_delivery_time VARCHAR(100),
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  CONSTRAINT valid_meal_type CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

-- Indexes
CREATE INDEX idx_delivery_user_date ON meal_delivery_status(user_id, delivery_date);
CREATE INDEX idx_delivery_status ON meal_delivery_status(status);
CREATE INDEX idx_delivery_date ON meal_delivery_status(delivery_date);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meal_delivery_status_updated_at 
BEFORE UPDATE ON meal_delivery_status 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

## API Endpoints

### 1. Update Meal Status
**Endpoint:** `POST /api/update-meal-status`

**Request Body:**
```json
{
  "userId": "USR001",
  "mealId": "meal_1",
  "status": "preparing",
  "date": "2024-10-08"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal status updated successfully",
  "data": {
    "userId": "USR001",
    "mealId": "meal_1",
    "status": "preparing",
    "updatedAt": "2024-10-08T10:30:00Z"
  }
}
```

### 2. Get Delivery Statuses
**Endpoint:** `GET /api/update-meal-status?userId=USR001&date=2024-10-08&status=pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "USR001",
      "userName": "John Doe",
      "meals": [
        {
          "id": "meal_1",
          "name": "Chicken & Zoodle Soup",
          "status": "pending",
          "type": "lunch",
          "estimatedDelivery": "12:00 PM - 12:30 PM"
        }
      ]
    }
  ]
}
```

## Integration with Mobile App / Website

### For Users (Mobile/Web App)

1. **Fetch User's Meal Schedule:**
```javascript
const fetchMealSchedule = async (userId, date) => {
  const response = await fetch(`/api/update-meal-status?userId=${userId}&date=${date}`)
  const data = await response.json()
  return data
}
```

2. **Display Status:**
```javascript
const MealCard = ({ meal }) => {
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending':
        return { icon: '⏳', text: 'Order Received', color: 'gray' }
      case 'preparing':
        return { icon: '👨‍🍳', text: 'Being Prepared', color: 'blue' }
      case 'out_for_delivery':
        return { icon: '🚗', text: 'On the Way', color: 'orange' }
      case 'delivered':
        return { icon: '✅', text: 'Delivered', color: 'green' }
      default:
        return { icon: '📦', text: 'Processing', color: 'gray' }
    }
  }
  
  const statusInfo = getStatusInfo(meal.status)
  
  return (
    <div className="meal-card">
      <h3>{meal.name}</h3>
      <div className={`status-badge ${statusInfo.color}`}>
        {statusInfo.icon} {statusInfo.text}
      </div>
      <p>Estimated: {meal.estimatedDelivery}</p>
    </div>
  )
}
```

### For Admins (CMS)

The admin interface is already built at `/cms/update-delivery-status`. Features include:
- View all orders for a specific date
- Search and filter by user
- Update status with dropdown
- Confirmation modal before updating
- Real-time stats dashboard

## Notifications

When a status is updated, you should send notifications to users:

### Push Notifications (Example)
```javascript
const sendPushNotification = async (userId, mealName, status) => {
  const messages = {
    preparing: `Your ${mealName} is being prepared! 👨‍🍳`,
    out_for_delivery: `Your ${mealName} is on the way! 🚗`,
    delivered: `Your ${mealName} has been delivered! ✅`
  }
  
  // Use Firebase Cloud Messaging, OneSignal, or similar
  await notificationService.send({
    userId,
    title: 'Meal Status Update',
    body: messages[status],
    data: { mealId, status }
  })
}
```

### Email Notifications (Example)
```javascript
const sendEmailNotification = async (email, userName, mealName, status) => {
  const templates = {
    out_for_delivery: {
      subject: `Your ${mealName} is on the way!`,
      body: `Hi ${userName}, your meal is out for delivery and will arrive soon.`
    },
    delivered: {
      subject: `Your ${mealName} has been delivered`,
      body: `Hi ${userName}, your meal has been successfully delivered. Enjoy!`
    }
  }
  
  // Use SendGrid, AWS SES, or similar
  await emailService.send({
    to: email,
    ...templates[status]
  })
}
```

## Real-time Updates (WebSocket)

For real-time status updates without refreshing:

```javascript
// Server-side (example with Socket.io)
io.on('connection', (socket) => {
  socket.on('subscribe_user_updates', (userId) => {
    socket.join(`user_${userId}`)
  })
})

// When status is updated
io.to(`user_${userId}`).emit('meal_status_updated', {
  mealId,
  status,
  timestamp: new Date()
})

// Client-side
socket.on('meal_status_updated', (data) => {
  // Update UI with new status
  updateMealStatus(data.mealId, data.status)
})
```

## Testing

### Test the Status Update Flow:

1. **Login to CMS** at `/cms` (admin/admin123)
2. **Navigate to** "Update Delivery Status" from sidebar
3. **Select today's date**
4. **Click on a status dropdown** for any meal
5. **Select new status** (e.g., "Preparing")
6. **Confirm** in the modal
7. **Check console** for API call logs

### Test API Endpoints:

```bash
# Update meal status
curl -X POST http://localhost:3000/api/update-meal-status \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR001",
    "mealId": "meal_1",
    "status": "preparing",
    "date": "2024-10-08"
  }'

# Get delivery statuses
curl "http://localhost:3000/api/update-meal-status?userId=USR001&date=2024-10-08"
```

## Next Steps

1. ✅ Connect API endpoints to your actual database (Supabase/PostgreSQL)
2. ✅ Implement push notification service
3. ✅ Add real-time WebSocket updates
4. ✅ Create mobile app UI for status display
5. ✅ Add delivery driver assignment feature
6. ✅ Implement delivery tracking with GPS
7. ✅ Add customer ratings and feedback
8. ✅ Create analytics dashboard for delivery performance

## Support

For questions or issues, contact the development team.

