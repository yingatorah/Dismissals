import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// GET /api/admin/logs - Get all dismissal activity logs
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')

    // Build where clause for filtering
    const where: any = {}
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await db.studentPickupEvent.count({ where })

    // Get pickup events with all related data
    const pickupEvents = await db.studentPickupEvent.findMany({
      where,
      include: {
        student: {
          include: {
            assignedTeacher: {
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
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        dismisser: {
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
            queuedAt: true,
            processedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format the data for frontend consumption
    const formattedLogs = pickupEvents.map(event => ({
      id: event.id,
      student: {
        name: event.student.name,
        grade: event.student.grade,
        teacher: event.student.assignedTeacher.user.name
      },
      parent: {
        name: event.parent.user.name,
        email: event.parent.user.email
      },
      dismisser: event.dismisser ? {
        name: event.dismisser.user.name
      } : null,
      status: event.status,
      dismissalMethod: event.dismissalMethod,
      timeline: {
        queued: event.createdAt,
        notifiedTeacher: event.notifiedTeacherAt,
        dismissed: event.dismissedAt,
        queuePosition: event.linkedQueueEntry?.position,
        queuedAt: event.linkedQueueEntry?.queuedAt,
        processedAt: event.linkedQueueEntry?.processedAt
      }
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error getting admin logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}