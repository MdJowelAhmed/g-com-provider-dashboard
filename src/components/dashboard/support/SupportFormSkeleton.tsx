/** Loading placeholder — matches contact form layout (topic → fields → submit). */
export default function SupportFormSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden>
      <div className="space-y-2">
        <div className="h-3 w-14 rounded bg-surface-border" />
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-16 rounded-full bg-surface-border/80" />
          <div className="h-8 w-14 rounded-full bg-surface-border/80" />
          <div className="h-8 w-[4.5rem] rounded-full bg-surface-border/80" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 rounded bg-surface-border" />
        <div className="h-11 w-full rounded-xl bg-surface-border/80" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-surface-border" />
        <div className="h-11 w-full rounded-xl bg-surface-border/80" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-14 rounded bg-surface-border" />
        <div className="h-36 w-full rounded-xl bg-surface-border/70" />
      </div>
      <div className="flex justify-end border-t border-white/[0.06] pt-4">
        <div className="h-11 w-28 rounded-xl bg-surface-border" />
      </div>
    </div>
  )
}
