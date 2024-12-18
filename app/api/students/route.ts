import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const role = searchParams.get('role') as Role | null

    // 如果是学生角色
    if (role === Role.STUDENT && username) {
      // 1. 先从 User 表获取学生的登录信息
      const user = await prisma.user.findUnique({
        where: { username }
      })

      if (!user) {
        return NextResponse.json([])
      }

      // 2. 假设 User 表的 username 就是 Student 表的 studentId
      const student = await prisma.student.findUnique({
        where: { studentId: username },
        include: {
          scores: {
            include: {
              course: true
            }
          }
        }
      })

      return NextResponse.json(student ? [student] : [])
    }

    // 非学生角色，返回所有记录
    const students = await prisma.student.findMany({
      include: {
        scores: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        studentId: 'asc'
      }
    })

    return NextResponse.json(students)
  } catch (err) {
    console.error('Error fetching students:', err)
    return NextResponse.json({ error: '获取学生信息失败' }, { status: 500 })
  }
}