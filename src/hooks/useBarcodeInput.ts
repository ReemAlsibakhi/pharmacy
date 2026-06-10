import { useState, useEffect } from 'react'

interface UseBarcodeInputOptions {
  onScan:   (barcode: string) => void
  enabled?: boolean
  minLength?: number
}

/**
 * يستمع لإدخال قارئ الباركود USB
 * قارئ USB يُدخل النص بسرعة عالية ثم يضغط Enter تلقائياً
 */
export function useBarcodeInput({
  onScan,
  enabled   = true,
  minLength = 4,
}: UseBarcodeInputOptions) {
  const [buffer,  setBuffer]  = useState('')
  const [lastKey, setLastKey] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // تجاهل أي input/textarea — لا نتداخل مع الكتابة العادية
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const now = Date.now()

      if (e.key === 'Enter') {
        if (buffer.length >= minLength) onScan(buffer)
        setBuffer('')
        return
      }

      // تجاهل مفاتيح التحكم
      if (e.key.length > 1) return

      // إذا مرّ أكثر من 100ms → مستخدم يكتب، وليس USB
      const newBuffer = now - lastKey > 100 ? e.key : buffer + e.key
      setBuffer(newBuffer)
      setLastKey(now)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buffer, lastKey, onScan, enabled, minLength])
}
