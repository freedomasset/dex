import { act, renderHook } from '@testing-library/react'
import ms from 'ms'

import { useTimeSince } from './parseRemote'

describe('parseRemote', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  describe('useTimeSince', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should initialize with the correct time since', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 60 // 60 seconds ago
      const { result } = renderHook(() => useTimeSince(timestamp))

      expect(result.current).toBe('1m')
    })

    it('should update time since every second', async () => {
      const timestamp = Math.floor(Date.now() / 1000) - 50 // 50 seconds ago
      const { result, rerender } = renderHook(() => useTimeSince(timestamp))

      act(() => {
        jest.advanceTimersByTime(ms('1.1s'))
      })
      rerender()

      expect(result.current).toBe('51s')
    })

    it('should stop updating after 61 seconds', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 61 // 61 seconds ago
      const { result, rerender } = renderHook(() => useTimeSince(timestamp))

      act(() => {
        jest.advanceTimersByTime(ms('121.1s'))
      })
      rerender()

      // maxes out at 1m
      expect(result.current).toBe('1m')
    })
  })
})
