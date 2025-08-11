# Telegram Bot Integration Documentation

## Overview

The Telegram bot integration feature automatically sends notifications to a Telegram chat when meetings are created or cancelled in the meeting booking system. This provides real-time updates to team members about meeting schedule changes.

## Features

- **Meeting Creation Notifications**: Sends detailed notifications when new meetings are created
- **Meeting Cancellation Notifications**: Sends notifications when meetings are cancelled
- **Rich Message Formatting**: Uses HTML formatting with emojis for better readability
- **Vietnamese Localization**: Messages are formatted in Vietnamese to match the application's language
- **Error Handling**: Graceful handling of notification failures without affecting meeting operations
- **Environment-based Configuration**: Uses environment variables for secure configuration

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

### Setting Up the Telegram Bot

1. **Create a Bot**:
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use the `/newbot` command
   - Follow the instructions to create your bot
   - Save the bot token provided

2. **Get Chat ID**:
   - Add your bot to the target chat/group
   - Send a message in the chat
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find the `chat_id` in the response

## Implementation Details

### File Structure

```
app/
├── api/
│   └── telegram/
│       └── notify/
│           └── route.ts                    # API endpoint for notifications
├── shared-ui/
│   └── lib/
│       └── utils/
│           └── telegram.ts                 # Telegram utility functions
└── (dashboard)/
    └── hrm/
        └── meeting-booking/
            └── page.tsx                    # Updated with notification calls
```

### Core Components

#### 1. Telegram Utilities (`app/shared-ui/lib/utils/telegram.ts`)

**Functions**:
- `sendTelegramMessage()`: Core function to send messages via Telegram Bot API
- `formatMeetingNotification()`: Formats meeting data into readable messages
- `sendMeetingCreationNotification()`: Sends creation notifications
- `sendMeetingCancellationNotification()`: Sends cancellation notifications

**Message Format**:
```html
📅 <b>Cuộc Họp Mới Được Tạo</b>

🏢 <b>Tiêu đề:</b> [Meeting Title]
👤 <b>Người tổ chức:</b> [Organizer Name]
🏠 <b>Phòng:</b> [Room Name]
📍 <b>Vị trí:</b> [Room Location]
👥 <b>Sức chứa:</b> [Room Capacity] người
⏰ <b>Thời gian:</b> [Start Time] - [End Time]

✅ Cuộc họp đã được đặt thành công!
```

#### 2. API Endpoint (`app/api/telegram/notify/route.ts`)

**Endpoint**: `POST /api/telegram/notify`

**Request Body**:
```json
{
  "type": "meeting_created" | "meeting_cancelled",
  "meetingData": {
    "title": "string",
    "startTime": "string (ISO)",
    "endTime": "string (ISO)",
    "roomName": "string",
    "organizerName": "string",
    "roomLocation": "string",
    "roomCapacity": "number"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Telegram notification sent successfully"
}
```

#### 3. Meeting Booking Integration

**Meeting Creation**:
- Notification is sent after successful meeting creation
- Uses meeting data and room information
- Non-blocking: meeting creation succeeds even if notification fails

**Meeting Cancellation**:
- Fetches meeting details before cancellation
- Sends notification after successful cancellation
- Non-blocking: cancellation succeeds even if notification fails

## Usage Examples

### Sending a Meeting Creation Notification

```typescript
import { sendMeetingCreationNotification } from '@/app/shared-ui/lib/utils/telegram';

const notificationData = {
  title: "Weekly Team Meeting",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T10:00:00Z",
  roomName: "Conference Room A",
  organizerName: "John Doe",
  roomLocation: "Floor 2",
  roomCapacity: 12,
};

const success = await sendMeetingCreationNotification(notificationData);
```

### Using the API Endpoint

```typescript
const response = await fetch('/api/telegram/notify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'meeting_created',
    meetingData: notificationData,
  }),
});

const result = await response.json();
```

## Error Handling

### Telegram API Errors

- **Missing Configuration**: Logs error if `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` are missing
- **API Failures**: Logs detailed error information from Telegram API
- **Network Errors**: Catches and logs fetch errors

### Graceful Degradation

- **Non-blocking Operations**: Meeting operations succeed even if notifications fail
- **Error Logging**: All errors are logged to console for debugging
- **User Experience**: Users are not affected by notification failures

## Security Considerations

1. **Environment Variables**: Bot token and chat ID are stored in environment variables
2. **No Client Exposure**: Sensitive configuration is not exposed to the client
3. **API Validation**: Input validation on the API endpoint
4. **Error Sanitization**: Error messages don't expose sensitive information

## Testing

### Manual Testing

1. **Create a Meeting**:
   - Navigate to meeting booking page
   - Create a new meeting
   - Check Telegram chat for notification

2. **Cancel a Meeting**:
   - Cancel an existing meeting
   - Check Telegram chat for cancellation notification

### API Testing

```bash
curl -X POST http://localhost:3000/api/telegram/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "meeting_created",
    "meetingData": {
      "title": "Test Meeting",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T10:00:00Z",
      "roomName": "Test Room",
      "organizerName": "Test User",
      "roomLocation": "Test Location",
      "roomCapacity": 10
    }
  }'
```

## Troubleshooting

### Common Issues

1. **Bot Not Responding**:
   - Verify bot token is correct
   - Check if bot is added to the chat
   - Ensure bot has permission to send messages

2. **Chat ID Issues**:
   - Verify chat ID is correct
   - For groups, ensure bot is a member
   - Check if chat ID includes the `-` prefix for groups

3. **Environment Variables**:
   - Restart the development server after adding environment variables
   - Verify variable names are correct
   - Check for typos in values

### Debug Information

Enable debug logging by checking console output for:
- Telegram API responses
- Error messages
- Configuration validation

## Future Enhancements

### Potential Improvements

1. **Message Templates**: Configurable message templates
2. **Multiple Chats**: Support for multiple Telegram chats
3. **Notification Preferences**: User-configurable notification settings
4. **Meeting Updates**: Notifications for meeting modifications
5. **Reminder Notifications**: Pre-meeting reminders
6. **Rich Media**: Support for images, files, or calendar invites

### Integration Possibilities

1. **Slack Integration**: Similar notifications to Slack channels
2. **Email Notifications**: Email notifications for meeting events
3. **Calendar Integration**: Automatic calendar event creation
4. **Webhook Support**: Generic webhook notifications for external systems

## Maintenance

### Monitoring

- Monitor Telegram API rate limits
- Check for failed notifications in logs
- Verify bot token validity periodically

### Updates

- Keep bot token secure and rotate if needed
- Update chat ID if chat structure changes
- Monitor Telegram Bot API changes

## Support

For issues related to the Telegram bot integration:

1. Check the troubleshooting section above
2. Verify environment variable configuration
3. Test the API endpoint directly
4. Check server logs for error messages
5. Verify Telegram bot permissions and chat membership 