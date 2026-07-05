// ═══════════════ CONFIG ═══════════════
const SERVICES = [
  { id:'flight',    icon:'✈️',  name:'Flight Ticket' },
  { id:'hotel',     icon:'🏨',  name:'Hotel Booking' },
  { id:'transfer',  icon:'🚐',  name:'Transfer' },
  { id:'tours',     icon:'🗺️',  name:'Tours' },
  { id:'holiday',   icon:'🌴',  name:'Holiday Package' },
  { id:'insurance', icon:'🛡️',  name:'Travel Insurance' },
  { id:'uaevisa',   icon:'🇦🇪',  name:'UAE Visa' },
  { id:'schengen',  icon:'🇪🇺',  name:'Schengen Visa' },
  { id:'globalvisa',icon:'🌐',  name:'Global Visa' },
];

const STATUS_COLORS = {
  'New':       '#3b82f6',
  'Pending':   '#f59e0b',
  'Confirmed': '#10b981',
  'Cancelled': '#ef4444',
};

let selectedService = '';
let currentEnqNo = '';

// ═══════════════ DATA ═══════════════
function getData() {
  try { return JSON.parse(localStorage.getItem('travelEnquiries') || '[]'); }
  catch(e) { return []; }
}

function saveData(d) { localStorage.setItem('travelEnquiries', JSON.stringify(d)); }

// ═══════════════ DATE / TIME ═══════════════
function formatDate(d) {
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function formatTime(d) {
  return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function todayStr() {
  return new Date().toISOString().slice(0,10);
}

function genEnqNo() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const prefix = `TRV${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const data = getData();
  const todayEnqs = data.filter(e => e.enqNo.startsWith(prefix));
  const seq = String(todayEnqs.length + 1).padStart(3,'0');
  return `${prefix}-${seq}`;
}

function updateClock() {
  const now = new Date();
  document.getElementById('nav-date').textContent = formatDate(now);
  if (document.getElementById('enq-date').textContent !== '—' || document.getElementById('page-enquiry').classList.contains('active')) {
    document.getElementById('enq-time').textContent = formatTime(now);
  }
}

// ═══════════════ NAVIGATION ═══════════════
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const idx = {dashboard:0, enquiry:1, records:2}[page];
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  if (page === 'dashboard') renderDashboard();
  if (page === 'records') renderRecords();
  if (page === 'enquiry') initForm();
}

// ═══════════════ INIT FORM ═══════════════
function buildServiceGrid() {
  const grid = document.getElementById('service-grid');
  grid.innerHTML = SERVICES.map(s => `
    <div class="svc-btn" id="svc-${s.id}" onclick="selectService('${s.id}')">
      <div class="svc-icon">${s.icon}</div>
      <div class="svc-name">${s.name}</div>
    </div>
  `).join('');
}

function selectService(id) {
  selectedService = id;
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('svc-' + id).classList.add('selected');
  document.getElementById('svc-error').style.display = 'none';
}

function initForm() {
  const now = new Date();
  currentEnqNo = genEnqNo();
  document.getElementById('enq-no').textContent = currentEnqNo;
  document.getElementById('enq-date').textContent = formatDate(now);
  document.getElementById('enq-time').textContent = formatTime(now);
  selectedService = '';
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
}

// ═══════════════ SUBMIT ═══════════════
function submitEnquiry() {
  const name = document.getElementById('f-name').value.trim();
  const mobile = document.getElementById('f-mobile').value.trim();
  const errEl = document.getElementById('form-error');

  if (!selectedService) {
    document.getElementById('svc-error').style.display = 'block';
    errEl.style.display = 'none';
    return;
  }

  if (!name || !mobile) {
    errEl.textContent = '⚠️ Full Name and Mobile Number are required.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  const now = new Date();
  const svc = SERVICES.find(s => s.id === selectedService);

  const record = {
    enqNo: currentEnqNo,
    date: formatDate(now),
    dateISO: todayStr(),
    time: formatTime(now),
    service: svc.name,
    serviceIcon: svc.icon,
    name: document.getElementById('f-name').value.trim(),
    mobile: document.getElementById('f-mobile').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    nationality: document.getElementById('f-nationality').value,
    passport: document.getElementById('f-passport').value.trim(),
    pax: document.getElementById('f-pax').value || '1',
    from: document.getElementById('f-from').value.trim(),
    to: document.getElementById('f-to').value.trim(),
    depDate: document.getElementById('f-dep').value,
    retDate: document.getElementById('f-ret').value,
    travelClass: document.getElementById('f-class').value,
    budget: document.getElementById('f-budget').value.trim(),
    agent: document.getElementById('f-agent').value.trim(),
    status: document.getElementById('f-status').value,
    remarks: document.getElementById('f-remarks').value.trim(),
  };

  const data = getData();
  data.unshift(record);
  saveData(data);

  showToast(`✅ Enquiry ${currentEnqNo} saved successfully!`);
  resetForm();
  initForm();
}

function resetForm() {
  ['f-name','f-mobile','f-email','f-passport','f-pax','f-from','f-to',
   'f-dep','f-ret','f-budget','f-agent','f-remarks'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['f-nationality','f-class'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-status').value = 'New';
  selectedService = '';
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('svc-error').style.display = 'none';
}

// ═══════════════ DASHBOARD ═══════════════
function renderDashboard() {
  const data = getData();
  const today = todayStr();
  const todayData = data.filter(e => e.dateISO === today);

  // KPIs
  const kpiDefs = [
    { label:'Total Enquiries', val: data.length, color:'#f59e0b', icon:'📋' },
    { label:"Today's Enquiries", val: todayData.length, color:'#3b82f6', icon:'📅' },
    { label:'Confirmed', val: data.filter(e=>e.status==='Confirmed').length, color:'#10b981', icon:'✅' },
    { label:'Pending', val: data.filter(e=>e.status==='Pending').length, color:'#f59e0b', icon:'⏳' },
    { label:'Cancelled', val: data.filter(e=>e.status==='Cancelled').length, color:'#ef4444', icon:'❌' },
    { label:'New', val: data.filter(e=>e.status==='New').length, color:'#8b5cf6', icon:'🔵' },
  ];

  document.getElementById('kpi-row').innerHTML = kpiDefs.map(k => `
    <div class="kpi" style="--kpi-color:${k.color}">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');

  // Service bars
  const svcCount = {};
  SERVICES.forEach(s => { svcCount[s.name] = 0; });
  data.forEach(e => { if (svcCount[e.service] !== undefined) svcCount[e.service]++; });
  const maxSvc = Math.max(...Object.values(svcCount), 1);

  const barsEl = document.getElementById('service-bars');
  const svcSorted = Object.entries(svcCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  barsEl.innerHTML = svcSorted.map(([name, count]) => {
    const pct = Math.round((count / maxSvc) * 100);
    const svc = SERVICES.find(s => s.name === name);
    return `
      <div class="bar-row">
        <div class="bar-label">${svc?.icon || ''} ${name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.max(pct,4)}%">${count}</div>
        </div>
      </div>
    `;
  }).join('');

  // Donut
  const statusKeys = ['New','Pending','Confirmed','Cancelled'];
  const statusCounts = statusKeys.map(s => ({ s, n: data.filter(e=>e.status===s).length, c: STATUS_COLORS[s] }));
  const total = statusCounts.reduce((a,b)=>a+b.n,0) || 1;
  const r = 48, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  let offset = 0;
  let paths = '';
  statusCounts.forEach(sc => {
    const pct = sc.n / total;
    const dash = pct * circ;
    if (sc.n > 0) {
      paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sc.c}" stroke-width="18" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`;
      offset += dash;
    }
  });
  document.getElementById('donut-svg').innerHTML = `
    <circle cx="60" cy="60" r="48" fill="none" stroke="#1f2e45" stroke-width="18"/>
    ${paths}
    <text x="60" y="55" text-anchor="middle" fill="#e2e8f0" font-size="16" font-weight="700" font-family="Space Grotesk">${total}</text>
    <text x="60" y="70" text-anchor="middle" fill="#64748b" font-size="9">TOTAL</text>
  `;
  document.getElementById('donut-legend').innerHTML = statusCounts.map(sc => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${sc.c}"></div>
      <span style="color:var(--muted)">${sc.s}:</span>
      <strong style="color:${sc.c}">${sc.n}</strong>
    </div>
  `).join('');

  // Today table
  const tbody = document.getElementById('today-tbody');
  document.getElementById('today-count').textContent = `${todayData.length} enquiries today`;
  document.getElementById('dash-empty').style.display = todayData.length ? 'none' : 'block';
  tbody.innerHTML = todayData.slice(0,10).map(e => `
    <tr>
      <td class="enq-no-cell">${e.enqNo}</td>
      <td style="color:var(--muted);font-size:12px;">${e.time}</td>
      <td><strong>${e.name}</strong></td>
      <td>${e.mobile}</td>
      <td>${e.serviceIcon} ${e.service}</td>
      <td>${badgeHtml(e.status)}</td>
    </tr>
  `).join('') || '';
}

// ═══════════════ RECORDS ═══════════════
function renderRecords(search='', statusFilter='', svcFilter='') {
  if (!statusFilter) statusFilter = document.getElementById('filter-status')?.value || '';
  if (!svcFilter) svcFilter = document.getElementById('filter-svc')?.value || '';

  // Populate service filter
  const sfEl = document.getElementById('filter-svc');
  if (sfEl && sfEl.options.length <= 1) {
    SERVICES.forEach(s => {
      const o = document.createElement('option');
      o.value = s.name; o.textContent = s.icon + ' ' + s.name;
      sfEl.appendChild(o);
    });
  }

  let data = getData();
  const q = search.toLowerCase();
  if (q) data = data.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.enqNo.toLowerCase().includes(q) ||
    e.mobile.includes(q)
  );
  if (statusFilter) data = data.filter(e => e.status === statusFilter);
  if (svcFilter) data = data.filter(e => e.service === svcFilter);

  const tbody = document.getElementById('records-tbody');
  document.getElementById('records-empty').style.display = data.length ? 'none' : 'block';

  tbody.innerHTML = data.map((e,i) => `
    <tr>
      <td style="color:var(--muted);font-size:11px;">${i+1}</td>
      <td class="enq-no-cell">${e.enqNo}</td>
      <td style="font-size:11px;color:var(--muted);">${e.date}</td>
      <td><strong>${e.name}</strong></td>
      <td>${e.mobile}</td>
      <td style="font-size:11px;">${e.nationality||'—'}</td>
      <td>${e.serviceIcon} ${e.service}</td>
      <td style="font-size:11px;">${e.from||''}${e.from&&e.to?' → ':''}${e.to||''}</td>
      <td style="text-align:center;">${e.pax||'1'}</td>
      <td style="font-size:11px;">${e.agent||'—'}</td>
      <td>${badgeHtml(e.status)}</td>
      <td>
        <button class="del-btn" onclick="deleteEnq('${e.enqNo}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function badgeHtml(status) {
  const cls = { 'New':'badge-new','Pending':'badge-pending','Confirmed':'badge-confirmed','Cancelled':'badge-cancelled' };
  const icons = { 'New':'●','Pending':'⏳','Confirmed':'✅','Cancelled':'✗' };
  return `<span class="badge ${cls[status]||'badge-new'}">${icons[status]||'●'} ${status}</span>`;
}

function deleteEnq(enqNo) {
  if (!confirm(`Delete enquiry ${enqNo}?`)) return;
  let data = getData().filter(e => e.enqNo !== enqNo);
  saveData(data);
  renderRecords();
  showToast('🗑️ Enquiry deleted');
}

function exportCSV() {
  const data = getData();
  if (!data.length) { alert('No data to export.'); return; }
  const headers = ['EnqNo','Date','Time','Service','Name','Mobile','Email','Nationality','Passport','Pax','From','To','DepDate','RetDate','Class','Budget','Agent','Status','Remarks'];
  const rows = data.map(e => [
    e.enqNo,e.date,e.time,e.service,e.name,e.mobile,e.email||'',e.nationality||'',
    e.passport||'',e.pax||'1',e.from||'',e.to||'',e.depDate||'',e.retDate||'',
    e.travelClass||'',e.budget||'',e.agent||'',e.status,e.remarks||''
  ]);
  const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `travel_enquiries_${todayStr()}.csv`;
  a.click();
}

// ═══════════════ TOAST ═══════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ═══════════════ INIT ═══════════════
buildServiceGrid();
initForm();
renderDashboard();
updateClock();
setInterval(updateClock, 1000);
setInterval(() => {
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
}, 30000);