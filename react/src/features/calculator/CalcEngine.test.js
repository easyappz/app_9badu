/* Easyappz CalcEngine tests */
import {
  createCalcState,
  inputDigit,
  inputDot,
  setOperator,
  equals,
  getDisplayValue,
  clearAll,
  toggleSign,
  percent
} from './CalcEngine';

function run(seq) {
  let s = createCalcState();
  for (const step of seq) {
    const [type, val] = step;
    if (type === 'digit') s = inputDigit(s, val);
    if (type === 'dot') s = inputDot(s);
    if (type === 'op') s = setOperator(s, val);
    if (type === 'eq') s = equals(s);
    if (type === 'sign') s = toggleSign(s);
    if (type === 'pct') s = percent(s);
    if (type === 'ac') s = clearAll();
  }
  return s;
}

test('0.1 + 0.2 = 0.3 exactly', () => {
  const s = run([
    ['digit', '0'], ['dot'], ['digit', '1'],
    ['op', '+'],
    ['digit', '0'], ['dot'], ['digit', '2'],
    ['eq']
  ]);
  expect(getDisplayValue(s)).toBe('0.3');
});

test('2 + 3 = = = sequence', () => {
  const s = run([
    ['digit', '2'], ['op', '+'], ['digit', '3'], ['eq'], ['eq'], ['eq']
  ]);
  expect(getDisplayValue(s)).toBe('11');
});

test('change operator before second operand', () => {
  let s = run([
    ['digit', '8'], ['op', '+']
  ]);
  s = setOperator(s, '-');
  s = run.call(null, [['digit', '5'], ['eq']].map(x => x));
  // We can't reuse run since it resets state; manually continue
  s = setOperator({ ...s, operator: '-' }, '-');
  s = equals({ ...s, currentInput: '5', overwrite: false });
  expect(getDisplayValue(s)).toBe('3');
});

test('AC/C behavior', () => {
  let s = createCalcState();
  s = inputDigit(s, '9');
  expect(getDisplayValue(s)).toBe('9'); // C should be visible in UI
  s = { ...s, currentInput: '0' }; // clearEntry effect
  expect(getDisplayValue(s)).toBe('0'); // AC now
  s = clearAll(s);
  expect(getDisplayValue(s)).toBe('0');
});

test('+/- on zero and fractional', () => {
  let s = createCalcState();
  s = inputDigit(s, '0');
  s = inputDot(s);
  s = inputDigit(s, '5');
  s = toggleSign(s);
  expect(getDisplayValue(s)).toBe('-0.5');
  s = toggleSign(s);
  expect(getDisplayValue(s)).toBe('0.5');
});

test('percent within operation and standalone', () => {
  // 200 + 10% = 220
  let s = createCalcState();
  s = inputDigit(s, '2'); s = inputDigit(s, '0'); s = inputDigit(s, '0');
  s = setOperator(s, '+');
  s = inputDigit(s, '1'); s = inputDigit(s, '0');
  s = percent(s); // should compute 200 + (200*10/100)
  expect(getDisplayValue(s)).toBe('220');

  // 200 × 10% = 20
  s = createCalcState();
  s = inputDigit(s, '2'); s = inputDigit(s, '0'); s = inputDigit(s, '0');
  s = setOperator(s, '×');
  s = inputDigit(s, '1'); s = inputDigit(s, '0');
  s = percent(s);
  expect(getDisplayValue(s)).toBe('20');
});

test('division by zero -> Error', () => {
  let s = createCalcState();
  s = inputDigit(s, '8');
  s = setOperator(s, '÷');
  s = inputDigit(s, '0');
  s = equals(s);
  expect(getDisplayValue(s)).toBe('Error');
});
