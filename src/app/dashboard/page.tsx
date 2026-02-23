import { getNotes } from '@/app/actions/notes'
import { getUser } from '@/app/actions/auth'
import { DashboardClient } from '@/components/dashboard-client'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const notes = await getNotes()

  return <DashboardClient initialNotes={notes} userId={user.id} />
}