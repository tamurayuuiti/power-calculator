import { useState } from 'react';

// ==========================================
// 1. Core Logic (計算処理)
// ==========================================
const performCalculation = (baseStr, expStr) => {
  const bStr = baseStr.trim();
  const eStr = expStr.trim();

  // 空欄チェック
  if (!bStr || !eStr) {
    throw new Error("⚠️ 値を入力してください");
  }

  const bNum = Number(bStr);
  const eNum = Number(eStr);

  // 数値以外への対応
  if (isNaN(bNum) || isNaN(eNum)) {
    throw new Error("⚠️ 有効な数字を入力してください");
  }

  // 制限値のチェック1: 指数自体の絶対的な上限
  if (Math.abs(eNum) > 1000000) {
    throw new Error("⚠️ 許容範囲を超えています (指数は±1,000,000以内にしてください)");
  }

  // 制限値のチェック2: 桁数によるフリーズ防止 (bNumが0や1のときは除外)
  if (bNum !== 0 && Math.abs(bNum) !== 1 && Math.abs(eNum * Math.log10(Math.abs(bNum))) > 100000) {
    throw new Error("⚠️ 許容範囲を超えています (計算結果が約10万桁を超えるため処理を制限しました)");
  }

  const isIntegerBase = /^-?\d+$/.test(bStr);
  const isIntegerExp = /^-?\d+$/.test(eStr);

  let exact = null;
  let exponential = "";
  let digits = 0;

  // 底も指数も整数の場合のみ、BigIntで高精度計算を実施
  if (isIntegerBase && isIntegerExp && eNum >= 0) {
    const baseBig = BigInt(bStr);
    const expBig = BigInt(eStr);
    const resultBig = baseBig ** expBig;
    
    const fullExactStr = resultBig.toString();
    digits = fullExactStr.replace("-", "").length;

    // 指数表記の生成
    if (digits > 20) {
      const sign = resultBig < 0n ? "-" : "";
      const absStr = fullExactStr.replace("-", "");
      exponential = `${sign}${absStr[0]}.${absStr.slice(1, 16)}e+${digits - 1}`;
    } else {
      exponential = fullExactStr;
    }

    // UIのフリーズを防ぐため、10,000文字で表示を打ち切る
    const MAX_DISPLAY_CHARS = 10000;
    exact = fullExactStr.length > MAX_DISPLAY_CHARS
      ? fullExactStr.slice(0, MAX_DISPLAY_CHARS) + "\n\n... (表示上限を超えるため以降省略)"
      : fullExactStr;

  } else {
    // 少数や負の指数の場合は標準のべき乗計算にフォールバック
    if (bNum < 0 && !Number.isInteger(eNum)) {
      throw new Error("⚠️ 虚数となる計算は現在のバージョンではサポートされていません");
    }

    const res = bNum ** eNum;
    
    if (!Number.isFinite(res) || isNaN(res)) {
      throw new Error("⚠️ 計算エラー: INFINITY (計算結果が大きすぎます)");
    }

    exponential = res.toExponential(15).replace(/\+/, '');
    
    // 概算桁数の計算 (0の境界値問題に対応)
    if (bNum === 0) {
      digits = 1;
    } else {
      digits = Math.abs(res) >= 1 ? Math.floor(eNum * Math.log10(Math.abs(bNum))) + 1 : 0;
    }
  }

  return { exact, exponential, digits };
};


// ==========================================
// 2. UI Components (コンポーネント分割)
// ==========================================

const InputField = ({ id, label, value, onChange, onKeyDown, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-bold text-slate-600">
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-lg font-mono placeholder:text-slate-400 shadow-sm"
    />
  </div>
);

const ResultCard = ({ title, content, isExact }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
    <div 
      className={`font-mono text-slate-800 ${
        isExact 
          ? "break-all whitespace-pre-wrap max-h-64 overflow-y-auto text-sm bg-white p-3 border border-slate-200 rounded-lg" 
          : "text-lg font-semibold"
      }`}
    >
      {content}
    </div>
  </div>
);


// ==========================================
// 3. Main Application
// ==========================================
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

    // Reactのレンダリングサイクルを優先し、計算によるUIフリーズを回避
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
        <p className="text-slate-500 font-medium">BigIntを活用した高精度な累乗計算機</p>
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

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 border-t border-red-100 p-6">
            <p className="text-red-600 font-bold flex items-center gap-2">
              {error}
            </p>
          </div>
        )}

        {result && (
          <div className="bg-slate-50 border-t border-slate-100 p-8 sm:p-10 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ResultCard 
                title="概算値 (Exponential)" 
                content={result.exponential} 
              />
              <ResultCard 
                title="計算結果の桁数" 
                content={`約 ${result.digits.toLocaleString()} 桁`} 
              />
            </div>
            
            {result.exact && (
              <ResultCard 
                title="正確な値 (Exact Result)" 
                content={result.exact} 
                isExact={true} 
              />
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}