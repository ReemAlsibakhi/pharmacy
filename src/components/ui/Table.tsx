import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────
export interface Column<T> {
  key:        string
  header:     string
  render?:    (row: T) => React.ReactNode
  className?: string
  align?:     'right' | 'left' | 'center'
}

interface TableProps<T> {
  columns:    Column<T>[]
  data:       T[]
  keyField:   keyof T
  onRowClick?: (row: T) => void
  className?:  string
  loading?:    boolean
  emptyMessage?: string
}

// ── Component ──────────────────────────────────────────────────
export function Table<T>({
  columns, data, keyField, onRowClick, className, loading, emptyMessage = 'لا توجد بيانات'
}: TableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-semibold text-gray-600 whitespace-nowrap',
                    col.align === 'left'   && 'text-left',
                    col.align === 'center' && 'text-center',
                    !col.align             && 'text-right',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors hover:bg-gray-50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-gray-700',
                        col.align === 'left'   && 'text-left',
                        col.align === 'center' && 'text-center',
                        !col.align             && 'text-right',
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
