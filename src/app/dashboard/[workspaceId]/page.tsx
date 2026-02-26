import { getUser } from '@/app/actions/auth'
import { getWorkspace, getWorkspaces } from '@/app/actions/workspaces'
import { getPages } from '@/app/actions/pages'
import { getTags } from '@/app/actions/tags'
import { DashboardClient } from '@/components/dashboard-client'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { workspaceId } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const [workspaces, workspace, pages, tags] = await Promise.all([
    getWorkspaces(),
    getWorkspace(workspaceId),
    getPages(workspaceId),
    getTags(),
  ])

  if (!workspace) redirect('/dashboard')

  return (
    <DashboardClient
      workspaces={workspaces}
      currentWorkspace={workspace}
      initialPages={pages}
      allTags={tags}
      userId={user.id}
    />
  )
}
