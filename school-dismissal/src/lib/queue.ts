import { db } from './db'
import { ParentStatus, StudentStatus, PickupEventStatus } from '../generated/prisma'

export async function addParentToQueue(
  parentId: string,
  studentIds: string[],
  dismisserId: string
) {
  // Get the current highest position in the queue
  const lastEntry = await db.carlineQueueEntry.findFirst({
    orderBy: { position: 'desc' },
    where: { processedAt: null }
  })

  const newPosition = (lastEntry?.position ?? 0) + 1

  // Create the queue entry
  const queueEntry = await db.carlineQueueEntry.create({
    data: {
      parentId,
      position: newPosition,
      createdById: dismisserId,
      students: {
        create: studentIds.map(studentId => ({
          studentId
        }))
      }
    },
    include: {
      parent: {
        include: {
          user: true
        }
      },
      students: {
        include: {
          student: {
            include: {
              assignedTeacher: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })

  // Update parent status to ARRIVED
  await db.parent.update({
    where: { id: parentId },
    data: { 
      status: ParentStatus.ARRIVED,
      arrivalTime: new Date()
    }
  })

  // Create pickup events for each student
  const pickupEvents = await Promise.all(
    studentIds.map(studentId =>
      db.studentPickupEvent.create({
        data: {
          studentId,
          parentId,
          status: PickupEventStatus.QUEUED,
          queueEntryId: queueEntry.id
        }
      })
    )
  )

  return { queueEntry, pickupEvents }
}

export async function getQueuePosition(queueEntryId: string) {
  const entry = await db.carlineQueueEntry.findUnique({
    where: { id: queueEntryId },
    include: {
      students: {
        include: {
          student: {
            include: {
              assignedTeacher: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      },
      parent: {
        include: {
          user: true
        }
      }
    }
  })

  if (!entry) return null

  // Count how many entries are ahead in the queue (unprocessed and lower position)
  const aheadCount = await db.carlineQueueEntry.count({
    where: {
      position: { lt: entry.position },
      processedAt: null
    }
  })

  return {
    ...entry,
    positionInQueue: aheadCount + 1
  }
}

export async function getCurrentQueue() {
  return await db.carlineQueueEntry.findMany({
    where: { processedAt: null },
    orderBy: { position: 'asc' },
    include: {
      parent: {
        include: {
          user: true
        }
      },
      students: {
        include: {
          student: {
            include: {
              assignedTeacher: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      },
      studentPickupEvents: true
    }
  })
}

export async function markStudentReady(studentId: string, teacherId: string) {
  // Update student status
  await db.student.update({
    where: { id: studentId },
    data: { status: StudentStatus.READY }
  })

  // Update the pickup event
  const pickupEvent = await db.studentPickupEvent.findFirst({
    where: {
      studentId,
      status: { in: [PickupEventStatus.QUEUED, PickupEventStatus.NOTIFIED] }
    }
  })

  if (pickupEvent) {
    await db.studentPickupEvent.update({
      where: { id: pickupEvent.id },
      data: {
        status: PickupEventStatus.READY,
        notifiedTeacherAt: new Date()
      }
    })
  }

  return pickupEvent
}

export async function dismissStudent(
  studentId: string,
  dismisserId: string,
  queueEntryId: string
) {
  // Update student status
  await db.student.update({
    where: { id: studentId },
    data: { status: StudentStatus.DISMISSED }
  })

  // Update the pickup event
  const pickupEvent = await db.studentPickupEvent.findFirst({
    where: {
      studentId,
      queueEntryId,
      status: PickupEventStatus.READY
    }
  })

  if (pickupEvent) {
    await db.studentPickupEvent.update({
      where: { id: pickupEvent.id },
      data: {
        status: PickupEventStatus.DISMISSED,
        dismissedBy: dismisserId,
        dismissedAt: new Date()
      }
    })
  }

  // Check if all students in the queue entry are dismissed
  const remainingEvents = await db.studentPickupEvent.findMany({
    where: {
      queueEntryId,
      status: { not: PickupEventStatus.DISMISSED }
    }
  })

  // If no remaining students, mark queue entry as processed
  if (remainingEvents.length === 0) {
    await db.carlineQueueEntry.update({
      where: { id: queueEntryId },
      data: { processedAt: new Date() }
    })
  }

  return pickupEvent
}

export async function getStudentsForParent(parentId: string) {
  const parent = await db.parent.findUnique({
    where: { id: parentId },
    include: {
      authorizedStudents: {
        include: {
          student: {
            include: {
              assignedTeacher: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })

  return parent?.authorizedStudents.map(auth => auth.student) ?? []
}