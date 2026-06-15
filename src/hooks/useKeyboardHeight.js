import { useState, useEffect } from 'react'

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!window.visualViewport) return
    const handler = () => {
      const h = window.innerHeight - window.visualViewport.height
      setKeyboardHeight(Math.max(0, h))
    }
    window.visualViewport.addEventListener('resize', handler)
    return () => window.visualViewport.removeEventListener('resize', handler)
  }, [])

  return keyboardHeight
}
