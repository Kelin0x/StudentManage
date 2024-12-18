import { useSession } from 'next-auth/react'

export function useAuthorization() {
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === 'ADMIN'
  const isTeacher = session?.user?.role === 'TEACHER'
  const isStudent = session?.user?.role === 'STUDENT'

  const canManageUsers = isAdmin
  const canManageCourses = isAdmin || isTeacher
  const canViewAllScores = isAdmin || isTeacher
  const canEditScores = isAdmin || isTeacher

  return {
    isAdmin,
    isTeacher,
    isStudent,
    canManageUsers,
    canManageCourses,
    canViewAllScores,
    canEditScores,
  }
} 