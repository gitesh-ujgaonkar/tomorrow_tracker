# Environment Variables Setup

To fix the session error you're experiencing, you need to set up the following environment variables in a `.env.local` file at the root of your project:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Important notes:

1. Replace the placeholder values with your actual Firebase configuration
2. For `NEXTAUTH_SECRET`, generate a strong random string (at least 32 characters)
3. You can generate a secure random string using this command: `openssl rand -base64 32`
4. After creating this file, restart your development server

This will fix the session error you're experiencing after login.
