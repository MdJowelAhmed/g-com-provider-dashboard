import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type UseSearchFieldOptions = {
  /** URL query param name. Default: `"q"`. */
  paramKey?: string
  /** Debounce delay for API / filter commits. Default: `300`. */
  debounceMs?: number
  /** Minimum characters before `searchTerm` / `query` is non-empty. Default: `0`. */
  minChars?: number
  /** Sync committed search value to the URL. Default: `true`. */
  syncUrl?: boolean
  /** Fallback when URL has no value. */
  defaultValue?: string
}

export type NormalizedQuery = {
  /** Trimmed value with original casing (for URL + backend `searchTerm`). */
  raw: string
  /** Lowercased trimmed value (for client-side matching helpers). */
  query: string
}

export type UseSearchFieldResult = {
  /** Immediate input value (what the user sees while typing). */
  inputValue: string
  setInputValue: (value: string) => void
  /**
   * Debounced, trimmed value for backend `searchTerm` query param.
   * Empty when below `minChars`.
   */
  searchTerm: string
  /**
   * Debounced, trimmed, lowercased value (client helpers).
   * Empty when below `minChars`.
   */
  query: string
  /** Alias of `searchTerm` (trimmed original casing). */
  rawQuery: string
  /** True while waiting for debounce to settle. */
  isDebouncing: boolean
  /** True when typed text is non-empty but below `minChars`. */
  isBelowMin: boolean
  clear: () => void
  /**
   * Cancel pending debounce and commit immediately.
   * Returns `false` when non-empty input is below `minChars` (nothing committed as a search).
   */
  flush: () => boolean
}

function normalizeQuery(value: string, minChars: number): NormalizedQuery {
  const trimmed = value.trim()
  if (trimmed.length < minChars) {
    return { raw: '', query: '' }
  }
  return { raw: trimmed, query: trimmed.toLowerCase() }
}

/**
 * Shared search state: debounce, trim, min-length, case-insensitive query, URL sync.
 * Use `searchTerm` as the backend GET query param.
 */
export function useSearchField(options: UseSearchFieldOptions = {}): UseSearchFieldResult {
  const {
    paramKey = 'q',
    debounceMs = 300,
    minChars = 0,
    syncUrl = true,
    defaultValue = '',
  } = options

  const [searchParams, setSearchParams] = useSearchParams()
  const urlParamValue = syncUrl ? (searchParams.get(paramKey) ?? '') : ''

  const [inputValue, setInputValueState] = useState(() => urlParamValue || defaultValue)
  const [committed, setCommitted] = useState(() =>
    normalizeQuery(urlParamValue || defaultValue, minChars),
  )

  const timerRef = useRef<number | null>(null)
  /** Last value we pushed to the URL — ignore echo from our own writes. */
  const lastPushedRef = useRef(urlParamValue)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const liveNormalized = useMemo(
    () => normalizeQuery(inputValue, minChars),
    [inputValue, minChars],
  )

  const commitValue = useCallback((value: string) => {
    setCommitted(normalizeQuery(value, minChars))
  }, [minChars])

  const setInputValue = useCallback((value: string) => {
    setInputValueState(value)
  }, [])

  const flush = useCallback(() => {
    clearTimer()
    const trimmed = inputValue.trim()
    if (trimmed.length > 0 && trimmed.length < minChars) {
      return false
    }
    commitValue(inputValue)
    return true
  }, [clearTimer, commitValue, inputValue, minChars])

  const clear = useCallback(() => {
    clearTimer()
    setInputValueState('')
    setCommitted({ raw: '', query: '' })
  }, [clearTimer])

  // Debounce commits from typing
  useEffect(() => {
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      commitValue(inputValue)
      timerRef.current = null
    }, debounceMs)
    return clearTimer
  }, [inputValue, debounceMs, commitValue, clearTimer])

  // Write committed value → URL (source of truth is local state while typing)
  useEffect(() => {
    if (!syncUrl) return
    if (lastPushedRef.current === committed.raw) return

    lastPushedRef.current = committed.raw
    setSearchParams(
      (prev) => {
        const current = prev.get(paramKey) ?? ''
        if (current === committed.raw) return prev
        const next = new URLSearchParams(prev)
        if (committed.raw) next.set(paramKey, committed.raw)
        else next.delete(paramKey)
        return next
      },
      { replace: true },
    )
  }, [committed.raw, paramKey, setSearchParams, syncUrl])

  // Sync FROM url only on external changes (back/forward) — never while echoing our write
  useEffect(() => {
    if (!syncUrl) return
    if (urlParamValue === lastPushedRef.current) return

    lastPushedRef.current = urlParamValue
    setInputValueState(urlParamValue)
    setCommitted(normalizeQuery(urlParamValue, minChars))
  }, [urlParamValue, syncUrl, minChars])

  const trimmedLive = inputValue.trim()
  const isBelowMin = trimmedLive.length > 0 && trimmedLive.length < minChars
  const isDebouncing = liveNormalized.query !== committed.query

  return {
    inputValue,
    setInputValue,
    searchTerm: committed.raw,
    query: committed.query,
    rawQuery: committed.raw,
    isDebouncing,
    isBelowMin,
    clear,
    flush,
  }
}

/** Case-insensitive includes helper for client-side list filtering. */
export function matchesSearch(haystack: string | null | undefined, query: string) {
  if (!query) return true
  return (haystack ?? '').toLowerCase().includes(query)
}
