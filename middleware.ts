import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 管理员可以访问所有页面
    if (token?.role === 'ADMIN') {
      return NextResponse.next()
    }

    // 教师只能访问查看成绩和课程相关页面
    if (token?.role === 'TEACHER') {
      if (path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // 学生只能查看自己的成绩
    if (token?.role === 'STUDENT') {
      if (path.startsWith('/admin') || path.startsWith('/teacher')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/teacher/:path*',
    '/api/scores/:path*',
    '/api/students/:path*'
  ]
} 