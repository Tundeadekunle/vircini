import { prisma } from '../../../lib/prisma'
import { notFound } from 'next/navigation'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold">{user.username}</h1>
      <p className="text-sm">Email: {user.email}</p>
      <p className="text-sm">Role: {user.role}</p>
    </div>
  )
}