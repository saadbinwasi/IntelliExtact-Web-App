'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  
  // Redirect to get-started (they're the same page now)
  useEffect(() => {
    router.replace('/get-started')
  }, [router])

  return null
}
