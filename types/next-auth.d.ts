import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      role: Role
      username: string
    }
  }

  interface User {
    id: string
    name: string
    role: Role
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    username: string
    role: Role
  }
} 