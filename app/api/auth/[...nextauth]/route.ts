import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from "@prisma/client"

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
          console.log(bcrypt.hashSync(credentials.password, 10)) // 试日志
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
            role: user.role as Role,
            username: user.username,
            email: user.role
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
      if (user) {
        // 登录时，将所有信息存入 token
        return {
          ...token,
          id: user.id,
          role: user.role,
          username: user.username,
          name: user.name
        }
      }
      // 刷新时，token 中已经有这些信息
      return token
    },
    async session({ session, token }) {
      // 每次刷新都需要从 token 重新构建 session
      return {
        ...session,
        user: {
          id: token.id as string,
          name: token.name as string,
          role: token.role as Role,
          username: token.username as string
        }
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }