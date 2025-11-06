// Easyappz calculator hook: state, handlers, keyboard, swipe-to-delete
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createCalcState,
  getDisplayValue,
  inputDigit,
  inputDot,
  setOperator,
  toggleSign,
  percent,
  equals,
  clearEntry,
  clearAll,
  deleteLast,
  formatNumberForDisplay
} from './CalcEngine';

export default function useCalculator() {
  const [state, setState] = useState(() => createCalcState());
  const displayValue = getDisplayValue(state);

  const pressDigit = useCallback((d) => setState((s) => inputDigit(s, d)), []);
  const pressDot = useCallback(() => setState((s) => inputDot(s)), []);
  const pressOperator = useCallback((op) => setState((s) => setOperator(s, op)), []);
  const pressToggleSign = useCallback(() => setState((s) => toggleSign(s)), []);
  const pressPercent = useCallback(() => setState((s) => percent(s)), []);
  const pressEquals = useCallback(() => setState((s) => equals(s)), []);
  const pressClearEntry = useCallback(() => setState((s) => clearEntry(s)), []);
  const pressClearAll = useCallback(() => setState(() => clearAll()), []);
  const pressDeleteLast = useCallback(() => setState((s) => deleteLast(s)), []);

  // AC/C label
  const clearLabel = useMemo(() => {
    const showing = getDisplayValue(state);
    if (showing !== '0' && showing !== 'Error') return 'C';
    return 'AC';
  }, [state]);

  // Keyboard handling
  useEffect(() => {
    function onKeyDown(e) {
      const k = e.key;
      if (k >= '0' && k <= '9') { pressDigit(k); return; }
      if (k === '.') { pressDot(); return; }
      if (k === '+' || k === '-') { pressOperator(k); return; }
      if (k === '*' || k === 'x' || k === 'X') { pressOperator('×'); return; }
      if (k === '/' || k === '÷') { pressOperator('÷'); return; }
      if (k === '%') { pressPercent(); return; }
      if (k === 'Enter' || k === '=') { pressEquals(); return; }
      if (k === 'Escape') { pressClearAll(); return; }
      if (k === 'Backspace') { pressDeleteLast(); return; }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pressDigit, pressDot, pressOperator, pressPercent, pressEquals, pressClearAll, pressDeleteLast]);

  // Swipe-to-delete on display
  const displayRef = useRef(null);
  const swipeState = useRef({ startX: 0, startY: 0, active: false, used: false });
  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;

    function onStart(ev) {
      const t = ev.touches ? ev.touches[0] : ev;
      swipeState.current = { startX: t.clientX, startY: t.clientY, active: true, used: false };
    }
    function onMove(ev) {
      if (!swipeState.current.active || swipeState.current.used) return;
      const t = ev.touches ? ev.touches[0] : ev;
      const dx = t.clientX - swipeState.current.startX;
      const dy = t.clientY - swipeState.current.startY;
      if (Math.abs(dx) > 30 && Math.abs(dy) < 20) {
        pressDeleteLast();
        swipeState.current.used = true;
      }
    }
    function onEnd() { swipeState.current.active = false; swipeState.current.used = false; }

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    // Support mouse drag as well
    el.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  }, [pressDeleteLast]);

  const formattedComputed = useMemo(() => (
    state.overwrite ? formatNumberForDisplay(state.accumulator) : null
  ), [state.overwrite, state.accumulator]);

  return {
    state,
    displayValue,
    formattedComputed,
    clearLabel,
    refs: { displayRef },
    actions: {
      pressDigit,
      pressDot,
      pressOperator,
      pressToggleSign,
      pressPercent,
      pressEquals,
      pressClearEntry,
      pressClearAll,
      pressDeleteLast
    }
  };
}
