import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { dismissStudent } from '@/lib/queue'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// POST /api/dismisser/dismiss - Dismiss a student
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.DISMISSER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId, queueEntryId } = await request.json()

    if (!studentId || !queueEntryId) {
      return NextResponse.json(
        { error: 'Student ID and queue entry ID are required' },
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

    // Verify the student is in the queue entry and ready for pickup
    const queueEntry = await db.carlineQueueEntry.findUnique({
      where: { id: queueEntryId },
      include: {
        students: {
          where: { studentId },
          include: {
            student: true
          }
        },
        studentPickupEvents: {
          where: { studentId }
        }
      }
    })

    if (!queueEntry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 })
    }

    if (queueEntry.students.length === 0) {
      return NextResponse.json({ error: 'Student not found in this queue entry' }, { status: 404 })
    }

    const student = queueEntry.students[0].student
    if (student.status !== 'READY') {
      return NextResponse.json(
        { error: 'Student is not ready for pickup. Teacher must mark student as ready first.' },
        { status: 400 }
      )
    }

    const result = await dismissStudent(studentId, dismisser.id, queueEntryId)
    
    return NextResponse.json({ 
      success: true, 
      pickupEvent: result,
      message: `${student.name} has been dismissed successfully`
    })
  } catch (error) {
    console.error('Error dismissing student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}