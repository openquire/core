import { getUser } from '@/app/actions/auth'
import { getOrCreateDefaultWorkspace } from '@/app/actions/workspaces'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const defaultWorkspace = await getOrCreateDefaultWorkspace(user.id)
  redirect(`/dashboard/${defaultWorkspace.id}`)
}
