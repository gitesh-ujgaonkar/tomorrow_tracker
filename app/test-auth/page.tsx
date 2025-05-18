import { TestLogin } from "@/components/test-login"

export default function TestAuthPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Authentication Test Page</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Use this page to test authentication directly with Firebase and NextAuth
      </p>
      <TestLogin />
    </div>
  )
}
