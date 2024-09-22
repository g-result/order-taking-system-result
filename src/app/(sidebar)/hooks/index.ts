import { useEffect, useState } from 'react'

export const useEditability = () => {
  const [isEditable, setIsEditable] = useState(false)

  useEffect(() => {
    const checkEditability = () => {
      const now = new Date()
      const hours = now.getHours()

      if (hours >= 9 && hours <= 14) {
        setIsEditable(true)
      } else {
        setIsEditable(false)
      }
    }

    checkEditability()
    const interval = setInterval(checkEditability, 60000) // 毎分チェック

    return () => clearInterval(interval)
  }, [])

  return { isEditable, setIsEditable }
}
