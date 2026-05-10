/* ===== BAYESIAN INFERENCE & PARAMETER ESTIMATION ===== */

window.StatsBayesian = {

  /* Bayes' Theorem: P(H|E) = P(E|H) P(H) / P(E)
     With P(E) = P(E|H)P(H) + P(E|¬H)P(¬H) */
  bayesTheorem(prior, likelihood, falsePositive) {
    const pH = prior, pNotH = 1 - prior;
    const pE = likelihood * pH + falsePositive * pNotH;
    if (pE === 0) return { error: 'P(E) = 0; cannot compute' };
    const posterior = (likelihood * pH) / pE;
    return {
      prior: pH, likelihood, falsePositive,
      pE, posterior,
      bayesFactor: likelihood / falsePositive,
      steps: [
        `P(H) = ${Utils.fmt(pH)} (prior)`,
        `P(E|H) = ${Utils.fmt(likelihood)} (true positive rate)`,
        `P(E|¬H) = ${Utils.fmt(falsePositive)} (false positive rate)`,
        `P(E) = P(E|H)P(H) + P(E|¬H)P(¬H) = ${Utils.fmt(pE)}`,
        `P(H|E) = P(E|H)P(H) / P(E) = ${Utils.fmt(posterior)}`,
        `Bayes Factor = P(E|H)/P(E|¬H) = ${Utils.fmt(likelihood / falsePositive)}`
      ]
    };
  },

  /* Beta-Binomial conjugate: prior Beta(α, β); after k successes in n trials, posterior is Beta(α+k, β+n−k) */
  betaBinomialPosterior(alpha, beta, k, n) {
    const aPost = alpha + k, bPost = beta + (n - k);
    const priorMean = alpha / (alpha + beta);
    const postMean = aPost / (aPost + bPost);
    const postVar = (aPost * bPost) / (((aPost + bPost) ** 2) * (aPost + bPost + 1));
    const postSD = Math.sqrt(postVar);
    return {
      alpha, beta, k, n, aPost, bPost, priorMean, postMean, postSD,
      mle: k / n,
      steps: [
        `Prior: Beta(α=${alpha}, β=${beta}); prior mean = α/(α+β) = ${Utils.fmt(priorMean)}`,
        `Likelihood: ${k} successes in ${n} trials → MLE p̂ = ${Utils.fmt(k / n)}`,
        `Posterior: Beta(α+k, β+(n−k)) = Beta(${aPost}, ${bPost})`,
        `Posterior mean = ${Utils.fmt(postMean)}`,
        `Posterior SD = ${Utils.fmt(postSD)}`,
        `As n grows, the posterior concentrates around the MLE.`
      ]
    };
  },

  /* MLE for common single-parameter distributions */
  mle(distribution, data) {
    if (distribution === 'normal') {
      const m = StatsDescriptive.mean(data);
      const s2 = StatsDescriptive.variance(data, true); // MLE uses /n
      return {
        distribution: 'Normal',
        params: { 'μ̂': m, 'σ̂²': s2, 'σ̂': Math.sqrt(s2) },
        loglik: data.reduce((s, x) => s - 0.5 * Math.log(2 * Math.PI * s2) - ((x - m) ** 2) / (2 * s2), 0),
        steps: [
          `Normal MLE: μ̂ = sample mean = ${Utils.fmt(m)}`,
          `σ̂² = (1/n) Σ(xᵢ−μ̂)² = ${Utils.fmt(s2)}  (population variance, not n−1)`,
          `σ̂ = ${Utils.fmt(Math.sqrt(s2))}`
        ]
      };
    }
    if (distribution === 'exponential') {
      const m = StatsDescriptive.mean(data);
      const lambda = 1 / m;
      return {
        distribution: 'Exponential',
        params: { 'λ̂': lambda, '1/λ̂ (mean)': m },
        loglik: data.length * Math.log(lambda) - lambda * data.reduce((s, x) => s + x, 0),
        steps: [
          `Exponential MLE: λ̂ = 1 / x̄ = 1 / ${Utils.fmt(m)} = ${Utils.fmt(lambda)}`
        ]
      };
    }
    if (distribution === 'poisson') {
      const m = StatsDescriptive.mean(data);
      return {
        distribution: 'Poisson',
        params: { 'λ̂': m },
        loglik: data.reduce((s, x) => s + x * Math.log(m) - m - Distributions.lnGamma(x + 1), 0),
        steps: [`Poisson MLE: λ̂ = sample mean = ${Utils.fmt(m)}`]
      };
    }
    if (distribution === 'bernoulli') {
      const m = StatsDescriptive.mean(data); // proportion of 1s
      return {
        distribution: 'Bernoulli',
        params: { 'p̂': m },
        loglik: data.reduce((s, x) => s + x * Math.log(m || 1e-10) + (1 - x) * Math.log(1 - m || 1e-10), 0),
        steps: [`Bernoulli MLE: p̂ = mean of 0/1 outcomes = ${Utils.fmt(m)}`]
      };
    }
    return { error: 'Unknown distribution' };
  },

  /* MAP for Beta-Binomial (proportion) and Normal (with normal prior on mean) */
  map(model, data, prior) {
    if (model === 'beta-binomial') {
      const k = data.reduce((s, x) => s + x, 0);
      const n = data.length;
      const a = prior.alpha, b = prior.beta;
      const aPost = a + k, bPost = b + (n - k);
      // Mode of Beta(α, β) is (α−1)/(α+β−2) when α,β > 1
      const map = (aPost - 1) / (aPost + bPost - 2);
      const mle = k / n;
      return {
        model: 'Bernoulli with Beta prior',
        params: { 'p̂_MAP': map, 'p̂_MLE': mle, 'aPost': aPost, 'bPost': bPost },
        steps: [
          `Prior: Beta(α=${a}, β=${b})`,
          `Data: ${k}/${n} successes`,
          `Posterior: Beta(${aPost}, ${bPost})`,
          `MAP estimate (mode of posterior) = (α'−1)/(α'+β'−2) = ${Utils.fmt(map)}`,
          `Compare MLE = ${Utils.fmt(mle)} (no prior)`
        ]
      };
    }
    if (model === 'normal-known-var') {
      // Known variance σ², prior N(μ₀, τ²) on μ
      const sigma2 = prior.sigma2, mu0 = prior.mu0, tau2 = prior.tau2;
      const n = data.length, xbar = StatsDescriptive.mean(data);
      const postVar = 1 / (1 / tau2 + n / sigma2);
      const postMean = postVar * (mu0 / tau2 + n * xbar / sigma2);
      return {
        model: 'Normal mean (known σ²) with Normal prior',
        params: { 'μ̂_MAP': postMean, 'posterior var': postVar, 'μ̂_MLE': xbar },
        steps: [
          `Known σ² = ${Utils.fmt(sigma2)}`,
          `Prior: μ ~ N(μ₀=${mu0}, τ²=${tau2})`,
          `Sample mean x̄ = ${Utils.fmt(xbar)} (n = ${n})`,
          `Posterior variance = 1 / (1/τ² + n/σ²) = ${Utils.fmt(postVar)}`,
          `Posterior mean (= MAP since posterior is normal) = ${Utils.fmt(postMean)}`
        ]
      };
    }
    return { error: 'Unknown model' };
  }
};
