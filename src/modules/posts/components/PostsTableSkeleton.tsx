export default function PostsTableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-surface-border">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-3 py-3.5 align-middle first:pl-4 last:pr-4">
              <div
                className={`animate-pulse rounded-md bg-surface-border ${
                  j === 0 ? 'h-4 w-4' : j === 1 ? 'h-14 w-14' : 'h-4 min-w-[4rem]'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
