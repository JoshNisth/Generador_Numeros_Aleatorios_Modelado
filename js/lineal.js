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
    // Validaciones básicas
    function pushError(msg){
      if (window.Swal) {
        window.Swal.fire({
          icon: 'error',
          title: 'Validación',
          text: msg,
          confirmButtonColor: '#1a4a43',
        });
        return;
      }
      if (!alertsBox) return alert(msg);
      const el = document.createElement('div');
      el.className = 'alert alert-error';
      el.innerHTML = `<span>⚠️</span><span>${msg}</span><button class="close" aria-label="Cerrar">×</button>`;
      el.querySelector('.close')?.addEventListener('click', ()=> el.remove());
      alertsBox.appendChild(el);
    }

    if (!isInteger(x0) || !isInteger(k) || !isInteger(c) || !isInteger(p)) {
      pushError('Todos los parámetros deben ser números enteros.');
      return;
    }
    if (x0 <= 0) { pushError('X₀ debe ser un entero positivo.'); return; }
    if (k < 0) { pushError('K debe ser entero (≥ 0).'); return; }
    if (c <= 0) { pushError('c debe ser un entero positivo.'); return; }
    if (p <= 0) { pushError('P (período) debe ser un entero positivo.'); return; }
    if (!isPowerOfTwo(p)) { pushError('P debe ser potencia de 2 para m = 2^g.'); return; }

    // Calcular variables
    const g = Math.round(Math.log2(p)); // g entero, consistente con P potencia de 2
    const m = Math.pow(2, g);
    const a = 1 + 4 * k;
  if (a <= 0) { pushError('a debe ser positivo (a = 1 + 4K).'); return; }
  if (m <= 0 || !isInteger(m)) { pushError('m debe ser entero positivo (m = 2^g).'); return; }
  if (gcd(c, m) !== 1) { pushError('c debe ser relativamente primo con p.'); return; }
    // Mostrar variables
    varsDiv.innerHTML = `
      <span class="chip">a: <strong>${a}</strong></span>
      <span class="chip">c: <strong>${c}</strong></span>
      <span class="chip">g: <strong>${g}</strong></span>
      <span class="chip">m: <strong>${m}</strong></span>
    `;
  // Tabla ya fue limpiada al inicio
    // Generar filas
    let Xi_prev = x0;
    for (let i = 1; i <= p + 1; i++) {
      // Operación
  const operacion = `(${a} * ${Xi_prev} + ${c}) MOD(${m})`;
      // Calcular Xi
      const Xi = (a * Xi_prev + c) % m;
      // Calcular ri
      const riVal = Xi / (m - 1);
      const ri = (riVal === 0 || riVal === 1) ? String(riVal) : formatRi(riVal, d);
      // Insertar fila
      const tr = document.createElement('tr');
  tr.innerHTML = `<td>${i}</td><td>${Xi_prev}</td><td class="nowrap" style="font-size:.85rem">${operacion}</td><td>${Xi}</td><td class="nowrap">${ri}</td>`;
      if (i === p + 1) tr.classList.add('cycle-end');
      tablaLinealBody.appendChild(tr);
      Xi_prev = Xi;
    }
  });

  clrBtn?.addEventListener('click', () => {
    clearForm(formLineal);
    clearTable(tablaLinealBody);
    varsDiv.innerHTML = '';
    formLineal.x0.focus();
  });
})();
