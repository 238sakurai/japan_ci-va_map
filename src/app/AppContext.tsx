import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { useGeoData } from '../hooks/useGeoData'
import { useSave } from '../hooks/useSave'
import { soundPlayer, type SoundName } from '../lib/audio'
import type { GeoData, SaveData } from '../types'

export interface AppContextValue {
  geo: GeoData | null
  geoError: string | null
  save: SaveData
  updateSave: (updater: (prev: SaveData) => SaveData) => void
  soundEnabled: boolean
  toggleSound: () => void
  play: (name: SoundName) => void
  reducedMotion: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { geo, error } = useGeoData()
  const [save, updateSave] = useSave()
  const reducedMotion = useReducedMotion() ?? false
  const soundEnabled = save.settings.sound

  useEffect(() => {
    soundPlayer.enabled = soundEnabled
  }, [soundEnabled])

  const toggleSound = useCallback(() => {
    updateSave((prev) => ({ ...prev, settings: { ...prev.settings, sound: !prev.settings.sound } }))
    soundPlayer.unlock()
  }, [updateSave])

  const play = useCallback((name: SoundName) => soundPlayer.play(name), [])

  const value = useMemo<AppContextValue>(
    () => ({ geo, geoError: error, save, updateSave, soundEnabled, toggleSound, play, reducedMotion }),
    [geo, error, save, updateSave, soundEnabled, toggleSound, play, reducedMotion],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
