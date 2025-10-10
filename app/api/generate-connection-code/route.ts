import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a unique connection code
    const connectionCode = randomBytes(16).toString('hex')

    // Update user with connection code
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { archerAquaConnectionCode: connectionCode },
    })

    return NextResponse.json({ connectionCode })
  } catch (error) {
    console.error('Error generating connection code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}