import React, { useState } from 'react';
import { X, Delete, RotateCcw } from 'lucide-react';

interface ScientificCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCalculatorModal: React.FC<ScientificCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setDisplay((prev) => (prev === 'Error' ? op : `${prev} ${op} `));
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1).trim();
    });
  };

  const handleCalculate = () => {
    try {
      // Safe sanitized arithmetic evaluation
      const sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`);
      
      // Basic math functions
      if (!/^[0-9+\-*/().\s**Math.PIe]+$/.test(sanitized)) {
        setDisplay('Error');
        return;
      }
      
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (Number.isFinite(result)) {
        setDisplay(String(Math.round(result * 1000000) / 1000000));
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleSpecial = (type: 'sqrt' | 'sq' | 'sin' | 'cos' | 'tan' | 'log') => {
    try {
      const val = parseFloat(display);
      if (Number.isNaN(val)) return;
      let res = 0;
      if (type === 'sqrt') res = Math.sqrt(val);
      if (type === 'sq') res = val * val;
      if (type === 'sin') res = Math.sin((val * Math.PI) / 180);
      if (type === 'cos') res = Math.cos((val * Math.PI) / 180);
      if (type === 'tan') res = Math.tan((val * Math.PI) / 180);
      if (type === 'log') res = Math.log10(val);
      setDisplay(String(Math.round(res * 1000000) / 1000000));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xs bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-700 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Exam Calculator
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="my-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
          <div className="text-2xl font-mono-numbers font-black tracking-tight text-cyan-400 overflow-x-auto whitespace-nowrap">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSpecial('sqrt')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300"
          >
            √x
          </button>
          <button
            type="button"
            onClick={() => handleSpecial('sq')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300"
          >
            x²
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-300"
          >
            C
          </button>

          <button
            type="button"
            onClick={() => handleSpecial('sin')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            sin
          </button>
          <button
            type="button"
            onClick={() => handleSpecial('cos')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            cos
          </button>
          <button
            type="button"
            onClick={() => handleSpecial('tan')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            tan
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
          >
            ÷
          </button>

          <button
            type="button"
            onClick={() => handleDigit('7')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleDigit('8')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleDigit('9')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
          >
            ×
          </button>

          <button
            type="button"
            onClick={() => handleDigit('4')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleDigit('5')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleDigit('6')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('-')}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => handleDigit('1')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleDigit('2')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleDigit('3')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white col-span-2"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleDigit('.')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
