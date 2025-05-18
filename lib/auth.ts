import type { NextAuthOptions } from "next-auth"
import type { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { signInWithEmailAndPassword } from "@/lib/firebase/auth"
import { getUserByEmail, createUserFromGoogle } from "@/lib/firebase/firestore"

// Extend the session user type to include the id property
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Ensure we have a secret for NextAuth, even if environment variable is missing
const getNextAuthSecret = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn('NEXTAUTH_SECRET environment variable is not set. Using a fallback secret. This is NOT secure for production!');
    // Use a consistent fallback secret for development only
    return 'DEVELOPMENT_FALLBACK_SECRET_DO_NOT_USE_IN_PRODUCTION';
  }
  return process.env.NEXTAUTH_SECRET;
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        // Ensure TypeScript knows we're adding an id property
        session.user = {
          ...session.user,
          id: token.id as string
        }
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: getNextAuthSecret(),
}
