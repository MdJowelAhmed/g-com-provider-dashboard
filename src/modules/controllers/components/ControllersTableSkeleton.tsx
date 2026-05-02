type Props = { cols: number }

export default function ControllersTableSkeleton({ cols }: Props) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-surface-border last:border-b-0">
          <td colSpan={cols} className="px-4 py-3">
            <div className="flex animate-pulse items-center gap-4">
              <div className="h-4 w-4 rounded bg-surface-border/90" />
              <div className="h-4 flex-1 rounded bg-surface-border/80" />
              <div className="hidden h-4 w-24 rounded bg-surface-border/70 md:block" />
              <div className="hidden h-4 w-16 rounded bg-surface-border/70 lg:block" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
