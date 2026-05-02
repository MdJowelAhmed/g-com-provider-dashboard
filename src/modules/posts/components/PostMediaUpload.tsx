import { ImageIcon, Trash2, Upload, Video } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PostMedia } from '../types'

function makeMediaId() {
  return `med_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

type Props = {
  /** When used inside `Form.Item`, Ant Design injects value/onChange. */
  value?: PostMedia[]
  onChange?: (next: PostMedia[]) => void
  maxFiles?: number
  accept?: string
}

export default function PostMediaUpload({
  value = [],
  onChange = () => undefined,
  maxFiles = 6,
  accept = 'image/*,video/*',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progressById, setProgressById] = useState<Record<string, number>>({})

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files as File[])
      const remaining = maxFiles - value.length
      if (remaining <= 0) return
      const slice = list.slice(0, remaining)

      const newMedia: PostMedia[] = []
      for (const file of slice) {
        const id = makeMediaId()
        const isVideo = file.type.startsWith('video/')
        const kind: PostMedia['kind'] = isVideo ? 'video' : 'image'
        const url = URL.createObjectURL(file)

        let p = 0
        const timer = window.setInterval(() => {
          p += 18 + Math.random() * 15
          if (p >= 100) {
            p = 100
            window.clearInterval(timer)
          }
          setProgressById((prev) => ({ ...prev, [id]: Math.round(p) }))
        }, 120)

        newMedia.push({
          id,
          kind,
          url,
          name: file.name,
          sizeBytes: file.size,
        })

        window.setTimeout(() => {
          window.clearInterval(timer)
          setProgressById((prev) => ({ ...prev, [id]: 100 }))
          window.setTimeout(() => {
            setProgressById((prev) => {
              const rest = { ...prev }
              delete rest[id]
              return rest
            })
          }, 400)
        }, 900)
      }
      onChange([...value, ...newMedia])
    },
    [maxFiles, onChange, value],
  )

  const remove = useCallback(
    (id: string) => {
      const target = value.find((m) => m.id === id)
      if (target?.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url)
      }
      onChange(value.filter((m) => m.id !== id))
    },
    [onChange, value],
  )

  return (
    <div className="space-y-3">
      <button
        type="button"
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver
            ? 'border-brand bg-brand/10 shadow-inner'
            : 'border-surface-border bg-surface-elevated/80 hover:border-brand/35 hover:bg-surface-card'
        }`}
      >
        <Upload className="mb-2 text-brand/70" size={22} />
        <span className="text-sm font-medium text-gray-200">Drop or click</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {value.length > 0 ? (
          <ul className="space-y-2">
            {value.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-card/90 p-2 backdrop-blur-sm"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-black/40">
                  {m.kind === 'video' ? (
                    <video src={m.url} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 p-0.5 text-[10px] text-white">
                    {m.kind === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-gray-200">{m.name}</div>
                  {progressById[m.id] != null && progressById[m.id] < 100 ? (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-border">
                      <motion.div
                        className="h-full rounded-full bg-brand"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressById[m.id]}%` }}
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500">
                      {m.sizeBytes != null ? formatBytes(m.sizeBytes) : 'Ready'}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-accent-danger/15 hover:text-accent-danger"
                  aria-label="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
