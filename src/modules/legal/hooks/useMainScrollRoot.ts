import { useEffect, useState } from 'react'

/** Dashboard scroll container is the `<main>` element in `DashboardLayout`. */
export function useMainScrollElement(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const main = document.querySelector('main')
    setEl(main instanceof HTMLElement ? main : null)
  }, [])

  return el
}
