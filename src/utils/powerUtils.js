// src/utils/powerUtils.js
// 累乗計算のロジックを担当するユーティリティ関数

export const performCalculation = (baseStr, expStr) => {
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