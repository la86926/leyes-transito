(() => {
  const D = window.RUTA_DATA;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const content = $('#content');
  const nav = $('#nav');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const storeKey = 'rutaPeruStateV2';
  const defaultState = {theme:'system',collapsed:false,route:'home',lesson:null,completed:[],favorites:[],errors:[],lastLesson:null,caseDone:[]};
  let state = {...defaultState,...readState()};

  function readState(){ try{return JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{return {}} }
  function saveState(){ localStorage.setItem(storeKey,JSON.stringify(state)); updateProgressUI(); }
  function progress(){ const ids=D.lessons.map(x=>x.id); const done=state.completed.filter(x=>ids.includes(x)).length; return ids.length?Math.round(done/ids.length*100):0 }
  function moduleProgress(m){ const ids=D.lessons.filter(x=>x.module===m).map(x=>x.id); const done=ids.filter(x=>state.completed.includes(x)).length; return {done,total:ids.length,pct:ids.length?Math.round(done/ids.length*100):0} }
  function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),1400)}

  const labels={norm:'Norma verificada',recommendation:'Seguridad',pending:'Pendiente'};
  const moduleSymbols={moto:'◉',auto:'▣',signs:'◇',rules:'↗',infractions:'△'};

  function renderNav(){
    nav.innerHTML=D.nav.map(g=>`<div class="nav-label">${g.group}</div>${g.items.map(([id,ic,label])=>{
      const count=id==='errors'?state.errors.length:id==='favorites'?state.favorites.length:'';
      return `<button data-route="${id}" class="${state.route===id?'active':''}"><span class="nav-icon">${ic}</span><span>${label}</span>${count!==''?`<span class="nav-count">${count}</span>`:''}</button>`
    }).join('')}`).join('');
  }

  function updateProgressUI(){
    const p=progress(); const top=$('#topProgress'); if(top)top.textContent=p+'%'; const avatar=$('.avatar-button'); if(avatar)avatar.style.setProperty('--p',p+'%');
    renderNav();
  }

  function route(id){
    state.route=id; if(id!=='lesson')state.lesson=null; saveState(); closeMobile();
    history.replaceState(null,'','#'+id); render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function openLesson(id){state.route='lesson';state.lesson=id;state.lastLesson=id;saveState();history.replaceState(null,'','#lesson/'+id);render();window.scrollTo({top:0,behavior:'smooth'})}

  function home(){
    const p=progress(); const last=D.lessons.find(x=>x.id===state.lastLesson)||D.lessons[0];
    return `<div class="hero">
      <div class="hero-main"><span class="eyebrow">Minicurso de tránsito · Perú</span><h1>Normas claras.<br>Decisiones seguras.</h1><p>Aprende lo que necesitas en la vía, con la norma explicada en lenguaje práctico y la fuente integrada dentro del curso.</p><div class="hero-actions"><button class="primary-btn" data-open-lesson="${last.id}">${state.lastLesson?'Continuar estudiando':'Empezar por motocicleta'} →</button><button class="secondary-btn" data-route="sources">Explorar fuentes</button></div></div>
      <aside class="hero-card"><div><div class="progress-ring" style="--p:${p}%"><b>${p}%</b></div><h3>Tu recorrido</h3><p>${state.completed.length} lecciones completadas · ${state.errors.length} preguntas por repasar</p></div><p><b>Revisión normativa:</b> ${D.meta.reviewed}</p></aside>
    </div>
    <div class="section-head"><div><span class="eyebrow">Tu curso</span><h2>Estudia por bloques</h2></div><p>La motocicleta tiene prioridad en esta primera etapa.</p></div>
    <div class="card-grid">${Object.entries(D.modules).map(([id,m])=>{const mp=moduleProgress(id);return `<article class="module-card ${m.tone||''}" data-module="${id}"><div class="module-icon">${moduleSymbols[id]||'•'}</div><h3>${m.title}</h3><p>${m.description}</p><div class="module-meta"><div class="mini-bar"><i style="width:${mp.pct}%"></i></div><span>${mp.done}/${mp.total}</span></div></article>`}).join('')}</div>
    <div class="section-head"><div><span class="eyebrow">Estado</span><h2>Lo importante de un vistazo</h2></div></div>
    <div class="quick-strip"><div class="quick-stat"><b>${D.lessons.filter(x=>x.status==='norm').length}</b><small>lecciones verificadas</small></div><div class="quick-stat"><b>${Object.keys(D.sources).length}</b><small>fuentes integradas</small></div><div class="quick-stat"><b>${state.favorites.length}</b><small>favoritos</small></div><div class="quick-stat"><b>${p}%</b><small>progreso general</small></div></div>`;
  }

  function modulePage(id){
    const m=D.modules[id]; const lessons=D.lessons.filter(x=>x.module===id); const mp=moduleProgress(id);
    return `<header class="page-head"><div><span class="eyebrow">${moduleSymbols[id]||'•'} Módulo · ${mp.pct}% completado</span><h1>${m.title}</h1><p>${m.subtitle} ${m.description}</p></div></header>
      <div class="lesson-list">${lessons.map((l,i)=>`<button class="lesson-row" data-open-lesson="${l.id}"><div class="lesson-number">${state.completed.includes(l.id)?'✓':String(i+1).padStart(2,'0')}</div><div><h3>${l.title}</h3><p>${l.summary}</p></div><span class="status-pill ${l.status}">${labels[l.status]}</span></button>`).join('')||empty('Aún no hay lecciones publicadas en este módulo.')}</div>`;
  }

  function lessonPage(id){
    const l=D.lessons.find(x=>x.id===id); if(!l)return empty('Lección no encontrada.');
    const isFav=state.favorites.includes(id), done=state.completed.includes(id);
    const steps=[['1','Qué establece la norma',l.steps.law],['2','Qué significa',l.steps.meaning],['3','Cómo se aplica',l.steps.practice],['4','Ejemplo',l.steps.example],['5','Error frecuente',l.steps.mistake]].filter(x=>x[2]);
    return `<div class="lesson-layout"><article class="lesson-article"><div class="lesson-top"><div><button class="ghost-btn" data-route="${l.module}">← ${D.modules[l.module]?.title||'Volver'}</button><br><span class="eyebrow">${labels[l.status]}</span><h1>${l.title}</h1></div><button class="favorite-btn ${isFav?'saved':''}" data-favorite="${id}" aria-label="Guardar favorito">${isFav?'★':'☆'}</button></div>
      <section class="legal-block" id="resumen"><h2>La idea clave</h2><p>${l.summary}</p></section>
      <div class="five-step">${steps.map(s=>`<section class="step-card"><div class="step-icon">${s[0]}</div><div><h3>${s[1]}</h3><p>${s[2]}</p></div></section>`).join('')}</div>
      ${l.practice?`<div class="callout practice" id="practica"><b>En la práctica</b>${l.practice}</div>`:''}
      ${l.warning?`<div class="callout warn" id="cuidado"><b>Cuidado con esto</b>${l.warning}</div>`:''}
      <section id="fuentes"><span class="eyebrow">Trazabilidad</span>${(l.sources||[]).map(s=>sourceButton(s)).join('')}</section>
      ${l.quiz?quizBlock(l):''}
      <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap"><button class="primary-btn" data-complete="${id}">${done?'✓ Lección completada':'Marcar como aprendida'}</button><button class="secondary-btn" data-route="${l.module}">Volver al módulo</button></div>
      </article><aside class="lesson-aside"><div class="aside-card"><h3>En esta lección</h3><button data-jump="resumen">Idea clave</button><button data-jump="practica">En la práctica</button><button data-jump="cuidado">Cuidado</button><button data-jump="fuentes">Fuentes</button>${l.quiz?'<button data-jump="pregunta">Pregunta rápida</button>':''}</div></aside></div>`;
  }

  function sourceButton(id){const s=D.sources[id];return s?`<button class="source-button" data-source="${id}"><span><b>${s.norm}</b><small>${s.entity} · ${s.date}</small></span><span>Ver ficha →</span></button>`:''}
  function quizBlock(l){return `<section class="quiz-card" id="pregunta" data-quiz="${l.id}"><span class="eyebrow">Pregunta rápida</span><h3>${l.quiz.q}</h3>${l.quiz.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}<div class="feedback" hidden></div></section>`}

  function casesPage(){return `<header class="page-head"><div><span class="eyebrow">◈ Decidir antes de leer</span><h1>Casos prácticos</h1><p>Situaciones breves para entrenar decisiones reales de conducción.</p></div></header>${D.cases.map(c=>`<article class="case-card" data-case="${c.id}"><div class="case-scene">🚦</div><span class="eyebrow">Situación</span><h2>${c.title}</h2><p style="color:var(--muted)">${c.text}</p><h3>${c.q}</h3>${c.options.map((o,i)=>`<button class="quiz-option" data-case-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}<div class="feedback" hidden></div><button class="source-button" data-source="${c.source}"><span><b>Ver fundamento integrado</b><small>Sin salir del minicurso</small></span><span>→</span></button></article>`).join('')}`}

  function quizPage(){const qs=D.lessons.filter(x=>x.quiz);return `<header class="page-head"><div><span class="eyebrow">✓ Práctica rápida</span><h1>Evaluación</h1><p>Responde y recibe retroalimentación inmediata. Tus errores quedan guardados para repasar.</p></div></header>${qs.map(l=>`<div style="margin-bottom:14px">${quizBlock(l)}</div>`).join('')}`}
  function errorsPage(){const items=state.errors.map(id=>D.lessons.find(x=>x.id===id)).filter(Boolean);return `<header class="page-head"><div><span class="eyebrow">! Repaso inteligente</span><h1>Mis errores</h1><p>Aquí aparecen las preguntas que respondiste incorrectamente.</p></div></header>${items.length?`<div class="lesson-list">${items.map(l=>`<button class="lesson-row" data-open-lesson="${l.id}"><div class="lesson-number">!</div><div><h3>${l.title}</h3><p>Vuelve a leer la explicación y reintenta la pregunta.</p></div><span class="status-pill">Repasar</span></button>`).join('')}</div>`:empty('Aún no tienes preguntas falladas.')}`}
  function favoritesPage(){const items=state.favorites.map(id=>D.lessons.find(x=>x.id===id)).filter(Boolean);return `<header class="page-head"><div><span class="eyebrow">☆ Tu biblioteca</span><h1>Favoritos</h1><p>Normas y conceptos guardados para consulta rápida.</p></div></header>${items.length?`<div class="lesson-list">${items.map(l=>`<button class="lesson-row" data-open-lesson="${l.id}"><div class="lesson-number">★</div><div><h3>${l.title}</h3><p>${l.summary}</p></div></button>`).join('')}</div>`:empty('Guarda una lección con la estrella para verla aquí.')}`}
  function sourcesPage(){return `<header class="page-head"><div><span class="eyebrow">ⓘ Biblioteca normativa</span><h1>Fuentes oficiales</h1><p>Las fichas esenciales están integradas en la web. Abrir el documento original queda como opción de verificación, no como requisito para estudiar.</p></div></header><div class="callout info"><b>Revisión legal</b>Las fichas se cotejaron hasta ${D.meta.reviewed}. La legislación puede cambiar después de esa fecha.</div><div class="source-grid">${Object.entries(D.sources).map(([id,s])=>`<button class="source-card" data-source="${id}"><span class="eyebrow">${s.status}</span><h3>${s.norm}</h3><p>${s.title}</p><div class="source-meta">${s.entity} · ${s.date}</div></button>`).join('')}</div>`}
  function infractionsPage(){return `<header class="page-head"><div><span class="eyebrow">△ Sanciones verificadas</span><h1>Infracciones clave</h1><p>Solo se muestran sanciones suficientemente verificadas para la fecha de revisión.</p></div></header>${D.infractions.map(i=>`<article class="infra-card"><div class="infra-top"><div><span class="infra-code">${i.code}</span><h3>${i.title}</h3></div><span class="status-pill">${i.level}</span></div><div class="facts"><div class="fact"><small>Sanción</small><b>${i.sanction}</b></div><div class="fact"><small>2026</small><b>${i.amount2026}</b></div><div class="fact"><small>Puntos</small><b>${i.points}</b></div><div class="fact"><small>Medida</small><b>${i.measure}</b></div></div><p style="color:var(--muted);font-size:11px">${i.note}</p><button class="source-button" data-source="${i.source}"><span><b>Ver fundamento integrado</b><small>Fuente oficial resumida dentro de la app</small></span><span>→</span></button></article>`).join('')}<div class="callout warn"><b>Importante</b>Los montos en soles dependen del valor de la UIT del año. La app conserva también el porcentaje legal para facilitar futuras actualizaciones.</div>`}
  function progressPage(){const p=progress();return `<header class="page-head"><div><span class="eyebrow">◌ Aprendizaje local</span><h1>Mi progreso</h1><p>Todo se guarda en este navegador mediante localStorage. No necesitas cuenta.</p></div></header><div class="hero-card" style="max-width:560px"><div><div class="progress-ring" style="--p:${p}%"><b>${p}%</b></div><h3>${state.completed.length} lecciones completadas</h3><p>${state.errors.length} errores por repasar · ${state.favorites.length} favoritos guardados</p></div></div>`}
  function empty(text){return `<div class="empty-state"><h3>Todo limpio por aquí</h3><p>${text}</p></div>`}

  function render(){
    renderNav(); const r=state.route; let html='';
    if(r==='home')html=home(); else if(['moto','auto','signs','rules'].includes(r))html=modulePage(r); else if(r==='lesson')html=lessonPage(state.lesson); else if(r==='cases')html=casesPage(); else if(r==='quiz')html=quizPage(); else if(r==='errors')html=errorsPage(); else if(r==='favorites')html=favoritesPage(); else if(r==='sources')html=sourcesPage(); else if(r==='infractions')html=infractionsPage(); else if(r==='progress')html=progressPage(); else html=home();
    content.innerHTML=html; bindContent(); updateProgressUI(); updateMobileTabs();
  }

  function bindContent(){
    $$('[data-module]').forEach(x=>x.onclick=()=>route(x.dataset.module));
    $$('[data-open-lesson]').forEach(x=>x.onclick=()=>openLesson(x.dataset.openLesson));
    $$('[data-source]').forEach(x=>x.onclick=e=>{e.stopPropagation();openSource(x.dataset.source)});
    $$('[data-complete]').forEach(x=>x.onclick=()=>{const id=x.dataset.complete;if(state.completed.includes(id))state.completed=state.completed.filter(v=>v!==id);else state.completed.push(id);saveState();toast(state.completed.includes(id)?'Lección completada':'Marcada como pendiente');render()});
    $$('[data-favorite]').forEach(x=>x.onclick=()=>{const id=x.dataset.favorite;if(state.favorites.includes(id))state.favorites=state.favorites.filter(v=>v!==id);else state.favorites.push(id);saveState();toast(state.favorites.includes(id)?'Guardado en favoritos':'Quitado de favoritos');render()});
    $$('[data-jump]').forEach(x=>x.onclick=()=>document.getElementById(x.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'}));
    $$('.quiz-card').forEach(card=>{const l=D.lessons.find(x=>x.id===card.dataset.quiz);if(!l)return;card.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>answerQuiz(card,l,+btn.dataset.answer))});
    $$('[data-case]').forEach(card=>{const c=D.cases.find(x=>x.id===card.dataset.case);card.querySelectorAll('[data-case-answer]').forEach(btn=>btn.onclick=()=>answerCase(card,c,+btn.dataset.caseAnswer))});
    $$('[data-route]').forEach(b=>b.onclick=()=>route(b.dataset.route));
  }

  function answerQuiz(card,l,choice){
    const buttons=[...card.querySelectorAll('[data-answer]')];buttons.forEach((b,i)=>{b.disabled=true;if(i===l.quiz.answer)b.classList.add('correct');if(i===choice&&i!==l.quiz.answer)b.classList.add('wrong')});
    const ok=choice===l.quiz.answer;const fb=card.querySelector('.feedback');fb.hidden=false;fb.innerHTML=`<b>${ok?'Correcto':'Revisa esta idea'}</b><br>${l.quiz.why}`;
    if(ok)state.errors=state.errors.filter(x=>x!==l.id);else if(!state.errors.includes(l.id))state.errors.push(l.id);saveState();toast(ok?'Respuesta correcta':'Guardado en Mis errores');
  }
  function answerCase(card,c,choice){const buttons=[...card.querySelectorAll('[data-case-answer]')];buttons.forEach((b,i)=>{b.disabled=true;if(i===c.answer)b.classList.add('correct');if(i===choice&&i!==c.answer)b.classList.add('wrong')});const fb=card.querySelector('.feedback');fb.hidden=false;fb.innerHTML=`<b>${choice===c.answer?'Correcto':'No sería la decisión adecuada'}</b><br>${c.why}`;if(!state.caseDone.includes(c.id))state.caseDone.push(c.id);saveState()}

  function openSource(id){const s=D.sources[id];if(!s)return;$('#sourceTitle').textContent=s.norm;$('#sourceBody').innerHTML=`<p style="color:var(--muted);margin-top:5px">${s.title}</p><div class="source-facts"><div class="fact"><small>Entidad</small><b>${s.entity}</b></div><div class="fact"><small>Fecha</small><b>${s.date}</b></div><div class="fact"><small>Estado</small><b>${s.status}</b></div></div><div class="callout info"><b>Lectura integrada</b>Estos puntos están guardados dentro de la aplicación para que puedas estudiar sin abandonar la página.</div><div>${s.digest.map(x=>`<div class="digest-item">${x}</div>`).join('')}</div><div class="fact"><small>Referencias</small><b>${(s.refs||[]).join(' · ')}</b></div><a class="external-link" href="${s.url}" target="_blank" rel="noopener">Abrir fuente oficial original ↗</a>`;$('#sourceModal').hidden=false;document.body.style.overflow='hidden'}
  function closeSource(){$('#sourceModal').hidden=true;document.body.style.overflow=''}

  function search(q){q=q.trim().toLowerCase();const box=$('#searchResults');if(!q){box.hidden=true;return}const pool=D.lessons.filter(l=>`${l.title} ${l.summary} ${Object.values(l.steps).join(' ')}`.toLowerCase().includes(q)).slice(0,7);box.innerHTML=pool.length?pool.map(l=>`<button class="search-result" data-search-lesson="${l.id}"><b>${l.title}</b><small>${D.modules[l.module]?.title||''} · ${labels[l.status]}</small></button>`).join(''):`<div class="search-result"><b>Sin coincidencias</b><small>Prueba con otra palabra.</small></div>`;box.hidden=false;$$('[data-search-lesson]').forEach(b=>b.onclick=()=>{box.hidden=true;$('#searchInput').value='';openLesson(b.dataset.searchLesson)})}
  function closeMobile(){sidebar.classList.remove('open');scrim.classList.remove('show')}
  function updateMobileTabs(){$$('.mobile-tabs [data-route]').forEach(b=>b.classList.toggle('active',state.route===b.dataset.route))}
  function setTheme(t){state.theme=t;document.documentElement.dataset.theme=t;saveState();toast(`Tema: ${t==='system'?'sistema':t==='dark'?'oscuro':'claro'}`)}
  function cycleTheme(){const order=['system','light','dark'];setTheme(order[(order.indexOf(state.theme)+1)%order.length])}

  document.addEventListener('click',e=>{const r=e.target.closest('[data-route]');if(r)route(r.dataset.route)});
  $('#menuBtn').onclick=()=>{sidebar.classList.add('open');scrim.classList.add('show')};scrim.onclick=closeMobile;
  $('#collapseBtn').onclick=()=>{state.collapsed=!state.collapsed;sidebar.classList.toggle('compact',state.collapsed);saveState()};
  $('#themeBtn').onclick=cycleTheme;$('#closeSourceBtn').onclick=closeSource;$('#sourceModal').onclick=e=>{if(e.target.id==='sourceModal')closeSource()};
  $('#searchInput').addEventListener('input',e=>search(e.target.value));
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus()}if(e.key==='Escape'){closeSource();$('#searchResults').hidden=true;closeMobile()}});
  $('#moreBtn').onclick=()=>{sidebar.classList.add('open');scrim.classList.add('show')};

  document.documentElement.dataset.theme=state.theme;sidebar.classList.toggle('compact',state.collapsed);
  const h=location.hash.replace(/^#/,'');if(h.startsWith('lesson/')){state.route='lesson';state.lesson=h.split('/')[1]}else if(h)state.route=h;
  render();
})();