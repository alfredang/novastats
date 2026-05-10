/* ===== HYPOTHESIS TESTING (Z-TESTS & T-TESTS) ===== */

window.StatsHypothesis = {

  /* ===== Z-TESTS ===== */

  zTestOneSample(data, mu0, sigma, alpha, tails) {
    const n = data.length;
    const xbar = StatsDescriptive.mean(data);
    const se = sigma / Math.sqrt(n);
    const z = (xbar - mu0) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC = ${mu0}`,
      tails === 2 ? `H\u2081: \u03BC \u2260 ${mu0}` : (tails === 1 ? `H\u2081: \u03BC > ${mu0}` : `H\u2081: \u03BC < ${mu0}`),
      `n = ${n}`,
      `\u0078\u0304 = ${Utils.fmt(xbar)}`,
      `\u03C3 (known) = ${Utils.fmt(sigma)}`,
      `SE = \u03C3 / \u221An = ${Utils.fmt(sigma)} / \u221A${n} = ${Utils.fmt(se)}`,
      `z = (\u0078\u0304 - \u03BC\u2080) / SE = (${Utils.fmt(xbar)} - ${mu0}) / ${Utils.fmt(se)} = ${Utils.fmt(z)}`,
      `\u03B1 = ${alpha}, Tails = ${tails}`,
      `Critical z = \u00B1${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'One-Sample Z-Test',
      n, xbar, mu0, sigma, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  zTestTwoSample(data1, data2, sigma1, sigma2, alpha, tails) {
    const n1 = data1.length, n2 = data2.length;
    const xbar1 = StatsDescriptive.mean(data1);
    const xbar2 = StatsDescriptive.mean(data2);
    const se = Math.sqrt((sigma1 ** 2) / n1 + (sigma2 ** 2) / n2);
    const z = (xbar1 - xbar2) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC\u2081 = \u03BC\u2082`,
      tails === 2 ? `H\u2081: \u03BC\u2081 \u2260 \u03BC\u2082` : `H\u2081: \u03BC\u2081 ${tails === 1 ? '>' : '<'} \u03BC\u2082`,
      `n\u2081 = ${n1}, n\u2082 = ${n2}`,
      `\u0078\u0304\u2081 = ${Utils.fmt(xbar1)}, \u0078\u0304\u2082 = ${Utils.fmt(xbar2)}`,
      `\u03C3\u2081 = ${Utils.fmt(sigma1)}, \u03C3\u2082 = ${Utils.fmt(sigma2)}`,
      `SE = \u221A(\u03C3\u2081\u00B2/n\u2081 + \u03C3\u2082\u00B2/n\u2082) = ${Utils.fmt(se)}`,
      `z = (\u0078\u0304\u2081 - \u0078\u0304\u2082) / SE = ${Utils.fmt(z)}`,
      `Critical z = \u00B1${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Two-Sample Z-Test',
      n1, n2, xbar1, xbar2, sigma1, sigma2, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== T-TESTS ===== */

  tTestOneSample(data, mu0, alpha, tails) {
    const n = data.length;
    const xbar = StatsDescriptive.mean(data);
    const s = StatsDescriptive.stddev(data, false);
    const se = s / Math.sqrt(n);
    const df = n - 1;
    const t = (xbar - mu0) / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC = ${mu0}`,
      tails === 2 ? `H\u2081: \u03BC \u2260 ${mu0}` : `H\u2081: \u03BC ${tails === 1 ? '>' : '<'} ${mu0}`,
      `n = ${n}, df = ${df}`,
      `\u0078\u0304 = ${Utils.fmt(xbar)}`,
      `s = ${Utils.fmt(s)}`,
      `SE = s / \u221An = ${Utils.fmt(s)} / \u221A${n} = ${Utils.fmt(se)}`,
      `t = (\u0078\u0304 - \u03BC\u2080) / SE = (${Utils.fmt(xbar)} - ${mu0}) / ${Utils.fmt(se)} = ${Utils.fmt(t)}`,
      `\u03B1 = ${alpha}, df = ${df}, Tails = ${tails}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'One-Sample T-Test',
      n, df, xbar, mu0, s, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  tTestTwoSample(data1, data2, alpha, tails, equalVar = false) {
    const n1 = data1.length, n2 = data2.length;
    const xbar1 = StatsDescriptive.mean(data1);
    const xbar2 = StatsDescriptive.mean(data2);
    const s1 = StatsDescriptive.stddev(data1, false);
    const s2 = StatsDescriptive.stddev(data2, false);
    const v1 = s1 ** 2, v2 = s2 ** 2;

    let se, df;

    if (equalVar) {
      // Pooled variance
      const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
      se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test
      se = Math.sqrt(v1 / n1 + v2 / n2);
      const num = (v1 / n1 + v2 / n2) ** 2;
      const denom = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
      df = Math.floor(num / denom);
    }

    const t = (xbar1 - xbar2) / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC\u2081 = \u03BC\u2082`,
      tails === 2 ? `H\u2081: \u03BC\u2081 \u2260 \u03BC\u2082` : `H\u2081: \u03BC\u2081 ${tails === 1 ? '>' : '<'} \u03BC\u2082`,
      `n\u2081 = ${n1}, n\u2082 = ${n2}`,
      `\u0078\u0304\u2081 = ${Utils.fmt(xbar1)}, \u0078\u0304\u2082 = ${Utils.fmt(xbar2)}`,
      `s\u2081 = ${Utils.fmt(s1)}, s\u2082 = ${Utils.fmt(s2)}`,
      equalVar ? `Pooled variance (equal var assumed)` : `Welch\u2019s t-test (unequal var)`,
      `SE = ${Utils.fmt(se)}`,
      `df = ${df}`,
      `t = (\u0078\u0304\u2081 - \u0078\u0304\u2082) / SE = ${Utils.fmt(t)}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: equalVar ? 'Independent Two-Sample T-Test (Equal Variance)' : 'Independent Two-Sample T-Test (Welch)',
      n1, n2, df, xbar1, xbar2, s1, s2, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== PROPORTION TESTS ===== */

  oneProportionZ(x, n, p0, alpha, tails) {
    const phat = x / n;
    const se = Math.sqrt(p0 * (1 - p0) / n);
    const z = (phat - p0) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: p = ${p0}`,
      tails === 2 ? `H₁: p ≠ ${p0}` : `H₁: p ${tails === 1 ? '>' : '<'} ${p0}`,
      `n = ${n}, x (successes) = ${x}`,
      `p̂ = x/n = ${Utils.fmt(phat)}`,
      `SE = √(p₀(1-p₀)/n) = ${Utils.fmt(se)}`,
      `z = (p̂ - p₀) / SE = ${Utils.fmt(z)}`,
      `Critical z = ±${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'One-Proportion Z-Test',
      n, x, phat, p0, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  twoProportionZ(x1, n1, x2, n2, alpha, tails) {
    const p1 = x1 / n1, p2 = x2 / n2;
    const pPool = (x1 + x2) / (n1 + n2);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
    const z = (p1 - p2) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: p₁ = p₂`,
      tails === 2 ? `H₁: p₁ ≠ p₂` : `H₁: p₁ ${tails === 1 ? '>' : '<'} p₂`,
      `n₁ = ${n1}, x₁ = ${x1}, p̂₁ = ${Utils.fmt(p1)}`,
      `n₂ = ${n2}, x₂ = ${x2}, p̂₂ = ${Utils.fmt(p2)}`,
      `Pooled p̂ = (x₁+x₂)/(n₁+n₂) = ${Utils.fmt(pPool)}`,
      `SE = √(p̂(1-p̂)(1/n₁ + 1/n₂)) = ${Utils.fmt(se)}`,
      `z = (p̂₁ - p̂₂) / SE = ${Utils.fmt(z)}`,
      `Critical z = ±${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Two-Proportion Z-Test',
      n1, n2, x1, x2, p1, p2, pPool, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== NON-PARAMETRIC TESTS ===== */

  // Compute ranks with average for ties; returns {ranks, tieAdj} where tieAdj = sum(t^3 - t)
  _ranks(values) {
    const indexed = values.map((v, i) => ({ v, i }));
    indexed.sort((a, b) => a.v - b.v);
    const ranks = new Array(values.length);
    let tieAdj = 0;
    let i = 0;
    while (i < indexed.length) {
      let j = i;
      while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) j++;
      const avg = (i + j) / 2 + 1; // 1-based average rank
      for (let k = i; k <= j; k++) ranks[indexed[k].i] = avg;
      const t = j - i + 1;
      if (t > 1) tieAdj += t * t * t - t;
      i = j + 1;
    }
    return { ranks, tieAdj };
  },

  mannWhitneyU(d1, d2, alpha, tails) {
    const n1 = d1.length, n2 = d2.length;
    const all = d1.concat(d2);
    const { ranks, tieAdj } = this._ranks(all);
    const R1 = ranks.slice(0, n1).reduce((s, r) => s + r, 0);
    const U1 = R1 - n1 * (n1 + 1) / 2;
    const U2 = n1 * n2 - U1;
    const U = Math.min(U1, U2);
    const N = n1 + n2;
    const meanU = n1 * n2 / 2;
    const varU = (n1 * n2 / 12) * ((N + 1) - tieAdj / (N * (N - 1)));
    const sdU = Math.sqrt(varU);
    // Continuity-corrected z
    const z = (U - meanU + 0.5 * Math.sign(meanU - U)) / sdU;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: distributions are equal (no shift in location)`,
      tails === 2 ? `H₁: distributions differ` : `H₁: shift in stated direction`,
      `n₁ = ${n1}, n₂ = ${n2}`,
      `R₁ (sum of ranks for sample 1) = ${Utils.fmt(R1)}`,
      `U₁ = R₁ - n₁(n₁+1)/2 = ${Utils.fmt(U1)}`,
      `U₂ = n₁n₂ - U₁ = ${Utils.fmt(U2)}`,
      `U = min(U₁, U₂) = ${Utils.fmt(U)}`,
      `μ_U = n₁n₂/2 = ${Utils.fmt(meanU)}`,
      `σ_U = ${Utils.fmt(sdU)} (tie-corrected)`,
      `z = ${Utils.fmt(z)} (with continuity correction)`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Mann-Whitney U Test',
      n1, n2, U, U1, U2, R1, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  wilcoxonSignedRank(d1, d2, alpha, tails) {
    const n0 = Math.min(d1.length, d2.length);
    const diffs = [];
    for (let i = 0; i < n0; i++) {
      const d = d1[i] - d2[i];
      if (d !== 0) diffs.push(d);
    }
    const n = diffs.length;
    const absD = diffs.map(Math.abs);
    const { ranks, tieAdj } = this._ranks(absD);
    let Wpos = 0, Wneg = 0;
    diffs.forEach((d, i) => { if (d > 0) Wpos += ranks[i]; else Wneg += ranks[i]; });
    const W = Math.min(Wpos, Wneg);
    const meanW = n * (n + 1) / 4;
    const varW = (n * (n + 1) * (2 * n + 1)) / 24 - tieAdj / 48;
    const sdW = Math.sqrt(varW);
    const z = (W - meanW + 0.5 * Math.sign(meanW - W)) / sdW;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: median difference = 0`,
      tails === 2 ? `H₁: median difference ≠ 0` : `H₁: median difference ${tails === 1 ? '>' : '<'} 0`,
      `Pairs (excluding zero diffs): n = ${n}`,
      `W₊ (sum of positive ranks) = ${Utils.fmt(Wpos)}`,
      `W₋ (sum of negative ranks) = ${Utils.fmt(Wneg)}`,
      `W = min(W₊, W₋) = ${Utils.fmt(W)}`,
      `μ_W = n(n+1)/4 = ${Utils.fmt(meanW)}`,
      `σ_W = ${Utils.fmt(sdW)} (tie-corrected)`,
      `z = ${Utils.fmt(z)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Wilcoxon Signed-Rank Test',
      n, W, Wpos, Wneg, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  kruskalWallis(groups, alpha) {
    const k = groups.length;
    const sizes = groups.map(g => g.length);
    const N = sizes.reduce((s, v) => s + v, 0);
    const all = [].concat(...groups);
    const { ranks, tieAdj } = this._ranks(all);

    const groupRanks = [];
    let cursor = 0;
    for (let i = 0; i < k; i++) {
      const slice = ranks.slice(cursor, cursor + sizes[i]);
      groupRanks.push(slice.reduce((s, r) => s + r, 0));
      cursor += sizes[i];
    }

    let H = 0;
    for (let i = 0; i < k; i++) H += (groupRanks[i] ** 2) / sizes[i];
    H = (12 / (N * (N + 1))) * H - 3 * (N + 1);

    const C = 1 - tieAdj / (N * N * N - N);
    const Hc = C > 0 ? H / C : H;

    const df = k - 1;
    const pValue = Distributions.pFromChiSquare(Hc, df);
    const chiCrit = Distributions.criticalChiSquare(alpha, df);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: all k groups have the same distribution`,
      `H₁: at least one group differs`,
      `k = ${k} groups, N = ${N}`,
      `Group sizes: [${sizes.join(', ')}]`,
      `Sum of ranks per group: [${groupRanks.map(r => Utils.fmt(r, 1)).join(', ')}]`,
      `H = (12/[N(N+1)]) Σ(Rᵢ²/nᵢ) - 3(N+1) = ${Utils.fmt(H)}`,
      `Tie correction C = ${Utils.fmt(C)}`,
      `H_corrected = H/C = ${Utils.fmt(Hc)}`,
      `df = k - 1 = ${df}`,
      `Critical χ² = ${Utils.fmt(chiCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Kruskal-Wallis Test',
      k, N, H: Hc, df, pValue, chiCrit, alpha, tails: 1,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  friedman(matrix, alpha) {
    // matrix: rows = subjects (blocks), cols = treatments
    const n = matrix.length;
    const k = matrix[0].length;
    // Rank within each row
    const rankSums = new Array(k).fill(0);
    let totalTieAdj = 0;
    for (let i = 0; i < n; i++) {
      const { ranks, tieAdj } = this._ranks(matrix[i]);
      ranks.forEach((r, j) => rankSums[j] += r);
      totalTieAdj += tieAdj;
    }
    const meanR = n * (k + 1) / 2;
    let Q = 0;
    for (let j = 0; j < k; j++) Q += (rankSums[j] - meanR) ** 2;
    Q = (12 / (n * k * (k + 1))) * Q;
    // Tie correction
    const C = 1 - totalTieAdj / (n * (k * k * k - k));
    const Qc = C > 0 ? Q / C : Q;

    const df = k - 1;
    const pValue = Distributions.pFromChiSquare(Qc, df);
    const chiCrit = Distributions.criticalChiSquare(alpha, df);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: all k treatments have identical effects`,
      `H₁: at least one treatment differs`,
      `n = ${n} blocks, k = ${k} treatments`,
      `Rank sums: [${rankSums.map(r => Utils.fmt(r, 1)).join(', ')}]`,
      `Q = ${Utils.fmt(Q)}`,
      `Tie correction C = ${Utils.fmt(C)}`,
      `Q_corrected = ${Utils.fmt(Qc)}`,
      `df = k - 1 = ${df}`,
      `Critical χ² = ${Utils.fmt(chiCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Friedman Test',
      n, k, Q: Qc, df, pValue, chiCrit, alpha, tails: 1,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== POST-HOC TESTS ===== */

  tukeyHSD(groups, labels, alpha) {
    // Approximation: q_alpha(k, df) ≈ z_{alpha/m} * √2 with m = k(k-1)/2 (Bonferroni-Sidak proxy)
    const k = groups.length;
    const sizes = groups.map(g => g.length);
    const means = groups.map(g => StatsDescriptive.mean(g));
    const N = sizes.reduce((s, v) => s + v, 0);
    let SSE = 0;
    for (let i = 0; i < k; i++) {
      const m = means[i];
      groups[i].forEach(v => SSE += (v - m) ** 2);
    }
    const dfWithin = N - k;
    const MSE = SSE / dfWithin;

    const m = k * (k - 1) / 2;
    const qApprox = Distributions.normalInv(1 - alpha / (2 * m)) * Math.SQRT2;

    const pairs = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const diff = means[i] - means[j];
        const se = Math.sqrt(MSE * 0.5 * (1 / sizes[i] + 1 / sizes[j]));
        const q = Math.abs(diff) / se;
        // Approximate p via studentized-range using normal approx with Bonferroni
        const pPair = Math.min(1, m * Distributions.pFromZ(q / Math.SQRT2, 2));
        pairs.push({
          a: labels[i], b: labels[j], meanDiff: diff,
          se, q, pValue: pPair, significant: q > qApprox
        });
      }
    }

    const steps = [
      `Pairwise comparisons of k = ${k} groups (m = ${m} pairs)`,
      `MSE (within-groups) = ${Utils.fmt(MSE)}, df_within = ${dfWithin}`,
      `Approx. critical q≈${Utils.fmt(qApprox)} (Bonferroni-style adjustment)`,
      `Note: exact Tukey q-distribution approximated; uses normal-based critical value.`
    ];

    return {
      testType: 'Tukey HSD (Pairwise Comparisons)',
      k, MSE, dfWithin, qCrit: qApprox, pairs, alpha,
      reject: pairs.some(p => p.significant),
      decision: pairs.some(p => p.significant)
        ? `${pairs.filter(p => p.significant).length} of ${m} pairs significantly differ`
        : 'No pairs significantly differ',
      steps
    };
  },

  dunnTest(groups, labels, alpha) {
    // Post-hoc nonparametric pairwise after Kruskal-Wallis
    const k = groups.length;
    const sizes = groups.map(g => g.length);
    const N = sizes.reduce((s, v) => s + v, 0);
    const all = [].concat(...groups);
    const { ranks, tieAdj } = this._ranks(all);

    const meanRanks = [];
    let cursor = 0;
    for (let i = 0; i < k; i++) {
      const slice = ranks.slice(cursor, cursor + sizes[i]);
      meanRanks.push(slice.reduce((s, r) => s + r, 0) / sizes[i]);
      cursor += sizes[i];
    }

    const C = tieAdj / (12 * (N - 1));
    const sigmaTerm = (N * (N + 1)) / 12 - C;

    const m = k * (k - 1) / 2;
    const pairs = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const diff = meanRanks[i] - meanRanks[j];
        const se = Math.sqrt(sigmaTerm * (1 / sizes[i] + 1 / sizes[j]));
        const z = diff / se;
        const pRaw = Distributions.pFromZ(z, 2);
        const pAdj = Math.min(1, pRaw * m); // Bonferroni
        pairs.push({
          a: labels[i], b: labels[j], rankDiff: diff, z, pValue: pRaw,
          pAdj, significant: pAdj < alpha
        });
      }
    }

    const steps = [
      `Dunn pairwise comparisons after Kruskal-Wallis`,
      `k = ${k} groups, N = ${N}, m = ${m} pairwise comparisons`,
      `Bonferroni-adjusted p reported (raw p × m)`
    ];

    return {
      testType: "Dunn's Test (Pairwise)",
      k, m, pairs, alpha,
      reject: pairs.some(p => p.significant),
      decision: pairs.some(p => p.significant)
        ? `${pairs.filter(p => p.significant).length} of ${m} pairs significantly differ`
        : 'No pairs significantly differ',
      steps
    };
  },

  /* ===== NORMALITY TEST (D'Agostino-Pearson K²) ===== */

  normalityTest(data, alpha) {
    const n = data.length;
    if (n < 8) {
      return { testType: 'Normality Test (D′Agostino-Pearson)', error: 'Need n ≥ 8' };
    }
    const mean = StatsDescriptive.mean(data);
    let m2 = 0, m3 = 0, m4 = 0;
    for (const x of data) {
      const d = x - mean;
      const d2 = d * d;
      m2 += d2; m3 += d2 * d; m4 += d2 * d2;
    }
    m2 /= n; m3 /= n; m4 /= n;

    const skew = m3 / Math.pow(m2, 1.5);
    const kurt = m4 / (m2 * m2) - 3; // excess kurtosis

    // D'Agostino skewness Z
    const Y = skew * Math.sqrt(((n + 1) * (n + 3)) / (6 * (n - 2)));
    const beta2 = (3 * (n * n + 27 * n - 70) * (n + 1) * (n + 3)) /
                  ((n - 2) * (n + 5) * (n + 7) * (n + 9));
    const W2 = -1 + Math.sqrt(2 * (beta2 - 1));
    const delta = 1 / Math.sqrt(Math.log(Math.sqrt(W2)));
    const a = Math.sqrt(2 / (W2 - 1));
    const Zskew = delta * Math.log(Y / a + Math.sqrt((Y / a) ** 2 + 1));

    // Anscombe-Glynn kurtosis Z
    const E = (3 * (n - 1)) / (n + 1);
    const V = (24 * n * (n - 2) * (n - 3)) / ((n + 1) ** 2 * (n + 3) * (n + 5));
    const X = ((kurt + 3) - E) / Math.sqrt(V);
    const sqrtBeta1 = (6 * (n * n - 5 * n + 2)) / ((n + 7) * (n + 9)) *
                      Math.sqrt((6 * (n + 3) * (n + 5)) / (n * (n - 2) * (n - 3)));
    const A = 6 + (8 / sqrtBeta1) * (2 / sqrtBeta1 + Math.sqrt(1 + 4 / (sqrtBeta1 * sqrtBeta1)));
    const term = (1 - 2 / A) / (1 + X * Math.sqrt(2 / (A - 4)));
    const Zkurt = ((1 - 2 / (9 * A)) - Math.cbrt(term)) / Math.sqrt(2 / (9 * A));

    const K2 = Zskew * Zskew + Zkurt * Zkurt;
    const df = 2;
    const pValue = Distributions.pFromChiSquare(K2, df);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H₀: data are drawn from a normal distribution`,
      `H₁: data are not normally distributed`,
      `n = ${n}`,
      `Sample skewness = ${Utils.fmt(skew)}`,
      `Sample excess kurtosis = ${Utils.fmt(kurt)}`,
      `Z(skewness) = ${Utils.fmt(Zskew)}`,
      `Z(kurtosis) = ${Utils.fmt(Zkurt)}`,
      `K² = Z²_skew + Z²_kurt = ${Utils.fmt(K2)}`,
      `df = 2, p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: "Normality Test (D′Agostino-Pearson K²)",
      n, skew, kurt, Zskew, Zkurt, K2, df, pValue, alpha, tails: 1,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== EFFECT SIZE ===== */

  effectSize(d1, d2) {
    const n1 = d1.length, n2 = d2.length;
    const m1 = StatsDescriptive.mean(d1), m2 = StatsDescriptive.mean(d2);
    const s1 = StatsDescriptive.stddev(d1, false);
    const s2 = StatsDescriptive.stddev(d2, false);
    const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
    const cohensD = (m1 - m2) / sp;
    const J = 1 - 3 / (4 * (n1 + n2) - 9);
    const hedgesG = J * cohensD;
    const glassDelta = (m1 - m2) / s2;
    const r = cohensD / Math.sqrt(cohensD * cohensD + 4);

    const magnitude = (() => {
      const a = Math.abs(cohensD);
      if (a < 0.2) return 'negligible';
      if (a < 0.5) return 'small';
      if (a < 0.8) return 'medium';
      return 'large';
    })();

    const steps = [
      `Cohen's d = (M₁ - M₂) / s_pooled`,
      `s_pooled = ${Utils.fmt(sp)}`,
      `Cohen's d = ${Utils.fmt(cohensD)} (${magnitude})`,
      `Hedges' g = J · d = ${Utils.fmt(hedgesG)} (small-sample bias corrected)`,
      `Glass's Δ = (M₁ - M₂) / s₂ = ${Utils.fmt(glassDelta)}`,
      `r (correlation form) = ${Utils.fmt(r)}`
    ];

    return {
      testType: 'Effect Size',
      n1, n2, m1, m2, sp, cohensD, hedgesG, glassDelta, r, magnitude,
      reject: false, decision: `Effect size: ${magnitude}`, steps,
      noChart: true
    };
  },

  /* ===== POWER ANALYSIS (one/two-sample t-test) ===== */

  powerAnalysis(effect, n, alpha, tails, twoSample) {
    // n is per-group sample size for two-sample case
    const df = twoSample ? 2 * n - 2 : n - 1;
    const ncp = twoSample ? effect * Math.sqrt(n / 2) : effect * Math.sqrt(n);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    // Power approximated via shifted-t -> normal approximation for large df
    const power = 1 - Distributions.normalCDF(tCrit - ncp) +
                  (tails === 2 ? Distributions.normalCDF(-tCrit - ncp) : 0);

    // Required n for 80% power (search)
    const targetPower = 0.8;
    let nReq = 4;
    while (nReq < 5000) {
      const dfR = twoSample ? 2 * nReq - 2 : nReq - 1;
      const ncpR = twoSample ? effect * Math.sqrt(nReq / 2) : effect * Math.sqrt(nReq);
      const tcR = Distributions.criticalT(alpha, dfR, tails);
      const p = 1 - Distributions.normalCDF(tcR - ncpR) +
                (tails === 2 ? Distributions.normalCDF(-tcR - ncpR) : 0);
      if (p >= targetPower) break;
      nReq++;
    }

    const steps = [
      `Test: ${twoSample ? 'two-sample' : 'one-sample'} t-test, ${tails === 2 ? 'two-tailed' : 'one-tailed'}`,
      `Effect size (Cohen's d) = ${Utils.fmt(effect)}`,
      `n${twoSample ? ' per group' : ''} = ${n}, df = ${df}`,
      `Noncentrality λ = ${Utils.fmt(ncp)}`,
      `Critical t = ${Utils.fmt(tCrit)}`,
      `Estimated power (1 - β) ≈ ${Utils.fmt(power, 3)}`,
      `n needed for power = 0.80: ≈ ${nReq}${twoSample ? ' per group' : ''}`
    ];

    return {
      testType: 'Power Analysis',
      effect, n, alpha, tails, twoSample, df, ncp, power, nForPower80: nReq,
      reject: power >= targetPower,
      decision: `Power ≈ ${(power * 100).toFixed(1)}%`,
      steps,
      noChart: true
    };
  },

  /* ===== P-VALUE CALCULATOR ===== */

  pValueCalc(stat, distribution, params, tails) {
    let p, label;
    if (distribution === 'z') {
      p = Distributions.pFromZ(stat, tails);
      label = `Z = ${Utils.fmt(stat)}`;
    } else if (distribution === 't') {
      p = Distributions.pFromT(stat, params.df, tails);
      label = `t = ${Utils.fmt(stat)}, df = ${params.df}`;
    } else if (distribution === 'chi2') {
      p = Distributions.pFromChiSquare(stat, params.df);
      label = `χ² = ${Utils.fmt(stat)}, df = ${params.df}`;
    } else if (distribution === 'f') {
      p = Distributions.pFromF(stat, params.df1, params.df2);
      label = `F = ${Utils.fmt(stat)}, df = (${params.df1}, ${params.df2})`;
    }

    const decision = Utils.interpretPValue(p, params.alpha || 0.05);
    const steps = [
      `Distribution: ${distribution.toUpperCase()}`,
      label,
      `Tails: ${distribution === 'chi2' || distribution === 'f' ? 'right (upper)' : tails}`,
      `p-value = ${Utils.pFmt(p)}`,
      decision.text
    ];

    return {
      testType: 'P-Value Calculator',
      stat, distribution, pValue: p, tails, alpha: params.alpha || 0.05,
      reject: decision.reject, decision: decision.text, steps,
      noChart: true
    };
  },

  /* ===== STANDARD ERROR ===== */

  standardError(data) {
    const n = data.length;
    const mean = StatsDescriptive.mean(data);
    const sd = StatsDescriptive.stddev(data, false);
    const sem = sd / Math.sqrt(n);
    const tCrit95 = Distributions.criticalT(0.05, n - 1, 2);
    const ciLow = mean - tCrit95 * sem;
    const ciHigh = mean + tCrit95 * sem;

    const steps = [
      `n = ${n}`,
      `Mean = ${Utils.fmt(mean)}`,
      `Sample SD = ${Utils.fmt(sd)}`,
      `SEM = SD / √n = ${Utils.fmt(sem)}`,
      `95% CI for mean: [${Utils.fmt(ciLow)}, ${Utils.fmt(ciHigh)}]`
    ];

    return {
      testType: 'Standard Error of the Mean',
      n, mean, sd, sem, ci95: [ciLow, ciHigh],
      reject: false, decision: `SEM = ${Utils.fmt(sem)}`, steps,
      noChart: true
    };
  },

  /* ===== OUTLIER DETECTION ===== */

  outlierDetection(data, method) {
    const sorted = [...data].sort((a, b) => a - b);
    const outliers = [];
    let lower, upper;

    if (method === 'iqr') {
      const q = StatsDescriptive.quartiles(data);
      const q1 = q.q1, q3 = q.q3, iqr = q.iqr;
      lower = q1 - 1.5 * iqr;
      upper = q3 + 1.5 * iqr;
      data.forEach((v, i) => {
        if (v < lower || v > upper) outliers.push({ index: i, value: v });
      });
      return {
        testType: 'Outlier Detection (Tukey IQR)',
        method: 'IQR (1.5×)',
        n: data.length,
        q1, q3, iqr, lower, upper, outliers,
        reject: outliers.length > 0,
        decision: `${outliers.length} outlier${outliers.length === 1 ? '' : 's'} detected`,
        steps: [
          `Q1 = ${Utils.fmt(q1)}, Q3 = ${Utils.fmt(q3)}, IQR = ${Utils.fmt(iqr)}`,
          `Lower fence = Q1 - 1.5×IQR = ${Utils.fmt(lower)}`,
          `Upper fence = Q3 + 1.5×IQR = ${Utils.fmt(upper)}`,
          `Outliers: ${outliers.length === 0 ? 'none' : outliers.map(o => `${Utils.fmt(o.value)} (row ${o.index + 1})`).join(', ')}`
        ],
        noChart: true
      };
    } else {
      // Z-score
      const mean = StatsDescriptive.mean(data);
      const sd = StatsDescriptive.stddev(data, false);
      const threshold = 3;
      data.forEach((v, i) => {
        const z = (v - mean) / sd;
        if (Math.abs(z) > threshold) outliers.push({ index: i, value: v, z });
      });
      return {
        testType: 'Outlier Detection (Z-score)',
        method: 'Z-score (|z| > 3)',
        n: data.length, mean, sd, threshold, outliers,
        reject: outliers.length > 0,
        decision: `${outliers.length} outlier${outliers.length === 1 ? '' : 's'} detected`,
        steps: [
          `Mean = ${Utils.fmt(mean)}, SD = ${Utils.fmt(sd)}`,
          `Threshold: |z| > ${threshold}`,
          `Outliers: ${outliers.length === 0 ? 'none' : outliers.map(o => `${Utils.fmt(o.value)} (z=${Utils.fmt(o.z)}, row ${o.index + 1})`).join(', ')}`
        ],
        noChart: true
      };
    }
  },

  /* ===== FISHER'S EXACT TEST (2x2) ===== */

  fishersExact(a, b, c, d, alpha, tails) {
    // Hypergeometric pmf
    const lnFact = (n) => Distributions.lnGamma(n + 1);
    const logHG = (a, b, c, d) => {
      const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d, n = r1 + r2;
      return lnFact(r1) + lnFact(r2) + lnFact(c1) + lnFact(c2)
           - lnFact(n) - lnFact(a) - lnFact(b) - lnFact(c) - lnFact(d);
    };
    const r1 = a + b, c1 = a + c, n = a + b + c + d;
    const aMin = Math.max(0, c1 - r1 - 0); // wait — typical bounds
    const aMinReal = Math.max(0, c1 - (n - r1));
    const aMax = Math.min(c1, r1);

    const obsLog = logHG(a, b, c, d);
    let pTwo = 0, pRight = 0, pLeft = 0;
    for (let i = aMinReal; i <= aMax; i++) {
      const bi = r1 - i;
      const ci = c1 - i;
      const di = n - i - bi - ci;
      if (bi < 0 || ci < 0 || di < 0) continue;
      const lp = logHG(i, bi, ci, di);
      const p = Math.exp(lp);
      if (lp <= obsLog + 1e-12) pTwo += p;
      if (i >= a) pRight += p;
      if (i <= a) pLeft += p;
    }
    const pValue = tails === 2 ? Math.min(1, pTwo) : Math.min(1, Math.min(pRight, pLeft));
    const decision = Utils.interpretPValue(pValue, alpha);

    // Odds ratio (with 0.5 correction if zeros)
    const aA = a || 0.5, bA = b || 0.5, cA = c || 0.5, dA = d || 0.5;
    const oddsRatio = (aA * dA) / (bA * cA);

    const steps = [
      `2×2 contingency table: [[${a}, ${b}], [${c}, ${d}]]`,
      `Row totals: ${a + b}, ${c + d}; Column totals: ${a + c}, ${b + d}; N = ${n}`,
      `Odds ratio = (a·d)/(b·c) = ${Utils.fmt(oddsRatio)}`,
      `Computed by summing hypergeometric probabilities`,
      `${tails === 2 ? 'Two-tailed' : 'One-tailed'} p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: "Fisher's Exact Test",
      a, b, c, d, n, oddsRatio, pValue, alpha, tails,
      reject: decision.reject, decision: decision.text, steps,
      noChart: true
    };
  },

  tTestPaired(data1, data2, alpha, tails) {
    const n = Math.min(data1.length, data2.length);
    const diffs = [];
    for (let i = 0; i < n; i++) {
      diffs.push(data1[i] - data2[i]);
    }

    const dbar = StatsDescriptive.mean(diffs);
    const sd = StatsDescriptive.stddev(diffs, false);
    const se = sd / Math.sqrt(n);
    const df = n - 1;
    const t = dbar / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC_d = 0 (mean difference is zero)`,
      tails === 2 ? `H\u2081: \u03BC_d \u2260 0` : `H\u2081: \u03BC_d ${tails === 1 ? '>' : '<'} 0`,
      `n = ${n} pairs`,
      `Differences: [${diffs.slice(0, 10).map(d => Utils.fmt(d, 2)).join(', ')}${n > 10 ? ', ...' : ''}]`,
      `Mean difference (\u0064\u0304) = ${Utils.fmt(dbar)}`,
      `SD of differences (s_d) = ${Utils.fmt(sd)}`,
      `SE = s_d / \u221An = ${Utils.fmt(sd)} / \u221A${n} = ${Utils.fmt(se)}`,
      `df = n - 1 = ${df}`,
      `t = \u0064\u0304 / SE = ${Utils.fmt(dbar)} / ${Utils.fmt(se)} = ${Utils.fmt(t)}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Paired T-Test',
      n, df, dbar, sd, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  }
};
