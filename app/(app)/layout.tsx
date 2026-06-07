'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path   = usePathname()

  useEffect(() => {
    const email = localStorage.getItem('vovu_email')
    if (!email) {
      router.replace('/login')
      return
    }
    // Check if onboarding is complete
    const onboarded = localStorage.getItem('vovu_onboarded')
    if (!onboarded && path !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [router, path])

  return (
    <div style={{ paddingBottom: 80 }}>
      {children}
      <BottomNav />
    </div>
  )
}
