import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { UserRole } from '../generated/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development'

export interface AuthUser {
  userId: string
  email: string
  role: UserRole
  name: string
}

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export function requireAuth(allowedRoles?: UserRole[]) {
  return (request: NextRequest) => {
    const user = verifyToken(request)
    
    if (!user) {
      throw new Error('Unauthorized')
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw new Error('Forbidden')
    }
    
    return user
  }
}