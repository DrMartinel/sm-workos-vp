import { NextRequest, NextResponse } from 'next/server';
import { sendMeetingCreationNotification, sendMeetingCancellationNotification } from '@/app/shared-ui/lib/utils/telegram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, meetingData } = body;

    if (!type || !meetingData) {
      return NextResponse.json(
        { error: 'Missing required fields: type and meetingData' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'meeting_created':
        success = await sendMeetingCreationNotification(meetingData);
        break;
      case 'meeting_cancelled':
        success = await sendMeetingCancellationNotification(meetingData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid notification type. Supported types: meeting_created, meeting_cancelled' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ success: true, message: 'Telegram notification sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send Telegram notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Telegram notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 