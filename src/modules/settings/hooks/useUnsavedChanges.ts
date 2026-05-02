import { useEffect } from 'react'

/** Browser tab close / refresh warning when draft differs from saved */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // eslint-disable-next-line no-param-reassign -- legacy beforeunload API
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}
