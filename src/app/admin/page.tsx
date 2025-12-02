import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return <p>Not authorized</p>
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin</h1>
      <p>Admin content management goes here.</p>
    </div>
  )
}