import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, Camera, CameraOff } from 'lucide-react'

interface BarcodeScannerProps {
  isOpen:  boolean
  onScan:  (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ isOpen, onScan, onClose }: BarcodeScannerProps) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const controlsRef  = useRef<{ stop: () => void } | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [cameras,      setCameras]      = useState<MediaDeviceInfo[]>([])
  const [activeCamera, setActiveCamera] = useState<string | undefined>()

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }, [])

  useEffect(() => {
    if (!isOpen) { stopScanner(); return }
    setError(null)

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices)
        const back = devices.find((d) => /back|rear|environment/i.test(d.label))
        setActiveCamera(back?.deviceId ?? devices[0]?.deviceId)
      })
      .catch(() => setError('تعذر الوصول إلى الكاميرا'))

    return stopScanner
  }, [isOpen, stopScanner])

  useEffect(() => {
    if (!isOpen || !activeCamera || !videoRef.current) return

    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromVideoDevice(activeCamera, videoRef.current, (result, err) => {
        if (result) {
          stopScanner()
          onScan(result.getText())
          onClose()
        }
        // err is normal when no barcode found yet — only log unexpected errors
        if (err && err.name !== 'NotFoundException') {
          console.warn('Scanner:', err.message)
        }
      })
      .then((controls) => {
        controlsRef.current = controls
      })
      .catch((err: Error) => {
        if (err.name === 'NotAllowedError')  setError('يرجى السماح بالوصول إلى الكاميرا')
        else if (err.name === 'NotFoundError') setError('لم يتم العثور على كاميرا')
        else setError('خطأ في تشغيل الكاميرا')
      })

    return stopScanner
  }, [activeCamera, isOpen, onScan, onClose, stopScanner])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">مسح الباركود</h3>
          </div>
          <button
            onClick={() => { stopScanner(); onClose() }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black" style={{ aspectRatio: '1' }}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <CameraOff className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-300 text-center px-4">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-36">
                  {(['top-0 right-0 border-t-4 border-r-4 rounded-tr',
                    'top-0 left-0 border-t-4 border-l-4 rounded-tl',
                    'bottom-0 right-0 border-b-4 border-r-4 rounded-br',
                    'bottom-0 left-0 border-b-4 border-l-4 rounded-bl',
                  ] as const).map((cls, i) => (
                    <span key={i} className={`absolute w-6 h-6 border-green-400 ${cls}`} />
                  ))}
                  <div className="absolute inset-x-0 h-0.5 bg-green-400 animate-scan top-1/2" />
                </div>
              </div>
            </>
          )}
        </div>

        {cameras.length > 1 && (
          <div className="px-4 py-2 border-t">
            <select
              className="w-full text-sm border border-gray-200 rounded-lg p-2"
              value={activeCamera}
              onChange={(e) => setActiveCamera(e.target.value)}
            >
              {cameras.map((cam, i) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `كاميرا ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-center text-gray-400 text-sm py-3">وجّه الكاميرا نحو الباركود</p>
      </div>
    </div>
  )
}
