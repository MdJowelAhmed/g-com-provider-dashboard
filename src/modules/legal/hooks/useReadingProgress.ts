import { useEffect, useState } from 'react'

/** 0–1 scroll progress for the dashboard main scroll container. */
export function useReadingProgress(scrollRoot: HTMLElement | null) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!scrollRoot) return

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRoot
      const max = Math.max(1, scrollHeight - clientHeight)
      setProgress(Math.min(1, Math.max(0, scrollTop / max)))
    }

    onScroll()
    scrollRoot.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollRoot.removeEventListener('scroll', onScroll)
  }, [scrollRoot])

  return progress
}
