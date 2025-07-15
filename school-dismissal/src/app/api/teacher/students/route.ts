import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// GET /api/teacher/students - Get teacher's students with pickup status
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.TEACHER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher profile
    const teacher = await db.teacher.findFirst({
      where: { userId: user.userId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Get teacher's students with their current pickup status
    const students = await db.student.findMany({
      where: { assignedTeacherId: teacher.id },
      include: {
        authorizedParents: {
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
          }
        },
        studentPickupEvents: {
          where: {
            status: { in: ['QUEUED', 'NOTIFIED', 'READY'] }
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
            },
            linkedQueueEntry: {
              select: {
                position: true,
                queuedAt: true
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

    // Transform data for frontend
    const formattedStudents = students.map(student => {
      const currentPickupEvent = student.studentPickupEvents[0]
      
      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        status: student.status,
        authorizedParents: student.authorizedParents.map(auth => auth.parent.user.name),
        currentPickup: currentPickupEvent ? {
          parentName: currentPickupEvent.parent.user.name,
          status: currentPickupEvent.status,
          queuePosition: currentPickupEvent.linkedQueueEntry?.position,
          queuedAt: currentPickupEvent.linkedQueueEntry?.queuedAt,
          notifiedAt: currentPickupEvent.notifiedTeacherAt
        } : null
      }
    })

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    console.error('Error getting teacher students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}