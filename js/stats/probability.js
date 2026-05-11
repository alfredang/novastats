/* ===== PROBABILITY DISTRIBUTIONS ===== */
/* Each distribution: { discrete, params: [{id,label,default,min?}], pdf(x,p), cdf(x,p), mean(p), variance(p), quantile?(q,p), support?(p) } */

window.StatsProbability = {

  // Basic probability calculator
  basicProb({ pA, pB, pAB, pBgivenA }) {
    const out = {};
    if (pA != null) out['P(A)'] = pA;
    if (pB != null) out['P(B)'] = pB;
    if (pA != null) out['P(¬A)'] = 1 - pA;
    if (pA != null && pB != null && pAB != null) {
      out['P(A∪B)'] = pA + pB - pAB;
      if (pB > 0) out['P(A|B)'] = pAB / pB;
      if (pA > 0) out['P(B|A)'] = pAB / pA;
      out['Independent?'] = Math.abs(pAB - pA * pB) < 1e-9 ? 'Yes' : 'No';
    } else if (pA != null && pB != null && pBgivenA != null) {
      // Multiplication rule
      out['P(A∩B)'] = pA * pBgivenA;
      out['P(A∪B)'] = pA + pB - (pA * pBgivenA);
    }
    return out;
  },

  /* ===== DISCRETE DISTRIBUTIONS ===== */

  binomial: {
    discrete: true,
    params: [
      { id: 'n', label: 'n (trials)', default: 10, min: 1, step: 1 },
      { id: 'p', label: 'p (success prob)', default: 0.5, min: 0, max: 1, step: 0.01 }
    ],
    pdf(k, { n, p }) {
      if (k < 0 || k > n || k !== Math.floor(k)) return 0;
      const logC = Distributions.lnGamma(n + 1) - Distributions.lnGamma(k + 1) - Distributions.lnGamma(n - k + 1);
      return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
    },
    cdf(k, p) {
      let s = 0;
      for (let i = 0; i <= Math.floor(k); i++) s += this.pdf(i, p);
      return s;
    },
    mean({ n, p }) { return n * p; },
    variance({ n, p }) { return n * p * (1 - p); }
  },

  negativeBinomial: {
    discrete: true,
    params: [
      { id: 'r', label: 'r (target successes)', default: 5, min: 1, step: 1 },
      { id: 'p', label: 'p (success prob)', default: 0.5, min: 0.001, max: 1, step: 0.01 }
    ],
    // P(X = k) = number of failures before r-th success. k ≥ 0.
    pdf(k, { r, p }) {
      if (k < 0 || k !== Math.floor(k)) return 0;
      const logC = Distributions.lnGamma(k + r) - Distributions.lnGamma(k + 1) - Distributions.lnGamma(r);
      return Math.exp(logC + r * Math.log(p) + k * Math.log(1 - p));
    },
    cdf(k, p) {
      let s = 0;
      for (let i = 0; i <= Math.floor(k); i++) s += this.pdf(i, p);
      return s;
    },
    mean({ r, p }) { return r * (1 - p) / p; },
    variance({ r, p }) { return r * (1 - p) / (p * p); }
  },

  poisson: {
    discrete: true,
    params: [{ id: 'lambda', label: 'λ (rate)', default: 3, min: 0.001, step: 0.1 }],
    pdf(k, { lambda }) {
      if (k < 0 || k !== Math.floor(k)) return 0;
      return Math.exp(k * Math.log(lambda) - lambda - Distributions.lnGamma(k + 1));
    },
    cdf(k, { lambda }) {
      let s = 0;
      for (let i = 0; i <= Math.floor(k); i++) s += this.pdf(i, { lambda });
      return s;
    },
    mean({ lambda }) { return lambda; },
    variance({ lambda }) { return lambda; }
  },

  geometric: {
    discrete: true,
    params: [{ id: 'p', label: 'p (success prob)', default: 0.5, min: 0.001, max: 1, step: 0.01 }],
    // X = number of failures before first success, k ≥ 0
    pdf(k, { p }) {
      if (k < 0 || k !== Math.floor(k)) return 0;
      return p * Math.pow(1 - p, k);
    },
    cdf(k, { p }) {
      if (k < 0) return 0;
      return 1 - Math.pow(1 - p, Math.floor(k) + 1);
    },
    mean({ p }) { return (1 - p) / p; },
    variance({ p }) { return (1 - p) / (p * p); }
  },

  hypergeometric: {
    discrete: true,
    params: [
      { id: 'N', label: 'N (population)', default: 50, min: 1, step: 1 },
      { id: 'K', label: 'K (successes in pop)', default: 20, min: 0, step: 1 },
      { id: 'n', label: 'n (sample size)', default: 10, min: 1, step: 1 }
    ],
    pdf(k, { N, K, n }) {
      if (k < Math.max(0, n - (N - K)) || k > Math.min(n, K) || k !== Math.floor(k)) return 0;
      const logC = (a, b) => Distributions.lnGamma(a + 1) - Distributions.lnGamma(b + 1) - Distributions.lnGamma(a - b + 1);
      return Math.exp(logC(K, k) + logC(N - K, n - k) - logC(N, n));
    },
    cdf(k, p) {
      let s = 0;
      const lo = Math.max(0, p.n - (p.N - p.K));
      for (let i = lo; i <= Math.floor(k); i++) s += this.pdf(i, p);
      return s;
    },
    mean({ N, K, n }) { return n * K / N; },
    variance({ N, K, n }) { return n * (K / N) * ((N - K) / N) * ((N - n) / (N - 1)); }
  },

  /* ===== CONTINUOUS DISTRIBUTIONS ===== */

  normal: {
    discrete: false,
    params: [
      { id: 'mu', label: 'μ (mean)', default: 0, step: 0.1 },
      { id: 'sigma', label: 'σ (sd)', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, { mu, sigma }) {
      const z = (x - mu) / sigma;
      return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
    },
    cdf(x, { mu, sigma }) { return Distributions.normalCDF((x - mu) / sigma); },
    quantile(q, { mu, sigma }) { return mu + sigma * Distributions.normalInv(q); },
    mean: ({ mu }) => mu, variance: ({ sigma }) => sigma * sigma
  },

  logNormal: {
    discrete: false,
    params: [
      { id: 'mu', label: 'μ (log mean)', default: 0, step: 0.1 },
      { id: 'sigma', label: 'σ (log sd)', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, { mu, sigma }) {
      if (x <= 0) return 0;
      const z = (Math.log(x) - mu) / sigma;
      return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));
    },
    cdf(x, { mu, sigma }) {
      if (x <= 0) return 0;
      return Distributions.normalCDF((Math.log(x) - mu) / sigma);
    },
    quantile(q, { mu, sigma }) { return Math.exp(mu + sigma * Distributions.normalInv(q)); },
    mean({ mu, sigma }) { return Math.exp(mu + sigma * sigma / 2); },
    variance({ mu, sigma }) { const e = Math.exp(sigma * sigma); return (e - 1) * Math.exp(2 * mu + sigma * sigma); }
  },

  logistic: {
    discrete: false,
    params: [
      { id: 'mu', label: 'μ (location)', default: 0, step: 0.1 },
      { id: 's', label: 's (scale)', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, { mu, s }) {
      const z = Math.exp(-(x - mu) / s);
      return z / (s * (1 + z) ** 2);
    },
    cdf(x, { mu, s }) { return 1 / (1 + Math.exp(-(x - mu) / s)); },
    quantile(q, { mu, s }) { return mu + s * Math.log(q / (1 - q)); },
    mean: ({ mu }) => mu, variance: ({ s }) => (s * s * Math.PI * Math.PI) / 3
  },

  studentT: {
    discrete: false,
    params: [{ id: 'df', label: 'df', default: 10, min: 1, step: 1 }],
    pdf(x, { df }) {
      const c = Math.exp(Distributions.lnGamma((df + 1) / 2) - Distributions.lnGamma(df / 2)) / Math.sqrt(df * Math.PI);
      return c * Math.pow(1 + x * x / df, -(df + 1) / 2);
    },
    cdf(x, { df }) { return Distributions.tCDF(x, df); },
    quantile(q, { df }) {
      // bisection
      let lo = -100, hi = 100;
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        if (this.cdf(mid, { df }) < q) lo = mid; else hi = mid;
        if (hi - lo < 1e-8) break;
      }
      return (lo + hi) / 2;
    },
    mean: () => 0, variance: ({ df }) => df > 2 ? df / (df - 2) : NaN
  },

  exponential: {
    discrete: false,
    params: [{ id: 'lambda', label: 'λ (rate)', default: 1, min: 0.001, step: 0.1 }],
    pdf(x, { lambda }) { return x < 0 ? 0 : lambda * Math.exp(-lambda * x); },
    cdf(x, { lambda }) { return x < 0 ? 0 : 1 - Math.exp(-lambda * x); },
    quantile(q, { lambda }) { return -Math.log(1 - q) / lambda; },
    mean: ({ lambda }) => 1 / lambda, variance: ({ lambda }) => 1 / (lambda * lambda)
  },

  uniform: {
    discrete: false,
    params: [
      { id: 'a', label: 'a (min)', default: 0, step: 0.1 },
      { id: 'b', label: 'b (max)', default: 1, step: 0.1 }
    ],
    pdf(x, { a, b }) { return x >= a && x <= b ? 1 / (b - a) : 0; },
    cdf(x, { a, b }) {
      if (x < a) return 0;
      if (x > b) return 1;
      return (x - a) / (b - a);
    },
    quantile(q, { a, b }) { return a + q * (b - a); },
    mean: ({ a, b }) => (a + b) / 2, variance: ({ a, b }) => (b - a) ** 2 / 12
  },

  gamma: {
    discrete: false,
    params: [
      { id: 'alpha', label: 'α (shape)', default: 2, min: 0.001, step: 0.1 },
      { id: 'beta', label: 'β (scale)', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, { alpha, beta }) {
      if (x < 0) return 0;
      return Math.exp((alpha - 1) * Math.log(x) - x / beta - alpha * Math.log(beta) - Distributions.lnGamma(alpha));
    },
    cdf(x, { alpha, beta }) { return x < 0 ? 0 : Distributions.gammainc(alpha, x / beta); },
    mean: ({ alpha, beta }) => alpha * beta, variance: ({ alpha, beta }) => alpha * beta * beta
  },

  beta: {
    discrete: false,
    params: [
      { id: 'alpha', label: 'α', default: 2, min: 0.001, step: 0.1 },
      { id: 'beta', label: 'β', default: 2, min: 0.001, step: 0.1 }
    ],
    pdf(x, { alpha, beta }) {
      if (x <= 0 || x >= 1) return 0;
      const lnBeta = Distributions.lnGamma(alpha) + Distributions.lnGamma(beta) - Distributions.lnGamma(alpha + beta);
      return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - lnBeta);
    },
    cdf(x, { alpha, beta }) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      return Distributions.betainc(x, alpha, beta);
    },
    mean: ({ alpha, beta }) => alpha / (alpha + beta),
    variance: ({ alpha, beta }) => (alpha * beta) / (((alpha + beta) ** 2) * (alpha + beta + 1))
  },

  chiSquare: {
    discrete: false,
    params: [{ id: 'df', label: 'df', default: 5, min: 1, step: 1 }],
    pdf(x, { df }) {
      if (x < 0) return 0;
      return Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - Distributions.lnGamma(df / 2));
    },
    cdf(x, { df }) { return Distributions.chiSquareCDF(x, df); },
    quantile(q, { df }) { return Distributions.criticalChiSquare(1 - q, df); },
    mean: ({ df }) => df, variance: ({ df }) => 2 * df
  },

  fDist: {
    discrete: false,
    params: [
      { id: 'df1', label: 'df₁', default: 5, min: 1, step: 1 },
      { id: 'df2', label: 'df₂', default: 10, min: 1, step: 1 }
    ],
    pdf(x, { df1, df2 }) {
      if (x <= 0) return 0;
      const c = Distributions.lnGamma((df1 + df2) / 2) - Distributions.lnGamma(df1 / 2) - Distributions.lnGamma(df2 / 2);
      const ln = c + (df1 / 2) * Math.log(df1 / df2) + (df1 / 2 - 1) * Math.log(x) - ((df1 + df2) / 2) * Math.log(1 + df1 * x / df2);
      return Math.exp(ln);
    },
    cdf(x, { df1, df2 }) { return Distributions.fCDF(x, df1, df2); },
    quantile(q, { df1, df2 }) { return Distributions.criticalF(1 - q, df1, df2); },
    mean: ({ df2 }) => df2 > 2 ? df2 / (df2 - 2) : NaN,
    variance: ({ df1, df2 }) => df2 > 4 ? (2 * df2 * df2 * (df1 + df2 - 2)) / (df1 * (df2 - 2) ** 2 * (df2 - 4)) : NaN
  },

  weibull: {
    discrete: false,
    params: [
      { id: 'k', label: 'k (shape)', default: 1.5, min: 0.001, step: 0.1 },
      { id: 'lambda', label: 'λ (scale)', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, { k, lambda }) {
      if (x < 0) return 0;
      return (k / lambda) * Math.pow(x / lambda, k - 1) * Math.exp(-Math.pow(x / lambda, k));
    },
    cdf(x, { k, lambda }) { return x < 0 ? 0 : 1 - Math.exp(-Math.pow(x / lambda, k)); },
    quantile(q, { k, lambda }) { return lambda * Math.pow(-Math.log(1 - q), 1 / k); },
    mean({ k, lambda }) { return lambda * Math.exp(Distributions.lnGamma(1 + 1 / k)); },
    variance({ k, lambda }) {
      const g1 = Math.exp(Distributions.lnGamma(1 + 1 / k));
      const g2 = Math.exp(Distributions.lnGamma(1 + 2 / k));
      return lambda * lambda * (g2 - g1 * g1);
    }
  },

  inverseNormal: {
    // Pure inverse-CDF utility: given a probability, compute the corresponding z (or X for μ, σ).
    discrete: false,
    params: [
      { id: 'mu', label: 'μ', default: 0, step: 0.1 },
      { id: 'sigma', label: 'σ', default: 1, min: 0.001, step: 0.1 }
    ],
    pdf(x, p) { return this._normal('pdf', x, p); },
    cdf(x, p) { return this._normal('cdf', x, p); },
    quantile(q, { mu, sigma }) { return mu + sigma * Distributions.normalInv(q); },
    mean: ({ mu }) => mu, variance: ({ sigma }) => sigma * sigma,
    _normal(fn, x, { mu, sigma }) {
      return fn === 'pdf'
        ? Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
        : Distributions.normalCDF((x - mu) / sigma);
    }
  }
};
