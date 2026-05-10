/* ===== ONE-WAY ANOVA ===== */

window.StatsAnova = {

  oneWayAnova(groups) {
    // groups: array of arrays, each being one group's data
    const k = groups.length;
    if (k < 2) return null;

    const ns = groups.map(g => g.length);
    const N = ns.reduce((a, b) => a + b, 0);
    if (N <= k) return null;

    const means = groups.map(g => StatsDescriptive.mean(g));
    const grandMean = StatsDescriptive.mean(groups.flat());

    // Sum of Squares Between
    let ssBetween = 0;
    for (let i = 0; i < k; i++) {
      ssBetween += ns[i] * (means[i] - grandMean) ** 2;
    }

    // Sum of Squares Within
    let ssWithin = 0;
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < groups[i].length; j++) {
        ssWithin += (groups[i][j] - means[i]) ** 2;
      }
    }

    const ssTotal = ssBetween + ssWithin;
    const dfBetween = k - 1;
    const dfWithin = N - k;
    const dfTotal = N - 1;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStat = msWithin === 0 ? Infinity : msBetween / msWithin;
    const pValue = Distributions.pFromF(fStat, dfBetween, dfWithin);
    const fCrit = Distributions.criticalF(CONFIG.DEFAULT_ALPHA, dfBetween, dfWithin);
    const decision = Utils.interpretPValue(pValue, CONFIG.DEFAULT_ALPHA);

    // Eta-squared (effect size)
    const etaSquared = ssTotal === 0 ? 0 : ssBetween / ssTotal;

    const steps = [
      `Number of groups (k) = ${k}`,
      `Total observations (N) = ${N}`,
      `Group sizes: [${ns.join(', ')}]`,
      `Group means: [${means.map(m => Utils.fmt(m)).join(', ')}]`,
      `Grand mean = ${Utils.fmt(grandMean)}`,
      ``,
      `SS_between = \u03A3 n\u1D62(\u0078\u0304\u1D62 - \u0078\u0304)\u00B2 = ${Utils.fmt(ssBetween)}`,
      `SS_within = \u03A3\u03A3 (x\u1D62\u2C7C - \u0078\u0304\u1D62)\u00B2 = ${Utils.fmt(ssWithin)}`,
      `SS_total = ${Utils.fmt(ssTotal)}`,
      ``,
      `df_between = k - 1 = ${dfBetween}`,
      `df_within = N - k = ${dfWithin}`,
      ``,
      `MS_between = SS_between / df_between = ${Utils.fmt(msBetween)}`,
      `MS_within = SS_within / df_within = ${Utils.fmt(msWithin)}`,
      ``,
      `F = MS_between / MS_within = ${Utils.fmt(fStat)}`,
      `Critical F (\u03B1=0.05) = ${Utils.fmt(fCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      `\u03B7\u00B2 (eta-squared) = ${Utils.fmt(etaSquared)}`,
      ``,
      decision.text
    ];

    return {
      testType: 'One-Way ANOVA',
      k, N, ns, means, grandMean,
      ssBetween, ssWithin, ssTotal,
      dfBetween, dfWithin, dfTotal,
      msBetween, msWithin,
      fStat, fCrit, pValue, etaSquared,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== WELCH'S ANOVA (unequal variances) ===== */
  welchAnova(groups, alpha = 0.05) {
    const k = groups.length;
    if (k < 2) return null;
    const ns = groups.map(g => g.length);
    if (ns.some(n => n < 2)) return { error: 'Each group needs n ≥ 2' };
    const means = groups.map(g => StatsDescriptive.mean(g));
    const vars = groups.map(g => StatsDescriptive.variance(g, false));
    const w = ns.map((n, i) => n / vars[i]);
    const sumW = w.reduce((s, v) => s + v, 0);
    const xtilde = w.reduce((s, wi, i) => s + wi * means[i], 0) / sumW;
    const num = w.reduce((s, wi, i) => s + wi * (means[i] - xtilde) ** 2, 0) / (k - 1);
    const lambdaSum = w.reduce((s, wi, i) => s + ((1 - wi / sumW) ** 2) / (ns[i] - 1), 0);
    const denom = 1 + (2 * (k - 2) / (k * k - 1)) * lambdaSum;
    const F = num / denom;
    const df1 = k - 1;
    const df2 = (k * k - 1) / (3 * lambdaSum);
    const pValue = Distributions.pFromF(F, df1, df2);
    const fCrit = Distributions.criticalF(alpha, df1, df2);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `Welch's ANOVA (does NOT assume equal variances)`,
      `k = ${k} groups; sample sizes [${ns.join(', ')}]`,
      `Group means: [${means.map(m => Utils.fmt(m)).join(', ')}]`,
      `Group variances: [${vars.map(v => Utils.fmt(v)).join(', ')}]`,
      `Weights wᵢ = nᵢ/sᵢ², Σw = ${Utils.fmt(sumW)}`,
      `Weighted grand mean = ${Utils.fmt(xtilde)}`,
      `F* = ${Utils.fmt(F)} on (${df1}, ${Utils.fmt(df2, 2)}) df`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: "Welch's ANOVA",
      k, ns, means, vars,
      F, fStat: F, df1, df2, dfBetween: df1, dfWithin: df2,
      pValue, fCrit, alpha,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== TWO-WAY ANOVA (balanced or unbalanced, with interaction) ===== */
  twoWayAnova(factorA, factorB, y, alpha = 0.05) {
    const n = Math.min(factorA.length, factorB.length, y.length);
    const aLevels = [...new Set(factorA.slice(0, n))];
    const bLevels = [...new Set(factorB.slice(0, n))];
    const a = aLevels.length, b = bLevels.length;
    if (a < 2 || b < 2) return { error: 'Each factor needs at least 2 levels' };

    // Build cell groups
    const cells = {};
    for (let i = 0; i < n; i++) {
      const key = `${factorA[i]}|${factorB[i]}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(y[i]);
    }
    if (Object.keys(cells).length !== a * b) return { error: 'Some factor combinations have no observations' };
    if (Object.values(cells).some(c => c.length < 1)) return { error: 'Each cell needs ≥1 observation' };

    const grandMean = StatsDescriptive.mean(y.slice(0, n));
    // Marginal means
    const aMeans = aLevels.map(av => {
      const vals = []; for (let i = 0; i < n; i++) if (factorA[i] === av) vals.push(y[i]);
      return StatsDescriptive.mean(vals);
    });
    const bMeans = bLevels.map(bv => {
      const vals = []; for (let i = 0; i < n; i++) if (factorB[i] === bv) vals.push(y[i]);
      return StatsDescriptive.mean(vals);
    });
    const aN = aLevels.map(av => factorA.slice(0, n).filter(v => v === av).length);
    const bN = bLevels.map(bv => factorB.slice(0, n).filter(v => v === bv).length);

    const cellMeans = {}, cellN = {};
    for (const key in cells) {
      cellMeans[key] = StatsDescriptive.mean(cells[key]);
      cellN[key] = cells[key].length;
    }

    let ssA = 0, ssB = 0, ssAB = 0, ssW = 0;
    aLevels.forEach((av, i) => { ssA += aN[i] * (aMeans[i] - grandMean) ** 2; });
    bLevels.forEach((bv, j) => { ssB += bN[j] * (bMeans[j] - grandMean) ** 2; });
    aLevels.forEach((av, i) => {
      bLevels.forEach((bv, j) => {
        const key = `${av}|${bv}`;
        const cm = cellMeans[key];
        ssAB += cellN[key] * (cm - aMeans[i] - bMeans[j] + grandMean) ** 2;
      });
    });
    for (const key in cells) {
      const cm = cellMeans[key];
      cells[key].forEach(v => ssW += (v - cm) ** 2);
    }
    const dfA = a - 1, dfB = b - 1, dfAB = (a - 1) * (b - 1), dfW = n - a * b;
    const msA = ssA / dfA, msB = ssB / dfB, msAB = ssAB / dfAB, msW = ssW / dfW;
    const fA = msA / msW, fB = msB / msW, fAB = msAB / msW;
    const pA = Distributions.pFromF(fA, dfA, dfW);
    const pB = Distributions.pFromF(fB, dfB, dfW);
    const pAB = Distributions.pFromF(fAB, dfAB, dfW);

    const reject = (pA < alpha) || (pB < alpha) || (pAB < alpha);
    const decisionText = `Significant: ${[pA < alpha ? 'A' : '', pB < alpha ? 'B' : '', pAB < alpha ? 'A×B' : ''].filter(Boolean).join(', ') || 'none'}`;

    const steps = [
      `Two-way ANOVA, ${a}×${b} design, n=${n}`,
      `SS_A = ${Utils.fmt(ssA)}, df=${dfA}, MS=${Utils.fmt(msA)}, F=${Utils.fmt(fA)}, p=${Utils.pFmt(pA)}`,
      `SS_B = ${Utils.fmt(ssB)}, df=${dfB}, MS=${Utils.fmt(msB)}, F=${Utils.fmt(fB)}, p=${Utils.pFmt(pB)}`,
      `SS_A×B = ${Utils.fmt(ssAB)}, df=${dfAB}, MS=${Utils.fmt(msAB)}, F=${Utils.fmt(fAB)}, p=${Utils.pFmt(pAB)}`,
      `SS_within = ${Utils.fmt(ssW)}, df=${dfW}, MS=${Utils.fmt(msW)}`,
      decisionText
    ];

    return {
      testType: 'Two-Way ANOVA',
      a, b, n, dfW, msW,
      effects: [
        { name: 'Factor A', SS: ssA, df: dfA, MS: msA, F: fA, p: pA, sig: pA < alpha },
        { name: 'Factor B', SS: ssB, df: dfB, MS: msB, F: fB, p: pB, sig: pB < alpha },
        { name: 'A × B (interaction)', SS: ssAB, df: dfAB, MS: msAB, F: fAB, p: pAB, sig: pAB < alpha },
        { name: 'Within (error)', SS: ssW, df: dfW, MS: msW }
      ],
      pValue: Math.min(pA, pB, pAB),
      F: fA, dfBetween: dfA, dfWithin: dfW,
      alpha, reject, decision: decisionText, steps
    };
  },

  /* ===== REPEATED MEASURES ANOVA (one-way within-subjects) ===== */
  repeatedMeasuresAnova(matrix, alpha = 0.05) {
    // matrix: rows = subjects, columns = treatments
    const n = matrix.length;
    const k = matrix[0].length;
    if (n < 2 || k < 2) return { error: 'Need ≥2 subjects and ≥2 treatments' };
    const grand = StatsDescriptive.mean(matrix.flat());
    const subjMeans = matrix.map(row => StatsDescriptive.mean(row));
    const trtMeans = [];
    for (let j = 0; j < k; j++) {
      let s = 0; for (let i = 0; i < n; i++) s += matrix[i][j];
      trtMeans.push(s / n);
    }

    let ssTotal = 0, ssTrt = 0, ssSubj = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) {
      ssTotal += (matrix[i][j] - grand) ** 2;
    }
    for (let j = 0; j < k; j++) ssTrt += n * (trtMeans[j] - grand) ** 2;
    for (let i = 0; i < n; i++) ssSubj += k * (subjMeans[i] - grand) ** 2;
    const ssError = ssTotal - ssTrt - ssSubj;
    const dfTrt = k - 1, dfSubj = n - 1, dfError = (n - 1) * (k - 1);
    const msTrt = ssTrt / dfTrt, msError = ssError / dfError;
    const F = msTrt / msError;
    const pValue = Distributions.pFromF(F, dfTrt, dfError);
    const fCrit = Distributions.criticalF(alpha, dfTrt, dfError);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `Repeated Measures ANOVA (1-way within)`,
      `n = ${n} subjects, k = ${k} treatments`,
      `SS_treatments = ${Utils.fmt(ssTrt)} (df=${dfTrt})`,
      `SS_subjects = ${Utils.fmt(ssSubj)} (df=${dfSubj})`,
      `SS_error = ${Utils.fmt(ssError)} (df=${dfError})`,
      `F = MS_trt / MS_error = ${Utils.fmt(F)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Repeated Measures ANOVA',
      n, k, trtMeans, subjMeans,
      ssTrt, ssSubj, ssError, ssTotal,
      F, fStat: F, dfBetween: dfTrt, dfWithin: dfError, fCrit,
      pValue, alpha,
      reject: decision.reject, decision: decision.text, steps
    };
  }
};
