import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { signInWithEmailAndPassword } from "@/lib/firebase/auth"
import { getUserByEmail, createUserFromGoogle } from "@/lib/firebase/firestore"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(credentials.email, credentials.password)

          // Get user data from Firestore
          const user = await getUserByEmail(credentials.email)

          if (!user) {
            throw new Error("User not found in database")
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google sign in, create or update user in Firestore
        if (account.provider === "google" && user.email) {
          const firestoreUser = await createUserFromGoogle({
            email: user.email,
            name: user.name || "",
            image: user.image || "",
          })

          return {
            ...token,
            id: firestoreUser.id,
          }
        }

        return {
          ...token,
          id: user.id,
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
