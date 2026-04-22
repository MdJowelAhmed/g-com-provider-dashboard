type Column = {
  key: string
  label: string
  align?: 'left' | 'right'
}

type Props = {
  columns: Column[]
  rows: Record<string, string>[]
  emptyLabel?: string
}

export default function DataTable({ columns, rows, emptyLabel = 'No data yet' }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-gray-200 ${c.align === 'right' ? 'text-right' : ''}`}
                  >
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
