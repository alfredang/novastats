/* ===== CANVAS CHART RENDERER ===== */

window.ChartRenderer = {
  PAD: { top: 30, right: 20, bottom: 45, left: 60 },

  getColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      grid: style.getPropertyValue('--chart-grid').trim(),
      axis: style.getPropertyValue('--chart-axis').trim(),
      text: style.getPropertyValue('--chart-text').trim(),
      bg: style.getPropertyValue('--bg-alt').trim(),
      accent: style.getPropertyValue('--accent').trim(),
      colors: CONFIG.CHART_COLORS
    };
  },

  setupCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  },

  clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
  },

  drawAxes(ctx, w, h, pad, opts = {}) {
    const c = this.getColors();
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();

    if (opts.xLabel) {
      ctx.fillStyle = c.text;
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.xLabel, pad.left + (w - pad.left - pad.right) / 2, h - 5);
    }
    if (opts.yLabel) {
      ctx.save();
      ctx.fillStyle = c.text;
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      ctx.translate(12, pad.top + (h - pad.top - pad.bottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(opts.yLabel, 0, 0);
      ctx.restore();
    }
  },

  drawGrid(ctx, w, h, pad, xTicks, yTicks) {
    const c = this.getColors();
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;

    yTicks.forEach(y => {
      const py = this.mapY(y, yTicks[0], yTicks[yTicks.length - 1], h, pad);
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();

      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.tickLabel(y), pad.left - 6, py + 3);
    });

    xTicks.forEach(x => {
      const px = this.mapX(x, xTicks[0], xTicks[xTicks.length - 1], w, pad);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, h - pad.bottom);
      ctx.stroke();

      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.tickLabel(x), px, h - pad.bottom + 15);
    });
  },

  mapX(val, min, max, w, pad) {
    if (max === min) return pad.left + (w - pad.left - pad.right) / 2;
    return pad.left + (val - min) / (max - min) * (w - pad.left - pad.right);
  },

  mapY(val, min, max, h, pad) {
    if (max === min) return pad.top + (h - pad.top - pad.bottom) / 2;
    return h - pad.bottom - (val - min) / (max - min) * (h - pad.top - pad.bottom);
  },

  tickLabel(v) {
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'k';
    if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
    return parseFloat(v.toPrecision(4)).toString();
  },

  niceRange(min, max, ticks) {
    ticks = ticks || 6;
    const range = max - min || 1;
    const step = this.niceStep(range / ticks);
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const arr = [];
    for (let v = niceMin; v <= niceMax + step * 0.01; v += step) {
      arr.push(parseFloat(v.toPrecision(10)));
    }
    return arr;
  },

  niceStep(raw) {
    const exp = Math.floor(Math.log10(raw));
    const frac = raw / Math.pow(10, exp);
    let nice;
    if (frac <= 1.5) nice = 1;
    else if (frac <= 3) nice = 2;
    else if (frac <= 7) nice = 5;
    else nice = 10;
    return nice * Math.pow(10, exp);
  },

  /* ===== SCATTERPLOT ===== */

  scatterplot(canvas, xData, yData, opts = {}) {
    const w = opts.width || 500;
    const h = opts.height || 320;
    const ctx = this.setupCanvas(canvas, w, h);
    const pad = { ...this.PAD };
    this.clear(ctx, w, h);

    const xMin = Math.min(...xData), xMax = Math.max(...xData);
    const yMin = Math.min(...yData), yMax = Math.max(...yData);
    const xTicks = this.niceRange(xMin, xMax);
    const yTicks = this.niceRange(yMin, yMax);

    this.drawGrid(ctx, w, h, pad, xTicks, yTicks);
    this.drawAxes(ctx, w, h, pad, { xLabel: opts.xLabel, yLabel: opts.yLabel });

    // Points
    const c = this.getColors();
    ctx.fillStyle = c.colors[0];
    for (let i = 0; i < xData.length; i++) {
      const px = this.mapX(xData[i], xTicks[0], xTicks[xTicks.length - 1], w, pad);
      const py = this.mapY(yData[i], yTicks[0], yTicks[yTicks.length - 1], h, pad);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Regression line
    if (opts.slope !== undefined && opts.intercept !== undefined) {
      const rxMin = xTicks[0], rxMax = xTicks[xTicks.length - 1];
      const y1 = opts.slope * rxMin + opts.intercept;
      const y2 = opts.slope * rxMax + opts.intercept;
      ctx.strokeStyle = c.colors[1];
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(
        this.mapX(rxMin, xTicks[0], xTicks[xTicks.length - 1], w, pad),
        this.mapY(y1, yTicks[0], yTicks[yTicks.length - 1], h, pad)
      );
      ctx.lineTo(
        this.mapX(rxMax, xTicks[0], xTicks[xTicks.length - 1], w, pad),
        this.mapY(y2, yTicks[0], yTicks[yTicks.length - 1], h, pad)
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Curve overlay (e.g., quadratic, exponential, logistic)
    if (typeof opts.curveFn === 'function') {
      const rxMin = xTicks[0], rxMax = xTicks[xTicks.length - 1];
      const steps = 80;
      ctx.strokeStyle = c.colors[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const xv = rxMin + (rxMax - rxMin) * (s / steps);
        const yv = opts.curveFn(xv);
        if (!isFinite(yv)) continue;
        const px = this.mapX(xv, rxMin, rxMax, w, pad);
        const py = this.mapY(yv, yTicks[0], yTicks[yTicks.length - 1], h, pad);
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Title
    if (opts.title) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, w / 2, 16);
    }
  },

  /* ===== HISTOGRAM ===== */

  histogram(canvas, data, opts = {}) {
    const w = opts.width || 500;
    const h = opts.height || 320;
    const ctx = this.setupCanvas(canvas, w, h);
    const pad = { ...this.PAD };
    this.clear(ctx, w, h);

    const bins = opts.bins || Math.max(5, Math.min(30, Math.ceil(Math.sqrt(data.length))));
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins || 1;

    // Count frequencies
    const counts = new Array(bins).fill(0);
    data.forEach(v => {
      let idx = Math.floor((v - min) / binWidth);
      if (idx >= bins) idx = bins - 1;
      counts[idx]++;
    });

    const maxCount = Math.max(...counts);
    const xTicks = this.niceRange(min, max);
    const yTicks = this.niceRange(0, maxCount);

    this.drawGrid(ctx, w, h, pad, xTicks, yTicks);
    this.drawAxes(ctx, w, h, pad, { xLabel: opts.xLabel || 'Value', yLabel: 'Frequency' });

    // Draw bars
    const c = this.getColors();
    const plotW = w - pad.left - pad.right;
    const barW = plotW / bins;

    for (let i = 0; i < bins; i++) {
      const barH = maxCount > 0
        ? (counts[i] / yTicks[yTicks.length - 1]) * (h - pad.top - pad.bottom)
        : 0;
      const x = pad.left + i * barW;
      const y = h - pad.bottom - barH;

      ctx.fillStyle = c.colors[0] + 'cc';
      ctx.fillRect(x + 1, y, barW - 2, barH);
      ctx.strokeStyle = c.colors[0];
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y, barW - 2, barH);
    }

    if (opts.title) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, w / 2, 16);
    }
  },

  /* ===== BAR CHART ===== */

  barChart(canvas, labels, values, opts = {}) {
    const w = opts.width || 500;
    const h = opts.height || 320;
    const ctx = this.setupCanvas(canvas, w, h);
    const pad = { ...this.PAD, bottom: 55 };
    this.clear(ctx, w, h);

    const maxVal = Math.max(...values, 0);
    const yTicks = this.niceRange(0, maxVal);

    // Y grid
    const c = this.getColors();
    yTicks.forEach(y => {
      const py = this.mapY(y, 0, yTicks[yTicks.length - 1], h, pad);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.tickLabel(y), pad.left - 6, py + 3);
    });

    this.drawAxes(ctx, w, h, pad, { yLabel: opts.yLabel });

    const plotW = w - pad.left - pad.right;
    const barW = plotW / labels.length;
    const gap = barW * 0.2;

    labels.forEach((label, i) => {
      const barH = yTicks[yTicks.length - 1] > 0
        ? (values[i] / yTicks[yTicks.length - 1]) * (h - pad.top - pad.bottom)
        : 0;
      const x = pad.left + i * barW + gap / 2;
      const y = h - pad.bottom - barH;

      ctx.fillStyle = c.colors[i % c.colors.length] + 'cc';
      ctx.fillRect(x, y, barW - gap, barH);
      ctx.strokeStyle = c.colors[i % c.colors.length];
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barW - gap, barH);

      // Label
      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      const lx = x + (barW - gap) / 2;
      const ly = h - pad.bottom + 12;
      if (label.length > 8) {
        ctx.translate(lx, ly);
        ctx.rotate(-0.4);
        ctx.fillText(label.slice(0, 12), 0, 0);
      } else {
        ctx.fillText(label, lx, ly);
      }
      ctx.restore();
    });

    if (opts.title) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, w / 2, 16);
    }
  },

  /* ===== GROUPED BAR CHART ===== */

  groupedBarChart(canvas, labels, groups, groupLabels, opts = {}) {
    const w = opts.width || 500;
    const h = opts.height || 320;
    const ctx = this.setupCanvas(canvas, w, h);
    const pad = { ...this.PAD, bottom: 55 };
    this.clear(ctx, w, h);

    const allVals = groups.flat();
    const maxVal = Math.max(...allVals, 0);
    const yTicks = this.niceRange(0, maxVal);
    const c = this.getColors();

    yTicks.forEach(y => {
      const py = this.mapY(y, 0, yTicks[yTicks.length - 1], h, pad);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.tickLabel(y), pad.left - 6, py + 3);
    });

    this.drawAxes(ctx, w, h, pad);

    const numGroups = groups.length;
    const plotW = w - pad.left - pad.right;
    const groupW = plotW / labels.length;
    const barW = (groupW * 0.7) / numGroups;

    labels.forEach((label, i) => {
      const groupStart = pad.left + i * groupW + groupW * 0.15;

      for (let g = 0; g < numGroups; g++) {
        const val = groups[g][i] || 0;
        const barH = yTicks[yTicks.length - 1] > 0
          ? (val / yTicks[yTicks.length - 1]) * (h - pad.top - pad.bottom)
          : 0;
        const x = groupStart + g * barW;
        const y = h - pad.bottom - barH;

        ctx.fillStyle = c.colors[g % c.colors.length] + 'cc';
        ctx.fillRect(x, y, barW - 1, barH);
      }

      ctx.fillStyle = c.text;
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, pad.left + i * groupW + groupW / 2, h - pad.bottom + 14);
    });

    // Legend
    if (groupLabels) {
      const legendY = h - 10;
      let legendX = pad.left;
      groupLabels.forEach((gl, i) => {
        ctx.fillStyle = c.colors[i % c.colors.length];
        ctx.fillRect(legendX, legendY - 8, 10, 10);
        ctx.fillStyle = c.text;
        ctx.font = '10px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(gl, legendX + 14, legendY);
        legendX += ctx.measureText(gl).width + 30;
      });
    }

    if (opts.title) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, w / 2, 16);
    }
  },

  /* ===== NORMAL CURVE ===== */

  normalCurve(canvas, mean, stddev, testStat, alpha, tails, opts = {}) {
    const w = opts.width || 500;
    const h = opts.height || 280;
    const ctx = this.setupCanvas(canvas, w, h);
    const pad = { ...this.PAD };
    this.clear(ctx, w, h);

    const c = this.getColors();
    const xMin = mean - 4 * stddev;
    const xMax = mean + 4 * stddev;
    const steps = 200;
    const dx = (xMax - xMin) / steps;

    // Normal PDF
    const pdf = x => (1 / (stddev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stddev) ** 2);
    const maxPDF = pdf(mean);
    const yTicks = this.niceRange(0, maxPDF);

    this.drawAxes(ctx, w, h, pad);

    // Draw shaded rejection regions
    const critZ = Distributions.criticalZ(alpha, tails);
    const critRight = mean + critZ * stddev;
    const critLeft = mean - critZ * stddev;

    ctx.fillStyle = 'rgba(225, 112, 85, 0.3)';
    if (tails === 2 || tails === 1) {
      // Right tail
      ctx.beginPath();
      for (let x = critRight; x <= xMax; x += dx) {
        const px = this.mapX(x, xMin, xMax, w, pad);
        const py = this.mapY(pdf(x), 0, yTicks[yTicks.length - 1], h, pad);
        if (x === critRight) ctx.moveTo(px, h - pad.bottom);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(this.mapX(xMax, xMin, xMax, w, pad), h - pad.bottom);
      ctx.closePath();
      ctx.fill();
    }
    if (tails === 2) {
      // Left tail
      ctx.beginPath();
      for (let x = xMin; x <= critLeft; x += dx) {
        const px = this.mapX(x, xMin, xMax, w, pad);
        const py = this.mapY(pdf(x), 0, yTicks[yTicks.length - 1], h, pad);
        if (x === xMin) ctx.moveTo(px, h - pad.bottom);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(this.mapX(critLeft, xMin, xMax, w, pad), h - pad.bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Draw curve
    ctx.strokeStyle = c.colors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const px = this.mapX(x, xMin, xMax, w, pad);
      const py = this.mapY(pdf(x), 0, yTicks[yTicks.length - 1], h, pad);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Test statistic line
    if (testStat !== undefined && testStat !== null) {
      const tsX = mean + testStat * stddev;
      const px = this.mapX(tsX, xMin, xMax, w, pad);
      ctx.strokeStyle = '#e17055';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, h - pad.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#e17055';
      ctx.font = 'bold 11px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`z/t = ${Utils.fmt(testStat, 2)}`, px, pad.top - 4);
    }

    // X-axis labels
    ctx.fillStyle = c.text;
    ctx.font = '10px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let z = -3; z <= 3; z++) {
      const x = mean + z * stddev;
      const px = this.mapX(x, xMin, xMax, w, pad);
      ctx.fillText(z.toString(), px, h - pad.bottom + 15);
    }

    if (opts.title) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, w / 2, 16);
    }
  }
};
