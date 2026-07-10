import ms from 'ms'
import { useEffect, useState } from 'react'
const getTimeSince = (timestamp: number) => {
  const seconds = Math.floor(Date.now() - timestamp * 1000)

  let interval
  // TODO(cartcrom): use locale to determine date shorthands to use for non-english
  if ((interval = seconds / ms(`1y`)) > 1) return Math.floor(interval) + 'y'
  if ((interval = seconds / ms(`30d`)) > 1) return Math.floor(interval) + 'mo'
  if ((interval = seconds / ms(`1d`)) > 1) return Math.floor(interval) + 'd'
  if ((interval = seconds / ms(`1h`)) > 1) return Math.floor(interval) + 'h'
  if ((interval = seconds / ms(`1m`)) > 1) return Math.floor(interval) + 'm'
  else return Math.floor(seconds / ms(`1s`)) + 's'
}

/**
 * Keeps track of the time since a given timestamp, keeping it up to date every second when necessary
 * @param timestamp
 * @returns
 */
export function useTimeSince(timestamp: number) {
  const [timeSince, setTimeSince] = useState<string>(getTimeSince(timestamp))

  useEffect(() => {
    const refreshTime = () =>
      setTimeout(() => {
        if (Math.floor(Date.now() - timestamp * 1000) / ms(`61s`) <= 1) {
          setTimeSince(getTimeSince(timestamp))
          timeout = refreshTime()
        }
      }, ms(`1s`))

    let timeout = refreshTime()

    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [timestamp])

  return timeSince
}
