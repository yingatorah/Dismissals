import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { markStudentReady } from '@/lib/queue'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// POST /api/teacher/mark-ready - Mark student as ready for pickup
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.TEACHER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Get teacher profile
    const teacher = await db.teacher.findFirst({
      where: { userId: user.userId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify the student belongs to this teacher
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        studentPickupEvents: {
          where: {
            status: { in: ['QUEUED', 'NOTIFIED'] }
          },
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.assignedTeacherId !== teacher.id) {
      return NextResponse.json({ error: 'Not authorized to mark this student' }, { status: 403 })
    }

    // Check if student has a pending pickup event
    if (student.studentPickupEvents.length === 0) {
      return NextResponse.json(
        { error: 'No pending pickup request for this student' },
        { status: 400 }
      )
    }

    // Mark student as ready
    const result = await markStudentReady(studentId, teacher.id)
    
    return NextResponse.json({ 
      success: true, 
      pickupEvent: result,
      message: `${student.name} has been marked as ready for pickup by ${student.studentPickupEvents[0].parent.user.name}`
    })
  } catch (error) {
    console.error('Error marking student ready:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}