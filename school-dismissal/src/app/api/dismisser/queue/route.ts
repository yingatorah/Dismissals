import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { getCurrentQueue, addParentToQueue, getStudentsForParent } from '@/lib/queue'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// GET /api/dismisser/queue - Get current queue
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.DISMISSER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queue = await getCurrentQueue()
    return NextResponse.json({ queue })
  } catch (error) {
    console.error('Error getting queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/dismisser/queue - Add parent to queue
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.DISMISSER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { parentId, studentIds } = await request.json()

    if (!parentId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'Parent ID and student IDs are required' },
        { status: 400 }
      )
    }

    // Get dismisser profile
    const dismisser = await db.dismisser.findFirst({
      where: { userId: user.userId }
    })

    if (!dismisser) {
      return NextResponse.json({ error: 'Dismisser profile not found' }, { status: 404 })
    }

    // Verify parent exists and get their authorized students
    const authorizedStudents = await getStudentsForParent(parentId)
    const authorizedStudentIds = authorizedStudents.map(s => s.id)

    // Check if all requested students are authorized for this parent
    const unauthorizedStudents = studentIds.filter(id => !authorizedStudentIds.includes(id))
    if (unauthorizedStudents.length > 0) {
      return NextResponse.json(
        { error: 'Parent is not authorized to pick up some of the selected students' },
        { status: 403 }
      )
    }

    const result = await addParentToQueue(parentId, studentIds, dismisser.id)
    
    return NextResponse.json({ 
      success: true, 
      queueEntry: result.queueEntry,
      pickupEvents: result.pickupEvents
    })
  } catch (error) {
    console.error('Error adding to queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}