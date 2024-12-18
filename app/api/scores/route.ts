import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // 查询课程成绩
      const scores = await prisma.score.findMany({
        where: { courseId },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
              major: true
            }
          }
        }
      })

      // 计算统计数据
      const scoreValues = scores.map(s => s.score)
      const totalStudents = scores.length  // 总人数就是成绩记录的数量
      const passCount = scores.filter(s => s.score >= 60).length  // 及格人数

      return NextResponse.json({
        statistics: {
          average: scoreValues.length > 0 ? 
            (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1) : 0,
          highest: Math.max(...(scoreValues.length > 0 ? scoreValues : [0])),
          lowest: Math.min(...(scoreValues.length > 0 ? scoreValues : [0])),
          count: totalStudents,  // 使用总人数
          passRate: totalStudents > 0 ? 
            ((passCount / totalStudents) * 100).toFixed(1) + '%' : '0%'
        },
        scores: scores.map(score => ({
          id: score.id,
          score: score.score,
          student: score.student
        }))
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
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: '获取成绩失败' }, { status: 500 })
  }
}