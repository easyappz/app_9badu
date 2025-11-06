// Easyappz Calculator Engine - precise decimal arithmetic without floating errors

// Helpers
function isString(value) { return typeof value === "string"; }
function startsWith(str, ch) { return str.length > 0 && str[0] === ch; }
function endsWith(str, ch) { return str.length > 0 && str[str.length - 1] === ch; }

function stripLeadingZeros(numStr) {
  let i = 0;
  while (i < numStr.length - 1 && numStr[i] === '0') i += 1;
  return numStr.slice(i);
}

function stripTrailingZeros(numStr) {
  // assumes only digits in numStr (fractional part)
  let end = numStr.length;
  while (end > 0 && numStr[end - 1] === '0') end -= 1;
  return numStr.slice(0, end);
}

function pow10(n) {
  let r = 1n;
  let i = 0;
  const ten = 10n;
  while (i < n) { r *= ten; i += 1; }
  return r;
}

function toIntScale(valueStr) {
  // valueStr could be like "-12.3400" or "0" or "1." or ".5" (we won't pass bare ".5" though)
  let s = String(valueStr);
  let sign = 1n;
  if (startsWith(s, '+')) s = s.slice(1);
  if (startsWith(s, '-')) { sign = -1n; s = s.slice(1); }

  let intPart = s;
  let fracPart = "";
  const dotIdx = s.indexOf('.');
  if (dotIdx !== -1) {
    intPart = s.slice(0, dotIdx);
    fracPart = s.slice(dotIdx + 1);
  }
  if (intPart === "") intPart = "0";
  if (fracPart === "") fracPart = "";

  // remove underscores or spaces if any (shouldn't be) - we won't use regex; ensure digits
  const intDigits = intPart === "0" ? "0" : stripLeadingZeros(intPart);
  const scale = fracPart.length;
  const digits = (intDigits === "0" ? "" : intDigits) + fracPart;
  const raw = digits === "" ? 0n : BigInt(digits);
  const intVal = sign * raw;
  return { intVal, scale };
}

function fromIntScaleToString(intVal, scale) {
  const negative = intVal < 0n;
  const absVal = negative ? -intVal : intVal;
  let s = absVal.toString();
  if (scale === 0) {
    return (negative ? "-" : "") + s;
  }
  // ensure at least scale digits
  if (s.length <= scale) {
    const zeros = '0'.repeat(scale - s.length + 1);
    s = zeros + s;
  }
  const split = s.length - scale;
  const intPart = s.slice(0, split);
  const fracPart = s.slice(split);
  const result = (negative ? "-" : "") + intPart + "." + fracPart;
  return result;
}

function normalizeResultString(s) {
  // Remove trailing zeros after decimal and optional trailing dot; convert -0 to 0
  if (!isString(s)) s = String(s);
  if (s === "Error") return s;
  let sign = "";
  if (startsWith(s, '-')) { sign = "-"; s = s.slice(1); }
  const dotIdx = s.indexOf('.');
  if (dotIdx === -1) {
    // integer
    if (s === "0") return "0";
    return (sign === "-" && s === "0") ? "0" : sign + s;
  }
  const intPart = s.slice(0, dotIdx);
  let fracPart = s.slice(dotIdx + 1);
  fracPart = stripTrailingZeros(fracPart);
  if (fracPart.length === 0) {
    if (intPart === "0") return "0";
    return (sign ? "-" : "") + intPart;
  }
  // Avoid "-0.x" sign rule: keep negative zero if any non-zero frac
  return (sign ? "-" : "") + (intPart === "" ? "0" : intPart) + "." + fracPart;
}

function alignScales(a, aS, b, bS) {
  if (aS === bS) return { a, b, s: aS };
  if (aS > bS) {
    const diff = aS - bS;
    return { a, b: b * pow10(BigInt(diff)), s: aS };
  }
  const diff = bS - aS;
  return { a: a * pow10(BigInt(diff)), b, s: bS };
}

function decimalAdd(aStr, bStr) {
  const { intVal: a, scale: aS } = toIntScale(aStr);
  const { intVal: b, scale: bS } = toIntScale(bStr);
  const { a: aa, b: bb, s } = alignScales(a, aS, b, bS);
  const sum = aa + bb;
  const raw = fromIntScaleToString(sum, s);
  return normalizeResultString(raw);
}

function decimalSub(aStr, bStr) {
  const { intVal: a, scale: aS } = toIntScale(aStr);
  const { intVal: b, scale: bS } = toIntScale(bStr);
  const { a: aa, b: bb, s } = alignScales(a, aS, b, bS);
  const diff = aa - bb;
  const raw = fromIntScaleToString(diff, s);
  return normalizeResultString(raw);
}

function decimalMul(aStr, bStr) {
  const { intVal: a, scale: aS } = toIntScale(aStr);
  const { intVal: b, scale: bS } = toIntScale(bStr);
  const prod = a * b;
  const s = aS + bS;
  const raw = fromIntScaleToString(prod, s);
  return normalizeResultString(raw);
}

function decimalDiv(aStr, bStr, scale = 12) {
  const { intVal: a, scale: aS } = toIntScale(aStr);
  const { intVal: b, scale: bS } = toIntScale(bStr);
  if (b === 0n) return "Error";
  const signNeg = (a < 0n) !== (b < 0n);
  const A = a < 0n ? -a : a;
  const B = b < 0n ? -b : b;
  const exp = bS - aS + scale;
  let num;
  let den;
  if (exp >= 0) {
    num = A * pow10(BigInt(exp));
    den = B;
  } else {
    num = A;
    den = B * pow10(BigInt(-exp));
  }
  let q = num / den;
  const r = num % den;
  // Half-up rounding
  if (r * 2n >= den) {
    q = q + 1n;
  }
  const signed = signNeg ? -q : q;
  const raw = fromIntScaleToString(signed, scale);
  return normalizeResultString(raw);
}

function operate(a, b, op) {
  if (op === '+') return decimalAdd(a, b);
  if (op === '-') return decimalSub(a, b);
  if (op === '*') return decimalMul(a, b);
  if (op === '/') return decimalDiv(a, b, 12);
  return b;
}

function createCalcState() {
  return {
    currentInput: "0", // as typed string (preserve trailing zeros/dot)
    accumulator: "0",  // last committed value/result
    operator: null,     // '+', '-', '*', '/'
    lastOperator: null, // for repeated equals
    lastOperand: null,
    overwrite: false,   // if true, next digit replaces currentInput
    error: null
  };
}

function getDisplayValue(state) {
  if (state.error) return "Error";
  if (state.overwrite) {
    return formatNumberForDisplay(state.accumulator);
  }
  return state.currentInput;
}

function inputDigit(state, d) {
  if (state.error) return state;
  const digit = String(d);
  const next = { ...state };
  if (next.overwrite) {
    next.currentInput = digit;
    next.overwrite = false;
    return next;
  }
  if (next.currentInput === "0") {
    next.currentInput = digit;
  } else {
    next.currentInput = next.currentInput + digit;
  }
  return next;
}

function inputDot(state) {
  if (state.error) return state;
  const next = { ...state };
  if (next.overwrite) {
    next.currentInput = "0.";
    next.overwrite = false;
    return next;
  }
  if (next.currentInput.indexOf('.') !== -1) return next;
  next.currentInput = next.currentInput + ".";
  return next;
}

function setOperator(state, opChar) {
  if (state.error) return state;
  const op = opChar === '×' ? '*' : opChar === '÷' ? '/' : opChar;
  const next = { ...state };
  // If there is an existing operator and we haven't started typing b yet, just switch operator
  if (next.operator && next.overwrite) {
    next.operator = op;
    return next;
  }
  // If we have an operator and a second operand, compute pending operation
  if (next.operator && !next.overwrite) {
    const a = next.accumulator;
    const b = next.currentInput;
    const res = operate(a, b, next.operator);
    if (res === "Error") {
      return { ...createCalcState(), error: "Error" };
    }
    next.accumulator = res;
    next.currentInput = res; // reflect current result temporarily
    next.overwrite = true;
    next.operator = op;
    // Update last op context
    next.lastOperator = op;
    next.lastOperand = b;
    return next;
  }
  // No pending operator: commit current input as accumulator and set operator
  const value = next.overwrite ? next.accumulator : next.currentInput;
  next.accumulator = normalizeResultString(value);
  next.operator = op;
  next.overwrite = true;
  return next;
}

function toggleSign(state) {
  if (state.error) return state;
  const next = { ...state };
  if (next.overwrite) {
    const val = next.accumulator;
    next.accumulator = startsWith(val, '-') ? val.slice(1) : (val === "0" ? "0" : "-" + val);
    return next;
  }
  const cur = next.currentInput;
  next.currentInput = startsWith(cur, '-') ? cur.slice(1) : (cur === "0" || cur === "0." ? cur : "-" + cur);
  return next;
}

function percent(state) {
  if (state.error) return state;
  const next = { ...state };
  if (next.operator) {
    // b% of a, then perform a (op) (a*b/100)
    const a = next.accumulator;
    const bIn = next.overwrite ? "0" : next.currentInput;
    const bPct = decimalDiv(decimalMul(a, bIn), "100", 12);
    if (bPct === "Error") return { ...createCalcState(), error: "Error" };
    const res = operate(a, bPct, next.operator);
    if (res === "Error") return { ...createCalcState(), error: "Error" };
    next.accumulator = res;
    next.currentInput = bPct; // reflect transformed b
    next.lastOperator = next.operator;
    next.lastOperand = bPct;
    next.operator = null;
    next.overwrite = true;
    return next;
  }
  // No operator: divide displayed value by 100
  if (next.overwrite) {
    const val = decimalDiv(next.accumulator, "100", 12);
    next.accumulator = val;
    return next;
  }
  next.currentInput = decimalDiv(next.currentInput, "100", 12);
  return next;
}

function equals(state) {
  if (state.error) return state;
  const next = { ...state };
  if (next.operator) {
    const a = next.accumulator;
    const b = next.overwrite ? (next.lastOperand ?? next.accumulator) : next.currentInput;
    const res = operate(a, b, next.operator);
    if (res === "Error") return { ...createCalcState(), error: "Error" };
    next.accumulator = res;
    next.lastOperator = next.operator;
    next.lastOperand = b;
    next.operator = null;
    next.overwrite = true;
    return next;
  }
  if (next.lastOperator && next.lastOperand) {
    const res = operate(next.accumulator, next.lastOperand, next.lastOperator);
    if (res === "Error") return { ...createCalcState(), error: "Error" };
    next.accumulator = res;
    next.overwrite = true;
    return next;
  }
  // nothing to do
  return next;
}

function clearEntry(state) {
  if (state.error) return createCalcState();
  const next = { ...state };
  if (next.overwrite) {
    // behaves like preparing new entry -> nothing typed yet, keep overwrite
    next.currentInput = "0";
    next.overwrite = false;
  } else {
    next.currentInput = "0";
  }
  return next;
}

function clearAll() {
  return createCalcState();
}

function deleteLast(state) {
  if (state.error) return state;
  const next = { ...state };
  if (next.overwrite) {
    // bring display back to editable state
    next.currentInput = "0";
    next.overwrite = false;
    return next;
  }
  const s = next.currentInput;
  if (s.length <= 1) { next.currentInput = "0"; return next; }
  // remove last char
  next.currentInput = s.slice(0, s.length - 1);
  // avoid ending with "-" only
  if (next.currentInput === "-" || next.currentInput === "-0") next.currentInput = "0";
  return next;
}

function formatNumberForDisplay(valueString, options) {
  const opts = options || {};
  const maxSig = typeof opts.maxSignificant === 'number' ? opts.maxSignificant : 12;
  if (valueString === "Error") return "Error";
  let s = normalizeResultString(String(valueString));
  if (s === "0") return "0";
  let sign = "";
  if (startsWith(s, '-')) { sign = "-"; s = s.slice(1); }
  const dotIdx = s.indexOf('.');
  let intPart = dotIdx === -1 ? s : s.slice(0, dotIdx);
  let fracPart = dotIdx === -1 ? "" : s.slice(dotIdx + 1);
  // trim frac trailing zeros for display
  fracPart = stripTrailingZeros(fracPart);
  // significant control (simple: cap fractional length so that total significant digits <= maxSig)
  const intDigits = intPart === "0" ? 0 : intPart.length;
  let allowedFrac = maxSig - (intDigits === 0 ? 1 : intDigits);
  if (allowedFrac < 0) allowedFrac = 0;
  if (fracPart.length > allowedFrac) {
    // round to allowedFrac using decimalDiv approach
    const rounded = roundToScale(sign + intPart + (fracPart ? "." + fracPart : ""), allowedFrac);
    return normalizeResultString(rounded);
  }
  const res = sign + (intPart === "" ? "0" : intPart) + (fracPart ? "." + fracPart : "");
  return res;
}

function roundToScale(valueStr, scale) {
  // returns string rounded half-up to a given number of digits after decimal
  const { intVal: a, scale: aS } = toIntScale(valueStr);
  if (scale < 0) scale = 0;
  if (aS === scale) return normalizeResultString(fromIntScaleToString(a, aS));
  if (aS < scale) {
    const diff = scale - aS;
    const v = a * pow10(BigInt(diff));
    return normalizeResultString(fromIntScaleToString(v, scale));
  }
  // aS > scale -> need rounding
  const diff = aS - scale;
  const divisor = pow10(BigInt(diff));
  let q = a / divisor;
  const r = a % divisor;
  const half = divisor / 2n;
  if (r >= half) q = q + 1n;
  return normalizeResultString(fromIntScaleToString(q, scale));
}

export {
  decimalAdd,
  decimalSub,
  decimalMul,
  decimalDiv,
  formatNumberForDisplay,
  createCalcState,
  // handlers
  inputDigit,
  inputDot,
  setOperator,
  toggleSign,
  percent,
  equals,
  clearEntry,
  clearAll,
  deleteLast,
  getDisplayValue
};
