import { useEffect, useState } from 'react'

/**
 * Highlights the TOC entry for the section most visible inside `scrollRoot`
 * (dashboard `<main>`).
 */
export function useLegalScrollSpy(
  sectionIds: string[],
  scrollRoot: HTMLElement | null,
) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null)
  const idsKey = sectionIds.join(',')

  useEffect(() => {
    if (!scrollRoot || sectionIds.length === 0) return

    const elements = sectionIds
      .map((id) => document.getElementById(`legal-section-${id}`))
      .filter((n): n is HTMLElement => n !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.15)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const top = visible[0]?.target
        if (top?.id?.startsWith('legal-section-')) {
          setActiveId(top.id.replace('legal-section-', ''))
        }
      },
      {
        root: scrollRoot,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [scrollRoot, idsKey, sectionIds])

  return activeId
}
