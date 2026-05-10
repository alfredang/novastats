/* ===== DESCRIPTIVE STATISTICS ENGINE ===== */

window.StatsDescriptive = {
  sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  },

  mean(arr) {
    if (!arr.length) return NaN;
    return this.sum(arr) / arr.length;
  },

  median(arr) {
    if (!arr.length) return NaN;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  mode(arr) {
    if (!arr.length) return { values: [], count: 0 };
    const freq = {};
    let maxFreq = 0;
    arr.forEach(v => {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxFreq) maxFreq = freq[v];
    });
    if (maxFreq === 1) return { values: [], count: 1, text: 'No mode (all values unique)' };
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
    return { values: modes, count: maxFreq, text: modes.join(', ') };
  },

  variance(arr, population = false) {
    if (arr.length < 2) return NaN;
    const m = this.mean(arr);
    const sumSq = arr.reduce((s, v) => s + (v - m) ** 2, 0);
    return sumSq / (population ? arr.length : arr.length - 1);
  },

  stddev(arr, population = false) {
    return Math.sqrt(this.variance(arr, population));
  },

  min(arr) {
    return arr.length ? Math.min(...arr) : NaN;
  },

  max(arr) {
    return arr.length ? Math.max(...arr) : NaN;
  },

  range(arr) {
    return arr.length ? this.max(arr) - this.min(arr) : NaN;
  },

  quartiles(arr) {
    if (arr.length < 4) return { q1: NaN, q2: NaN, q3: NaN, iqr: NaN };
    const sorted = [...arr].sort((a, b) => a - b);
    const q2 = this.median(sorted);
    const mid = Math.floor(sorted.length / 2);
    const lower = sorted.length % 2 !== 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
    const upper = sorted.length % 2 !== 0 ? sorted.slice(mid + 1) : sorted.slice(mid);
    const q1 = this.median(lower);
    const q3 = this.median(upper);
    return { q1, q2, q3, iqr: q3 - q1 };
  },

  /* ===== CENTRAL TENDENCY ===== */

  geometricMean(arr) {
    if (!arr.length || arr.some(v => v <= 0)) return NaN;
    return Math.exp(arr.reduce((s, v) => s + Math.log(v), 0) / arr.length);
  },

  harmonicMean(arr) {
    if (!arr.length || arr.some(v => v === 0)) return NaN;
    return arr.length / arr.reduce((s, v) => s + 1 / v, 0);
  },

  /* ===== DISPERSION ===== */

  coefficientOfVariation(arr) {
    const m = this.mean(arr);
    if (m === 0) return NaN;
    return this.stddev(arr, false) / Math.abs(m);
  },

  meanAbsoluteDeviation(arr) {
    if (!arr.length) return NaN;
    const m = this.mean(arr);
    return arr.reduce((s, v) => s + Math.abs(v - m), 0) / arr.length;
  },

  medianAbsoluteDeviation(arr) {
    if (!arr.length) return NaN;
    const med = this.median(arr);
    return this.median(arr.map(v => Math.abs(v - med)));
  },

  /* ===== POSITION ===== */

  percentile(arr, p) {
    if (!arr.length || p < 0 || p > 100) return NaN;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  },

  zScores(arr) {
    const m = this.mean(arr);
    const sd = this.stddev(arr, false);
    if (sd === 0) return arr.map(() => 0);
    return arr.map(v => (v - m) / sd);
  },

  /* ===== SHAPE ===== */

  skewness(arr) {
    const n = arr.length;
    if (n < 3) return NaN;
    const m = this.mean(arr);
    const s = this.stddev(arr, false);
    if (s === 0) return 0;
    const sum3 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
    return (n / ((n - 1) * (n - 2))) * sum3;
  },

  kurtosis(arr) {
    // Sample excess kurtosis (Fisher's g2 with bias correction)
    const n = arr.length;
    if (n < 4) return NaN;
    const m = this.mean(arr);
    const s = this.stddev(arr, false);
    if (s === 0) return 0;
    const sum4 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
    const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sum4;
    const term2 = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
    return term1 - term2;
  },

  /* ===== RELATIONSHIPS ===== */

  covariance(x, y, population = false) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return NaN;
    const mx = this.mean(x.slice(0, n));
    const my = this.mean(y.slice(0, n));
    let s = 0;
    for (let i = 0; i < n; i++) s += (x[i] - mx) * (y[i] - my);
    return s / (population ? n : n - 1);
  },

  frequencyTable(arr) {
    const freq = new Map();
    arr.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
    const rows = [...freq.entries()]
      .sort((a, b) => (typeof a[0] === 'number' && typeof b[0] === 'number') ? a[0] - b[0] : String(a[0]).localeCompare(String(b[0])))
      .map(([value, count]) => ({
        value, count,
        relative: count / arr.length,
        percent: count / arr.length * 100
      }));
    let cum = 0;
    rows.forEach(r => { cum += r.count; r.cumCount = cum; r.cumPercent = cum / arr.length * 100; });
    return rows;
  },

  contingencyTable(x, y) {
    const n = Math.min(x.length, y.length);
    const xLevels = [...new Set(x.slice(0, n))].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    const yLevels = [...new Set(y.slice(0, n))].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    const counts = xLevels.map(() => yLevels.map(() => 0));
    for (let i = 0; i < n; i++) {
      const xi = xLevels.indexOf(x[i]);
      const yi = yLevels.indexOf(y[i]);
      counts[xi][yi]++;
    }
    const rowTotals = counts.map(row => row.reduce((s, v) => s + v, 0));
    const colTotals = yLevels.map((_, j) => xLevels.reduce((s, _, i) => s + counts[i][j], 0));
    return { xLevels, yLevels, counts, rowTotals, colTotals, n };
  },

  /* ===== RELIABILITY ===== */

  cronbachsAlpha(items) {
    // items: array of arrays — each sub-array is one item's responses across subjects.
    // Or: pass an n×k matrix as { rows: [...] }. We accept array-of-arrays where outer = items.
    const k = items.length;
    if (k < 2) return { error: 'Need at least 2 items' };
    const n = Math.min(...items.map(it => it.length));
    if (n < 2) return { error: 'Need at least 2 subjects' };

    // Item variances
    const itemVars = items.map(it => this.variance(it.slice(0, n), false));
    const sumItemVar = itemVars.reduce((s, v) => s + v, 0);

    // Total variance per subject (sum across items)
    const totals = [];
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < k; j++) s += items[j][i];
      totals.push(s);
    }
    const totalVar = this.variance(totals, false);
    if (totalVar === 0) return { error: 'Total variance is zero' };
    const alpha = (k / (k - 1)) * (1 - sumItemVar / totalVar);
    return { alpha, k, n, itemVars, sumItemVar, totalVar };
  },

  compute(arr) {
    const n = arr.length;
    const m = this.mean(arr);
    const med = this.median(arr);
    const mod = this.mode(arr);
    const sVar = this.variance(arr, false);
    const pVar = this.variance(arr, true);
    const sStd = this.stddev(arr, false);
    const pStd = this.stddev(arr, true);
    const mn = this.min(arr);
    const mx = this.max(arr);
    const rng = this.range(arr);
    const q = this.quartiles(arr);
    const sm = this.sum(arr);

    const steps = [
      `n = ${n}`,
      `Sum = ${Utils.fmt(sm)}`,
      `Mean = Sum / n = ${Utils.fmt(sm)} / ${n} = ${Utils.fmt(m)}`,
      `Sorted: [${[...arr].sort((a, b) => a - b).slice(0, 20).map(v => Utils.fmt(v, 2)).join(', ')}${n > 20 ? ', ...' : ''}]`,
      `Median = ${Utils.fmt(med)}`,
      `Mode = ${mod.text || mod.values.join(', ')} (frequency: ${mod.count})`,
      `Sample Variance = \u03A3(x\u1D62 - x\u0304)\u00B2 / (n-1) = ${Utils.fmt(sVar)}`,
      `Population Variance = \u03A3(x\u1D62 - x\u0304)\u00B2 / n = ${Utils.fmt(pVar)}`,
      `Sample Std Dev = \u221A(Sample Variance) = ${Utils.fmt(sStd)}`,
      `Population Std Dev = \u221A(Pop Variance) = ${Utils.fmt(pStd)}`,
      `Min = ${Utils.fmt(mn)}, Max = ${Utils.fmt(mx)}, Range = ${Utils.fmt(rng)}`,
      `Q1 = ${Utils.fmt(q.q1)}, Q2 = ${Utils.fmt(q.q2)}, Q3 = ${Utils.fmt(q.q3)}, IQR = ${Utils.fmt(q.iqr)}`
    ];

    return {
      n, sum: sm, mean: m, median: med, mode: mod,
      sampleVariance: sVar, populationVariance: pVar,
      sampleStdDev: sStd, populationStdDev: pStd,
      min: mn, max: mx, range: rng,
      q1: q.q1, q2: q.q2, q3: q.q3, iqr: q.iqr,
      steps
    };
  }
};
