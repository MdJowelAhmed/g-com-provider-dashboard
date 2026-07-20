import SearchField from '../../../components/common/SearchField'

type Props = {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  onFlush: () => boolean
  loading?: boolean
  searchPlaceholder: string
}

export default function PostFiltersBar({
  value,
  onChange,
  onClear,
  onFlush,
  loading = false,
  searchPlaceholder,
}: Props) {
  return (
    <div className="mb-4">
      <SearchField
        value={value}
        onChange={onChange}
        onClear={onClear}
        onFlush={onFlush}
        minChars={2}
        loading={loading}
        placeholder={searchPlaceholder}
        aria-label="Search posts"
        widthClass="w-full"
        className="min-w-[220px] max-w-xl"
      />
    </div>
  )
}
