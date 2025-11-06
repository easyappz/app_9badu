// Easyappz Calculator UI component
import React from 'react';
import './Calculator.css';
import useCalculator from './useCalculator';
import useFitText from './useFitText';

function KeyButton({ label, aria, kind, active, onClick, grow, dataTag }) {
  const classes = [
    'btn',
    kind === 'num' ? 'btn-num' : kind === 'func' ? 'btn-func' : 'btn-op',
    active ? 'active' : ''
  ].join(' ');
  return (
    <button
      data-easytag={dataTag}
      type="button"
      className={`${classes} flex items-center justify-center h-16 sm:h-20 md:h-24 px-4 ${grow ? 'col-span-2' : ''}`}
      onClick={onClick}
      aria-label={aria}
      role="button"
    >
      <span data-easytag={`${dataTag}-label`} className="text-[22px] sm:text-[26px] md:text-[28px] font-medium select-none">
        {label}
      </span>
    </button>
  );
}

export default function Calculator() {
  const { state, displayValue, formattedComputed, clearLabel, refs, actions } = useCalculator();
  const fit = useFitText(displayValue, { min: 28, max: 96 });

  const opActive = (op) => state.operator === (op === '×' ? '*' : op === '÷' ? '/' : op);

  return (
    <div data-easytag="id1-src/features/calculator/Calculator.js" className="app-root safe-area-top safe-area-bottom flex items-end justify-center min-h-screen">
      <main data-easytag="id2-src/features/calculator/Calculator.js" className="w-full max-w-[420px] p-4 sm:p-6">
        <section data-easytag="id3-src/features/calculator/Calculator.js" className="calc-shell p-4 sm:p-5">
          <div data-easytag="id4-src/features/calculator/Calculator.js" className="display-wrap h-28 sm:h-32 md:h-36 mb-3 sm:mb-4 flex items-end justify-end px-4 sm:px-5">
            <div data-easytag="id5-src/features/calculator/Calculator.js" ref={refs.displayRef} className="w-full text-right text-glow">
              <div data-easytag="id6-src/features/calculator/Calculator.js" className="text-white overflow-hidden">
                <span data-easytag="id7-src/features/calculator/Calculator.js" className="block font-semibold" style={fit.style} aria-live="polite">
                  {state.overwrite && formattedComputed ? formattedComputed : displayValue}
                </span>
              </div>
              <div data-easytag="id8-src/features/calculator/Calculator.js" className="text-[12px] opacity-60 mt-1">
                {state.error ? 'Ошибка' : ' '}
              </div>
            </div>
          </div>

          <div data-easytag="id9-src/features/calculator/Calculator.js" className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Row 1 */}
            <KeyButton dataTag="id10-src/features/calculator/Calculator.js" kind="func" label={clearLabel} aria={clearLabel === 'AC' ? 'сброс' : 'очистить'} onClick={clearLabel === 'AC' ? actions.pressClearAll : actions.pressClearEntry} />
            <KeyButton dataTag="id11-src/features/calculator/Calculator.js" kind="func" label={'+/−'} aria="плюс-минус" onClick={actions.pressToggleSign} />
            <KeyButton dataTag="id12-src/features/calculator/Calculator.js" kind="func" label={'%'} aria="процент" onClick={actions.pressPercent} />
            <KeyButton dataTag="id13-src/features/calculator/Calculator.js" kind="op" active={opActive('÷')} label={'÷'} aria="делить" onClick={() => actions.pressOperator('÷')} />

            {/* Row 2 */}
            <KeyButton dataTag="id14-src/features/calculator/Calculator.js" kind="num" label={'7'} aria="семь" onClick={() => actions.pressDigit('7')} />
            <KeyButton dataTag="id15-src/features/calculator/Calculator.js" kind="num" label={'8'} aria="восемь" onClick={() => actions.pressDigit('8')} />
            <KeyButton dataTag="id16-src/features/calculator/Calculator.js" kind="num" label={'9'} aria="девять" onClick={() => actions.pressDigit('9')} />
            <KeyButton dataTag="id17-src/features/calculator/Calculator.js" kind="op" active={opActive('×')} label={'×'} aria="умножить" onClick={() => actions.pressOperator('×')} />

            {/* Row 3 */}
            <KeyButton dataTag="id18-src/features/calculator/Calculator.js" kind="num" label={'4'} aria="четыре" onClick={() => actions.pressDigit('4')} />
            <KeyButton dataTag="id19-src/features/calculator/Calculator.js" kind="num" label={'5'} aria="пять" onClick={() => actions.pressDigit('5')} />
            <KeyButton dataTag="id20-src/features/calculator/Calculator.js" kind="num" label={'6'} aria="шесть" onClick={() => actions.pressDigit('6')} />
            <KeyButton dataTag="id21-src/features/calculator/Calculator.js" kind="op" active={opActive('−')} label={'−'} aria="минус" onClick={() => actions.pressOperator('-')} />

            {/* Row 4 */}
            <KeyButton dataTag="id22-src/features/calculator/Calculator.js" kind="num" label={'1'} aria="один" onClick={() => actions.pressDigit('1')} />
            <KeyButton dataTag="id23-src/features/calculator/Calculator.js" kind="num" label={'2'} aria="два" onClick={() => actions.pressDigit('2')} />
            <KeyButton dataTag="id24-src/features/calculator/Calculator.js" kind="num" label={'3'} aria="три" onClick={() => actions.pressDigit('3')} />
            <KeyButton dataTag="id25-src/features/calculator/Calculator.js" kind="op" active={opActive('+')} label={'+'} aria="прибавить" onClick={() => actions.pressOperator('+')} />

            {/* Row 5 */}
            <KeyButton dataTag="id26-src/features/calculator/Calculator.js" kind="num" label={'0'} aria="ноль" onClick={() => actions.pressDigit('0')} grow />
            <KeyButton dataTag="id27-src/features/calculator/Calculator.js" kind="num" label={'.'} aria="точка" onClick={actions.pressDot} />
            <KeyButton dataTag="id28-src/features/calculator/Calculator.js" kind="op" label={'='} aria="равно" onClick={actions.pressEquals} />
          </div>
        </section>
      </main>
    </div>
  );
}
