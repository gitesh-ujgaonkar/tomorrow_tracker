"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, LogOut, Plus, Settings, User } from "lucide-react"

export function DashboardHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center mr-6">
          <Clock className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">Tomorrow Tracker</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/set-goals">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Set Tomorrow's Goals
          </Button>
        </Link>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {session?.user?.name && <p className="font-medium">{session.user.name}</p>}
                {session?.user?.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(event) => {
                event.preventDefault()
                signOut({
                  callbackUrl: "/",
                })
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
