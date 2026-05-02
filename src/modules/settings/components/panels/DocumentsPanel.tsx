import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Trash2, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type DocRow = { id: string; name: string; size: number }

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

export default function DocumentsPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [docs, setDocs] = useState<DocRow[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const next: DocRow[] = []
      for (const f of Array.from(files)) {
        next.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          size: f.size,
        })
      }
      setDocs((d) => [...d, ...next])
      onDirty()
    },
    [onDirty],
  )

  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      updateUser({
        extra: {
          ...user.extra,
          verification_doc_count: String(docs.length),
          verification_docs_updated: new Date().toISOString(),
        },
      })
      setSaving(false)
      onSaved()
      setOk(true)
      window.setTimeout(() => setOk(false), 2600)
    }, 500)
  }

  const fmt = (n: number) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Document list saved. Wire uploads to your storage API for production.
        </p>
      ) : null}

      <SettingsCard
        title="Verification documents"
        description="Business registration, tax IDs, or other files our team may request."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save</SettingsPrimaryButton>}
      >
        <div
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
            addFiles(e.dataTransfer.files)
          }}
          className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            drag ? 'border-brand/60 bg-brand/10' : 'border-white/[0.1] bg-surface-elevated/35'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => addFiles(e.target.files)}
          />
          <Upload className="mx-auto text-brand" size={26} />
          <p className="mt-2 text-sm text-gray-300">Drag files here or</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-sm font-medium text-brand hover:underline"
          >
            browse
          </button>
          <p className="mt-2 text-[11px] text-gray-600">PDF, JPEG, PNG · max 10 MB each (client-side)</p>
        </div>

        <AnimatePresence initial={false}>
          {docs.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07] bg-surface-elevated/40"
            >
              {docs.map((d) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={18} className="shrink-0 text-gray-500" />
                    <div className="min-w-0">
                      <div className="truncate text-sm text-gray-200">{d.name}</div>
                      <div className="text-[11px] text-gray-600">{fmt(d.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocs((list) => list.filter((x) => x.id !== d.id))
                      onDirty()
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-accent-danger/15 hover:text-accent-danger"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <p className="py-6 text-center text-sm text-gray-600">No documents added yet.</p>
          )}
        </AnimatePresence>
      </SettingsCard>
    </motion.div>
  )
}
