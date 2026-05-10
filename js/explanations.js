/* ===== TEST EXPLANATIONS ===== */
/* Keyed by toolId. Each entry: { title, definition, formula, interpretation[], considerations[] } */

window.Explanations = {

  /* --- DESCRIPTIVE: COMPREHENSIVE --- */
  'all': {
    title: 'Comprehensive Descriptive Statistics',
    intro: 'This Comprehensive Descriptive Statistics calculator gives you a complete numerical snapshot of one variable in a single click — central tendency, spread, position, and shape. Use it as your default first look at any new dataset before deciding which more focused tools to apply.',
    definition: 'A complete numerical summary of a single variable: central tendency (mean, median, mode), dispersion (variance, SD, range, IQR), and shape (skewness, kurtosis).',
    interpretation: [
      'Use the mean & median together — large gaps suggest skew.',
      'SD shows typical distance from the mean; IQR is robust to outliers.',
      'Skewness and kurtosis describe asymmetry and tail-weight.'
    ],
    considerations: [
      'Mean is sensitive to outliers; prefer median for skewed data.',
      'Use sample SD (n−1) for inference, population SD (n) only when you have the entire population.'
    ]
  },

  /* --- DESCRIPTIVE: CENTRAL TENDENCY --- */
  'mean-median-mode': {
    title: 'Mean, Median, Mode',
    intro: 'This Mean, Median, Mode calculator reports the three classic measures of the \'center\' of a dataset. Use it when you need a quick summary of where typical values sit and to detect skew by comparing how the three measures relate.',
    definition: 'Three measures of the "center" of a dataset.',
    formula: 'Mean = Σxᵢ / n &nbsp;·&nbsp; Median = middle value of sorted data &nbsp;·&nbsp; Mode = most frequent value',
    interpretation: [
      'Mean ≈ Median → roughly symmetric.',
      'Mean > Median → right (positive) skew.',
      'Mean < Median → left (negative) skew.'
    ],
    considerations: [
      'Mean is best for symmetric, outlier-free data.',
      'Median is robust to outliers and ordinal data.',
      'Mode applies to categorical and discrete data; can be multimodal or absent.'
    ]
  },
  'geometric': {
    title: 'Geometric Mean',
    intro: 'This Geometric Mean calculator is designed for averaging multiplicative quantities like growth rates, ratios, and investment returns. For example, use it to compute the average annual return across several years where compounding matters.',
    definition: 'The n-th root of the product of n positive numbers. Used for averaging rates, ratios, or growth factors.',
    formula: 'GM = ⁿ√(x₁·x₂·…·xₙ) = exp(mean(ln xᵢ))',
    interpretation: [
      'Always ≤ arithmetic mean (equality only when all values equal).',
      'For multiplicative processes (compound interest, returns), it gives the "true" average factor.'
    ],
    considerations: [
      'All values must be strictly positive.',
      'Sensitive to values close to zero.'
    ]
  },
  'harmonic': {
    title: 'Harmonic Mean',
    intro: 'This Harmonic Mean calculator is the right average for rates measured over equal amounts — for example, the average speed when you drive equal distances at different speeds. It always lies below both the geometric and arithmetic means.',
    definition: 'Reciprocal of the arithmetic mean of reciprocals. Best for averaging rates over equal "amounts" (e.g., speed over equal distances).',
    formula: 'HM = n / Σ(1/xᵢ)',
    interpretation: [
      'Always ≤ geometric mean ≤ arithmetic mean.',
      'Heavily weighted toward smaller values.'
    ],
    considerations: [
      'Cannot be used with zero or negative values.',
      'Use only when the underlying quantity is a rate (per unit something).'
    ]
  },

  /* --- DESCRIPTIVE: DISPERSION --- */
  'range-var-sd': {
    title: 'Range, Variance, Standard Deviation',
    intro: 'This Range, Variance, Standard Deviation calculator quantifies how spread out your data is. SD and variance are fundamental for inferential statistics; range is a quick first impression of spread.',
    definition: 'Three measures of spread. Range is max−min. Variance is mean squared deviation. SD is the square root of variance (same units as the data).',
    formula: 'Sample Var = Σ(xᵢ−x̄)² / (n−1) &nbsp;·&nbsp; SD = √Var',
    interpretation: [
      'Larger SD → values are more spread out.',
      'Approximately 68% of normally-distributed data is within ±1 SD of the mean (95% within ±2 SD).'
    ],
    considerations: [
      'Use n−1 (Bessel\'s correction) for sample SD when estimating a population.',
      'Range is not robust — one outlier can dominate.'
    ]
  },
  'cv': {
    title: 'Coefficient of Variation (CV)',
    intro: 'This Coefficient of Variation Calculator gives you a unitless measure of relative variability. For example, you can use it to compare price volatility between stocks priced in dollars and stocks priced in cents on the same scale.',
    definition: 'Ratio of SD to the absolute mean — a unitless measure of relative variability.',
    formula: 'CV = σ / |μ|  (often expressed as %)',
    interpretation: [
      'Allows comparing variability between datasets with different units or scales.',
      'CV < 10% — low variability; 10–30% — moderate; > 30% — high.'
    ],
    considerations: [
      'Undefined or unstable when the mean is near zero.',
      'Only meaningful for ratio-scale data with a true zero.'
    ]
  },
  'five-num': {
    title: 'Five-Number Summary',
    intro: 'This Five-Number Summary calculator reports the minimum, Q1, median, Q3, and maximum — the foundation of a box plot. Use it for a robust, outlier-resistant snapshot of where your data sits.',
    definition: 'Minimum, Q1, Median, Q3, Maximum — the foundation of a box plot.',
    interpretation: [
      'IQR = Q3 − Q1 measures the middle 50% spread.',
      'Tukey outlier fences: Q1 − 1.5·IQR and Q3 + 1.5·IQR.'
    ],
    considerations: [
      'Robust to outliers — based on order statistics, not means.',
      'Different software may use slightly different quartile methods.'
    ]
  },
  'mad': {
    title: 'Mean Absolute Deviation (MAD)',
    intro: 'This Mean Absolute Deviation calculator measures average distance from the mean without squaring. It is easier to interpret than variance and useful when you want spread in the original units.',
    definition: 'Average of absolute deviations from the mean. A non-squared measure of spread.',
    formula: 'MAD = Σ|xᵢ − x̄| / n',
    interpretation: [
      'In the same units as the data.',
      'Less sensitive to outliers than variance/SD (which squares deviations).'
    ],
    considerations: [
      'Mathematically less convenient than variance for further inference.',
      'Don\'t confuse with the median absolute deviation.'
    ]
  },
  'median-ad': {
    title: 'Median Absolute Deviation',
    intro: 'This Median Absolute Deviation calculator gives a highly robust measure of spread — virtually unaffected by outliers. Multiply by 1.4826 to estimate the SD of an underlying normal distribution.',
    definition: 'Median of absolute deviations from the median. A highly robust measure of spread.',
    formula: 'MAD = median(|xᵢ − median(x)|)',
    interpretation: [
      'Robust to outliers (breakdown point ≈ 50%).',
      'Multiply by 1.4826 to estimate normal-distribution σ.'
    ],
    considerations: [
      'Preferred for heavy-tailed distributions or contaminated data.'
    ]
  },

  /* --- DESCRIPTIVE: POSITION --- */
  'percentile': {
    title: 'Percentile, Quartile, IQR',
    intro: 'This Percentile, Quartile, IQR Calculator helps you find any p-th percentile of your data — for example, the 90th percentile of test scores or the IQR for a box plot. Useful for ranking, cutoff thresholds, and identifying outliers.',
    definition: 'The p-th percentile is the value below which p% of observations fall. Q1, Q2, Q3 are the 25th, 50th, 75th percentiles.',
    formula: 'IQR = Q3 − Q1',
    interpretation: [
      'Use percentiles to describe relative position in a dataset.',
      'IQR captures the central 50% spread; robust to outliers.'
    ],
    considerations: [
      'Multiple conventions exist (linear interpolation, nearest-rank, etc.). This calculator uses linear interpolation.'
    ]
  },
  'zscore': {
    title: 'Z-Score',
    intro: 'This Z-Score calculator standardizes every value by how many SDs it sits from the mean. Use it to compare values from different distributions or to flag unusual observations (|z| > 2 or 3).',
    definition: 'How many standard deviations a value is from the mean.',
    formula: 'zᵢ = (xᵢ − μ) / σ',
    interpretation: [
      'z = 0 → exactly average; |z| > 2 → unusual; |z| > 3 → extreme.',
      'For a normal distribution, ~95% of values have |z| ≤ 2.'
    ],
    considerations: [
      'Z-scores assume the distribution is approximately normal for the rule-of-thumb cutoffs to apply.',
      'Sample SD is used; for very small n, z-scores are unstable.'
    ]
  },

  /* --- DESCRIPTIVE: SHAPE --- */
  'skewness': {
    title: 'Skewness',
    intro: 'This Skewness Calculator measures asymmetry in your data. For example, you can use it to detect whether income, response times, or any positive quantity has the long right tail typical of skewed distributions.',
    definition: 'A measure of distributional asymmetry. Positive = long right tail; negative = long left tail.',
    formula: 'g₁ = (n/((n−1)(n−2))) · Σ((xᵢ − x̄)/s)³',
    interpretation: [
      '|g₁| < 0.5 → approximately symmetric.',
      '0.5 ≤ |g₁| < 1 → moderately skewed.',
      '|g₁| ≥ 1 → highly skewed.'
    ],
    considerations: [
      'Sensitive to outliers — a few extreme values inflate the estimate.',
      'Skewness near zero does not imply normality (could still be heavy-tailed).'
    ]
  },
  'kurtosis': {
    title: 'Kurtosis (Excess)',
    intro: 'This Kurtosis Calculator measures tail-weight relative to a normal distribution. Heavy tails (positive excess kurtosis) signal more frequent extreme values — important for risk modeling.',
    definition: 'A measure of tail weight relative to a normal distribution. Excess kurtosis subtracts 3 so a normal distribution has g₂ = 0.',
    formula: 'g₂ = bias-corrected fourth standardized moment − 3',
    interpretation: [
      'g₂ ≈ 0 → mesokurtic (normal-like).',
      'g₂ > 0 → leptokurtic (heavier tails, sharper peak).',
      'g₂ < 0 → platykurtic (lighter tails, flatter peak).'
    ],
    considerations: [
      'Highly sensitive to outliers (raises x to the 4th power).',
      'Need n ≥ 4; small samples produce unreliable estimates.'
    ]
  },

  /* --- DESCRIPTIVE: RELATIONSHIPS --- */
  'covariance': {
    title: 'Covariance',
    intro: 'This Covariance Calculator helps you measure the joint variability of two variables. For example, you could test if rising study hours go hand-in-hand with rising exam scores. Pair it with the correlation coefficient for a unit-free version.',
    definition: 'A measure of joint variability — how two variables change together.',
    formula: 'Cov(X,Y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n−1)',
    interpretation: [
      'Positive → variables tend to move together.',
      'Negative → variables tend to move in opposite directions.',
      'Zero → no linear association (could still be non-linearly related).'
    ],
    considerations: [
      'Magnitude depends on the units of the variables — not directly comparable across datasets. Use the correlation coefficient for a unit-free version.',
      'Sensitive to outliers.',
      'Detects only linear relationships.'
    ]
  },
  'frequency': {
    title: 'Frequency Table',
    intro: 'This Frequency Table calculator counts how often each unique value (or category) occurs and reports relative and cumulative frequencies. Use it to summarize categorical or discrete data before plotting.',
    definition: 'Counts how often each unique value (or category) occurs in a dataset, plus relative and cumulative frequencies.',
    interpretation: [
      'Identifies modal values and the shape of categorical distributions.',
      'Cumulative frequency shows the running total — useful for finding percentiles.'
    ],
    considerations: [
      'For continuous data, bin into ranges first (use the histogram view).'
    ]
  },
  'contingency': {
    title: 'Contingency Table',
    intro: 'This Contingency Table calculator cross-tabulates two categorical variables — the foundation for chi-square tests of independence. For example, you could compare treatment outcomes across two patient groups.',
    definition: 'A two-way cross-tabulation of counts for two categorical variables.',
    interpretation: [
      'Row and column totals (marginals) describe each variable separately.',
      'Cell counts reveal joint distribution patterns.'
    ],
    considerations: [
      'For independence testing, use the Chi-Square module.',
      'Small expected counts (<5) make χ² unreliable — consider Fisher\'s Exact for 2×2 tables.'
    ]
  },

  /* --- DESCRIPTIVE: RELIABILITY --- */
  'cronbach': {
    title: "Cronbach's Alpha",
    intro: 'This Cronbach\'s Alpha calculator measures the internal consistency reliability of a multi-item survey scale. For example, use it to confirm that 5 items on a satisfaction questionnaire all measure the same underlying construct.',
    definition: 'A reliability coefficient measuring internal consistency among k items intended to measure the same construct.',
    formula: 'α = (k/(k−1)) · (1 − Σσᵢ²/σ²_total)',
    interpretation: [
      'α ≥ 0.9 — excellent; 0.8–0.9 — good; 0.7–0.8 — acceptable.',
      '0.6–0.7 — questionable; below 0.6 — poor.'
    ],
    considerations: [
      'Assumes items are positively correlated and measure one underlying construct.',
      'Inflates with more items — high α can occur from many redundant items, not necessarily a good scale.',
      'Reverse-coded items must be re-coded before computing.'
    ]
  },

  /* ===== HYPOTHESIS TESTING ===== */

  'z-one': {
    title: 'One-Sample Z-Test',
    intro: 'This One-Sample Z-Test calculator helps you test whether a sample mean differs from a hypothesized population value when the population SD is known. For example, you could test if the average product weight from a production line matches the labeled weight.',
    definition: 'Tests whether a sample mean differs from a hypothesized population mean when the population SD is known.',
    formula: 'z = (x̄ − μ₀) / (σ/√n)',
    interpretation: [
      'Reject H₀ if |z| > critical value (or p < α).',
      'Two-tailed: tests for any difference; one-tailed: tests for a specific direction.'
    ],
    considerations: [
      'Requires known population SD — rare in practice. Use t-test if SD is estimated.',
      'Assumes data are approximately normal (or n is large via CLT).'
    ]
  },
  'z-two': {
    title: 'Two-Sample Z-Test',
    intro: 'This Two-Sample Z-Test calculator compares the means of two independent groups when both population SDs are known. For example, you could compare average yield between two factories with established historical SDs.',
    definition: 'Compares two independent sample means when both population SDs are known.',
    formula: 'z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)',
    interpretation: ['Reject H₀ if |z| > critical value (or p < α).'],
    considerations: [
      'Both σ₁ and σ₂ must be known.',
      'Independence: samples must not be paired.',
      'For unknown SDs, use the Two-Sample t-Test.'
    ]
  },
  't-one': {
    title: 'One-Sample t-Test',
    intro: 'This One-Sample t-Test calculator tests whether a sample mean differs from a hypothesized value when the population SD is unknown — the most common single-sample mean test. For example, you could test if average customer satisfaction differs from the company target.',
    definition: 'Tests whether a sample mean differs from a hypothesized value when the population SD is unknown.',
    formula: 't = (x̄ − μ₀) / (s/√n),  df = n − 1',
    interpretation: [
      'Reject H₀ if |t| > critical t (or p < α).',
      'Effect size: use Cohen\'s d to gauge practical significance.'
    ],
    considerations: [
      'Assumes the sample is drawn from an approximately normal distribution.',
      'Robust for moderate departures from normality if n ≥ 30.'
    ]
  },
  't-two': {
    title: 'Two-Sample (Independent) t-Test',
    intro: 'This Two-Sample (Independent) t-Test calculator compares means between two independent groups when SDs are estimated from data. For example, you could test if a new teaching method produces higher average scores than the standard approach.',
    definition: 'Compares means of two independent groups.',
    formula: 'Welch: t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂);  Pooled: assumes σ₁ = σ₂.',
    interpretation: ['Reject H₀ if |t| > critical t at chosen α.'],
    considerations: [
      'Welch\'s test is the safer default — does not assume equal variances.',
      'Use the pooled version only if a Levene\'s test or visual check supports equal variance.',
      'For non-normal data with small n, consider the Mann-Whitney U test.'
    ]
  },
  't-paired': {
    title: 'Paired Samples t-Test',
    intro: 'This Paired Samples t-Test calculator analyzes within-subject changes — before vs after, treatment vs control on the same units. For example, you could test if blood pressure drops in patients after taking a new medication.',
    definition: 'Tests whether the mean difference between paired observations differs from zero (e.g., before/after).',
    formula: 't = d̄ / (s_d/√n),  df = n − 1',
    interpretation: [
      'Reject H₀ if |t| > critical t.',
      'Test focuses on the within-pair difference, not raw means.'
    ],
    considerations: [
      'Pairs must be matched (same subject or natural pair).',
      'Assumes the paired differences are approximately normal.',
      'For non-normal differences, use Wilcoxon Signed-Rank.'
    ]
  },
  'prop-one': {
    title: 'One-Proportion Z-Test',
    intro: 'This One-Proportion Z-Test calculator helps you test whether a sample proportion differs from a hypothesized population proportion. For example, you could test if the click-through rate of an ad campaign exceeds the historical baseline.',
    definition: 'Tests whether a sample proportion differs from a hypothesized population proportion.',
    formula: 'z = (p̂ − p₀) / √(p₀(1−p₀)/n)',
    interpretation: ['Reject H₀ if |z| > critical value (or p < α).'],
    considerations: [
      'Normal approximation requires np₀ ≥ 5 and n(1−p₀) ≥ 5.',
      'For small samples, use the binomial exact test.'
    ]
  },
  'prop-two': {
    title: 'Two-Proportion Z-Test',
    intro: 'This Two-Proportion Z-Test calculator helps you compare proportions from two independent groups. For example, you could test if the success rates between two different manufacturing processes differ, or if treatment outcomes vary between two groups.',
    definition: 'Compares two independent sample proportions.',
    formula: 'z = (p̂₁ − p̂₂) / √(p̂(1−p̂)(1/n₁ + 1/n₂)),  pooled p̂ = (x₁+x₂)/(n₁+n₂)',
    interpretation: ['Reject H₀ if |z| > critical value.'],
    considerations: [
      'Each group needs at least ~5 successes and 5 failures.',
      'For small or sparse data, prefer Fisher\'s Exact Test.'
    ]
  },
  'mwu': {
    title: 'Mann-Whitney U Test',
    intro: 'This Mann-Whitney U Test calculator is the non-parametric alternative to the two-sample t-test. Use it when data are ordinal or non-normal — for example, comparing customer ratings across two products on a 1–5 scale.',
    definition: 'Non-parametric test comparing two independent samples; tests whether one tends to have larger values than the other.',
    formula: 'U = R₁ − n₁(n₁+1)/2; large-n normal approx with continuity & tie correction.',
    interpretation: [
      'Reject H₀ if p < α — the distributions differ in location.',
      'A non-parametric alternative to the two-sample t-test.'
    ],
    considerations: [
      'No normality assumption — uses ranks.',
      'Assumes the two distributions have similar shape (only location differs) for a clean median interpretation.',
      'For very small n, use exact tables.'
    ]
  },
  'wilcoxon': {
    title: 'Wilcoxon Signed-Rank Test',
    intro: 'This Wilcoxon Signed-Rank Test calculator is the non-parametric alternative to the paired t-test. Use it for paired non-normal data — for example, before/after pain scores on an ordinal scale.',
    definition: 'Non-parametric paired test on the median of within-pair differences.',
    formula: 'W = min(W⁺, W⁻); large-n normal approximation used here.',
    interpretation: ['Reject H₀ if p < α — the median paired difference is non-zero.'],
    considerations: [
      'Pairs with zero difference are dropped before ranking.',
      'Non-parametric alternative to the paired t-test.',
      'Assumes the distribution of differences is symmetric.'
    ]
  },
  'kw': {
    title: 'Kruskal-Wallis Test',
    intro: 'This Kruskal-Wallis Test calculator is the non-parametric alternative to one-way ANOVA across 3+ independent groups. For example, compare median wait times across multiple hospitals when distributions are skewed.',
    definition: 'Non-parametric one-way ANOVA across 3+ independent groups.',
    formula: 'H = (12/(N(N+1))) Σ(Rᵢ²/nᵢ) − 3(N+1); compared to χ²(k−1).',
    interpretation: [
      'Reject H₀ if p < α — at least one group differs.',
      'Follow up with Dunn\'s test for pairwise comparisons.'
    ],
    considerations: [
      'No normality required; uses ranks.',
      'Assumes similar distribution shapes across groups for a median interpretation.'
    ]
  },
  'friedman': {
    title: 'Friedman Test',
    intro: 'This Friedman Test calculator is the non-parametric alternative to repeated-measures ANOVA. For example, compare 3+ ratings of the same products by the same judges, when ratings are ordinal.',
    definition: 'Non-parametric repeated-measures test for k matched (paired) treatments across n blocks.',
    formula: 'Q (Friedman statistic) compared to χ²(k−1).',
    interpretation: ['Reject H₀ if p < α — at least one treatment differs.'],
    considerations: [
      'Each row (block) is the same subject across treatments.',
      'Non-parametric analog of repeated-measures ANOVA.'
    ]
  },
  'tukey': {
    title: "Tukey's HSD Test",
    intro: 'This Tukey\'s HSD Test calculator performs all pairwise comparisons after a significant ANOVA, controlling family-wise error. Use it to identify exactly which group means differ from one another.',
    definition: 'Post-hoc pairwise comparison of group means after a significant ANOVA, controlling family-wise error.',
    formula: 'q = |x̄ᵢ − x̄ⱼ| / √(MSE · ½(1/nᵢ + 1/nⱼ)); compared to studentized range.',
    interpretation: ['Pairs with q > q_crit (or p < α) significantly differ.'],
    considerations: [
      'Use only after a significant overall F-test.',
      'This implementation uses a Bonferroni-style normal approximation for the studentized range; very-small-df values may differ slightly from exact tables.'
    ]
  },
  'dunn': {
    title: "Dunn's Test",
    intro: 'This Dunn\'s Test calculator performs non-parametric pairwise comparisons after a significant Kruskal-Wallis test, with Bonferroni-adjusted p-values to control multiple-comparison error.',
    definition: 'Non-parametric post-hoc pairwise test after a significant Kruskal-Wallis, with Bonferroni-adjusted p-values.',
    interpretation: ['Pairs with adjusted p < α significantly differ.'],
    considerations: [
      'Use only after a significant Kruskal-Wallis.',
      'Bonferroni adjustment is conservative — true positives may be missed in many-group comparisons.'
    ]
  },
  'normality': {
    title: "Normality Test (D'Agostino-Pearson K²)",
    intro: 'This Normality Test (D\'Agostino-Pearson K²) calculator combines skewness and kurtosis into an omnibus test of whether your data follow a normal distribution — a common assumption check before parametric tests.',
    definition: 'Combines tests of skewness and kurtosis into an omnibus chi-square test of normality.',
    formula: 'K² = Z²(skew) + Z²(kurtosis); df = 2.',
    interpretation: [
      'Reject H₀ → data are not normally distributed.',
      'Fail to reject → no evidence against normality (not proof of normality).'
    ],
    considerations: [
      'Requires n ≥ 8.',
      'Large samples have power to flag tiny, harmless deviations — combine with QQ plots and judgement.'
    ]
  },
  'effect': {
    title: 'Effect Size',
    intro: 'This Effect Size calculator quantifies the magnitude of difference between two groups, independent of sample size. Use Cohen\'s d, Hedges\' g, and Glass\'s Δ alongside p-values to report practical (not just statistical) significance.',
    definition: 'Standardized magnitude of difference between two means — independent of sample size.',
    formula: "Cohen's d = (M₁ − M₂)/s_pooled; Hedges' g = J·d (small-sample correction).",
    interpretation: [
      '|d| < 0.2 → negligible; 0.2–0.5 → small; 0.5–0.8 → medium; > 0.8 → large.',
      "Glass's Δ uses only s₂ (control SD); useful when group variances differ."
    ],
    considerations: [
      'Always report effect size alongside p-values.',
      "Hedges' g corrects bias in small samples (n < 20)."
    ]
  },
  'power': {
    title: 'Sample Size & Power Analysis',
    intro: 'This Sample Size & Power Analysis calculator estimates the probability of detecting a true effect (power) and the sample size needed to reach a target power level. Use it during study design to avoid underpowered experiments.',
    definition: 'Estimates statistical power (probability of detecting a true effect) and required n for a specified power level.',
    interpretation: [
      'Power = 1 − β (probability of avoiding a Type II error).',
      '0.80 (80%) is the conventional target.'
    ],
    considerations: [
      'Effect size must be specified — use prior research or Cohen\'s rule of thumb.',
      'Power depends on n, effect size, α, tails, and design (one- vs two-sample).',
      'This calculator uses a normal approximation; for very small n consult specialized tables.'
    ]
  },
  'pvalue': {
    title: 'P-Value Calculator',
    intro: 'This P-Value Calculator converts a known test statistic (Z, t, χ², or F) into a tail probability. Use it when you have a statistic from another tool and just need the p-value.',
    definition: 'Computes a tail probability from a known test statistic and reference distribution (Z, t, χ², or F).',
    interpretation: [
      'p = probability of observing data at least as extreme under H₀.',
      'p < α → reject H₀.'
    ],
    considerations: [
      'A p-value is not the probability that H₀ is true.',
      'Always pair with effect size and confidence intervals.'
    ]
  },
  'se': {
    title: 'Standard Error of the Mean',
    intro: 'This Standard Error of the Mean calculator estimates the precision of your sample mean as an estimate of the population mean. Smaller SEM = more precise estimate; pair with t for a confidence interval.',
    definition: 'Estimated standard deviation of the sampling distribution of the mean.',
    formula: 'SEM = s / √n',
    interpretation: [
      'Smaller SEM → more precise estimate of the population mean.',
      '95% CI for the mean ≈ x̄ ± t·SEM.'
    ],
    considerations: [
      'SEM ≠ SD: SD describes individual variability; SEM describes precision of the mean estimate.',
      'SEM shrinks as n grows.'
    ]
  },
  'outliers': {
    title: 'Outlier Detection',
    intro: 'This Outlier Detection calculator flags unusual observations using the Tukey IQR rule or Z-score method. Always inspect flagged points before deciding whether they are data errors or genuine extreme cases.',
    definition: 'Flags observations that differ markedly from the rest of the data.',
    formula: 'IQR method: outside [Q1 − 1.5·IQR, Q3 + 1.5·IQR]. Z-score method: |z| > 3.',
    interpretation: ['Flagged points warrant inspection — may be data-entry errors or real extreme cases.'],
    considerations: [
      'IQR method is robust to outliers themselves; Z-score method is not.',
      'Removing outliers should always be justified — never automatic.'
    ]
  },
  'fisher': {
    title: "Fisher's Exact Test",
    intro: 'This Fisher\'s Exact Test calculator computes an exact p-value for association in a 2×2 table — preferred over chi-square when expected cell counts are small.',
    definition: 'Exact test for association between two categorical variables in a 2×2 table, using the hypergeometric distribution.',
    interpretation: ['Reject H₀ if p < α — variables are associated.'],
    considerations: [
      'Preferred over χ² when expected counts are small (< 5).',
      'Computes an exact p-value, no large-sample approximation needed.'
    ]
  },

  /* ===== REGRESSION ===== */

  'linear': {
    title: 'Simple Linear Regression',
    intro: 'This Simple Linear Regression calculator fits the best-fitting straight line through paired (X, Y) data. For example, predict weight from height, sales from advertising spend, or any one-predictor relationship.',
    definition: 'Models a linear relationship between one predictor X and an outcome Y: y = β₀ + β₁x.',
    formula: 'β₁ = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²;  β₀ = ȳ − β₁x̄',
    interpretation: [
      'β₁ is the change in Y per unit increase in X.',
      'R² is the proportion of variance in Y explained by X (0–1).'
    ],
    considerations: [
      'Assumes linearity, independence, homoscedasticity, and normal residuals.',
      'Sensitive to outliers and influential points.',
      'Correlation ≠ causation.'
    ]
  },
  'multiple': {
    title: 'Multiple Linear Regression',
    intro: 'This Multiple Linear Regression calculator models an outcome as a linear combination of two or more predictors. Use it to control for confounders and isolate the effect of each predictor while holding others constant.',
    definition: 'Models Y as a linear combination of two or more predictors: y = β₀ + β₁x₁ + … + βₚxₚ.',
    formula: 'β = (XᵀX)⁻¹Xᵀy',
    interpretation: [
      'Each βⱼ is the change in Y per unit change in xⱼ holding other predictors constant.',
      'Adjusted R² penalizes adding uninformative predictors.',
      'Overall F-test asks whether any predictor explains Y.'
    ],
    considerations: [
      'Assumes no severe multicollinearity (highly correlated predictors).',
      'Linearity, independence, homoscedasticity, normal residuals.',
      'Centring/scaling predictors helps interpretability when units differ.'
    ]
  },
  'exponential': {
    title: 'Exponential Regression',
    intro: 'This Exponential Regression calculator fits y = a·e^(b·x) — useful for modelling growth or decay processes such as population growth, radioactive decay, or compound interest.',
    definition: 'Fits an exponential growth/decay model y = a·e^(b·x) by linear regression on ln(y).',
    formula: 'ln(y) = ln(a) + b·x  → linear regression in log space',
    interpretation: [
      'b > 0 → growth; b < 0 → decay; |b| is the rate.',
      'Doubling time = ln(2) / b.'
    ],
    considerations: [
      'All Y values must be strictly positive.',
      'R² is reported in original (not log) space.',
      'Model assumes constant relative growth rate.'
    ]
  },
  'quadratic': {
    title: 'Quadratic Regression',
    intro: 'This Quadratic Regression calculator fits a parabolic curve y = β₀ + β₁x + β₂x² to capture non-linear, U-shaped or inverted-U relationships in your data.',
    definition: 'Fits a parabolic curve y = β₀ + β₁x + β₂x².',
    interpretation: [
      'β₂ > 0 → concave up (U-shape); β₂ < 0 → concave down (inverted U).',
      'Vertex (extremum) at x = −β₁/(2β₂).'
    ],
    considerations: [
      'A special case of multiple linear regression with x and x² as predictors.',
      'Beware extrapolation — quadratic curves grow rapidly outside the data range.'
    ]
  },
  /* ===== ANOVA VARIANTS ===== */
  'one-way': {
    title: 'One-way ANOVA',
    intro: "This One-way ANOVA calculator compares means across 3 or more independent groups in a single test. For example, you could compare average yield across multiple manufacturing lines or test scores across teaching methods.",
    definition: 'A test of whether three or more group means are equal, partitioning total variance into between-group and within-group components.',
    formula: 'F = MS_between / MS_within; df = (k−1, N−k)',
    interpretation: ['Reject H₀ if F > critical F (or p < α): at least one group differs.', 'Eta-squared η² = SS_between/SS_total measures proportion of variance explained.'],
    considerations: ['Assumes normality, independence, and equal variances. For unequal variances use Welch\'s ANOVA.', 'Significant ANOVA tells you something differs but not which pairs — follow up with Tukey HSD.']
  },
  'welch': {
    title: "Welch's ANOVA",
    intro: "This Welch's ANOVA calculator is the safer alternative to one-way ANOVA when group variances are unequal. Use it as your default for comparing means across 3+ independent groups when variance homogeneity is doubtful.",
    definition: 'A modification of one-way ANOVA that does not assume equal variances; uses adjusted F-statistic and approximate degrees of freedom.',
    interpretation: ['Reject H₀ if p < α — group means differ.', 'Robust to heteroscedasticity (unequal variances).'],
    considerations: ['Still assumes independence and approximate normality within groups.', 'Follow up with Games-Howell test for pairwise comparisons under unequal variances.']
  },
  'two-way': {
    title: 'Two-way ANOVA',
    intro: "This Two-way ANOVA calculator analyzes the effect of two categorical factors (and their interaction) on a numeric outcome. For example, study how teaching method AND school type jointly affect exam scores.",
    definition: 'Factorial ANOVA decomposing variance into main effect of A, main effect of B, A×B interaction, and within-cell error.',
    formula: 'F_X = MS_X / MS_within for each effect X ∈ {A, B, A×B}',
    interpretation: ['Significant interaction → effect of A depends on level of B; interpret main effects with caution.', 'Significant main effect → that factor changes the outcome on average.'],
    considerations: ['Each cell (combination of A and B levels) needs ≥1 observation; for full power, balance is preferred.', 'For ≥2 within-subjects factors use a mixed/repeated-measures ANOVA instead.']
  },
  'rm': {
    title: 'Repeated Measures ANOVA',
    intro: "This Repeated Measures ANOVA calculator analyzes within-subject changes across 3+ time points or treatment conditions on the same subjects. For example, compare blood pressure measurements taken before, during, and after a treatment.",
    definition: 'A within-subjects ANOVA that partitions variance into treatments, subjects, and error — leveraging within-subject correlation for higher power.',
    formula: 'F = MS_treatments / MS_error; df = (k−1, (n−1)(k−1))',
    interpretation: ['Reject H₀ if p < α — at least one treatment mean differs.', 'Higher statistical power than between-subjects designs because subject-level variability is removed.'],
    considerations: ['Assumes sphericity (equal variance of pairwise differences). Apply Greenhouse-Geisser or Huynh-Feldt correction if violated.', 'Each row in the data must represent the same subject across all treatment columns.']
  },
  'chi-indep': {
    title: 'Chi-Square Test of Independence',
    intro: "This Chi-Square Test of Independence calculator tests whether two categorical variables are statistically associated. For example, you could test if smoking status is related to lung disease occurrence in a survey.",
    definition: "Tests whether the joint distribution of two categorical variables differs from what would be expected if they were independent.",
    formula: 'χ² = Σ(Oᵢⱼ − Eᵢⱼ)² / Eᵢⱼ; df = (rows−1)(cols−1); E = row total × col total / N',
    interpretation: ['Reject H₀ if p < α — variables are associated.', "Pair with Cramér's V for effect size."],
    considerations: ['All expected counts should be ≥5 for the chi-square approximation to be reliable.', "For 2×2 tables with small expected counts, use Fisher's Exact Test instead."]
  },
  'chi-gof': {
    title: 'Chi-Square Goodness-of-Fit',
    intro: "This Chi-Square Goodness-of-Fit calculator tests whether observed category frequencies match a hypothesized distribution. For example, test whether dice rolls are uniform or whether observed genotype frequencies match Hardy-Weinberg expectations.",
    definition: 'Tests whether an observed frequency distribution differs from an expected (theoretical) distribution.',
    formula: 'χ² = Σ(Oᵢ − Eᵢ)² / Eᵢ; df = k − 1 (or k − 1 − p where p is parameters estimated)',
    interpretation: ['Reject H₀ if p < α — observed counts deviate significantly from expected.'],
    considerations: ['Each expected count should be ≥5; combine sparse categories if needed.', 'Sum of expected frequencies should equal sum of observed (rescale if necessary).']
  },

  /* ===== BAYESIAN ===== */
  'bayes': {
    title: "Bayes' Theorem",
    intro: "This Bayes' Theorem calculator updates the probability of a hypothesis given new evidence. The classic example: given a 95%-sensitive medical test and a low disease prevalence, what is the probability you actually have the disease if you test positive? The answer is often surprisingly low.",
    definition: 'Bayes\' theorem updates a prior probability given new evidence and the likelihood of that evidence under both hypotheses.',
    formula: 'P(H|E) = P(E|H) · P(H) / P(E),  where P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)',
    interpretation: ['Posterior P(H|E) is your updated belief after seeing the evidence.', 'Bayes Factor = P(E|H)/P(E|¬H) measures the strength of evidence for H.'],
    considerations: ['Sensitive to the prior — different priors give different posteriors.', 'Assumes conditional probabilities are well-calibrated.']
  },
  'beta-bin': {
    title: 'Beta-Binomial Posterior',
    intro: "This Beta-Binomial Posterior calculator performs a conjugate Bayesian update on a proportion. Start with a Beta(α, β) prior on p, observe k successes in n trials, and get the posterior Beta(α+k, β+n−k) in closed form. Useful for Bayesian A/B testing and proportion estimation.",
    definition: 'The Beta distribution is the conjugate prior for the Bernoulli/binomial likelihood. The posterior is itself Beta with updated parameters.',
    formula: 'Prior Beta(α, β) + Data (k of n) → Posterior Beta(α+k, β+n−k)',
    interpretation: ['Posterior mean balances prior mean and the MLE k/n.', 'As n grows, the posterior concentrates around the MLE, washing out the prior.'],
    considerations: ['Beta(1, 1) is the uniform (uninformative) prior.', 'Strong priors with large α+β can dominate small samples.']
  },
  'mle': {
    title: 'Maximum Likelihood Estimation',
    intro: "This Maximum Likelihood (MLE) calculator finds the parameters that make the observed data most probable under a chosen distribution (Normal, Exponential, Poisson, or Bernoulli). MLE is the foundational estimation method in classical (frequentist) statistics.",
    definition: 'MLE selects parameter values that maximize the joint probability (likelihood) of the observed data.',
    interpretation: ['MLE is consistent and asymptotically normal under regularity conditions.', 'Log-likelihood values let you compare fits between different parameter values.'],
    considerations: ['MLE can be biased in small samples (e.g., normal MLE σ̂² uses 1/n, not 1/(n−1)).', 'For Bernoulli data, encode outcomes as 0/1.']
  },
  'map': {
    title: 'Maximum A Posteriori Estimation',
    intro: "This MAP calculator finds the parameter value that maximizes the posterior — i.e., combines a prior belief with the data likelihood. For example, estimate a proportion using a Beta prior, or estimate a mean with a normal prior on μ. MAP is the Bayesian counterpart to MLE.",
    definition: 'MAP estimates parameters by maximizing posterior probability = likelihood × prior.',
    formula: 'θ̂_MAP = argmax_θ [ p(data|θ) · p(θ) ]',
    interpretation: ['MAP equals MLE when the prior is flat (uniform).', 'Strong priors pull MAP toward the prior mode; weak priors leave it close to MLE.'],
    considerations: ['For Beta-Binomial: MAP mode = (α+k−1)/(α+β+n−2) when α+k>1 and β+(n−k)>1.', 'For Normal mean with normal prior, MAP equals the posterior mean (since posterior is normal).']
  },

  'logistic': {
    title: 'Logistic Regression',
    intro: 'This Logistic Regression calculator models the probability of a binary outcome (0/1) given one or more predictors. Use it for classification problems and to obtain interpretable odds ratios for each predictor.',
    definition: 'Models the probability of a binary outcome (0/1) as a logistic function of predictors.',
    formula: 'logit(p) = ln(p/(1−p)) = β₀ + β₁x₁ + … + βₚxₚ',
    interpretation: [
      'exp(βⱼ) is the odds ratio: how the odds of Y=1 change per unit increase in xⱼ.',
      "McFadden's pseudo-R²: 0.2–0.4 indicates a good fit (different scale from linear R²).",
      'Classification accuracy at threshold 0.5 is shown for quick assessment.'
    ],
    considerations: [
      'Outcome must be binary (0 or 1).',
      'Maximum-likelihood estimation via Newton-Raphson (IRLS) — may not converge with perfect separation.',
      'Sample size: ~10 events per predictor is a common rule of thumb.'
    ]
  }
};

/* ===== RENDERER ===== */

window.renderExplanation = function(toolId) {
  const e = window.Explanations && window.Explanations[toolId];
  if (!e) return '';
  return `
    <details class="explanation-card" open style="margin-top:16px">
      <summary style="cursor:pointer;font-weight:600;font-size:0.95rem;padding:8px 0">
        About: ${Utils.escHtml(e.title)}
      </summary>
      <div style="padding:8px 0 4px;line-height:1.55;font-size:0.88rem">
        ${e.intro ? `<p style="opacity:0.9;font-style:italic;margin-bottom:10px">${e.intro}</p>` : ''}
        <p><strong>Definition.</strong> ${e.definition}</p>
        ${e.formula ? `<p><strong>Formula.</strong> <code style="background:var(--bg-elevated);padding:2px 6px;border-radius:3px">${e.formula}</code></p>` : ''}
        ${e.interpretation && e.interpretation.length ? `
          <p style="margin-bottom:4px"><strong>Interpretation.</strong></p>
          <ul style="margin-top:0;padding-left:20px">
            ${e.interpretation.map(i => `<li>${i}</li>`).join('')}
          </ul>` : ''}
        ${e.considerations && e.considerations.length ? `
          <p style="margin-bottom:4px"><strong>When to use / Considerations.</strong></p>
          <ul style="margin-top:0;padding-left:20px">
            ${e.considerations.map(i => `<li>${i}</li>`).join('')}
          </ul>` : ''}
      </div>
    </details>`;
};
