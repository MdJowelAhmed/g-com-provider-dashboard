import { motion } from 'framer-motion'

export default function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <span className="sr-only">{label ? `${label} is typing` : 'Typing'}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gray-400"
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
