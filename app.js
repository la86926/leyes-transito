(() => {
  const D = window.RUTA_DATA;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const content = $('#content');
  const nav = $('#nav');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const storeKey = 'rutaPeruStudyV3';

  const defaultState = {
    theme: 'system',
    vehicle: 'moto',
    view: 'learn',
    unit: null,
    rule: 0,
    bankIndex: { moto: 0, auto: 0 },
    bankFilter: { moto: 'all', auto: 'all' },
    bankTopic: { moto: '', auto: '' },
    answers: {},
    completedUnits: { moto: [], auto: [] },
    sim: null
  };

  const state = mergeState(readState());
  const banks = { moto: null, auto: null };
  let imageManifest = {};
  let timerId = null;

  function mergeState(saved) {
    return {
      ...defaultState,
      ...saved,
      bankIndex: { ...defaultState.bankIndex, ...(saved.bankIndex || {}) },
      bankFilter: { ...defaultState.bankFilter, ...(saved.bankFilter || {}) },
      bankTopic: { ...defaultState.bankTopic, ...(saved.bankTopic || {}) },
      answers: saved.answers || {},
      completedUnits: {
        moto: saved.completedUnits?.moto || [],
        auto: saved.completedUnits?.auto || []
      }
    };
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); }
    catch { return {}; }
  }

  function saveState() {
    localStorage.setItem(storeKey, JSON.stringify(state));
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    saveState();
    const btn = $('#themeBtn');
    if (btn) btn.innerHTML = `${theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'} <span>${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}</span>`;
  }

  function cycleTheme() {
    const order = ['system', 'light', 'dark'];
    setTheme(order[(order.indexOf(state.theme) + 1) % order.length]);
  }

  function vehicle() { return D.vehicles[state.vehicle]; }

  function route(vehicleId, view = 'learn') {
    if (!D.vehicles[vehicleId]) vehicleId = 'moto';
    state.vehicle = vehicleId;
    state.view = view;
    state.unit = null;
    state.rule = 0;
    if (view !== 'sim') state.sim = null;
    saveState();
    history.replaceState(null, '', `#${vehicleId}/${view}`);
    closeMobile();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openUnit(id) {
    state.view = 'unit';
    state.unit = id;
    state.rule = 0;
    state.sim = null;
    saveState();
    history.replaceState(null, '', `#${state.vehicle}/unit/${id}`);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function parseHash() {
    const parts = location.hash.replace(/^#/, '').split('/').filter(Boolean);
    if (D.vehicles[parts[0]]) state.vehicle = parts[0];
    if (['learn', 'bank', 'sim'].includes(parts[1])) state.view = parts[1];
    if (parts[1] === 'unit' && parts[2]) {
      state.view = 'unit';
      state.unit = parts[2];
    }
  }

  async function loadBank(vehicleId) {
    if (banks[vehicleId]) return banks[vehicleId];
    const v = D.vehicles[vehicleId];
    try {
      const response = await fetch(v.bankFile, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const raw = Array.isArray(payload) ? payload : payload.data;
      banks[vehicleId] = raw.map(normalizeQuestion);
      return banks[vehicleId];
    } catch (error) {
      console.error('No se pudo cargar el balotario', error);
      banks[vehicleId] = [];
      return [];
    }
  }

  async function loadManifest() {
    try {
      const response = await fetch('data/question-images.json', { cache: 'no-store' });
      if (response.ok) imageManifest = await response.json();
    } catch { imageManifest = {}; }
  }

  function normalizeQuestion(q) {
    const answerLetter = String(q.answer || '').trim().toLowerCase();
    const correct = Math.max(0, ['a', 'b', 'c', 'd'].indexOf(answerLetter));
    return {
      ...q,
      id: Number(q.id),
      title: cleanText(q.title || q.statement || ''),
      options: (q.options || q.alternatives || []).map(cleanText),
      correct,
      topic: cleanText(q.topic || q.section || 'Materias generales'),
      fundamento: cleanText(q.fundamento || ''),
      imagens: q.imagens || (q.image ? [q.image] : []) || []
    };
  }

  function cleanText(text) {
    return String(text || '')
      .replace(/\r?\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function optionText(text) {
    return cleanText(text).replace(/^\s*[a-dA-D]\s*[\)\.\-:]\s*/, '');
  }

  function keyFor(vehicleId, q) { return `${vehicleId}:${q.id}`; }

  function getAnswer(vehicleId, q) { return state.answers[keyFor(vehicleId, q)] || null; }

  function currentAudit(q, vehicleId = state.vehicle) {
    const text = `${q.title} ${q.options.join(' ')} ${q.fundamento}`.toLowerCase();

    if (text.includes('actualizado por última vez en el año 2016') || text.includes('16- 2016-mtc') || text.includes('16-2016-mtc')) {
      return {
        level: 'obsolete',
        title: 'Pregunta histórica desactualizada',
        message: 'El balotario conserva una referencia al Manual 2016, pero el MTC aprobó una actualización del Manual de Dispositivos de Control de Tránsito Automotor mediante la R.D. N.° 26-2024-MTC/18. Esta pregunta no se usa para calcular tu dominio actual.',
        source: 'manual'
      };
    }

    const speedQuestion = /(velocidad|km\/h|kmh)/.test(text);
    if (speedQuestion && text.includes('avenida') && (text.includes('60 km') || text.includes('60km'))) {
      return {
        level: 'obsolete',
        title: 'Límite urbano actualizado',
        message: 'El límite máximo general vigente en avenidas urbanas es 50 km/h. La referencia antigua de 60 km/h fue modificada por el D.S. N.° 025-2021-MTC.',
        source: 'speed'
      };
    }

    if (speedQuestion && /(calle|jirón|jiron)/.test(text) && (text.includes('40 km') || text.includes('40km'))) {
      return {
        level: 'obsolete',
        title: 'Límite urbano actualizado',
        message: 'El límite máximo general vigente en calles y jirones es 30 km/h. La referencia antigua de 40 km/h fue modificada por el D.S. N.° 025-2021-MTC.',
        source: 'speed'
      };
    }

    if (vehicleId === 'moto' && /(casco|chaleco|lentes protectores)/.test(text)) {
      return {
        level: 'review',
        title: 'Revisada con normativa de motocicletas 2025',
        message: 'Las reglas técnicas sobre casco, lentes y determinadas obligaciones vinculadas al chaleco tuvieron modificaciones posteriores al balotario B-II-B. Conservamos la pregunta para estudiar, pero la explicación prioriza la regulación vigente.',
        source: 'helmet'
      };
    }

    if (/s\/\s*\d|s\.\/|soles|uit/.test(text)) {
      return {
        level: 'review',
        title: 'No memorices el monto histórico',
        message: 'Los montos expresados en soles pueden cambiar con la UIT o con modificaciones normativas. Aprende primero la conducta, el código y el porcentaje o consecuencia legal aplicable.',
        source: 'rnt'
      };
    }

    return { level: 'current', title: 'Vigencia revisada', message: 'No se detectó en esta pregunta una referencia histórica conocida que contradiga las actualizaciones incorporadas al curso.', source: q.fundamento ? 'rnt' : 'banks' };
  }

  function explanationFor(q, audit) {
    const correct = optionText(q.options[q.correct] || '');
    const t = q.title.toLowerCase();

    if (audit.level === 'obsolete') {
      return `${audit.message} El balotario histórico marcaba como respuesta “${correct}”, pero para estudiar hoy debes retener la regla vigente indicada arriba.`;
    }
    if (/semáforo|semaforo|luz ámbar|luz amarilla/.test(t)) {
      return `La respuesta correcta es “${correct}”. En un semáforo, cada fase regula la entrada a la intersección; el ámbar no es una invitación a acelerar, sino una advertencia para detenerse cuando puede hacerse con seguridad.`;
    }
    if (/señal|manual de dispositivos|marcas en el pavimento|línea|linea/.test(t)) {
      return `La respuesta correcta es “${correct}”. Esta pregunta evalúa que interpretes la señalización como una regla de circulación, no como un dibujo aislado. Identifica primero si regula, previene o informa y luego aplica la maniobra correspondiente.`;
    }
    if (/prioridad|derecho de paso|intersección|interseccion|policía|policia/.test(t)) {
      return `La respuesta correcta es “${correct}”. La clave es resolver el conflicto antes de ingresar a la intersección: observa autoridad, señalización, semáforo y prioridad aplicable, y recién después ejecuta la maniobra.`;
    }
    if (/velocidad|km\/h|kmh/.test(t)) {
      return `La respuesta del balotario es “${correct}”. En preguntas de velocidad, verifica siempre si el valor sigue vigente: hoy la referencia urbana general es 30 km/h en calles y jirones y 50 km/h en avenidas, salvo señalización específica.`;
    }
    if (/licencia|documento|soat|tarjeta|inspección|inspeccion/.test(t)) {
      return `La respuesta correcta es “${correct}”. La pregunta busca que distingas qué documento, habilitación o condición debe existir antes de circular. No esperes a una intervención para comprobar vigencias.`;
    }
    if (/adelant|carril|giro|voltear|direccional|dirección/.test(t)) {
      return `La respuesta correcta es “${correct}”. Estas maniobras deben ser previsibles: observa, señaliza con anticipación, verifica espacio y puntos de conflicto, y ejecuta solo cuando sea seguro y esté permitido.`;
    }
    if (/alcohol|alcoholemia|estupefaciente/.test(t)) {
      return `La respuesta correcta es “${correct}”. El control busca determinar si el conductor mantiene aptitud para conducir. En la práctica, la decisión segura es no conducir después de consumir alcohol o sustancias que alteren la capacidad.`;
    }
    if (/accidente|primeros auxilios|herid|lesion/.test(t)) {
      return `La respuesta correcta es “${correct}”. Frente a un siniestro, primero evita un segundo accidente, solicita ayuda y no realices maniobras que puedan agravar lesiones sin necesidad inmediata.`;
    }
    return `La respuesta correcta es “${correct}”. Léela como una regla práctica: identifica qué conducta exige o prohíbe la pregunta y descarta las alternativas que cambian esa obligación, añaden una excepción inexistente o describen una conducta riesgosa.`;
  }

  function renderNav() {
    nav.innerHTML = D.nav.map(group => `${group.items.map(([id, icon, label]) => `
      <button data-vehicle="${id}" class="${state.vehicle === id ? 'active' : ''}">
        <span class="nav-icon">${icon}</span><span>${label}</span>
      </button>`).join('')}`).join('');
  }

  function prepareShell() {
    document.body.classList.add('study-shell');
    const search = $('.search-wrap');
    if (search) search.innerHTML = `<div class="top-context"><span id="topVehicleIcon">🏍️</span><div><b id="topVehicle">Motocicleta</b><small id="topPath">Aprender</small></div></div>`;
    const avatar = $('.avatar-button');
    if (avatar) avatar.style.display = 'none';
    const sourceFoot = $('.mini-action[data-route="sources"]');
    if (sourceFoot) sourceFoot.remove();
    const brand = $('.brand');
    if (brand) {
      brand.removeAttribute('data-route');
      brand.addEventListener('click', () => route(state.vehicle, 'learn'));
    }
    const mobile = $('.mobile-tabs');
    if (mobile) mobile.innerHTML = `
      <button data-mobile-vehicle="moto"><span>🏍</span>Motocicleta</button>
      <button data-mobile-vehicle="auto"><span>🚗</span>Automóvil</button>`;
  }

  function updateShell() {
    renderNav();
    const v = vehicle();
    const icon = $('#topVehicleIcon');
    const name = $('#topVehicle');
    const path = $('#topPath');
    if (icon) icon.textContent = v.icon;
    if (name) name.textContent = v.title;
    if (path) path.textContent = state.view === 'unit' ? 'Aprender' : state.view === 'bank' ? 'Banco oficial' : state.view === 'sim' ? 'Simulacro' : 'Aprender';
    $$('[data-mobile-vehicle]').forEach(b => b.classList.toggle('active', b.dataset.mobileVehicle === state.vehicle));
  }

  function tabs() {
    return `<div class="study-tabs" role="tablist">
      <button class="${state.view === 'learn' || state.view === 'unit' ? 'active' : ''}" data-view="learn">Aprender</button>
      <button class="${state.view === 'bank' ? 'active' : ''}" data-view="bank">Banco oficial</button>
      <button class="${state.view === 'sim' ? 'active' : ''}" data-view="sim">Simulacro</button>
    </div>`;
  }

  function courseProgress(vehicleId) {
    const total = D.vehicles[vehicleId].units.length;
    const done = state.completedUnits[vehicleId].length;
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function learnPage() {
    const v = vehicle();
    const p = courseProgress(state.vehicle);
    return `
      <header class="course-head">
        <div><span class="eyebrow">${v.license}</span><h1>${v.icon} ${v.title}</h1><p>${v.intro}</p></div>
        <div class="course-progress"><b>${p.pct}%</b><span>Curso aprendido</span><div class="progress-line"><i style="width:${p.pct}%"></i></div></div>
      </header>
      ${tabs()}
      <section class="learning-intro"><div><span class="step-kicker">Ruta recomendada</span><h2>Aprende en este orden</h2><p>No necesitas saltar entre señales, multas y artículos. Son seis unidades y cada una muestra una regla a la vez.</p></div><div class="bank-chip"><b>${v.questionCount}</b><span>preguntas del balotario después</span></div></section>
      <div class="unit-list">
        ${v.units.map((u, i) => {
          const done = state.completedUnits[state.vehicle].includes(u.id);
          return `<button class="unit-row ${done ? 'done' : ''}" data-unit="${u.id}">
            <span class="unit-number">${done ? '✓' : String(i + 1).padStart(2, '0')}</span>
            <span class="unit-copy"><small>Unidad ${i + 1}</small><b>${u.title}</b><em>${u.subtitle}</em></span>
            <span class="unit-go">→</span>
          </button>`;
        }).join('')}
      </div>
      <div class="sequence-note"><b>Orden pedagógico</b><span>Curso → banco completo → simulacro. Así entiendes primero y memorizas después.</span></div>`;
  }

  function unitPage() {
    const v = vehicle();
    const unit = v.units.find(u => u.id === state.unit);
    if (!unit) { state.view = 'learn'; return learnPage(); }
    const index = Math.min(Math.max(0, state.rule || 0), unit.rules.length - 1);
    state.rule = index;
    const rule = unit.rules[index];
    const source = D.sources[rule.source];
    const isLast = index === unit.rules.length - 1;
    const done = state.completedUnits[state.vehicle].includes(unit.id);

    return `
      <button class="back-link" data-view="learn">← Volver a las unidades</button>
      <header class="lesson-head-simple"><div><span class="eyebrow">${v.title} · ${unit.title}</span><h1>${rule.title}</h1></div><div class="lesson-count">${index + 1} / ${unit.rules.length}</div></header>
      <div class="lesson-meter"><i style="width:${((index + 1) / unit.rules.length) * 100}%"></i></div>
      <article class="focus-lesson">
        <section class="focus-block law"><span>Norma vigente</span><p>${rule.law}</p></section>
        <section class="focus-block plain"><span>En sencillo</span><p>${rule.plain}</p></section>
        <div class="focus-two">
          <section class="focus-block practice"><span>En la práctica</span><p>${rule.practice}</p></section>
          <section class="focus-block mistake"><span>Error típico</span><p>${rule.mistake}</p></section>
        </div>
        <details class="source-disclosure"><summary>Fuente y vigencia</summary><div><b>${source?.norm || 'Fuente oficial'}</b><p>${source?.note || ''}</p>${source?.url ? `<a href="${source.url}" target="_blank" rel="noopener">Comprobar en fuente oficial ↗</a>` : ''}</div></details>
      </article>
      <div class="lesson-actions">
        <button class="secondary-btn" data-rule-prev ${index === 0 ? 'disabled' : ''}>← Anterior</button>
        ${isLast ? `<button class="primary-btn" data-unit-complete="${unit.id}">${done ? '✓ Unidad aprendida' : 'Completar unidad ✓'}</button>` : `<button class="primary-btn" data-rule-next>Siguiente →</button>`}
      </div>`;
  }

  function topicOptions(bank) {
    return [...new Set(bank.map(q => q.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  function filteredBank(vehicleId) {
    const bank = banks[vehicleId] || [];
    const filter = state.bankFilter[vehicleId];
    const topic = state.bankTopic[vehicleId];
    return bank.filter(q => {
      if (topic && q.topic !== topic) return false;
      const ans = getAnswer(vehicleId, q);
      if (filter === 'wrong' && !(ans && ans.correct === false)) return false;
      if (filter === 'unanswered' && ans) return false;
      return true;
    });
  }

  function questionImages(q) {
    if (!q.imagens?.length) return '';
    const imgs = q.imagens.map(name => {
      const clean = String(name).replace(/^.*\//, '').replace(/\.[^.]+$/, '');
      const file = imageManifest[clean];
      return file ? `<img src="assets/questions/${file}" alt="Imagen de la pregunta ${q.id}" loading="lazy">` : '';
    }).filter(Boolean);
    return imgs.length ? `<div class="question-images">${imgs.join('')}</div>` : `<div class="image-pending">Esta pregunta contiene una imagen del balotario. La copia visual está siendo integrada al curso.</div>`;
  }

  function bankPage() {
    const v = vehicle();
    const bank = banks[state.vehicle] || [];
    if (!bank.length) return loadingPage('Cargando balotario…');

    const list = filteredBank(state.vehicle);
    const topics = topicOptions(bank);
    if (!list.length) return `
      <header class="course-head compact"><div><span class="eyebrow">${v.license}</span><h1>Banco oficial</h1><p>No hay preguntas que coincidan con el filtro actual.</p></div></header>${tabs()}
      <button class="primary-btn" data-reset-filters>Mostrar todas las preguntas</button>`;

    let index = state.bankIndex[state.vehicle] || 0;
    if (index >= list.length) index = 0;
    state.bankIndex[state.vehicle] = index;
    const q = list[index];
    const saved = getAnswer(state.vehicle, q);
    const audit = currentAudit(q);
    const answeredCount = bank.filter(x => getAnswer(state.vehicle, x)).length;
    const wrongCount = bank.filter(x => getAnswer(state.vehicle, x)?.correct === false).length;

    return `
      <header class="course-head compact"><div><span class="eyebrow">${v.license}</span><h1>Banco oficial MTC</h1><p>${v.questionCount} preguntas en copia local para estudiar sin salir de Ruta Perú. Las referencias antiguas conocidas se marcan antes de que las memorices.</p></div><div class="bank-stats"><b>${answeredCount}</b><span>respondidas</span><small>${wrongCount} por repasar</small></div></header>
      ${tabs()}
      <div class="bank-toolbar">
        <div class="bank-filters">
          <button class="filter-pill ${state.bankFilter[state.vehicle] === 'all' ? 'active' : ''}" data-filter="all">Todas</button>
          <button class="filter-pill ${state.bankFilter[state.vehicle] === 'unanswered' ? 'active' : ''}" data-filter="unanswered">Pendientes</button>
          <button class="filter-pill ${state.bankFilter[state.vehicle] === 'wrong' ? 'active' : ''}" data-filter="wrong">Falladas${wrongCount ? ` · ${wrongCount}` : ''}</button>
        </div>
        <select class="topic-select" id="topicSelect" aria-label="Filtrar por tema"><option value="">Todos los temas</option>${topics.map(t => `<option value="${escapeAttr(t)}" ${state.bankTopic[state.vehicle] === t ? 'selected' : ''}>${escapeHTML(t)}</option>`).join('')}</select>
      </div>
      ${questionCard(q, index, list.length, saved, audit, false)}
      <div class="bank-nav"><button class="secondary-btn" data-bank-prev ${index === 0 ? 'disabled' : ''}>← Anterior</button><button class="secondary-btn" data-random-question>Aleatoria</button><button class="primary-btn" data-bank-next>${index === list.length - 1 ? 'Volver al inicio' : 'Siguiente →'}</button></div>`;
  }

  function questionCard(q, index, total, saved, audit, simulation) {
    const statusClass = audit.level === 'obsolete' ? 'obsolete' : audit.level === 'review' ? 'review' : 'current';
    return `<article class="question-card ${simulation ? 'simulation-card' : ''}" data-question-id="${q.id}">
      <div class="question-meta"><span>Pregunta ${index + 1} de ${total}</span><span class="audit-badge ${statusClass}">${audit.level === 'obsolete' ? 'Desactualizada' : audit.level === 'review' ? 'Revisar vigencia' : 'Vigencia revisada'}</span></div>
      <div class="question-progress"><i style="width:${((index + 1) / total) * 100}%"></i></div>
      <small class="question-topic">${escapeHTML(q.topic)}</small>
      <h2>${escapeHTML(q.title)}</h2>
      ${questionImages(q)}
      <div class="answers-list">${q.options.map((o, i) => {
        let cls = '';
        if (saved) {
          if (i === q.correct) cls = 'correct';
          else if (i === saved.choice && !saved.correct) cls = 'wrong';
        }
        return `<button class="answer-option ${cls}" data-choice="${i}" ${saved && !simulation ? 'disabled' : ''}><span>${String.fromCharCode(65 + i)}</span><b>${escapeHTML(optionText(o))}</b></button>`;
      }).join('')}</div>
      ${saved && !simulation ? feedbackBlock(q, saved, audit) : ''}
    </article>`;
  }

  function feedbackBlock(q, saved, audit) {
    const explanation = explanationFor(q, audit);
    return `<section class="answer-feedback ${saved.correct ? 'ok' : 'no'}">
      <div class="feedback-title"><span>${saved.correct ? '✓' : '×'}</span><div><b>${saved.correct ? 'Correcto' : 'Revisa esta idea'}</b><small>${saved.correct ? 'Bien razonado.' : `La respuesta del balotario es ${String.fromCharCode(65 + q.correct)}.`}</small></div></div>
      <div class="explanation"><b>Por qué</b><p>${escapeHTML(explanation)}</p></div>
      ${q.fundamento ? `<div class="foundation"><b>Fundamento del balotario</b><span>${escapeHTML(q.fundamento)}</span></div>` : ''}
      ${audit.level !== 'current' ? `<div class="audit-note ${audit.level}"><b>${audit.title}</b><p>${audit.message}</p></div>` : ''}
    </section>`;
  }

  function simulationPage() {
    const v = vehicle();
    const bank = banks[state.vehicle] || [];
    if (!bank.length) return loadingPage('Preparando simulacro…');

    if (!state.sim || state.sim.vehicle !== state.vehicle) {
      const eligible = bank.filter(q => currentAudit(q).level !== 'obsolete').length;
      return `
        <header class="course-head compact"><div><span class="eyebrow">${v.license}</span><h1>Simulacro</h1><p>Cuando ya entiendas las unidades y hayas practicado el banco, haz una prueba con el formato del examen oficial.</p></div></header>
        ${tabs()}
        <div class="sim-intro">
          <div class="sim-number"><b>40</b><span>preguntas</span></div><div class="sim-number"><b>40</b><span>minutos</span></div><div class="sim-number"><b>35</b><span>mínimo correcto</span></div>
          <div class="sim-copy"><h2>Como el simulador del MTC</h2><p>Seleccionaremos 40 preguntas aleatorias entre las que no están marcadas como desactualizadas. Durante el simulacro no verás explicaciones; aparecen al terminar.</p><small>${eligible} preguntas disponibles para generar pruebas vigentes.</small><button class="primary-btn" data-start-sim>Comenzar simulacro →</button></div>
        </div>`;
    }

    const sim = state.sim;
    const bankMap = new Map(bank.map(q => [q.id, q]));
    const questions = sim.ids.map(id => bankMap.get(id)).filter(Boolean);
    const index = Math.min(sim.index, questions.length - 1);
    const q = questions[index];

    if (sim.finished) return simulationResult(questions);

    const savedChoice = sim.responses[q.id];
    const tempSaved = savedChoice === undefined ? null : { choice: savedChoice, correct: savedChoice === q.correct };
    return `
      <header class="sim-header"><div><span class="eyebrow">Simulacro ${v.license}</span><h1>Pregunta ${index + 1} de ${questions.length}</h1></div><div class="timer" id="timer">40:00</div></header>
      ${questionCard(q, index, questions.length, tempSaved, currentAudit(q), true)}
      <div class="bank-nav"><button class="secondary-btn" data-sim-prev ${index === 0 ? 'disabled' : ''}>← Anterior</button><button class="primary-btn" data-sim-next>${index === questions.length - 1 ? 'Finalizar' : 'Siguiente →'}</button></div>`;
  }

  function simulationResult(questions) {
    const sim = state.sim;
    let score = 0;
    const wrong = [];
    questions.forEach(q => {
      if (sim.responses[q.id] === q.correct) score++;
      else wrong.push(q);
    });
    const passed = score >= 35;
    return `
      <header class="result-head ${passed ? 'pass' : 'retry'}"><span>${passed ? '✓' : '↻'}</span><div><small>Resultado</small><h1>${score} / 40</h1><p>${passed ? 'Alcanzaste el mínimo de 35 respuestas correctas.' : 'Aún no llegas a 35. Usa tus errores como siguiente ruta de estudio.'}</p></div></header>
      <div class="result-grid"><div><b>${score}</b><span>Aciertos</span></div><div><b>${40 - score}</b><span>Errores</span></div><div><b>${Math.round(score / 40 * 100)}%</b><span>Puntaje</span></div></div>
      ${wrong.length ? `<section class="review-list"><div class="section-title"><span class="eyebrow">Repaso</span><h2>Preguntas que debes entender</h2></div>${wrong.slice(0, 10).map(q => `<div class="review-item"><span>${q.id}</span><div><b>${escapeHTML(q.title)}</b><p>${escapeHTML(explanationFor(q, currentAudit(q)))}</p></div></div>`).join('')}${wrong.length > 10 ? `<p class="more-errors">Hay ${wrong.length - 10} errores más guardados en tu progreso del banco.</p>` : ''}</section>` : ''}
      <div class="lesson-actions"><button class="secondary-btn" data-view="bank">Repasar banco</button><button class="primary-btn" data-restart-sim>Nuevo simulacro</button></div>`;
  }

  function loadingPage(text) {
    return `<div class="loading-card"><div class="spinner"></div><h2>${text}</h2><p>La copia local se está leyendo desde el repositorio.</p></div>`;
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function escapeAttr(value) { return escapeHTML(value); }

  async function render() {
    clearInterval(timerId);
    timerId = null;
    updateShell();

    if (['bank', 'sim'].includes(state.view)) {
      content.innerHTML = loadingPage('Cargando balotario…');
      await loadBank(state.vehicle);
    }

    let html = '';
    if (state.view === 'unit') html = unitPage();
    else if (state.view === 'bank') html = bankPage();
    else if (state.view === 'sim') html = simulationPage();
    else html = learnPage();
    content.innerHTML = html;
    updateShell();
    if (state.view === 'sim' && state.sim && !state.sim.finished) startTimer();
  }

  function answerBank(qId, choice) {
    const bank = banks[state.vehicle] || [];
    const q = bank.find(x => x.id === qId);
    if (!q) return;
    const audit = currentAudit(q);
    if (audit.level === 'obsolete') {
      state.answers[keyFor(state.vehicle, q)] = { choice, correct: choice === q.correct, historical: true };
    } else {
      state.answers[keyFor(state.vehicle, q)] = { choice, correct: choice === q.correct };
    }
    saveState();
    render();
  }

  function startSimulation() {
    const bank = (banks[state.vehicle] || []).filter(q => currentAudit(q).level !== 'obsolete');
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 40);
    state.sim = {
      vehicle: state.vehicle,
      ids: shuffled.map(q => q.id),
      index: 0,
      responses: {},
      startedAt: Date.now(),
      duration: 40 * 60 * 1000,
      finished: false
    };
    saveState();
    render();
  }

  function startTimer() {
    const tick = () => {
      if (!state.sim || state.sim.finished) return;
      const left = Math.max(0, state.sim.duration - (Date.now() - state.sim.startedAt));
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      const el = $('#timer');
      if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (left <= 0) finishSimulation();
    };
    tick();
    timerId = setInterval(tick, 1000);
  }

  function finishSimulation() {
    if (!state.sim) return;
    state.sim.finished = true;
    const bank = banks[state.vehicle] || [];
    const map = new Map(bank.map(q => [q.id, q]));
    state.sim.ids.forEach(id => {
      const q = map.get(id);
      if (!q) return;
      const choice = state.sim.responses[id];
      if (choice !== undefined) state.answers[keyFor(state.vehicle, q)] = { choice, correct: choice === q.correct, fromSim: true };
      else state.answers[keyFor(state.vehicle, q)] = { choice: -1, correct: false, fromSim: true };
    });
    saveState();
    render();
  }

  function closeMobile() {
    sidebar?.classList.remove('open');
    scrim?.classList.remove('show');
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button,a,summary,select');
    if (!target) return;

    if (target.dataset.vehicle) return route(target.dataset.vehicle, 'learn');
    if (target.dataset.mobileVehicle) return route(target.dataset.mobileVehicle, 'learn');
    if (target.dataset.view) return route(state.vehicle, target.dataset.view);
    if (target.dataset.unit) return openUnit(target.dataset.unit);

    if (target.hasAttribute('data-rule-next')) {
      const unit = vehicle().units.find(u => u.id === state.unit);
      if (unit && state.rule < unit.rules.length - 1) { state.rule++; saveState(); render(); window.scrollTo({top:0,behavior:'smooth'}); }
      return;
    }
    if (target.hasAttribute('data-rule-prev')) {
      if (state.rule > 0) { state.rule--; saveState(); render(); window.scrollTo({top:0,behavior:'smooth'}); }
      return;
    }
    if (target.dataset.unitComplete) {
      const list = state.completedUnits[state.vehicle];
      if (!list.includes(target.dataset.unitComplete)) list.push(target.dataset.unitComplete);
      saveState();
      state.view = 'learn'; state.unit = null; state.rule = 0;
      history.replaceState(null, '', `#${state.vehicle}/learn`);
      render();
      return;
    }

    if (target.dataset.choice !== undefined) {
      const card = target.closest('[data-question-id]');
      const qId = Number(card?.dataset.questionId);
      const choice = Number(target.dataset.choice);
      if (state.view === 'sim' && state.sim) {
        state.sim.responses[qId] = choice;
        saveState();
        render();
      } else answerBank(qId, choice);
      return;
    }

    if (target.dataset.filter) {
      state.bankFilter[state.vehicle] = target.dataset.filter;
      state.bankIndex[state.vehicle] = 0;
      saveState(); render(); return;
    }
    if (target.hasAttribute('data-reset-filters')) {
      state.bankFilter[state.vehicle] = 'all'; state.bankTopic[state.vehicle] = ''; state.bankIndex[state.vehicle] = 0; saveState(); render(); return;
    }
    if (target.hasAttribute('data-bank-prev')) {
      state.bankIndex[state.vehicle] = Math.max(0, state.bankIndex[state.vehicle] - 1); saveState(); render(); window.scrollTo({top:0,behavior:'smooth'}); return;
    }
    if (target.hasAttribute('data-bank-next')) {
      const list = filteredBank(state.vehicle);
      state.bankIndex[state.vehicle] = state.bankIndex[state.vehicle] >= list.length - 1 ? 0 : state.bankIndex[state.vehicle] + 1;
      saveState(); render(); window.scrollTo({top:0,behavior:'smooth'}); return;
    }
    if (target.hasAttribute('data-random-question')) {
      const list = filteredBank(state.vehicle);
      state.bankIndex[state.vehicle] = Math.floor(Math.random() * Math.max(1, list.length)); saveState(); render(); window.scrollTo({top:0,behavior:'smooth'}); return;
    }

    if (target.hasAttribute('data-start-sim') || target.hasAttribute('data-restart-sim')) return startSimulation();
    if (target.hasAttribute('data-sim-prev') && state.sim) { state.sim.index = Math.max(0, state.sim.index - 1); saveState(); render(); return; }
    if (target.hasAttribute('data-sim-next') && state.sim) {
      if (state.sim.index >= state.sim.ids.length - 1) finishSimulation();
      else { state.sim.index++; saveState(); render(); }
      return;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'topicSelect') {
      state.bankTopic[state.vehicle] = event.target.value;
      state.bankIndex[state.vehicle] = 0;
      saveState(); render();
    }
  });

  $('#menuBtn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    scrim?.classList.toggle('show');
  });
  scrim?.addEventListener('click', closeMobile);
  $('#themeBtn')?.addEventListener('click', cycleTheme);
  $('#collapseBtn')?.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
  window.addEventListener('hashchange', () => { parseHash(); render(); });

  (async function init() {
    parseHash();
    prepareShell();
    setTheme(state.theme);
    await loadManifest();
    await loadBank(state.vehicle);
    render();
  })();
})();