'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  grade: string
  status: string
  authorizedParents: string[]
  currentPickup: {
    parentName: string
    status: string
    queuePosition?: number
    queuedAt?: string
    notifiedAt?: string
  } | null
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStudents, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      } else if (response.status === 401) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const markStudentReady = async (studentId: string, studentName: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/teacher/mark-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(data.message)
        fetchStudents()
      } else {
        setMessage(data.error || 'Failed to mark student ready')
      }
    } catch (error) {
      setMessage('Error marking student ready')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'AWAITING':
        return 'bg-yellow-100 text-yellow-800'
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPickupStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'QUEUED':
        return 'bg-blue-100 text-blue-800'
      case 'NOTIFIED':
        return 'bg-yellow-100 text-yellow-800'
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const studentsWithPickup = students.filter(s => s.currentPickup)
  const studentsWithoutPickup = students.filter(s => !s.currentPickup)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage student pickup readiness</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-4 p-4 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-blue-800">{message}</p>
            <button
              onClick={() => setMessage('')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Students with Pending Pickups */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Students with Pending Pickups ({studentsWithPickup.length})
              </h2>
              <button
                onClick={fetchStudents}
                className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {studentsWithPickup.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending pickups
                </p>
              ) : (
                studentsWithPickup.map(student => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.grade}</p>
                        <p className="text-sm text-gray-600">
                          Parent: {student.currentPickup?.parentName}
                        </p>
                        {student.currentPickup?.queuePosition && (
                          <p className="text-sm text-gray-600">
                            Queue Position: #{student.currentPickup.queuePosition}
                          </p>
                        )}
                        {student.currentPickup?.queuedAt && (
                          <p className="text-sm text-gray-600">
                            Queued: {new Date(student.currentPickup.queuedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                        <br />
                        <span className={`px-2 py-1 rounded text-xs mt-1 inline-block ${getPickupStatusColor(student.currentPickup?.status || '')}`}>
                          {student.currentPickup?.status}
                        </span>
                      </div>
                    </div>

                    {student.currentPickup?.status === 'QUEUED' && student.status === 'AWAITING' && (
                      <button
                        onClick={() => markStudentReady(student.id, student.name)}
                        disabled={loading}
                        className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Marking Ready...' : 'Mark Ready for Pickup'}
                      </button>
                    )}

                    {student.currentPickup?.status === 'READY' && (
                      <div className="mt-3 text-center text-green-600 font-medium">
                        ✓ Ready for pickup - waiting for dismisser
                      </div>
                    )}

                    {student.currentPickup?.notifiedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Marked ready at: {new Date(student.currentPickup.notifiedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All Students Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All My Students ({students.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div key={student.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.grade}</p>
                      <p className="text-xs text-gray-500">
                        Authorized parents: {student.authorizedParents.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                      {student.currentPickup && (
                        <>
                          <br />
                          <span className={`px-2 py-1 rounded text-xs mt-1 inline-block ${getPickupStatusColor(student.currentPickup.status)}`}>
                            {student.currentPickup.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {studentsWithPickup.length}
            </div>
            <div className="text-sm text-gray-600">Pending Pickups</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'READY').length}
            </div>
            <div className="text-sm text-gray-600">Ready Students</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => s.status === 'AWAITING').length}
            </div>
            <div className="text-sm text-gray-600">Awaiting Students</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">
              {students.filter(s => s.status === 'DISMISSED').length}
            </div>
            <div className="text-sm text-gray-600">Dismissed Students</div>
          </div>
        </div>
      </div>
    </div>
  )
}