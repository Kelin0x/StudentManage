import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: '管理员',
      role: 'ADMIN'
    }
  })

  // 创建测试学生
  const student1 = await prisma.student.create({
    data: {
      studentId: '2024001',
      name: '张三',
      gender: '男',
      major: '计算机科学',
      grade: 2024
    }
  })

  // 创建测试课程
  const course1 = await prisma.course.create({
    data: {
      courseId: 'CS001',
      courseName: '计算机基础',
      teacher: '李老师'
    }
  })

  // 创建测试成绩
  await prisma.score.create({
    data: {
      studentId: student1.studentId,
      courseId: course1.courseId,
      score: 85
    }
  })

  console.log('测试数据创建成功')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 