'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  grade: string
  status: string
  teacher: string
}

interface Parent {
  id: string
  name: string
  email: string
  status: string
  students: Student[]
}

interface QueueEntry {
  id: string
  position: number
  queuedAt: string
  parent: {
    user: { name: string }
  }
  students: Array<{
    student: {
      id: string
      name: string
      grade: string
      status: string
      assignedTeacher: {
        user: { name: string }
      }
    }
  }>
  studentPickupEvents: Array<{
    id: string
    status: string
    student: { name: string }
  }>
}

export default function DismisserDashboard() {
  const [parents, setParents] = useState<Parent[]>([])
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [selectedParent, setSelectedParent] = useState<string>('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchParents()
    fetchQueue()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchParents = async () => {
    try {
      const response = await fetch('/api/dismisser/parents')
      if (response.ok) {
        const data = await response.json()
        setParents(data.parents)
      }
    } catch (error) {
      console.error('Error fetching parents:', error)
    }
  }

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/dismisser/queue')
      if (response.ok) {
        const data = await response.json()
        setQueue(data.queue)
      }
    } catch (error) {
      console.error('Error fetching queue:', error)
    }
  }

  const addToQueue = async () => {
    if (!selectedParent || selectedStudents.length === 0) {
      setMessage('Please select a parent and at least one student')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/dismisser/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParent,
          studentIds: selectedStudents
        })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Successfully added to queue at position ${data.queueEntry.position}`)
        setSelectedParent('')
        setSelectedStudents([])
        fetchQueue()
      } else {
        setMessage(data.error || 'Failed to add to queue')
      }
    } catch (error) {
      setMessage('Error adding to queue')
    } finally {
      setLoading(false)
    }
  }

  const dismissStudent = async (studentId: string, queueEntryId: string) => {
    try {
      const response = await fetch('/api/dismisser/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, queueEntryId })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(data.message)
        fetchQueue()
      } else {
        setMessage(data.error || 'Failed to dismiss student')
      }
    } catch (error) {
      setMessage('Error dismissing student')
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/')
  }

  const selectedParentData = parents.find(p => p.id === selectedParent)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dismisser Dashboard</h1>
              <p className="text-gray-600">Manage carline pickup queue</p>
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add to Queue Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Parent to Queue</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Parent
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => {
                    setSelectedParent(e.target.value)
                    setSelectedStudents([])
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a parent...</option>
                  {parents.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} - {parent.students.length} student(s)
                    </option>
                  ))}
                </select>
              </div>

              {selectedParentData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Students ({selectedParentData.students.length} available)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedParentData.students.map(student => (
                      <label key={student.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id])
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {student.name} ({student.grade}) - {student.teacher}
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            student.status === 'READY' ? 'bg-green-100 text-green-800' :
                            student.status === 'AWAITING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={addToQueue}
                disabled={loading || !selectedParent || selectedStudents.length === 0}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
          </div>

          {/* Current Queue Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Current Queue</h2>
              <button
                onClick={fetchQueue}
                className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Queue is empty</p>
              ) : (
                queue.map(entry => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Position #{entry.position} - {entry.parent.user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Queued at {new Date(entry.queuedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {entry.students.map(({ student }) => {
                        const pickupEvent = entry.studentPickupEvents.find(
                          event => event.student.name === student.name
                        )
                        const isReady = student.status === 'READY'
                        
                        return (
                          <div key={student.id} className="flex justify-between items-center">
                            <div>
                              <span className="text-sm font-medium">{student.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {student.grade} - {student.assignedTeacher.user.name}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                isReady ? 'bg-green-100 text-green-800' :
                                student.status === 'AWAITING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </div>
                            {isReady && (
                              <button
                                onClick={() => dismissStudent(student.id, entry.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}