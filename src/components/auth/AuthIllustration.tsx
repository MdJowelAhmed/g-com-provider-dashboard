type Props = {
  src?: string
  alt: string
}

export default function AuthIllustration({ src, alt }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="max-h-[560px] w-full max-w-[640px] object-contain"
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="flex h-[420px] w-full max-w-[560px] items-center justify-center rounded-3xl border border-dashed border-surface-border text-sm text-gray-500"
    >
      {alt}
    </div>
  )
}
