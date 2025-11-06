// Easyappz useFitText hook - auto fit text inside container by adjusting font-size
import { useEffect, useRef, useState } from 'react';

export default function useFitText(value, { min = 28, max = 96, step = 1 } = {}) {
  const ref = useRef(null);
  const [fontSize, setFontSize] = useState(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = null;
    function measureAndFit() {
      if (!el) return;
      // reset to max first for recalculation
      el.style.fontSize = max + 'px';
      let size = max;
      // Decrease until fits or min reached
      const parent = el.parentElement;
      if (!parent) return;
      const maxWidth = parent.clientWidth - 8; // small padding
      while (el.scrollWidth > maxWidth && size > min) {
        size -= step;
        el.style.fontSize = size + 'px';
      }
      setFontSize(size);
    }

    const ro = new ResizeObserver(() => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureAndFit);
    });
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    measureAndFit();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [value, min, max, step]);

  return { ref, style: { fontSize: fontSize + 'px', lineHeight: 1.15 } };
}
