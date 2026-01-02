import NextAuth from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)