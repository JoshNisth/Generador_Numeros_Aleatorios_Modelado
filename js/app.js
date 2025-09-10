// Utilidades compartidas y lógica placeholder de generación
(function(){
  const page = document.body.dataset.page;

  function clearForm(form) { form && form.reset(); }
  function clearTable(tbody) { if (tbody) tbody.innerHTML = ''; }
  function addExampleRow(tbody, iteration, prevX, operation, newX, r) {
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${iteration}</td><td>${prevX}</td><td style="font-size:.7rem">${operation}</td><td>${newX}</td><td>${r}</td>`;
    tbody.appendChild(tr);
  }
  function formatRi(value, decimals) { return Number(value).toFixed(decimals); }

  // Marcar enlace activo según data-page si no se añadió manualmente
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(a => {
    if (a.getAttribute('href').includes(page)) a.classList.add('active');
    // special case index
    if(page === 'inicio' && a.getAttribute('href') === 'index.html') a.classList.add('active');
  });

  // Página algoritmo lineal
  if (page === 'lineal') {
    const formLineal = document.getElementById('form-lineal');
    const tablaLinealBody = document.querySelector('#tabla-lineal tbody');
    const genBtn = document.getElementById('btn-lin-generar');
    const clrBtn = document.getElementById('btn-lin-limpiar');

    genBtn?.addEventListener('click', () => {
      if (!formLineal.reportValidity()) return;
      const x0 = formLineal.x0.value || 0;
      const k = formLineal.k.value || 0;
      const c = formLineal.c.value || 0;
      const p = formLineal.p.value || 5; // placeholder filas
      const d = Math.min(Math.max(parseInt(formLineal.d.value || 4,10),0),15);
      clearTable(tablaLinealBody);
      let prev = Number(x0);
      for (let i=1; i<=Math.min(p,5); i++) {
        const op = `X = (k*X + c)`;
        const nextX = prev + Number(k) + Number(c); // placeholder
        const ri = formatRi((nextX % 1000) / 1000, d);
        addExampleRow(tablaLinealBody, i, prev, op, nextX, ri);
        prev = nextX;
      }
    });

    clrBtn?.addEventListener('click', () => {
      clearForm(formLineal); clearTable(tablaLinealBody); formLineal.x0.focus();
    });
  }

  // Página algoritmo multiplicativo
  if (page === 'multiplicativo') {
    const formMulti = document.getElementById('form-multi');
    const tablaMultiBody = document.querySelector('#tabla-multi tbody');
    const genBtn = document.getElementById('btn-mul-generar');
    const clrBtn = document.getElementById('btn-mul-limpiar');

    genBtn?.addEventListener('click', () => {
      if (!formMulti.reportValidity()) return;
      const x0 = formMulti.x0.value || 0;
      const k = Number(formMulti.k.value || 0);
      const formulaFlag = formMulti.querySelector('input[name="formula-a"]:checked').value; // '3' o '5'
      const a = (Number(formulaFlag) + 8 * k); // placeholder a
      const p = formMulti.p.value || 5;
      const d = Math.min(Math.max(parseInt(formMulti.d.value || 4,10),0),15);
      clearTable(tablaMultiBody);
      let prev = Number(x0);
      for (let i=1; i<=Math.min(p,5); i++) {
        const op = `X = (a*X)`;
        const nextX = prev * a; // placeholder
        const ri = formatRi((nextX % 1000) / 1000, d);
        addExampleRow(tablaMultiBody, i, prev, op, nextX, ri);
        prev = nextX;
      }
    });

    clrBtn?.addEventListener('click', () => {
      clearForm(formMulti); clearTable(tablaMultiBody); formMulti.x0.focus();
    });
  }

  // Accesibilidad: navegación con flechas por el menú
  document.addEventListener('keydown', (e) => {
    if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const links = [...navLinks];
    const activeIndex = links.findIndex(l => l.classList.contains('active'));
    if (activeIndex === -1) return;
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const newIndex = (activeIndex + delta + links.length) % links.length;
    links[newIndex].focus();
    location.href = links[newIndex].getAttribute('href');
  });
})();
