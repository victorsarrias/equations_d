import { useEffect, useMemo, useState } from 'react';

export function usePreloadImages(urls = [], { enabled = true } = {}) {
  const [loaded, setLoaded] = useState(0);
  const total = useMemo(() => (Array.isArray(urls) ? urls.filter(Boolean).length : 0), [urls]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !total) { setDone(true); setLoaded(0); return; }
    let canceled = false;
    setLoaded(0);
    setDone(false);
    const imgs = [];

    const onSettled = () => {
      if (canceled) return;
      setLoaded((x) => {
        const next = x + 1;
        if (next >= total) setDone(true);
        return next;
      });
    };

    for (const url of urls) {
      if (!url) continue;
      const img = new Image();
      img.onload = onSettled;
      img.onerror = onSettled; // No bloquea por errores
      img.src = url;
      imgs.push(img);
    }

    return () => { canceled = true; };
  }, [enabled, total, JSON.stringify(urls)]);

  return { loading: enabled && !done, progress: total ? loaded / total : 1 };
}

