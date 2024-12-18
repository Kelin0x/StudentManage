'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'


export default function AuthProvider({ 
  children,
  session 
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <html lang="zh">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}