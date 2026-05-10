/* ===== SIMPLE LINEAR REGRESSION ===== */

window.StatsRegression = {
  linearRegression(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return null;

    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);
    const mx = StatsDescriptive.mean(xSlice);
    const my = StatsDescriptive.mean(ySlice);

    let sumXY = 0, sumX2 = 0, sumY2 = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      sumXY += (xSlice[i] - mx) * (ySlice[i] - my);
      sumX2 += (xSlice[i] - mx) ** 2;
      sumY2 += (ySlice[i] - my) ** 2;
    }

    if (sumX2 === 0) return null;

    const slope = sumXY / sumX2;
    const intercept = my - slope * mx;

    // R-squared
    for (let i = 0; i < n; i++) {
      const predicted = slope * xSlice[i] + intercept;
      ssRes += (ySlice[i] - predicted) ** 2;
    }
    const ssTot = sumY2;
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    // Standard error of slope
    const se = n > 2 ? Math.sqrt(ssRes / (n - 2) / sumX2) : NaN;

    // Format equation
    const sign = intercept >= 0 ? '+' : '-';
    const equation = `y = ${Utils.fmt(slope)}x ${sign} ${Utils.fmt(Math.abs(intercept))}`;

    const steps = [
      `n = ${n} data points`,
      `Mean of X (\u0078\u0304) = ${Utils.fmt(mx)}`,
      `Mean of Y (\u0079\u0304) = ${Utils.fmt(my)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)(y\u1D62 - \u0079\u0304) = ${Utils.fmt(sumXY)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)\u00B2 = ${Utils.fmt(sumX2)}`,
      `Slope (b\u2081) = ${Utils.fmt(sumXY)} / ${Utils.fmt(sumX2)} = ${Utils.fmt(slope)}`,
      `Intercept (b\u2080) = ${Utils.fmt(my)} - ${Utils.fmt(slope)} \u00D7 ${Utils.fmt(mx)} = ${Utils.fmt(intercept)}`,
      `Equation: ${equation}`,
      `SS_res = ${Utils.fmt(ssRes)}`,
      `SS_tot = ${Utils.fmt(ssTot)}`,
      `R\u00B2 = 1 - SS_res/SS_tot = 1 - ${Utils.fmt(ssRes)}/${Utils.fmt(ssTot)} = ${Utils.fmt(rSquared)}`,
      `Standard Error of Slope = ${Utils.fmt(se)}`
    ];

    return { slope, intercept, rSquared, equation, se, n, steps };
  },

  predict(model, xValue) {
    if (!model) return NaN;
    return model.slope * xValue + model.intercept;
  },

  /* ===== MATRIX HELPERS (small dense, OLS-scale) ===== */

  _transpose(M) {
    const r = M.length, c = M[0].length;
    const T = Array.from({ length: c }, () => new Array(r));
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = M[i][j];
    return T;
  },

  _mmul(A, B) {
    const r = A.length, c = B[0].length, k = B.length;
    const C = Array.from({ length: r }, () => new Array(c).fill(0));
    for (let i = 0; i < r; i++)
      for (let j = 0; j < c; j++) {
        let s = 0;
        for (let m = 0; m < k; m++) s += A[i][m] * B[m][j];
        C[i][j] = s;
      }
    return C;
  },

  _mvmul(M, v) {
    return M.map(row => row.reduce((s, x, i) => s + x * v[i], 0));
  },

  _inverse(M) {
    const n = M.length;
    const A = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0)]);
    for (let i = 0; i < n; i++) {
      // Partial pivot
      let piv = i;
      for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[piv][i])) piv = k;
      if (piv !== i) [A[i], A[piv]] = [A[piv], A[i]];
      const d = A[i][i];
      if (Math.abs(d) < 1e-12) return null;
      for (let j = 0; j < 2 * n; j++) A[i][j] /= d;
      for (let k = 0; k < n; k++) {
        if (k === i) continue;
        const f = A[k][i];
        if (f === 0) continue;
        for (let j = 0; j < 2 * n; j++) A[k][j] -= f * A[i][j];
      }
    }
    return A.map(row => row.slice(n));
  },

  /* ===== MULTIPLE LINEAR REGRESSION ===== */

  // X: array of arrays (each row = one observation, each col = one predictor).
  // Adds intercept automatically. Returns coefficients incl. intercept first.
  multipleLinearRegression(X, y, predictorNames) {
    const n = y.length;
    const p = X[0].length; // predictors excl. intercept
    if (n <= p + 1) return { error: `Need n > ${p + 1} observations` };
    // Design matrix with intercept column
    const Xd = X.map(row => [1, ...row]);
    const Xt = this._transpose(Xd);
    const XtX = this._mmul(Xt, Xd);
    const XtXinv = this._inverse(XtX);
    if (!XtXinv) return { error: 'Singular matrix; check for collinear predictors' };
    const Xty = this._mvmul(Xt, y);
    const beta = this._mvmul(XtXinv, Xty);

    const yHat = Xd.map(row => row.reduce((s, x, i) => s + x * beta[i], 0));
    const yMean = y.reduce((s, v) => s + v, 0) / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      ssRes += (y[i] - yHat[i]) ** 2;
      ssTot += (y[i] - yMean) ** 2;
    }
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    const dfRes = n - p - 1;
    const adjR2 = 1 - (1 - rSquared) * (n - 1) / dfRes;
    const mse = ssRes / dfRes;
    const seCoef = beta.map((_, i) => Math.sqrt(mse * XtXinv[i][i]));
    const tStats = beta.map((b, i) => b / seCoef[i]);
    const pValues = tStats.map(t => Distributions.pFromT(t, dfRes, 2));

    // Overall F-test
    const msReg = (ssTot - ssRes) / p;
    const F = msReg / mse;
    const fP = Distributions.pFromF(F, p, dfRes);

    const names = ['Intercept', ...(predictorNames || beta.slice(1).map((_, i) => `X${i + 1}`))];
    const coefTable = beta.map((b, i) => ({
      name: names[i], coef: b, se: seCoef[i], t: tStats[i], p: pValues[i]
    }));

    let eq = `y = ${Utils.fmt(beta[0])}`;
    for (let i = 1; i < beta.length; i++) {
      eq += ` ${beta[i] >= 0 ? '+' : '-'} ${Utils.fmt(Math.abs(beta[i]))}·${names[i]}`;
    }

    const steps = [
      `n = ${n}, p = ${p} predictors`,
      `Design matrix has intercept + ${p} predictor column(s)`,
      `β = (XᵀX)⁻¹Xᵀy`,
      `Coefficients: ${beta.map((b, i) => `${names[i]}=${Utils.fmt(b)}`).join(', ')}`,
      `SS_res = ${Utils.fmt(ssRes)}, SS_tot = ${Utils.fmt(ssTot)}`,
      `R² = ${Utils.fmt(rSquared)}, Adjusted R² = ${Utils.fmt(adjR2)}`,
      `F(${p}, ${dfRes}) = ${Utils.fmt(F)}, p = ${Utils.pFmt(fP)}`,
      `Equation: ${eq}`
    ];

    return {
      type: 'multiple', n, p, beta, coefTable, equation: eq,
      rSquared, adjR2, ssRes, ssTot, F, fP, dfRes, mse,
      yHat, steps
    };
  },

  /* ===== EXPONENTIAL REGRESSION (y = a · e^(b·x)) ===== */

  exponentialRegression(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return { error: 'Need at least 2 points' };
    if (y.some(v => v <= 0)) return { error: 'All Y values must be positive (taking log)' };
    const lnY = y.slice(0, n).map(v => Math.log(v));
    const lin = this.linearRegression(x.slice(0, n), lnY);
    if (!lin) return { error: 'Failed to fit' };
    const b = lin.slope;
    const a = Math.exp(lin.intercept);
    // R² in original (non-log) space
    const yMean = y.slice(0, n).reduce((s, v) => s + v, 0) / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const yhat = a * Math.exp(b * x[i]);
      ssRes += (y[i] - yhat) ** 2;
      ssTot += (y[i] - yMean) ** 2;
    }
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    const equation = `y = ${Utils.fmt(a)} · e^(${Utils.fmt(b)}·x)`;
    const steps = [
      `Transform: ln(y) = ln(a) + b·x`,
      `Fit linear regression on (x, ln y):`,
      `  slope (= b) = ${Utils.fmt(b)}`,
      `  intercept (= ln a) = ${Utils.fmt(lin.intercept)}`,
      `Recover a = e^intercept = ${Utils.fmt(a)}`,
      `Equation: ${equation}`,
      `R² (original space) = ${Utils.fmt(rSquared)}`
    ];
    return { type: 'exponential', a, b, equation, rSquared, n, steps,
             curveFn: (xv) => a * Math.exp(b * xv) };
  },

  /* ===== QUADRATIC REGRESSION (y = β0 + β1·x + β2·x²) ===== */

  quadraticRegression(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 3) return { error: 'Need at least 3 points' };
    const X = [];
    for (let i = 0; i < n; i++) X.push([x[i], x[i] * x[i]]);
    const result = this.multipleLinearRegression(X, y.slice(0, n), ['x', 'x²']);
    if (result.error) return result;
    const [b0, b1, b2] = result.beta;
    const equation = `y = ${Utils.fmt(b0)} ${b1 >= 0 ? '+' : '-'} ${Utils.fmt(Math.abs(b1))}x ${b2 >= 0 ? '+' : '-'} ${Utils.fmt(Math.abs(b2))}x²`;
    return {
      ...result,
      type: 'quadratic',
      equation,
      curveFn: (xv) => b0 + b1 * xv + b2 * xv * xv,
      steps: [
        `Quadratic fit: y = β₀ + β₁x + β₂x²`,
        ...result.steps,
        `Equation: ${equation}`
      ]
    };
  },

  /* ===== LOGISTIC REGRESSION (binary, IRLS) ===== */

  logisticRegression(X, y, predictorNames) {
    const n = y.length;
    if (!y.every(v => v === 0 || v === 1)) {
      return { error: 'Y must be binary (0 or 1)' };
    }
    const p = X[0].length;
    const Xd = X.map(row => [1, ...row]); // intercept
    let beta = new Array(p + 1).fill(0);

    const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));

    let converged = false;
    let iter = 0;
    const maxIter = 50;

    for (iter = 0; iter < maxIter; iter++) {
      const eta = Xd.map(row => row.reduce((s, x, i) => s + x * beta[i], 0));
      const probs = eta.map(sigmoid);
      const W = probs.map(pr => pr * (1 - pr));
      // X^T W X
      const XtWX = Array.from({ length: p + 1 }, () => new Array(p + 1).fill(0));
      const XtWz = new Array(p + 1).fill(0);
      for (let i = 0; i < n; i++) {
        const wi = W[i];
        const zi = eta[i] + (wi > 1e-10 ? (y[i] - probs[i]) / wi : 0);
        for (let r = 0; r < p + 1; r++) {
          XtWz[r] += Xd[i][r] * wi * zi;
          for (let c = 0; c < p + 1; c++) {
            XtWX[r][c] += Xd[i][r] * wi * Xd[i][c];
          }
        }
      }
      const inv = this._inverse(XtWX);
      if (!inv) return { error: 'Hessian singular; cannot fit' };
      const newBeta = this._mvmul(inv, XtWz);
      const change = newBeta.reduce((s, b, i) => s + Math.abs(b - beta[i]), 0);
      beta = newBeta;
      if (change < 1e-7) { converged = true; break; }
    }

    // Final probabilities & log-likelihood
    const eta = Xd.map(row => row.reduce((s, x, i) => s + x * beta[i], 0));
    const probs = eta.map(sigmoid);
    let ll = 0;
    for (let i = 0; i < n; i++) {
      const eps = 1e-15;
      const pi = Math.max(eps, Math.min(1 - eps, probs[i]));
      ll += y[i] * Math.log(pi) + (1 - y[i]) * Math.log(1 - pi);
    }

    // Null model log-likelihood
    const yBar = y.reduce((s, v) => s + v, 0) / n;
    const llNull = n * (yBar * Math.log(Math.max(1e-15, yBar)) + (1 - yBar) * Math.log(Math.max(1e-15, 1 - yBar)));
    const pseudoR2 = 1 - ll / llNull; // McFadden's

    // Standard errors from final Hessian inverse
    const Wfinal = probs.map(pr => pr * (1 - pr));
    const XtWXfinal = Array.from({ length: p + 1 }, () => new Array(p + 1).fill(0));
    for (let i = 0; i < n; i++) {
      for (let r = 0; r < p + 1; r++)
        for (let c = 0; c < p + 1; c++)
          XtWXfinal[r][c] += Xd[i][r] * Wfinal[i] * Xd[i][c];
    }
    const cov = this._inverse(XtWXfinal);
    const seCoef = beta.map((_, i) => cov ? Math.sqrt(Math.abs(cov[i][i])) : NaN);
    const zStats = beta.map((b, i) => b / seCoef[i]);
    const pValues = zStats.map(z => Distributions.pFromZ(z, 2));

    // Classification accuracy at 0.5 threshold
    const preds = probs.map(p => p >= 0.5 ? 1 : 0);
    const correct = preds.reduce((s, p, i) => s + (p === y[i] ? 1 : 0), 0);
    const accuracy = correct / n;

    const names = ['Intercept', ...(predictorNames || beta.slice(1).map((_, i) => `X${i + 1}`))];
    const coefTable = beta.map((b, i) => ({
      name: names[i], coef: b, se: seCoef[i], z: zStats[i], p: pValues[i],
      oddsRatio: i === 0 ? null : Math.exp(b)
    }));

    let eq = `logit(p) = ${Utils.fmt(beta[0])}`;
    for (let i = 1; i < beta.length; i++) {
      eq += ` ${beta[i] >= 0 ? '+' : '-'} ${Utils.fmt(Math.abs(beta[i]))}·${names[i]}`;
    }

    const steps = [
      `Binary logistic regression via IRLS (Newton-Raphson)`,
      `n = ${n}, predictors = ${p}`,
      `Converged in ${iter + 1} iterations: ${converged}`,
      `Coefficients: ${beta.map((b, i) => `${names[i]}=${Utils.fmt(b)}`).join(', ')}`,
      `Log-likelihood = ${Utils.fmt(ll)}, Null LL = ${Utils.fmt(llNull)}`,
      `McFadden's pseudo-R² = ${Utils.fmt(pseudoR2)}`,
      `Classification accuracy (threshold 0.5) = ${Utils.fmt(accuracy * 100, 1)}%`,
      `Equation: ${eq}`
    ];

    return {
      type: 'logistic', n, p, beta, coefTable, equation: eq,
      probs, preds, accuracy, ll, llNull, pseudoR2, converged, iterations: iter + 1,
      steps,
      curveFn: p === 1 ? (xv) => sigmoid(beta[0] + beta[1] * xv) : null
    };
  }
};
