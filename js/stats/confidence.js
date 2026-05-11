/* ===== CONFIDENCE INTERVALS ===== */

window.StatsConfidence = {

  /* Confidence level → α/2 z critical */
  zCrit(conf) { return Distributions.normalInv(1 - (1 - conf) / 2); },
  tCrit(conf, df) { return Distributions.criticalT(1 - conf, df, 2); },

  /* CI for a mean: σ known → z; σ unknown → t */
  ciMean(data, conf, knownSigma) {
    const n = data.length;
    const xbar = StatsDescriptive.mean(data);
    if (knownSigma != null) {
      const se = knownSigma / Math.sqrt(n);
      const z = this.zCrit(conf);
      return {
        type: 'z',
        n, xbar, sigma: knownSigma, se, crit: z, margin: z * se,
        low: xbar - z * se, high: xbar + z * se, conf,
        steps: [
          `n = ${n}, x̄ = ${Utils.fmt(xbar)}`,
          `Known σ = ${Utils.fmt(knownSigma)}`,
          `SE = σ/√n = ${Utils.fmt(se)}`,
          `z (${Utils.fmt(conf * 100, 1)}%) = ${Utils.fmt(z)}`,
          `Margin = z·SE = ${Utils.fmt(z * se)}`,
          `CI: [${Utils.fmt(xbar - z * se)}, ${Utils.fmt(xbar + z * se)}]`
        ]
      };
    }
    const s = StatsDescriptive.stddev(data, false);
    const se = s / Math.sqrt(n);
    const df = n - 1;
    const t = this.tCrit(conf, df);
    return {
      type: 't', n, xbar, s, se, df, crit: t, margin: t * se,
      low: xbar - t * se, high: xbar + t * se, conf,
      steps: [
        `n = ${n}, x̄ = ${Utils.fmt(xbar)}, s = ${Utils.fmt(s)}`,
        `SE = s/√n = ${Utils.fmt(se)}`,
        `df = n−1 = ${df}, t critical = ${Utils.fmt(t)}`,
        `Margin = t·SE = ${Utils.fmt(t * se)}`,
        `CI: [${Utils.fmt(xbar - t * se)}, ${Utils.fmt(xbar + t * se)}]`
      ]
    };
  },

  /* CI for a proportion */
  ciProportion(x, n, conf, method) {
    const p = x / n;
    const z = this.zCrit(conf);
    if (method === 'wilson') {
      // Wilson score interval
      const denom = 1 + z * z / n;
      const center = (p + z * z / (2 * n)) / denom;
      const halfWidth = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n) / denom;
      return {
        method: 'Wilson', n, x, p, crit: z,
        low: center - halfWidth, high: center + halfWidth, conf,
        steps: [
          `p̂ = x/n = ${Utils.fmt(p)}; z = ${Utils.fmt(z)}`,
          `Center = (p̂ + z²/(2n)) / (1 + z²/n) = ${Utils.fmt(center)}`,
          `Half-width = z·√((p̂(1−p̂)+z²/(4n))/n) / (1+z²/n) = ${Utils.fmt(halfWidth)}`,
          `CI: [${Utils.fmt(center - halfWidth)}, ${Utils.fmt(center + halfWidth)}]`
        ]
      };
    }
    // Wald (normal approximation)
    const se = Math.sqrt(p * (1 - p) / n);
    return {
      method: 'Wald', n, x, p, se, crit: z, margin: z * se,
      low: p - z * se, high: p + z * se, conf,
      steps: [
        `p̂ = ${Utils.fmt(p)}; SE = √(p̂(1−p̂)/n) = ${Utils.fmt(se)}`,
        `z (${Utils.fmt(conf * 100, 1)}%) = ${Utils.fmt(z)}`,
        `CI: p̂ ± z·SE = [${Utils.fmt(p - z * se)}, ${Utils.fmt(p + z * se)}]`,
        `Note: Wilson interval recommended for small n or extreme p.`
      ]
    };
  },

  /* CI for SD using chi-square */
  ciStdDev(data, conf) {
    const n = data.length;
    const s2 = StatsDescriptive.variance(data, false);
    const s = Math.sqrt(s2);
    const df = n - 1;
    const alpha = 1 - conf;
    const chiHi = Distributions.criticalChiSquare(alpha / 2, df);
    const chiLo = Distributions.criticalChiSquare(1 - alpha / 2, df);
    const varLow = (df * s2) / chiHi;
    const varHigh = (df * s2) / chiLo;
    return {
      n, s, s2, df, conf,
      varLow, varHigh, sdLow: Math.sqrt(varLow), sdHigh: Math.sqrt(varHigh),
      steps: [
        `n = ${n}, s = ${Utils.fmt(s)}, df = ${df}`,
        `χ²_{α/2, df} = ${Utils.fmt(chiHi)}`,
        `χ²_{1−α/2, df} = ${Utils.fmt(chiLo)}`,
        `Variance CI: [(df·s²)/χ²_{α/2}, (df·s²)/χ²_{1−α/2}] = [${Utils.fmt(varLow)}, ${Utils.fmt(varHigh)}]`,
        `SD CI: [${Utils.fmt(Math.sqrt(varLow))}, ${Utils.fmt(Math.sqrt(varHigh))}]`
      ]
    };
  },

  /* CI for correlation r using Fisher z-transform */
  ciCorrelation(r, n, conf) {
    if (Math.abs(r) >= 1) return { error: '|r| must be < 1' };
    const z = this.zCrit(conf);
    const zr = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const lowZ = zr - z * se, highZ = zr + z * se;
    const low = (Math.exp(2 * lowZ) - 1) / (Math.exp(2 * lowZ) + 1);
    const high = (Math.exp(2 * highZ) - 1) / (Math.exp(2 * highZ) + 1);
    return {
      r, n, conf, zr, se, crit: z, low, high,
      steps: [
        `Fisher z = ½ ln((1+r)/(1−r)) = ${Utils.fmt(zr)}`,
        `SE(z) = 1/√(n−3) = ${Utils.fmt(se)}`,
        `z critical = ${Utils.fmt(z)}`,
        `z CI: [${Utils.fmt(lowZ)}, ${Utils.fmt(highZ)}]`,
        `Back-transform → r CI: [${Utils.fmt(low)}, ${Utils.fmt(high)}]`
      ]
    };
  },

  /* CI for difference of two means (independent samples, Welch) */
  ciDiffMeans(d1, d2, conf) {
    const n1 = d1.length, n2 = d2.length;
    const m1 = StatsDescriptive.mean(d1), m2 = StatsDescriptive.mean(d2);
    const v1 = StatsDescriptive.variance(d1, false), v2 = StatsDescriptive.variance(d2, false);
    const se = Math.sqrt(v1 / n1 + v2 / n2);
    const dfNum = (v1 / n1 + v2 / n2) ** 2;
    const dfDen = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
    const df = dfNum / dfDen;
    const t = this.tCrit(conf, df);
    const diff = m1 - m2;
    return {
      n1, n2, m1, m2, diff, se, df, crit: t, conf,
      low: diff - t * se, high: diff + t * se,
      steps: [
        `m₁ = ${Utils.fmt(m1)}, m₂ = ${Utils.fmt(m2)}, diff = ${Utils.fmt(diff)}`,
        `SE = √(s₁²/n₁ + s₂²/n₂) = ${Utils.fmt(se)}`,
        `Welch df = ${Utils.fmt(df, 2)}, t critical = ${Utils.fmt(t)}`,
        `CI: diff ± t·SE = [${Utils.fmt(diff - t * se)}, ${Utils.fmt(diff + t * se)}]`
      ]
    };
  },

  /* CI for difference of two proportions (Wald) */
  ciDiffProportions(x1, n1, x2, n2, conf) {
    const p1 = x1 / n1, p2 = x2 / n2;
    const diff = p1 - p2;
    const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    const z = this.zCrit(conf);
    return {
      n1, n2, x1, x2, p1, p2, diff, se, crit: z, conf,
      low: diff - z * se, high: diff + z * se,
      steps: [
        `p̂₁ = ${Utils.fmt(p1)}, p̂₂ = ${Utils.fmt(p2)}, diff = ${Utils.fmt(diff)}`,
        `SE = √(p̂₁(1−p̂₁)/n₁ + p̂₂(1−p̂₂)/n₂) = ${Utils.fmt(se)}`,
        `z = ${Utils.fmt(z)}`,
        `CI: diff ± z·SE = [${Utils.fmt(diff - z * se)}, ${Utils.fmt(diff + z * se)}]`
      ]
    };
  },

  /* Margin of error calculator: for a mean (z-based) or proportion */
  marginOfError(kind, params) {
    const z = this.zCrit(params.conf);
    if (kind === 'mean') {
      const me = z * params.sigma / Math.sqrt(params.n);
      const nNeeded = Math.ceil(((z * params.sigma) / params.targetMargin) ** 2);
      return {
        kind: 'Mean (σ known)', z, n: params.n, sigma: params.sigma,
        margin: me, nForTarget: nNeeded, targetMargin: params.targetMargin, conf: params.conf,
        steps: [
          `Margin = z·σ/√n = ${Utils.fmt(z)}·${Utils.fmt(params.sigma)}/√${params.n} = ${Utils.fmt(me)}`,
          `For margin ≤ ${params.targetMargin}, n ≥ ((z·σ)/margin)² = ${nNeeded}`
        ]
      };
    }
    // proportion
    const p = params.p != null ? params.p : 0.5;
    const me = z * Math.sqrt(p * (1 - p) / params.n);
    const nNeeded = Math.ceil(p * (1 - p) * (z / params.targetMargin) ** 2);
    return {
      kind: 'Proportion', z, n: params.n, p, conf: params.conf,
      margin: me, nForTarget: nNeeded, targetMargin: params.targetMargin,
      steps: [
        `Margin = z·√(p(1−p)/n) = ${Utils.fmt(me)}`,
        `For margin ≤ ${params.targetMargin}, n ≥ p(1−p)·(z/margin)² = ${nNeeded}`,
        `p = 0.5 gives the most conservative (worst-case) n.`
      ]
    };
  }
};
