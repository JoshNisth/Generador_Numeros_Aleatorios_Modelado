// Algoritmo Congruencial Multiplicativo
(function(){
  // Helpers
  function isInteger(n){ return Number.isInteger(n); }
  function clearForm(form){ form && form.reset(); }
  function clearTable(tbody){ if (tbody) tbody.innerHTML = ''; }
  function formatRi(value, decimals){ return Number(value).toFixed(decimals); }

  // Elements
  const form = document.getElementById('form-multi');
  const alertsBox = document.getElementById('multiplicativo-alerts');
  const tbody = document.querySelector('#tabla-multi tbody');
  const genBtn = document.getElementById('btn-mul-generar');
  const clrBtn = document.getElementById('btn-mul-limpiar');
  const expBtn = document.getElementById('btn-mul-export');

  // Vars strip
  let varsDiv = document.getElementById('multiplicativo-vars');
  if (!varsDiv) {
    const host = document.getElementById('multiplicativo-vars-placeholder') || form?.parentNode;
    varsDiv = document.createElement('div');
    varsDiv.id = 'multiplicativo-vars';
    varsDiv.className = 'vars-strip';
    host?.appendChild(varsDiv);
  }

  // Modal infra (reuses style from lineal)
  let lastModal = { key: '', ts: 0 };
  let modalOverlay = null;
  let escHandler = null;
  function closeModal(){
    if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
    modalOverlay?.remove();
    modalOverlay = null;
  }
  function renderModal(messages, title){
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <header><h3 id="modal-title">${title || 'Revisa los datos'}</h3></header>
          <div class="content"><ul class="errors"></ul></div>
          <footer><button class="btn primary" type="button">Entendido</button></footer>
        </div>`;
      document.body.appendChild(modalOverlay);
      const btn = modalOverlay.querySelector('.btn.primary');
      btn?.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e)=>{ if (e.target === modalOverlay) closeModal(); });
      escHandler = (e)=>{ if (e.key === 'Escape') closeModal(); };
      document.addEventListener('keydown', escHandler);
      setTimeout(()=> btn?.focus(), 0);
    }
    const list = modalOverlay.querySelector('.errors');
    list.innerHTML = '';
    messages.forEach(m => { const li = document.createElement('li'); li.textContent = m; list.appendChild(li); });
  }
  function pushError(msgs){
    const messages = Array.isArray(msgs) ? msgs : [msgs];
    const key = messages.join(' | ');
    const now = Date.now();
    if (key === lastModal.key && (now - lastModal.ts) < 1200) return;
    lastModal = { key, ts: now };
    renderModal(messages, 'Revisa los datos');
  }

  genBtn?.addEventListener('click', () => {
    // clear
    alertsBox && (alertsBox.innerHTML = '');
    clearTable(tbody);
    varsDiv && (varsDiv.innerHTML = '');
    if (!form.reportValidity()) return;

    // read
    const x0 = parseInt(form.x0.value, 10);
    const k = parseInt(form.k.value, 10);
  const p = parseInt(form.p.value, 10);
    const d = Math.min(Math.max(parseInt(form.d.value || 4, 10), 0), 15);
    const opt = form.querySelector('input[name="formula-a"]:checked')?.value || '3';

    // validate
    const errors = [];
  if (!isInteger(x0) || !isInteger(k) || !isInteger(p)) errors.push('Todos los parámetros deben ser números enteros.');
    if (x0 <= 0) errors.push('X₀ debe ser un entero positivo.');
  if (k < 0) errors.push('k debe ser un entero (≥ 0).');
  if (p <= 0) errors.push('P (período) debe ser un entero positivo.');
    if (x0 % 2 === 0) errors.push('La semilla X₀ debe ser un número impar.');
    if (errors.length) { pushError(errors); return; }

    // compute params
  const g = Math.ceil(Math.log2(p)+2);
  const m = Math.pow(2, g);
  const a = (opt === '3') ? (3 + 8*k) : (5 + 8*k);

    // show vars
    varsDiv.innerHTML = `
      <span class="chip">a: <strong>${a}</strong></span>
      <span class="chip">g: <strong>${g}</strong></span>
      <span class="chip">m: <strong>${m}</strong></span>
    `;

    // generate first P rows (or m if P>m), then cycle end row i=m+1
    let Xi_prev = x0;
    const toShow = Math.min(p, m);
    for (let i = 1; i <= toShow; i++) {
      const operacion = `(${a} * ${Xi_prev}) MOD(${m})`;
      const Xi = (a * Xi_prev) % m;
      const riVal = Xi / (m - 1);
      const ri = (riVal === 0 || riVal === 1) ? String(riVal) : formatRi(riVal, d);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i}</td><td>${Xi_prev}</td><td class="nowrap" style="font-size:.85rem">${operacion}</td><td>${Xi}</td><td class="nowrap">${ri}</td>`;
      const tdRi = tr.querySelector('td:last-child');
      if (tdRi) tdRi.title = `rᵢ = ${Xi} / (${m - 1})`;
      tbody.appendChild(tr);
      Xi_prev = Xi;
    }
    // advance to m for cycle closure
    for (let i = toShow + 1; i <= m; i++) {
      const Xi = (a * Xi_prev) % m;
      Xi_prev = Xi;
    }
    // final cycle end row
    const operacionCierre = `(${a} * ${Xi_prev}) MOD(${m})`;
    const Xi_cierre = (a * Xi_prev) % m;
    const riCierreVal = Xi_cierre / (m - 1);
    const riCierre = (riCierreVal === 0 || riCierreVal === 1) ? String(riCierreVal) : formatRi(riCierreVal, d);
    const trCierre = document.createElement('tr');
    trCierre.innerHTML = `<td>${m + 1}</td><td>${Xi_prev}</td><td class="nowrap" style="font-size:.85rem">${operacionCierre}</td><td>${Xi_cierre}</td><td class="nowrap">${riCierre}</td>`;
    const tdRiCierre = trCierre.querySelector('td:last-child');
    if (tdRiCierre) tdRiCierre.title = `rᵢ = ${Xi_cierre} / (${m - 1})`;
    trCierre.classList.add('cycle-end');
    tbody.appendChild(trCierre);
  });

  clrBtn?.addEventListener('click', () => {
    clearForm(form);
    clearTable(tbody);
    varsDiv && (varsDiv.innerHTML = '');
    form.x0.focus();
  });

  expBtn?.addEventListener('click', () => {
    const rows = Array.from(document.querySelectorAll('#tabla-multi tbody tr'));
    if (rows.length === 0) { pushError('Primero genera la tabla antes de exportar.'); return; }
    const header = ['i','X(i-1)','Operación','Xi','rᵢ'];
    const matrix = [header];
    rows.forEach(r => {
      const cols = Array.from(r.querySelectorAll('td')).map(td => td.textContent?.trim() ?? '');
      matrix.push(cols);
    });
    const ws = XLSX.utils.aoa_to_sheet(matrix);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Multiplicativo');
    XLSX.writeFile(wb, 'multiplicativo.xlsx');
  });
})();
