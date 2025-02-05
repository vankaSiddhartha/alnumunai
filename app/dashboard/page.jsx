'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import JobPost from '../components/JobPost'
import EventCard from '../components/EventCard'
import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function Dashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch jobs
        const jobsQuery = query(collection(db, 'jobs'))
        const jobsSnapshot = await getDocs(jobsQuery)
        setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

        // Fetch events
        const eventsQuery = query(collection(db, 'events'))
        const eventsSnapshot = await getDocs(eventsQuery)
        setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      }
    }

    fetchData()
  }, [user])

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {user?.role === 'teacher' && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
          {/* Add your analytics components here */}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Latest Jobs</h2>
          <div className="space-y-6">
            {jobs.map(job => (
              <JobPost key={job.id} post={job} onApply={() => {}} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}