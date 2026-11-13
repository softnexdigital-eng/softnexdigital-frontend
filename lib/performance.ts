'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * A timer hook that only triggers re-renders at the specified interval.
 * Uses refs to avoid unnecessary dependency changes.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * A counter that updates at a given interval, useful for low-priority timers.
 * Only triggers re-renders every `renderInterval` ms instead of every tick.
 * e.g., useThrottledCounter(10000, 10000) updates state every 10 seconds.
 */
export function useThrottledCounter(
  tickInterval: number,
  renderInterval: number
): number {
  const [counter, setCounter] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    let lastRender = Date.now();
    const id = setInterval(() => {
      tickRef.current += 1;
      const now = Date.now();
      if (now - lastRender >= renderInterval) {
        lastRender = now;
        setCounter(tickRef.current);
      }
    }, tickInterval);
    return () => clearInterval(id);
  }, [tickInterval, renderInterval]);

  return counter;
}