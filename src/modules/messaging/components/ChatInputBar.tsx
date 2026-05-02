import { Paperclip, SendHorizontal, Tag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  disabled?: boolean
  quickReplies: string[]
  onSend: (text: string) => void
  onAttach: () => void
  onOpenOffer: () => void
}

export default function ChatInputBar({
  disabled,
  quickReplies,
  onSend,
  onAttach,
  onOpenOffer,
}: Props) {
  const [text, setText] = useState('')
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [text])

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
  }

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-surface-card/85 px-4 pb-4 pt-2.5 shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {quickReplies.length > 0 ? (
        <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5 messaging-scrollbar messaging-scrollbar-horizontal">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSend(q)}
              disabled={disabled}
              className="shrink-0 rounded-full border border-white/[0.08] bg-surface-elevated/70 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-brand/35 hover:bg-surface-elevated hover:text-white disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2.5">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-surface-elevated/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.03] transition focus-within:border-brand/45 focus-within:bg-surface-elevated/75 focus-within:shadow-[0_0_0_3px_rgba(160,82,45,0.18)] focus-within:ring-brand/25">
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            disabled={disabled}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Message"
            className="messaging-scrollbar max-h-[140px] min-h-[48px] w-full resize-none rounded-xl bg-transparent px-3.5 py-3 text-[15px] leading-snug text-gray-100 placeholder:text-gray-500 outline-none"
          />
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-2 py-1.5">
            <div className="flex items-center gap-0.5">
              <IconBtn label="Attach" onClick={onAttach} disabled={disabled}>
                <Paperclip size={18} />
              </IconBtn>
              <IconBtn label="Offer" onClick={onOpenOffer} disabled={disabled}>
                <Tag size={18} />
              </IconBtn>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !text.trim()}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-semibold text-white shadow-md shadow-brand/15 transition hover:bg-brand-hover disabled:opacity-40"
            >
              Send <SendHorizontal size={14} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.06] hover:text-gray-100 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
