import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { db } from '@/lib/db'
import { UserRole } from '@/generated/prisma'

// GET /api/dismisser/parents - Get all parents with their authorized students
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user || user.role !== UserRole.DISMISSER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parents = await db.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        authorizedStudents: {
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
            }
          }
        }
      }
    })

    // Transform the data for easier frontend consumption
    const formattedParents = parents.map(parent => ({
      id: parent.id,
      name: parent.user.name,
      email: parent.user.email,
      status: parent.status,
      students: parent.authorizedStudents.map(auth => ({
        id: auth.student.id,
        name: auth.student.name,
        grade: auth.student.grade,
        status: auth.student.status,
        teacher: auth.student.assignedTeacher.user.name
      }))
    }))

    return NextResponse.json({ parents: formattedParents })
  } catch (error) {
    console.error('Error getting parents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}