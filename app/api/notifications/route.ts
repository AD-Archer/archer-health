import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock notifications
    // In a real implementation, this would fetch from a database
    const notifications = [
      {
        id: '1',
        type: 'achievement',
        title: 'Goal Achieved!',
        message: 'You\'ve reached your daily calorie goal',
        time: '2 hours ago',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Water Reminder',
        message: 'Don\'t forget to log your water intake',
        time: '4 hours ago',
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'progress',
        title: 'Weekly Progress',
        message: 'You\'ve lost 2 lbs this week!',
        time: '1 day ago',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'info',
        title: 'New Recipe Available',
        message: 'Check out our new healthy dinner recipes',
        time: '2 days ago',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, action } = body

    // For now, just return success
    // In a real implementation, this would update the notification status in the database

    if (action === 'markAsRead' && notificationId) {
      // Mark notification as read
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}