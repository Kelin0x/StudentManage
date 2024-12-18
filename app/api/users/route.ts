import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: '缺少用户名参数' }, { status: 400 })
    }

    // 先尝试通过 username 查询
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        role: true,
        username: true
      }
    })

    // 如果没找到，尝试通过 name 查询
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: username },
        select: {
          id: true,
          name: true,
          role: true,
          username: true
        }
      })
    }

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 