import { useState, useEffect } from 'react'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return isDesktop
}
