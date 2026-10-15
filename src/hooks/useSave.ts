import { useCallback, useEffect, useRef, useState } from 'react'
import { loadSave, persistSave } from '../lib/storage'
import type { SaveData } from '../types'

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function useSave(): [SaveData, (updater: (prev: SaveData) => SaveData) => void] {
  const storageRef = useRef<Storage | null>(null)
  const [save, setSave] = useState<SaveData>(() => {
    storageRef.current = browserStorage()
    return loadSave(storageRef.current)
  })

  useEffect(() => {
    persistSave(storageRef.current, save)
  }, [save])

  const update = useCallback((updater: (prev: SaveData) => SaveData) => {
    setSave((prev) => updater(prev))
  }, [])

  return [save, update]
}
