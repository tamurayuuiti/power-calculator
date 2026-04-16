// src/components/ResultSection.jsx
// 計算結果やエラーメッセージを表示するコンポーネント

import ResultCard from './ResultCard';

const ResultSection = ({ result, error }) => {
  // 表示すべきデータがない場合は何もレンダリングしない
  if (!result && !error) return null;

  return (
    <>
      {/* エラー表示エリア */}
      {error && (
        <div className="bg-red-50 border-t border-red-100 p-6">
          <p className="text-red-600 font-bold flex items-center gap-2">
            {error}
          </p>
        </div>
      )}

      {/* 計算結果表示エリア */}
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
    </>
  );
};

export default ResultSection;