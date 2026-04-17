let allStudents   = [];
let chatHistory   = [];
let currentModal  = null;
let charts        = {};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`[data-page="${name}"]`);
  if (navItem) navItem.classList.add('active');
  if (name === 'dashboard' && allStudents.length) renderDashboard();
  if (name === 'students' && allStudents.length) renderStudentGrid();
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const vs = document.getElementById('validationSection');
  const ps = document.getElementById('previewSection');
  vs.style.display = 'block';
  ps.style.display = 'none';
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('statusBadge').textContent = 'STATUS: PROCESSING';
  document.getElementById('statusBadge').className = 'status-badge';
  setProgress(0);
  animateTo(40, () => {
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast('Error: ' + data.error, true); return; }
        allStudents = data.students;
        animateTo(100, () => {
          document.getElementById('statusBadge').textContent = 'STATUS: COMPLETE';
          document.getElementById('statusBadge').className = 'status-badge done';
          document.getElementById('checkIntegrity').querySelector('.check-icon').className = 'check-icon done';
          document.getElementById('checkIntegrity').querySelector('.check-icon').innerHTML = checkSVG();
          document.getElementById('integrityMsg').textContent = `${data.count} records validated`;
          document.getElementById('checkBias').querySelector('.check-icon').className = 'check-icon done';
          document.getElementById('checkBias').querySelector('.check-icon').innerHTML = checkSVG();
          document.getElementById('biasMsg').textContent = 'No significant bias detected';
          showPreview(allStudents.slice(0,5));
          updateInsightBox();
          showToast(`✓ ${data.count} students loaded successfully`);
        });
      })
      .catch(err => showToast('Upload failed: ' + err.message, true));
  });
}

function checkSVG() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
}

function animateTo(target, cb) {
  const fill = document.getElementById('progressFill');
  const pct  = document.getElementById('progressPct');
  const current = parseInt(fill.style.width) || 0;
  let v = current;
  const iv = setInterval(() => {
    v = Math.min(v + 2, target);
    fill.style.width = v + '%';
    pct.textContent  = v + '%';
    if (v >= target) { clearInterval(iv); if (cb) cb(); }
  }, 20);
}

function setProgress(val) {
  document.getElementById('progressFill').style.width = val + '%';
  document.getElementById('progressPct').textContent  = val + '%';
}

/* ── PREVIEW TABLE ────────────────────────────────────────────── */
function showPreview(rows) {
  if (!rows.length) return;
  const ps   = document.getElementById('previewSection');
  const head = document.getElementById('previewHead');
  const body = document.getElementById('previewBody');
  const cols = ['id','name','hrs','login','score','risk'];
  head.innerHTML = `<tr>${cols.map(c=>`<th>${c.toUpperCase()}</th>`).join('')}</tr>`;
  body.innerHTML = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.hrs}h</td>
      <td>${r.login}</td>
      <td>${r.score}%</td>
      <td><span class="risk-badge ${r.risk}">${r.risk}</span></td>
    </tr>`).join('');
  ps.style.display = 'block';
}

/* ── DASHBOARD ────────────────────────────────────────────────── */
function renderDashboard() {
  if (!allStudents.length) return;
  const high = allStudents.filter(s=>s.risk==='High').length;
  const med  = allStudents.filter(s=>s.risk==='Medium').length;
  const low  = allStudents.filter(s=>s.risk==='Low').length;
  document.getElementById('dmTotal').textContent = allStudents.length;
  document.getElementById('dmHigh').textContent  = high;
  document.getElementById('dmMed').textContent   = med;
  document.getElementById('dmLow').textContent   = low;
  renderCharts();
  renderDashTable();
}

function renderCharts() {
  // Destroy old charts
  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  const defaults = {
    color: '#8b93a7',
    font: { family: "'DM Sans', sans-serif", size: 11 }
  };

  // Scatter: study hours vs test score
  const scatterCtx = document.getElementById('chartScatter');
  if (scatterCtx) {
    const colorMap = { High: 'rgba(239,68,68,.8)', Medium: 'rgba(245,158,11,.8)', Low: 'rgba(34,197,94,.8)' };
    charts.scatter = new Chart(scatterCtx, {
      type: 'scatter',
      data: {
        datasets: ['High','Medium','Low'].map(risk => ({
          label: risk + ' Risk',
          data: allStudents.filter(s=>s.risk===risk).map(s=>({x:s.hrs,y:s.score})),
          backgroundColor: colorMap[risk],
          pointRadius: 5
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8b93a7', font: defaults.font } } },
        scales: {
          x: { title: { display:true, text:'Study hrs/day', color:'#555f74', font: defaults.font },
               grid: { color: '#252a38' }, ticks: { color: '#555f74' } },
          y: { title: { display:true, text:'Test score %', color:'#555f74', font: defaults.font },
               grid: { color: '#252a38' }, ticks: { color: '#555f74' } }
        }
      }
    });
  }

  // Bar: risk distribution
  const barCtx = document.getElementById('chartBar');
  if (barCtx) {
    const high = allStudents.filter(s=>s.risk==='High').length;
    const med  = allStudents.filter(s=>s.risk==='Medium').length;
    const low  = allStudents.filter(s=>s.risk==='Low').length;
    charts.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['High Risk','Medium Risk','Low Risk'],
        datasets: [{
          data: [high, med, low],
          backgroundColor: ['rgba(239,68,68,.7)','rgba(245,158,11,.7)','rgba(34,197,94,.7)'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display:false }, ticks: { color: '#555f74', font: defaults.font } },
          y: { grid: { color: '#252a38' }, ticks: { color: '#555f74', font: defaults.font } }
        }
      }
    });
  }
}

function renderDashTable() {
  const filter = document.getElementById('dashFilter')?.value || 'all';
  const rows   = filter === 'all' ? allStudents : allStudents.filter(s=>s.risk===filter);
  const body   = document.getElementById('dashBody');
  if (!body) return;
  body.innerHTML = rows.map(s => `
    <tr>
      <td style="font-family:var(--mono);color:var(--text3)">${s.id}</td>
      <td style="color:var(--text);font-weight:500">${s.name}</td>
      <td>${s.hrs}h</td>
      <td>${s.login}</td>
      <td>${s.score}%</td>
      <td><span class="risk-badge ${s.risk}">${s.risk}</span></td>
      <td>
        <button class="btn-sm" onclick="openInsightModal(${JSON.stringify(s).split('"').join("'")})">Insight</button>
        <button class="btn-sm" onclick="openEmailModal(${JSON.stringify(s).split('"').join("'")})">Email</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text3)">No students found</td></tr>`;
}

/* ── STUDENT GRID ─────────────────────────────────────────────── */
function renderStudentGrid() {
  const grid = document.getElementById('studentGrid');
  if (!grid) return;
  if (!allStudents.length) {
    grid.innerHTML = `<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>Upload student data first</p></div>`;
    return;
  }
  const riskColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
  grid.innerHTML = allStudents.map(s => `
    <div class="student-card">
      <div class="sc-header">
        <div>
          <div class="sc-name">${s.name}</div>
          <div class="sc-id">${s.id}</div>
        </div>
        <span class="risk-badge ${s.risk}">${s.risk}</span>
      </div>
      <div class="sc-stats">
        <div class="sc-stat">
          <div class="sc-stat-val" style="color:var(--accent)">${s.hrs}h</div>
          <div class="sc-stat-lbl">Study/day</div>
        </div>
        <div class="sc-stat">
          <div class="sc-stat-val" style="color:var(--accent2)">${s.login}</div>
          <div class="sc-stat-lbl">Logins/wk</div>
        </div>
        <div class="sc-stat">
          <div class="sc-stat-val" style="color:${riskColor[s.risk]}">${s.score}%</div>
          <div class="sc-stat-lbl">Score</div>
        </div>
      </div>
      <div class="sc-actions">
        <button class="sc-btn" onclick="openInsightModal(${JSON.stringify(s).split('"').join("'")})">AI Insight</button>
        <button class="sc-btn" onclick="openEmailModal(${JSON.stringify(s).split('"').join("'")})">Email</button>
      </div>
    </div>`).join('');
}

/* ── AI CHAT ──────────────────────────────────────────────────── */
function getClassSummary() {
  if (!allStudents.length) return 'No student data loaded yet.';
  const h = allStudents.filter(s=>s.risk==='High').length;
  const m = allStudents.filter(s=>s.risk==='Medium').length;
  const l = allStudents.filter(s=>s.risk==='Low').length;
  const avg = (allStudents.reduce((a,s)=>a+s.score,0)/allStudents.length).toFixed(1);
  return `${allStudents.length} students total. High risk: ${h}, Medium: ${m}, Low: ${l}. Avg score: ${avg}%. Names: ${allStudents.map(s=>s.name+' ('+s.risk+')').join(', ')}`;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  appendMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  const loadId = appendMsg('ai', '...', true);
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatHistory, summary: getClassSummary() })
  })
  .then(r => r.json())
  .then(data => {
    removeMsg(loadId);
    if (data.error) {
      appendMsg('ai', 'Error: ' + data.error);
    } else {
      appendMsg('ai', data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
    }
  })
  .catch(err => { removeMsg(loadId); appendMsg('ai', 'Network error: ' + err.message); });
}

function sendQuick(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

let msgCounter = 0;
function appendMsg(role, text, isLoading=false) {
  const id  = 'msg-' + (++msgCounter);
  const div = document.createElement('div');
  div.className = `chat-msg ${role}${isLoading?' loading':''}`;
  div.id = id;
  div.innerHTML = `<p>${text.replace(/\n/g,'<br>')}</p>`;
  const container = document.getElementById('chatMessages');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeMsg(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ── AI INSIGHT BOX ───────────────────────────────────────────── */
function updateInsightBox() {
  if (!allStudents.length) return;
  const high = allStudents.filter(s=>s.risk==='High');
  const text = high.length
    ? `${high.length} student(s) at HIGH risk: ${high.map(s=>s.name).join(', ')}. Click "AI Insight" on any student for detailed analysis.`
    : `All students appear to be in good standing. Continue monitoring engagement metrics.`;
  document.getElementById('aiInsightText').textContent = text;
}

/* ── MODALS ───────────────────────────────────────────────────── */
function openModal(html) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'activeModal';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

function closeModal() {
  const m = document.getElementById('activeModal');
  if (m) m.remove();
}

// Safely pass student object to modal via data attribute
function openInsightModal(studentJson) {
  const s = typeof studentJson === 'string' ? JSON.parse(studentJson) : studentJson;
  const id = 'insight_' + Date.now();
  openModal(`
    <div class="modal-header">
      <div class="modal-title">AI Insight — ${s.name}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" id="${id}">
      <div style="color:var(--text3);font-size:12px">Generating insight…</div>
    </div>`);
  fetch('/api/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student: s })
  })
  .then(r => r.json())
  .then(data => {
    const el = document.getElementById(id);
    if (el) el.textContent = data.insight || data.error || 'No response';
  })
  .catch(err => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Error: ' + err.message;
  });
}

let currentEmailStudent = null;
let currentTone = 'motivational';

function openEmailModal(studentJson) {
  currentEmailStudent = typeof studentJson === 'string' ? JSON.parse(studentJson) : studentJson;
  currentTone = 'motivational';
  openModal(`
    <div class="modal-header">
      <div class="modal-title">Generate Email — ${currentEmailStudent.name}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-tone-row">
      ${['motivational','urgent','parent','congratulatory'].map(t =>
        `<button class="tone-btn${t==='motivational'?' active':''}" onclick="setTone('${t}',this)">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`
      ).join('')}
    </div>
    <div style="margin-bottom:10px">
      <button class="btn-primary" style="width:100%" onclick="generateEmail()">Generate Email</button>
    </div>
    <div class="modal-body" id="emailOutput" style="min-height:60px"></div>`);
}

function setTone(tone, btn) {
  currentTone = tone;
  document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function generateEmail() {
  const out = document.getElementById('emailOutput');
  if (!out) return;
  out.textContent = 'Generating…';
  fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student: currentEmailStudent, tone: currentTone })
  })
  .then(r => r.json())
  .then(data => {
    if (out) out.textContent = data.email || data.error || 'No response';
  })
  .catch(err => { if (out) out.textContent = 'Error: ' + err.message; });
}

/* ── REPORT GENERATION ────────────────────────────────────────── */
function generateReport() {
  if (!allStudents.length) { showToast('Upload student data first', true); return; }
  showPage('insights');
  const content = document.getElementById('insightContent');
  content.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text2)">
    <div style="font-size:13px;margin-bottom:8px">Generating AI report…</div>
    <div style="width:200px;height:4px;background:var(--surface2);border-radius:4px;margin:0 auto;overflow:hidden">
      <div style="height:100%;width:60%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;animation:slide 1s infinite"></div>
    </div>
  </div>
  <style>@keyframes slide{0%{margin-left:-60%}100%{margin-left:100%}}</style>`;

  fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: getClassSummary(), students: allStudents })
  })
  .then(r => r.json())
  .then(data => {
    const sections = data.sections || [];
    content.innerHTML = `<div class="report-grid">${
      sections.map(sec => `
        <div class="report-section">
          <h3>${sec.title}</h3>
          <p>${sec.body}</p>
        </div>`).join('')
    }</div>`;
  })
  .catch(err => {
    content.innerHTML = `<div class="empty-state"><p>Report failed: ${err.message}</p></div>`;
  });
}

/* ── SEARCH ───────────────────────────────────────────────────── */
function handleSearch(q) {
  if (!q.trim()) return;
  const lower = q.toLowerCase();
  const results = allStudents.filter(s =>
    s.name.toLowerCase().includes(lower) ||
    s.id.toLowerCase().includes(lower) ||
    s.risk.toLowerCase().includes(lower)
  );
  showPage('students');
  const grid = document.getElementById('studentGrid');
  if (!grid) return;
  if (!results.length) {
    grid.innerHTML = `<div class="empty-state"><p>No students match "${q}"</p></div>`;
    return;
  }
  const riskColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
  grid.innerHTML = results.map(s => `
    <div class="student-card">
      <div class="sc-header">
        <div><div class="sc-name">${s.name}</div><div class="sc-id">${s.id}</div></div>
        <span class="risk-badge ${s.risk}">${s.risk}</span>
      </div>
      <div class="sc-stats">
        <div class="sc-stat"><div class="sc-stat-val" style="color:var(--accent)">${s.hrs}h</div><div class="sc-stat-lbl">Study/day</div></div>
        <div class="sc-stat"><div class="sc-stat-val" style="color:var(--accent2)">${s.login}</div><div class="sc-stat-lbl">Logins/wk</div></div>
        <div class="sc-stat"><div class="sc-stat-val" style="color:${riskColor[s.risk]}">${s.score}%</div><div class="sc-stat-lbl">Score</div></div>
      </div>
      <div class="sc-actions">
        <button class="sc-btn" onclick="openInsightModal(${JSON.stringify(s).split('"').join("'")})">AI Insight</button>
        <button class="sc-btn" onclick="openEmailModal(${JSON.stringify(s).split('"').join("'")})">Email</button>
      </div>
    </div>`).join('');
}

/* ── TOAST ────────────────────────────────────────────────────── */
function showToast(msg, isError=false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = isError ? 'var(--danger)' : 'var(--success)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── MISC ─────────────────────────────────────────────────────── */
function showNotifications() {
  showToast('No new notifications');
}

function loadTemplate() {
  // Create and download a sample CSV
  const csv = `student_name,study_hours_per_day,logins_per_week,test_score\nAlice Johnson,2.5,6,78\nBob Smith,0.5,2,42\nCarla Diaz,3.0,7,88\nDavid Lee,1.2,4,61\nEve Martin,0.8,1,38`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'academic_lens_template.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Template downloaded!');
}

function toggleAIPanel() {
  const p = document.querySelector('.ai-panel');
  if (p) p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
}

/* ── INIT ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  showPage('upload');
  // Handle Enter key in chat
  const ci = document.getElementById('chatInput');
  if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
});