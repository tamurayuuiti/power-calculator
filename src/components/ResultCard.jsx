// src/components/ResultCard.jsx
// 結果表示用のカードコンポーネント

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

export default ResultCard;