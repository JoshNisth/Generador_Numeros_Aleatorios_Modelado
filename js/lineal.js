// Algoritmo Congruencial Lineal - Hull-Dobell
(function(){
  // Utilidades
  function clearForm(form) { form && form.reset(); }
  function clearTable(tbody) { if (tbody) tbody.innerHTML = ''; }
  function formatRi(value, decimals) { return Number(value).toFixed(decimals); }
  function isInteger(n) { return Number.isInteger(n); }
  function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a; }
  function isPowerOfTwo(n){ return n>0 && (n & (n-1)) === 0; }

  // Elementos
  const formLineal = document.getElementById('form-lineal');
  const tablaLinealBody = document.querySelector('#tabla-lineal tbody');
  const genBtn = document.getElementById('btn-lin-generar');
  const clrBtn = document.getElementById('btn-lin-limpiar');
  const expBtn = document.getElementById('btn-lin-export');
  const alertsBox = document.getElementById('lineal-alerts');

  // Div para mostrar variables calculadas
  let varsDiv = document.getElementById('lineal-vars');
  if (!varsDiv) {
    const host = document.getElementById('lineal-vars-placeholder') || formLineal.parentNode;
    varsDiv = document.createElement('div');
    varsDiv.id = 'lineal-vars';
    varsDiv.className = 'vars-strip';
    host.appendChild(varsDiv);
  }

  genBtn?.addEventListener('click', () => {
    // limpiar alertas y tabla siempre
    if (alertsBox) alertsBox.innerHTML = '';
    clearTable(tablaLinealBody);
  // también limpiar la franja de variables calculadas para evitar confusión
  if (varsDiv) varsDiv.innerHTML = '';
    if (!formLineal.reportValidity()) return;
    // Leer entradas
    const x0 = parseInt(formLineal.x0.value, 10);
    const k = parseInt(formLineal.k.value, 10);
    const c = parseInt(formLineal.c.value, 10);
    const p = parseInt(formLineal.p.value, 10);
    const d = Math.min(Math.max(parseInt(formLineal.d.value || 4,10),0),15);
    // Validaciones básicas (modal centrado, anti-spam)
    let lastModal = { key: '', ts: 0 };
    let modalOverlay = null;
    let escHandler = null;
    function closeModal(){
      if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
      modalOverlay?.remove();
      modalOverlay = null;
    }
    function renderModal(messages){
      // Create overlay if not present
      if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header><h3 id="modal-title">Revisa los datos</h3></header>
            <div class="content"><ul class="errors"></ul></div>
            <footer>
              <button class="btn primary" type="button">Entendido</button>
            </footer>
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
      messages.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        list.appendChild(li);
      });
    }
    function pushError(msg){
      const messages = Array.isArray(msg) ? msg : [msg];
      const key = messages.join(' | ');
      const now = Date.now();
      if (key === lastModal.key && (now - lastModal.ts) < 1200) return; // throttle duplicates
      lastModal = { key, ts: now };
      renderModal(messages);
    }

    const errors = [];
    if (!isInteger(x0) || !isInteger(k) || !isInteger(c) || !isInteger(p)) {
      errors.push('Todos los parámetros deben ser números enteros.');
    }
    if (x0 <= 0) errors.push('X₀ debe ser un entero positivo.');
    if (k < 0) errors.push('K debe ser entero (≥ 0).');
    if (c <= 0) errors.push('c debe ser un entero positivo.');
  if (p <= 0) errors.push('P (período) debe ser un entero positivo.');
    if (errors.length) { pushError(errors); return; }

    // Calcular variables
  const g = Math.ceil(Math.log2(p)); // g entero: al siguiente
  const m = Math.pow(2, g);
    const a = 1 + 4 * k;
  const moreErrors = [];
  if (a <= 0) moreErrors.push('a debe ser positivo (a = 1 + 4K).');
  if (m <= 0 || !isInteger(m)) moreErrors.push('m debe ser entero positivo (m = 2^g).');
  if (gcd(c, m) !== 1) moreErrors.push('c debe ser relativamente primo con m.');
  if (moreErrors.length) { pushError(moreErrors); return; }
    // Mostrar variables
    varsDiv.innerHTML = `
      <span class="chip">a: <strong>${a}</strong></span>
      <span class="chip">c: <strong>${c}</strong></span>
      <span class="chip">g: <strong>${g}</strong></span>
      <span class="chip">m: <strong>${m}</strong></span>
    `;
  // Tabla ya fue limpiada al inicio
    // Generar primeras P filas (o m si P>m) y luego una fila extra i=m+1
    let Xi_prev = x0;
    const toShow = Math.min(p, m);
    for (let i = 1; i <= toShow; i++) {
      const operacion = `(${a} * ${Xi_prev} + ${c}) MOD(${m})`;
      const Xi = (a * Xi_prev + c) % m;
      const riVal = Xi / (m - 1);
      const ri = (riVal === 0 || riVal === 1) ? String(riVal) : formatRi(riVal, d);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i}</td><td>${Xi_prev}</td><td class="nowrap" style="font-size:.85rem">${operacion}</td><td>${Xi}</td><td class="nowrap">${ri}</td>`;
      const tdRi = tr.querySelector('td:last-child');
      if (tdRi) tdRi.title = `rᵢ = ${Xi} / (${m - 1})`;
      tablaLinealBody.appendChild(tr);
      Xi_prev = Xi;
    }
    // Avanzar hasta m para poder mostrar el cierre (si no hemos llegado)
    for (let i = toShow + 1; i <= m; i++) {
      const Xi = (a * Xi_prev + c) % m;
      Xi_prev = Xi;
    }
    // Fila extra: i = m + 1 (cierre del ciclo)
    const operacionCierre = `(${a} * ${Xi_prev} + ${c}) MOD(${m})`;
    const Xi_cierre = (a * Xi_prev + c) % m;
    const riCierreVal = Xi_cierre / (m - 1);
    const riCierre = (riCierreVal === 0 || riCierreVal === 1) ? String(riCierreVal) : formatRi(riCierreVal, d);
    const trCierre = document.createElement('tr');
    trCierre.innerHTML = `<td>${m + 1}</td><td>${Xi_prev}</td><td class="nowrap" style="font-size:.85rem">${operacionCierre}</td><td>${Xi_cierre}</td><td class="nowrap">${riCierre}</td>`;
    const tdRiCierre = trCierre.querySelector('td:last-child');
    if (tdRiCierre) tdRiCierre.title = `rᵢ = ${Xi_cierre} / (${m - 1})`;
    trCierre.classList.add('cycle-end');
    tablaLinealBody.appendChild(trCierre);
  });

  clrBtn?.addEventListener('click', () => {
    clearForm(formLineal);
    clearTable(tablaLinealBody);
    varsDiv.innerHTML = '';
    formLineal.x0.focus();
  });

  expBtn?.addEventListener('click', () => {
    const rows = Array.from(document.querySelectorAll('#tabla-lineal tbody tr'));
    if (rows.length === 0) {
      // modal guard
      const msg = ['Primero genera la tabla antes de exportar.'];
      const key = msg.join(' | ');
      // reuse modal infra
      (function(){
        let modal = document.querySelector('.modal-overlay');
        if (!modal) {
          modal = document.createElement('div');
          modal.className = 'modal-overlay';
          modal.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
              <header><h3 id="modal-title">Acción requerida</h3></header>
              <div class="content"><ul class="errors"><li>${msg[0]}</li></ul></div>
              <footer><button class="btn primary" type="button">Entendido</button></footer>
            </div>`;
          document.body.appendChild(modal);
          modal.querySelector('.btn.primary')?.addEventListener('click', ()=> modal.remove());
          modal.addEventListener('click', (e)=>{ if (e.target === modal) modal.remove(); });
        }
      })();
      return;
    }
    // Build XLSX using SheetJS
    const header = ['i','X(i-1)','Operación','Xi','rᵢ'];
    const matrix = [header];
    rows.forEach(r => {
      const cols = Array.from(r.querySelectorAll('td')).map(td => td.textContent?.trim() ?? '');
      matrix.push(cols);
    });
    const ws = XLSX.utils.aoa_to_sheet(matrix);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lineal');
    XLSX.writeFile(wb, 'lineal.xlsx');
  });
})();
