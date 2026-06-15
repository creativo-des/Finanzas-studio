import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState(null)

  const showToast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), duration)
  }, [])

  return { toast, showToast }
}
