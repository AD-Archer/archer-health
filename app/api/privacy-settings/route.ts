import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const settings = await prisma.privacySettings.findUnique({
      where: { userId },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching privacy settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Ensure User record exists for Clerk user
    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      user = await prisma.user.create({ data: { clerkId: userId, email: '', name: '', username: '' } })
    }
    const body = await request.json()
    const { profileVisibility, activitySharing, dataCollection } = body
    const settings = await prisma.privacySettings.upsert({
      where: { userId: user.id },
      update: {
        profileVisibility: typeof profileVisibility === 'boolean' ? profileVisibility : true,
        activitySharing: typeof activitySharing === 'boolean' ? activitySharing : false,
        dataCollection: typeof dataCollection === 'boolean' ? dataCollection : true,
      },
      create: {
        userId: user.id,
        profileVisibility: typeof profileVisibility === 'boolean' ? profileVisibility : true,
        activitySharing: typeof activitySharing === 'boolean' ? activitySharing : false,
        dataCollection: typeof dataCollection === 'boolean' ? dataCollection : true,
      },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
