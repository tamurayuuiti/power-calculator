// src/components/InputField.jsx
// 入力フィールドコンポーネント

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

export default InputField;