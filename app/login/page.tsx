import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  console.log('Login page - getting server session...')
  const session = await getServerSession(authOptions)
  console.log('Login page - session:', JSON.stringify(session, null, 2))
  
  // Get the callback URL from query params or default to dashboard
  const getCallbackUrl = () => {
    if (!searchParams?.callbackUrl) return '/dashboard';
    if (Array.isArray(searchParams.callbackUrl)) {
      return searchParams.callbackUrl[0] || '/dashboard';
    }
    return searchParams.callbackUrl;
  };
  
  const callbackUrl = getCallbackUrl();
  const callbackUrlEncoded = encodeURIComponent(callbackUrl);

  if (session) {
    console.log('Session found, redirecting to:', callbackUrl)
    redirect(callbackUrl)
  }

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <LoginForm callbackUrl={callbackUrlEncoded} />
      </div>
    </div>
  )
}
