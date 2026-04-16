// src/App.jsx

import { useState } from 'react';
import InputField from './components/InputField';
import ResultSection from './components/ResultSection';
import { performCalculation } from './utils/powerUtils';

export default function App() {
  const [base, setBase] = useState("");
  const [exponent, setExponent] = useState("");
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    if (e) e.preventDefault();
    
    setError(null);
    setResult(null);
    setIsCalculating(true);

    // 計算によるUIフリーズを回避
    setTimeout(() => {
      try {
        const data = performCalculation(base, exponent);
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCalculate();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 mb-3 tracking-tight">
          Power Calculator
        </h1>
        <p className="text-slate-500 font-medium">高精度な累乗計算機</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 sm:p-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <InputField
              id="base"
              label="底 (Base)"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: 2"
            />
            <InputField
              id="exponent"
              label="指数 (Exponent)"
              value={exponent}
              onChange={(e) => setExponent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: 100"
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                計算中...
              </>
            ) : (
              "計算する"
            )}
          </button>
        </div>

        {/* 抽出した結果表示セクション */}
        <ResultSection result={result} error={error} />
        
      </div>
    </div>
  );
}