/* ===== DATA MANAGER ===== */

window.DataManager = {

  EXAMPLES: {
    'exam-scores': {
      name: 'Exam Scores',
      description: 'Student test scores (1 variable, 30 observations)',
      headers: ['Score'],
      data: [[85, 92, 78, 90, 88, 76, 95, 89, 84, 91, 73, 98, 82, 87, 93, 79, 86, 94, 81, 77, 96, 83, 88, 75, 92, 80, 90, 85, 97, 74]]
    },
    'height-weight': {
      name: 'Height vs Weight',
      description: 'Height (cm) and Weight (kg) pairs for regression/correlation',
      headers: ['Height', 'Weight'],
      data: [
        [160, 162, 165, 168, 170, 172, 175, 178, 180, 182, 155, 158, 163, 167, 171, 174, 176, 179, 183, 185, 157, 161, 166, 169, 177],
        [55, 58, 62, 65, 68, 70, 74, 78, 80, 83, 50, 54, 60, 64, 69, 72, 75, 77, 82, 86, 52, 57, 63, 66, 76]
      ]
    },
    'treatment-groups': {
      name: 'Treatment Groups',
      description: '3 groups for ANOVA comparison',
      headers: ['Control', 'Drug A', 'Drug B'],
      data: [
        [4.2, 3.8, 4.5, 5.1, 3.9, 4.0, 4.7, 3.6, 4.3, 5.0, 4.1, 3.7],
        [5.8, 6.2, 5.5, 6.7, 5.9, 6.4, 5.3, 6.1, 5.7, 6.0, 5.6, 6.3],
        [7.1, 6.8, 7.5, 6.9, 7.3, 7.0, 7.6, 6.7, 7.2, 7.4, 6.6, 7.8]
      ]
    },
    'survey-responses': {
      name: 'Survey (Chi-Square)',
      description: 'Observed vs Expected frequencies for chi-square goodness-of-fit',
      headers: ['Observed', 'Expected'],
      data: [
        [45, 35, 20, 50, 30],
        [36, 36, 36, 36, 36]
      ]
    },
    'logistic-pass': {
      name: 'Pass/Fail vs Hours Studied',
      description: 'Hours studied (X) and binary pass/fail outcome (Y) — for logistic regression',
      headers: ['Hours', 'Pass'],
      data: [
        [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 4.0, 4.25, 4.5, 4.75, 5.0, 5.5],
        [0,    0,    0,   0,    0,   0,    1,   0,    1,   0,    1,   1,    1,   1,    1,   1,    1,   1,   1]
      ]
    },
    'likert-scale': {
      name: 'Likert Scale (Cronbach)',
      description: '5 survey items × 12 respondents (1–5 scale) — for Cronbach\'s alpha',
      headers: ['Item1', 'Item2', 'Item3', 'Item4', 'Item5'],
      data: [
        [4, 5, 3, 4, 2, 5, 4, 3, 5, 4, 3, 4],
        [4, 4, 3, 5, 2, 5, 4, 3, 5, 4, 2, 4],
        [3, 5, 4, 4, 3, 4, 5, 2, 5, 3, 3, 5],
        [4, 5, 3, 5, 2, 5, 4, 3, 5, 4, 3, 4],
        [5, 4, 3, 4, 3, 5, 5, 2, 4, 4, 3, 5]
      ]
    }
  },

  parseCSV(text) {
    if (!text || !text.trim()) {
      AppState.setData({ raw: '', headers: [], columns: [], rows: [] });
      return;
    }

    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Detect delimiter
    const delimiters = [',', '\t', ';', '|'];
    let bestDelim = ',';
    let bestCount = 0;
    for (const d of delimiters) {
      const count = (lines[0].match(new RegExp('\\' + d, 'g')) || []).length;
      if (count > bestCount) { bestCount = count; bestDelim = d; }
    }

    const parsed = lines.map(l => l.split(bestDelim).map(v => v.trim()));
    const numCols = Math.max(...parsed.map(r => r.length));

    // Detect if first row is headers
    const firstRow = parsed[0];
    const isHeader = firstRow.some(v => isNaN(parseFloat(v)) && v.length > 0);

    let headers, dataRows;
    if (isHeader) {
      headers = firstRow.map((h, i) => h || `Var ${i + 1}`);
      dataRows = parsed.slice(1);
    } else {
      headers = Array.from({ length: numCols }, (_, i) => `Var ${i + 1}`);
      dataRows = parsed;
    }

    // Pad rows
    dataRows = dataRows.map(r => {
      while (r.length < numCols) r.push('');
      return r;
    });

    // Convert to columns of numbers
    const columns = [];
    for (let j = 0; j < numCols; j++) {
      const col = [];
      for (let i = 0; i < dataRows.length; i++) {
        const val = parseFloat(dataRows[i][j]);
        if (!isNaN(val)) col.push(val);
      }
      columns.push(col);
    }

    // Rows as 2D array (strings)
    const rows = dataRows.map(r => r.map(v => v));

    AppState.setData({ raw: text, headers, columns, rows });
  },

  loadExample(key) {
    const ex = this.EXAMPLES[key];
    if (!ex) return;

    const headers = ex.headers;
    const columns = ex.data.map(col => [...col]);

    // Build CSV text
    const maxLen = Math.max(...columns.map(c => c.length));
    let csv = headers.join(',') + '\n';
    for (let i = 0; i < maxLen; i++) {
      csv += columns.map(c => c[i] !== undefined ? c[i] : '').join(',') + '\n';
    }

    // Build rows
    const rows = [];
    for (let i = 0; i < maxLen; i++) {
      rows.push(columns.map(c => c[i] !== undefined ? String(c[i]) : ''));
    }

    AppState.setData({ raw: csv, headers, columns, rows });
  },

  syncFromGrid(tableEl) {
    if (!tableEl) return;
    const headerCells = tableEl.querySelectorAll('thead th[contenteditable]');
    const headers = Array.from(headerCells).map(th => th.textContent.trim() || 'Var');

    const bodyRows = tableEl.querySelectorAll('tbody tr');
    const rows = [];
    bodyRows.forEach(tr => {
      const cells = tr.querySelectorAll('td[contenteditable]');
      rows.push(Array.from(cells).map(td => td.textContent.trim()));
    });

    // Convert to columns
    const numCols = headers.length;
    const columns = [];
    for (let j = 0; j < numCols; j++) {
      const col = [];
      for (let i = 0; i < rows.length; i++) {
        const val = parseFloat(rows[i]?.[j]);
        if (!isNaN(val)) col.push(val);
      }
      columns.push(col);
    }

    // Build CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });

    AppState.setData({ raw: csv, headers, columns, rows });
  },

  buildGridHTML() {
    const { headers, rows } = AppState.data;
    if (!headers.length) {
      return '<div class="empty-state"><p>No data loaded. Paste CSV data or load an example dataset.</p></div>';
    }

    let html = '<table class="data-table" id="dataGrid"><thead><tr>';
    html += '<th>#</th>';
    headers.forEach((h, i) => {
      html += `<th contenteditable="true" data-col="${i}">${Utils.escHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    const maxRows = Math.min(rows.length, 500);
    for (let i = 0; i < maxRows; i++) {
      html += `<tr><td class="text-muted" style="font-size:0.75rem">${i + 1}</td>`;
      for (let j = 0; j < headers.length; j++) {
        html += `<td contenteditable="true" data-row="${i}" data-col="${j}">${Utils.escHtml(rows[i]?.[j] || '')}</td>`;
      }
      html += '</tr>';
    }

    if (rows.length > 500) {
      html += `<tr><td colspan="${headers.length + 1}" class="text-muted" style="text-align:center;padding:8px">... ${rows.length - 500} more rows (computing on full dataset)</td></tr>`;
    }

    html += '</tbody></table>';
    return html;
  },

  getVariableOptions() {
    return AppState.data.headers.map((h, i) =>
      `<option value="${i}">${Utils.escHtml(h)}</option>`
    ).join('');
  },

  validate() {
    const issues = [];
    const { columns, headers } = AppState.data;
    if (!columns.length) issues.push('No data loaded');
    columns.forEach((col, i) => {
      if (col.length === 0) issues.push(`"${headers[i]}" has no numeric values`);
    });
    return issues;
  }
};
