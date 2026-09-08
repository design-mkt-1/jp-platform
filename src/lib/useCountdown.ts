'use client'

import { useEffect, useState } from 'react'

/**
 * A promo countdown that actually counts down.
 *
 * The clock has to move on the client and nowhere else. This is a static export: a value computed
 * at import time, or during the build, is frozen the moment it is deployed — which is exactly how
 * every banner ended up reading "00:00:00". `useCountdown` re-formats from `Date.now()` once a
 * second instead, so the same HTML is correct on any date it is opened.
 *
 * The formatter is passed in rather than chosen here: the desktop banner draws "08h : 12m : 36s"
 * and the mobile card "08:12:36", and both are the same clock in two type styles.
 *
 * It ticks in both motion modes. A countdown is information, not decoration, so
 * `prefers-reduced-motion` has no say over it — the reduced-motion rules in `globals.css` only stop
 * transitions and animations, and a text node replaced once a second is neither.
 *
 * `endsAt` may be undefined (the wheel card has no deadline) so that a caller can hold the hook
 * above the branch that decides whether a clock is drawn at all.
 */
export function useCountdown(
  endsAt: string | undefined,
  format: (endsAt: string, from: number) => string,
): string | undefined {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // Once immediately: hydration can land well after the render that seeded `now`.
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return endsAt ? format(endsAt, now) : undefined
}
