import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

type Props = {
  label: string
  hint?: string
  variant: 'avatar' | 'cover'
  previewUrl: string | null
  onFile: (file: File | null) => void
}

export default function MediaUploadTile({
  label,
  hint,
  variant,
  previewUrl,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)

  const runProgress = useCallback(() => {
    setProgress(8)
    let v = 8
    const id = window.setInterval(() => {
      v += 17 + Math.random() * 12
      if (v >= 100) {
        v = 100
        window.clearInterval(id)
        window.setTimeout(() => setProgress(null), 400)
      }
      setProgress(Math.round(v))
    }, 110)
  }, [])

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    runProgress()
    onFile(f)
  }

  const dropCls = drag ? 'border-brand/70 bg-brand/10 shadow-inner' : 'border-white/[0.1] bg-surface-elevated/40'

  return (
    <div>
      <span className="text-xs font-medium text-gray-400">{label}</span>
      {hint ? <p className="mt-0.5 text-[11px] text-gray-600">{hint}</p> : null}
      <div
        className={`relative mt-3 overflow-hidden transition ${variant === 'avatar' ? 'h-32 w-32 sm:h-36 sm:w-36' : 'aspect-[21/9] w-full max-w-3xl'}`}
      >
        <motion.div
          role="button"
          tabIndex={0}
          onDragEnter={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDrag(false)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          whileHover={{ scale: 1.01 }}
          className={`relative flex h-full w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed backdrop-blur-sm transition outline-none ring-brand/40 focus-visible:ring-2 ${dropCls} ${variant === 'avatar' ? 'rounded-full' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.img
                key="img"
                src={previewUrl}
                alt=""
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`h-full w-full object-cover ${variant === 'avatar' ? 'rounded-full' : 'rounded-xl'}`}
              />
            ) : (
              <motion.div
                key="ph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 px-4 text-center text-gray-500"
              >
                <Upload size={22} className="text-brand/80" />
                <span className="text-xs">Drop or click to upload</span>
              </motion.div>
            )}
          </AnimatePresence>

          {previewUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFile(null)
              }}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-gray-200 backdrop-blur-md transition hover:bg-accent-danger/90 hover:text-white"
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          ) : null}

          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-gray-300 backdrop-blur-sm">
            <ImagePlus size={11} /> JPEG · PNG · WebP
          </span>

          {progress != null && progress < 100 ? (
            <div className="absolute inset-x-4 bottom-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
                <motion.div
                  className="h-full rounded-full bg-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-gray-400">Uploading… {progress}%</p>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
