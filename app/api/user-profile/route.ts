import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
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
    const {
      currentWeight,
      goalWeight,
      height,
      age,
      gender,
      activityLevel,
      goalType,
      weeklyGoal,
      units,
      timezone,
      waterGoal,
      waterGoalUnit
    } = body

    // Update or create user profile data
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name: body.name,
        email: body.email,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        goalWeight: goalWeight ? parseFloat(goalWeight) : null,
        height: height ? parseInt(height) : null,
        age: age ? parseInt(age) : null,
        gender,
        activityLevel,
        goalType,
        weeklyGoal: weeklyGoal ? parseFloat(weeklyGoal) : null,
        units,
        timezone,
        waterGoal: waterGoal ? parseInt(waterGoal) : null,
        waterGoalUnit,
      },
      create: {
        clerkId: userId,
        name: body.name,
        email: body.email,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        goalWeight: goalWeight ? parseFloat(goalWeight) : null,
        height: height ? parseInt(height) : null,
        age: age ? parseInt(age) : null,
        gender,
        activityLevel,
        goalType,
        weeklyGoal: weeklyGoal ? parseFloat(weeklyGoal) : null,
        units,
        timezone,
        waterGoal: waterGoal ? parseInt(waterGoal) : null,
        waterGoalUnit,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}