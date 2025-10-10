import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, find the user by clerkId to get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, find the user by clerkId to get the internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      mealReminders,
      workoutReminders,
      goalAchievements,
      weeklyReports,
      emailNotifications,
      pushNotifications,
    } = body

    console.log('Saving notification settings for user:', user.id, body)

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: {
        mealReminders: typeof mealReminders === 'boolean' ? mealReminders : true,
        workoutReminders: typeof workoutReminders === 'boolean' ? workoutReminders : true,
        goalAchievements: typeof goalAchievements === 'boolean' ? goalAchievements : true,
        weeklyReports: typeof weeklyReports === 'boolean' ? weeklyReports : true,
        emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : false,
        pushNotifications: typeof pushNotifications === 'boolean' ? pushNotifications : true,
      },
      create: {
        userId: user.id,
        mealReminders: typeof mealReminders === 'boolean' ? mealReminders : true,
        workoutReminders: typeof workoutReminders === 'boolean' ? workoutReminders : true,
        goalAchievements: typeof goalAchievements === 'boolean' ? goalAchievements : true,
        weeklyReports: typeof weeklyReports === 'boolean' ? weeklyReports : true,
        emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : false,
        pushNotifications: typeof pushNotifications === 'boolean' ? pushNotifications : true,
      },
    })

    console.log('Successfully saved notification settings:', settings)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
