import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        scores: {
          include: {
            course: true
          }
        }
      }
    })
    return NextResponse.json(students)
  } catch (err) {
    console.error('Error fetching students:', err)
    return NextResponse.json({ error: '获取学生信息失败' }, { status: 500 })
  }
}