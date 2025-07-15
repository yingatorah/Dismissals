import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserRole } from '../generated/prisma'

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: UserRole
) {
  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  })

  // Create role-specific profile
  switch (role) {
    case UserRole.PARENT:
      await db.parent.create({
        data: {
          userId: user.id,
        },
      })
      break
    case UserRole.TEACHER:
      await db.teacher.create({
        data: {
          userId: user.id,
        },
      })
      break
    case UserRole.DISMISSER:
      await db.dismisser.create({
        data: {
          userId: user.id,
        },
      })
      break
  }

  return user
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserWithProfile(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      parentProfile: true,
      teacherProfile: true,
      dismisserProfile: true,
    },
  })

  return user
}

export async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
    include: {
      parentProfile: true,
      teacherProfile: true,
      dismisserProfile: true,
    },
  })
}