import { db } from './db'
import { createUser } from './auth'
import { UserRole } from '../generated/prisma'

export async function seedDatabase() {
  // Create admin user
  const admin = await createUser(
    'admin@school.edu',
    'Admin User',
    'admin123',
    UserRole.ADMIN
  )

  // Create dismisser users
  const dismisser1 = await createUser(
    'dismisser1@school.edu',
    'Jane Dismisser',
    'dismisser123',
    UserRole.DISMISSER
  )

  // Create teacher users
  const teacher1 = await createUser(
    'teacher1@school.edu',
    'Ms. Johnson',
    'teacher123',
    UserRole.TEACHER
  )

  const teacher2 = await createUser(
    'teacher2@school.edu',
    'Mr. Smith',
    'teacher123',
    UserRole.TEACHER
  )

  const teacher3 = await createUser(
    'teacher3@school.edu',
    'Mrs. Davis',
    'teacher123',
    UserRole.TEACHER
  )

  // Create parent users
  const parent1 = await createUser(
    'parent1@email.com',
    'John Parent',
    'parent123',
    UserRole.PARENT
  )

  const parent2 = await createUser(
    'parent2@email.com',
    'Sarah Parent',
    'parent123',
    UserRole.PARENT
  )

  const parent3 = await createUser(
    'parent3@email.com',
    'Mike Parent',
    'parent123',
    UserRole.PARENT
  )

  const parent4 = await createUser(
    'parent4@email.com',
    'Lisa Parent',
    'parent123',
    UserRole.PARENT
  )

  // Get teacher profiles
  const teacherProfile1 = await db.teacher.findUnique({
    where: { userId: teacher1.id }
  })
  const teacherProfile2 = await db.teacher.findUnique({
    where: { userId: teacher2.id }
  })
  const teacherProfile3 = await db.teacher.findUnique({
    where: { userId: teacher3.id }
  })

  // Get parent profiles
  const parentProfile1 = await db.parent.findUnique({
    where: { userId: parent1.id }
  })
  const parentProfile2 = await db.parent.findUnique({
    where: { userId: parent2.id }
  })
  const parentProfile3 = await db.parent.findUnique({
    where: { userId: parent3.id }
  })
  const parentProfile4 = await db.parent.findUnique({
    where: { userId: parent4.id }
  })

  // Create students
  const student1 = await db.student.create({
    data: {
      name: 'Emma Johnson',
      grade: '3rd Grade',
      assignedTeacherId: teacherProfile1!.id,
    }
  })

  const student2 = await db.student.create({
    data: {
      name: 'Liam Smith',
      grade: '4th Grade',
      assignedTeacherId: teacherProfile2!.id,
    }
  })

  const student3 = await db.student.create({
    data: {
      name: 'Olivia Davis',
      grade: '2nd Grade',
      assignedTeacherId: teacherProfile3!.id,
    }
  })

  const student4 = await db.student.create({
    data: {
      name: 'Noah Wilson',
      grade: '3rd Grade',
      assignedTeacherId: teacherProfile1!.id,
    }
  })

  const student5 = await db.student.create({
    data: {
      name: 'Ava Brown',
      grade: '4th Grade',
      assignedTeacherId: teacherProfile2!.id,
    }
  })

  const student6 = await db.student.create({
    data: {
      name: 'William Johnson',
      grade: '1st Grade',
      assignedTeacherId: teacherProfile3!.id,
    }
  })

  // Create student-parent relationships
  await db.student_Parent.createMany({
    data: [
      // Parent 1 (John) has Emma and William
      { studentId: student1.id, parentId: parentProfile1!.id },
      { studentId: student6.id, parentId: parentProfile1!.id },
      
      // Parent 2 (Sarah) has Liam
      { studentId: student2.id, parentId: parentProfile2!.id },
      
      // Parent 3 (Mike) has Olivia and Noah
      { studentId: student3.id, parentId: parentProfile3!.id },
      { studentId: student4.id, parentId: parentProfile3!.id },
      
      // Parent 4 (Lisa) has Ava
      { studentId: student5.id, parentId: parentProfile4!.id },
    ]
  })

  console.log('Database seeded successfully!')
  console.log('Test accounts created:')
  console.log('Admin: admin@school.edu / admin123')
  console.log('Dismisser: dismisser1@school.edu / dismisser123')
  console.log('Teachers: teacher1@school.edu, teacher2@school.edu, teacher3@school.edu / teacher123')
  console.log('Parents: parent1@email.com, parent2@email.com, parent3@email.com, parent4@email.com / parent123')

  return {
    admin,
    dismisser1,
    teachers: [teacher1, teacher2, teacher3],
    parents: [parent1, parent2, parent3, parent4],
    students: [student1, student2, student3, student4, student5, student6]
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}