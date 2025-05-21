'use client'

import { toast as toastPrimitive } from "@/components/ui/use-toast"

export function useToast() {
  const showToast = (options: { 
    title: string; 
    description?: string; 
    variant?: 'default' | 'destructive';
  }) => {
    toastPrimitive({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
    })
  }
  
  return {
    toast: showToast,
  }
}
