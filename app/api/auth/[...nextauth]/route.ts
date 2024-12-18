import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('开始验证用户:', credentials?.username) // 调试日志

          if (!credentials?.username || !credentials?.password) {
            console.log('缺少用户名或密码')
            throw new Error('请输入用户名和密码')
          }


          const user = await prisma.user.findUnique({
            where: { 
              username: credentials.username 
            }
          })

          console.log('数据库查询结果:', user ? '用户存在' : '用户不存在') // 调试日志

          if (!user) {
            console.log('用户不存在')
            throw new Error('用户名或密码错误')
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          const hash = await bcrypt.hash(user.password, 10) // 哈希密码
          console.log('密码哈希:', hash) // 调试日志

          console.log('密码验证结果:', isValid ? '正确' : '错误') // 调试日志

          if (!isValid) {
            console.log('密码不正确')
            throw new Error('用户名或密码错误')
          }

          // 返回用户信息
          return {
            id: user.id.toString(),
            name: user.name,
            role: user.role,
            username: user.username
          }
        } catch (error) {
          console.error('认证过程出错:', error) // 错误日志
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback:', { token, user }) // 调试日志
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token }) // 调试日志
      if (session?.user) {
        session.user.role = token.role
        session.user.username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true, // 开启调试模式
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }