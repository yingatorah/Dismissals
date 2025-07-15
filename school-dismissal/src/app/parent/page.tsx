'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  grade: string
  status: string
  teacher: string
  currentPickup?: {
    status: string
    queuePosition?: number
    queuedAt?: string
    readyAt?: string
  }
}

export default function ParentDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // Since this is a simplified parent view and we don't have a dedicated
    // parent API endpoint in our current implementation, we'll show a 
    // placeholder UI with information about how the system works
    setLoading(false)
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {user?.name || 'Parent'}
              </p>
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
        {/* How It Works Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Carline Pickup Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Arrive at School</h3>
              <p className="text-sm text-gray-600">
                Drive to the designated carline pickup area and wait in line.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Check-in with Staff</h3>
              <p className="text-sm text-gray-600">
                A dismisser will manually log you into the pickup queue and verify your identity.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Student Pickup</h3>
              <p className="text-sm text-gray-600">
                Your child's teacher will be notified and prepare them for pickup when it's your turn.
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Identification Required</h3>
              <p className="text-gray-600">
                Please have your ID ready when you arrive. Our dismisser staff will verify your identity 
                before adding you to the pickup queue.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-gray-900">Authorized Pickups Only</h3>
              <p className="text-gray-600">
                Only parents and guardians on the authorized pickup list can collect students. 
                Contact the office if you need to update your authorized pickup persons.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Queue System</h3>
              <p className="text-gray-600">
                Pickups are processed in the order of arrival. Teachers will be notified when 
                it's time to prepare your child, ensuring an efficient and safe dismissal process.
              </p>
            </div>
          </div>
        </div>

        {/* Mock Student Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Students</h2>
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Student information and real-time pickup status will be displayed here.
              </p>
              <p className="text-sm text-gray-500">
                Note: In this demo, parent functionality is limited to viewing information. 
                The core workflow involves dismisser staff manually managing the pickup queue 
                for security and safety reasons.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">School Office</h3>
              <p className="text-gray-600">
                Phone: (555) 123-4567<br/>
                Email: office@school.edu<br/>
                Hours: 7:30 AM - 4:00 PM
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Carline Questions</h3>
              <p className="text-gray-600">
                For questions about pickup procedures, authorized persons, 
                or carline logistics, please contact the main office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}