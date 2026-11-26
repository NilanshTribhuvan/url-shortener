import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> { data: T | null; error: Error | null; loading: boolean }

/** Runs `fn` on mount and on reload(). Late responses from superseded calls are dropped. */
export function useAsync<T>(fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const seq = useRef(0);
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });

  const reload = useCallback(async () => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === seq.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (id === seq.current) setState((s) => ({ data: s.data, error: e as Error, loading: false }));
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const setData = useCallback(
    (update: (prev: T | null) => T | null) => setState((s) => ({ ...s, data: update(s.data) })),
    [],
  );

  return { ...state, reload, setData };
}
