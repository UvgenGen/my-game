import { useCallback, useRef, useState } from 'react';

/**
 * Lightweight anti-spam guard for action buttons.
 *
 * Wraps a handler so rapid re-clicks are ignored for `cooldown` ms after it
 * fires, and exposes a `busy` flag to disable the control for visual feedback.
 * The lock is held in a ref so it blocks synchronously — back-to-back clicks in
 * the same tick can't both get through before React re-renders.
 *
 * Usage:
 *   const [buzz, busy] = useActionGuard(answerHandler);
 *   <button onClick={buzz} disabled={busy}>Buzz</button>
 */
export default function useActionGuard(action, cooldown = 1000) {
  const [busy, setBusy] = useState(false);
  const lockedRef = useRef(false);

  const run = useCallback((...args) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setBusy(true);
    setTimeout(() => {
      lockedRef.current = false;
      setBusy(false);
    }, cooldown);
    action(...args);
  }, [action, cooldown]);

  return [run, busy];
}
