import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    // 课程查询
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { courseId },
        include: {
          scores: {
            include: {
              student: true
            }
          }
        }
      })

      if (!course) {
        return NextResponse.json({
          error: '未找到该课程',
          scores: [],
          statistics: {
            average: '0',
            highest: 0,
            lowest: 0,
            totalStudents: 0,
            passRate: '0%'
          }
        })
      }

      const scores = course.scores
      const totalStudents = scores.length
      const passCount = scores.filter(score => score.score >= 60).length
      
      const statistics = {
        average: totalStudents ? (scores.reduce((sum, s) => sum + s.score, 0) / totalStudents).toFixed(1) : '0',
        highest: totalStudents ? Math.max(...scores.map(s => s.score)) : 0,
        lowest: totalStudents ? Math.min(...scores.map(s => s.score)) : 0,
        totalStudents,
        passRate: totalStudents ? `${((passCount / totalStudents) * 100).toFixed(1)}%` : '0%'
      }

      return NextResponse.json({
        scores: scores.map(score => ({
          id: score.id,
          score: score.score,
          student: {
            studentId: score.student.studentId,
            name: score.student.name,
            major: score.student.major
          }
        })),
        statistics
      })
    }

    // 学生查询
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { studentId },
        include: {
          scores: {
            include: {
              course: true
            }
          }
        }
      })

      if (!student) {
        return NextResponse.json({
          error: '未找到该学生',
          scores: [],
          statistics: {
            average: '0',
            highest: 0,
            lowest: 0,
            totalCourses: 0,
            passRate: '0%'
          },
          studentInfo: null
        })
      }

      const scores = student.scores
      const totalCourses = scores.length
      const passCount = scores.filter(score => score.score >= 60).length

      const statistics = {
        average: totalCourses ? (scores.reduce((sum, s) => sum + s.score, 0) / totalCourses).toFixed(1) : '0',
        highest: totalCourses ? Math.max(...scores.map(s => s.score)) : 0,
        lowest: totalCourses ? Math.min(...scores.map(s => s.score)) : 0,
        totalCourses,
        passRate: totalCourses ? `${((passCount / totalCourses) * 100).toFixed(1)}%` : '0%'
      }

      const studentInfo = {
        id: student.studentId,
        name: student.name,
        class: `${student.grade}年级`,
        major: student.major
      }

      return NextResponse.json({
        scores: scores.map(score => ({
          id: score.id,
          score: score.score,
          course: {
            courseId: score.course.courseId,
            courseName: score.course.courseName,
            teacher: score.course.teacher
          }
        })),
        statistics,
        studentInfo
      })
    }

    return NextResponse.json({
      error: '请提供学生ID或课程ID',
      scores: [],
      statistics: {
        average: '0',
        highest: 0,
        lowest: 0,
        totalCourses: 0,
        passRate: '0%'
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      error: '服务器内部错误',
      scores: [],
      statistics: {
        average: '0',
        highest: 0,
        lowest: 0,
        totalCourses: 0,
        passRate: '0%'
      }
    }, { status: 500 })
  }
}