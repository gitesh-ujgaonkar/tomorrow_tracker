# ⚠️ Notice

We were facing errors in the previous codebase, so we created a new version from scratch. You can find the new version here: [https://github.com/gitesh-ujgaonkar/tomorrow-tracker-V02](https://github.com/gitesh-ujgaonkar/tomorrow-tracker-V02)

# Tomorrow Tracker

Tomorrow Tracker is a goal-setting and habit-tracking application designed to help users plan their days effectively. Set small daily goals, track your progress, and build lasting habits.

![Tomorrow Tracker](https://i.imgur.com/placeholder.png)

## Features

- **Daily Goal Setting**: Set specific goals for tomorrow, with optional time reminders
- **Smart Notifications**: Get reminders before your scheduled goals and nightly prompts
- **Daily Tracking**: Check off completed goals and build a history of achievements
- **Progress Dashboard**: Track your streaks and see your goal completion rates over time
- **Authentication**: Secure login with email/password or Google authentication
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: NextAuth.js with Firebase Auth integration
- **Database**: Firebase Firestore
- **Notifications**: Firebase Cloud Messaging
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

## Getting Started

### Fork and Clone the Repository

1. Fork this repository by clicking the "Fork" button at the top right of the GitHub page
2. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tomorrow-tracker.git
   cd tomorrow-tracker
   ```

### Install Dependencies

```bash
# Using npm
npm install

# Using pnpm
pnpm install
```

### Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth (for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Run the Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Setting Up Required APIs

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new Firebase project
3. Once your project is created, click on the web icon (</>) to add a web app to your project
4. Register your app with a nickname (e.g., "Tomorrow Tracker Web")
5. Copy the Firebase configuration values to your `.env.local` file

#### Enable Firebase Authentication

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the "Email/Password" provider
3. Enable the "Google" provider
4. For Google authentication, add your domain to the authorized domains list

#### Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database" and start in production mode
3. Choose a location for your Firestore database
4. Set up the following security rules in "Rules" tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /goals/{goalId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Set Up Firebase Cloud Messaging (Optional, for Notifications)

1. In the Firebase Console, go to "Project settings" > "Cloud Messaging"
2. Generate a new web push certificate
3. Copy the Server key and add it to your environment variables

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen
6. Create a Web application OAuth client ID
7. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: Your production URL
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
9. Copy the Client ID and Client Secret to your `.env.local` file

## Deployment to Vercel

### Prepare for Deployment

1. Push your code to your GitHub repository
2. Make sure all environment variables are properly set up

### Deploy to Vercel

1. Sign up or log in to [Vercel](https://vercel.com/)
2. Click "New Project" and import your GitHub repository
3. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
4. Add all the environment variables from your `.env.local` file
5. Click "Deploy"

### Post-Deployment Configuration

1. Update the `NEXTAUTH_URL` environment variable to your production URL
2. Add your production URL to the authorized domains in Firebase Authentication
3. Update the authorized redirect URIs in your Google Cloud Console project

## Troubleshooting

### Common Issues

#### NextAuth Crypto Error

If you encounter the error `crypto.createHash is not implemented yet!`, make sure your Next.js configuration includes:

```javascript
// next.config.mjs
const nextConfig = {
  // ...other config
  serverExternalPackages: ['next-auth'],
}

export default nextConfig
```

#### Firebase Initialization Error

If Firebase fails to initialize, check that:
1. All Firebase environment variables are correctly set
2. You're using the correct Firebase project ID
3. Firebase services (Auth, Firestore) are enabled in your Firebase project

#### Google Authentication Issues

If Google authentication fails:
1. Verify your Google Client ID and Secret are correct
2. Check that the authorized redirect URIs are properly configured
3. Ensure your OAuth consent screen is properly set up

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
