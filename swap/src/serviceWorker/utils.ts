/// <reference lib="webworker" />

import { PrecacheEntry } from 'workbox-precaching/_types'

type GroupedEntries = { onDemandEntries: (string | PrecacheEntry)[]; precacheEntries: PrecacheEntry[] }

/**
 * Splits entries into on-demand and precachable entries.
 * Effectively, splits out index.html as the only precachable entry.
 */
export function groupEntries(entries: (string | PrecacheEntry)[]): GroupedEntries {
  return entries.reduce<GroupedEntries>(
    ({ onDemandEntries, precacheEntries }, entry) => {
      if (typeof entry === 'string' || entry.url.includes('/media/')) {
        return { precacheEntries, onDemandEntries: [...onDemandEntries, entry] }
      } else if (entry.revision) {
        // index.html should be the only non-media entry with a revision, as code chunks have a hashed URL.
        return { precacheEntries: [...precacheEntries, entry], onDemandEntries }
      } else {
        return { precacheEntries, onDemandEntries: [...onDemandEntries, entry] }
      }
    },
    { onDemandEntries: [], precacheEntries: [] }
  )
}

export async function deleteUnusedCaches(caches: CacheStorage, { usedCaches }: { usedCaches: string[] }) {
  const cacheKeys = await caches.keys()
  cacheKeys.filter((key) => !usedCaches.includes(key)).forEach((key) => caches.delete(key))
}
