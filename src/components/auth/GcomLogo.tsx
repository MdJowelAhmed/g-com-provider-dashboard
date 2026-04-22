type Props = {
  className?: string
}

export default function GcomLogo({ className = '' }: Props) {
  return (
    <div
      className={`flex h-[86px] w-[86px] items-center justify-center rounded-2xl bg-black ${className}`}
    >
      <div className="flex flex-col items-center leading-none">
        <span className="font-extrabold text-yellow-400 text-[34px]">G</span>
        <span className="text-white text-[11px] font-semibold tracking-wide -mt-1">
          G-com
        </span>
      </div>
    </div>
  )
}
