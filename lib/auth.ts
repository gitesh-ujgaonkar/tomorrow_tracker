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

// DEVELOPMENT ONLY: Use a hardcoded secret for testing
// In production, this should be replaced with a proper environment variable
const HARDCODED_SECRET = 'a_very_long_secret_key_for_development_testing_only_not_for_production_use';

// Ensure we have a secret for NextAuth, even if environment variable is missing
const getNextAuthSecret = () => {
  // For development and testing, use the hardcoded secret
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using hardcoded development secret');
    return HARDCODED_SECRET;
  }
  
  // For production, use the environment variable
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn('NEXTAUTH_SECRET environment variable is not set in production!');
    // Fallback to hardcoded secret even in production as a last resort
    return HARDCODED_SECRET;
  }
  
  return process.env.NEXTAUTH_SECRET;
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
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
          console.log("Missing credentials")
          return null
        }

        try {
          console.log("Authorize function: Attempting to authenticate user:", credentials.email)
          
          // DEVELOPMENT SHORTCUT: Allow test@example.com with any password for testing
          if (process.env.NODE_ENV !== 'production' && credentials.email === 'test@example.com') {
            console.log("Using test account for development")
            return {
              id: 'test-user-id',
              name: 'Test User',
              email: 'test@example.com',
              image: '',
            }
          }
          
          // Authenticate with Firebase
          try {
            const userCredential = await signInWithEmailAndPassword(credentials.email, credentials.password)
            console.log("Firebase authentication successful", userCredential.user.uid)
          } catch (firebaseError) {
            console.error("Firebase authentication failed:", firebaseError)
            // Rethrow to be caught by the outer try/catch
            throw firebaseError;
          }

          // Get user data from Firestore
          console.log("Getting user data from Firestore")
          const user = await getUserByEmail(credentials.email)

          if (!user) {
            console.error("User not found in Firestore")
            throw new Error("User not found in database")
          }

          console.log("User found in Firestore:", user.id)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("Authentication error in authorize function:", error)
          // Instead of returning null, throw the error to provide better feedback
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback - token:", token);
      console.log("JWT callback - user:", user);
      console.log("JWT callback - account:", account);

      // Initial sign in
      if (account && user) {
        console.log("Initial sign in");
        
        // For Google sign in, create or update user in Firestore
        if (account.provider === "google") {
          try {
            console.log("Processing Google sign in");
            const firestoreUser = await createUserFromGoogle({
              email: user.email || "",
              name: user.name || "",
              image: user.image || "",
            });
            console.log("Google user created/updated in Firestore:", firestoreUser);
            
            return {
              ...token,
              id: firestoreUser.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } catch (error) {
            console.error("Error processing Google sign in:", error);
            throw error;
          }
        }

        // For credentials sign in
        console.log("Processing credentials sign in");
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }

      // For subsequent requests, return the existing token
      console.log("Subsequent request, returning existing token");
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      
      if (token && session.user) {
        // Ensure TypeScript knows we're adding an id property
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name || session.user.name || null,
          email: token.email || session.user.email || null,
          image: token.image as string | null || session.user.image || null,
        };
      }
      
      console.log("Final session object:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: getNextAuthSecret(),
}
