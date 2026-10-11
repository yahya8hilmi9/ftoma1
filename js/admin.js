/* FATOUMA — لوحة التحكم: الطلبات + المخزون (Supabase) */
(function () {
  const F = window.FATOUMA;
  const S = F.supabase;
  const $ = (s, r) => (r || document).querySelector(s);
  const root = $('#admin-root');
  const STATUS = { new: 'جديد', confirmed: 'مؤكد', preparing: 'قيد التحضير', shipped: 'في الطريق', completed: 'مكتمل', cancelled: 'ملغى' };
  const DELIVERY = { city: 'داخل المدينة', nation: 'باقي المدن', pickup: 'استلام من المحل' };
  const CATS = {}; (F.categories || []).forEach(c => { CATS[c.id] = c.ar; });
  const LOW = 5;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (Number(n) % 1 ? Number(n).toFixed(2) : Number(n)) + ' ' + F.config.currency;

  let tab = 'orders', me = null, admins = null, adminErr = '', period = '30', orders = [], products = [], ofilter = 'all', oq = '', sq = '', scat = 'all', timer = null;

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---------- الدخول ---------- */
  function showLogin(msg) {
    $('#btn-logout').hidden = true;
    clearInterval(timer);
    root.innerHTML = `
      <form id="login" class="form login-card">
        <h2 style="margin:0">دخول المسؤول</h2>
        <div class="field"><label for="a-email">Email</label><input id="a-email" name="email" type="email" required autocomplete="username"></div>
        <div class="field"><label for="a-pass">كلمة السر</label><input id="a-pass" name="password" type="password" required autocomplete="current-password"></div>
        <p class="form-error" id="login-err" ${msg ? '' : 'hidden'}>${esc(msg || '')}</p>
        <button class="btn btn-primary btn-block" type="submit">دخول</button>
      </form>`;
  }

  function fail(m) {
    root.innerHTML = '<div class="form login-card"><h2 style="margin:0">خطأ</h2><p class="form-error">' + esc(m) + '</p><p>افتح Console (F12) وصيفط ليا الخطأ.</p></div>';
  }
  window.addEventListener('error', e => fail((e.message || 'JS error') + (e.filename ? ' — ' + e.filename.split('/').pop() + ':' + e.lineno : '')));
  window.addEventListener('unhandledrejection', e => fail((e.reason && e.reason.message) || String(e.reason)));

  async function boot() {
    if (!S || !S.configured) return showLogin('إعدادات Supabase ناقصة.');
    try {
      const session = await Promise.race([S.getAdminSession(), new Promise((_, rej) => setTimeout(() => rej(new Error('Supabase ما جاوبش (timeout). تأكد من الإنترنت ومن تحميل مكتبة Supabase.')), 10000))]);
      if (session) { me = session.user.id; return start(); }
    } catch (e) { console.warn(e); return showLogin(e.message); }
    showLogin();
  }

  // sign out automatically after 30 minutes without activity
  let idleT = null;
  function armIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(async () => { try { await S.signOut(); } catch (x) {} showLogin('تم تسجيل الخروج تلقائياً بسبب عدم النشاط.'); }, 30 * 60 * 1000);
  }
  ['click', 'keydown', 'touchstart', 'mousemove'].forEach(ev => document.addEventListener(ev, () => { if (!$('#btn-logout').hidden) armIdle(); }, { passive: true }));

  async function start() {
    armIdle();
    $('#btn-logout').hidden = false;
    await load();
    clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden && tab !== 'admins' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) load(true); }, 60000);
  }

  async function load(silent) {
    try {
      [orders, products] = await Promise.all([S.listOrders(), S.listAllProducts()]);
    } catch (e) {
      console.error(e);
      if (!silent) root.innerHTML = '<p class="form-error">تعذّر تحميل البيانات. تأكد أن حسابك مسجل كمسؤول.</p>';
      return;
    }
    render();
  }

  /* ---------- العرض ---------- */
  function render() {
    const today = new Date().toDateString();
    const nNew = orders.filter(o => o.status === 'new').length;
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled');
    const todayRev = todayOrders.reduce((a, o) => a + Number(o.total), 0);
    const open = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const lowN = products.filter(p => p.is_active && p.stock_quantity !== null && p.stock_quantity <= LOW).length;
    root.innerHTML = `
      <div class="stats">
        <div class="stat ${nNew ? 'warn' : ''}"><b>${nNew}</b><span>طلبات جديدة</span></div>
        <div class="stat"><b>${open}</b><span>طلبات قيد المعالجة</span></div>
        <div class="stat"><b>${todayOrders.length}</b><span>طلبات اليوم</span></div>
        <div class="stat"><b>${money(todayRev)}</b><span>مبيعات اليوم</span></div>
        <div class="stat ${lowN ? 'warn' : ''}"><b>${lowN}</b><span>مخزون قليل</span></div>
      </div>
      <div class="tabs">
        <button class="btn btn-sm ${tab === 'orders' ? 'btn-primary' : 'btn-ghost'}" data-tab="orders">الطلبات</button>
        <button class="btn btn-sm ${tab === 'stock' ? 'btn-primary' : 'btn-ghost'}" data-tab="stock">المنتجات والمخزون</button>
        <button class="btn btn-sm ${tab === 'stats' ? 'btn-primary' : 'btn-ghost'}" data-tab="stats">الإحصائيات</button>
        <button class="btn btn-sm ${tab === 'admins' ? 'btn-primary' : 'btn-ghost'}" data-tab="admins">المسؤولون</button>
        <span class="spacer"></span>
        <button class="btn btn-sm btn-ghost" id="btn-refresh">تحديث</button>
      </div>
      <div id="panel"></div>`;
    ({ orders: renderOrders, stock: renderStock, stats: renderStats, admins: renderAdmins }[tab] || renderOrders)();
  }

  function itemLine(i) {
    const op = i.options || {};
    const f = op.filling && F.fillingById && F.fillingById(op.filling);
    const comp = op.comp ? ' [معدّل: ' + Object.entries(op.comp).map(([k, q]) => q + '×' + ((F.byId(k) || {}).ar || k)).join('، ') + ']' : '';
    return `<li><span>${i.quantity} × ${esc(i.product_name)}${f ? ' (' + esc(f.ar) + ')' : ''}${esc(comp)}</span><b>${money(i.line_total)}</b></li>`;
  }

  function renderOrders() {
    const counts = { all: orders.length };
    Object.keys(STATUS).forEach(k => { counts[k] = orders.filter(o => o.status === k).length; });
    const q = oq.trim().toLowerCase();
    const list = orders.filter(o => (ofilter === 'all' || o.status === ofilter) &&
      (!q || [o.order_number, o.customer_name, o.customer_phone, o.customer_city].join(' ').toLowerCase().includes(q)));
    $('#panel').innerHTML = `
      <div class="toolbar">
        <input type="search" id="oq" placeholder="بحث: رقم الطلب، الاسم، الهاتف، المدينة" value="${esc(oq)}">
        <button class="btn btn-sm btn-ghost" id="btn-csv">تصدير CSV</button>
        <button class="btn btn-sm btn-ghost" id="btn-del-cancelled" ${counts.cancelled ? '' : 'disabled'}>حذف كل الطلبات الملغاة (${counts.cancelled})</button>
      </div>
      <div class="toolbar">
        ${['all'].concat(Object.keys(STATUS)).map(k => `<button class="chip ${ofilter === k ? 'on' : ''}" data-ofilter="${k}">${k === 'all' ? 'الكل' : STATUS[k]}<i>${counts[k]}</i></button>`).join('')}
      </div>
      ${list.map(o => {
        const phone = String(o.customer_phone).replace(/^0/, '212').replace(/^\+/, '');
        const wa = `https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم ' + o.customer_name + '، بخصوص طلبك رقم #' + o.order_number + ' من فطومة')}`;
        return `<article class="order s-${o.status}">
          <div class="order-top"><h3>#${o.order_number} · ${esc(o.customer_name)}</h3><small>${new Date(o.created_at).toLocaleString('fr-MA')}</small></div>
          <div class="order-meta">
            <span>📞 <a href="tel:${esc(o.customer_phone)}">${esc(o.customer_phone)}</a> · <a href="${wa}" target="_blank" rel="noopener">واتساب</a></span>
            <span>📍 ${esc(o.customer_city)} — ${esc(o.customer_address)}</span>
            <span>🚚 ${esc(DELIVERY[o.delivery_method] || o.delivery_method)}</span>
          </div>
          ${o.customer_notes ? `<div class="note">📝 ${esc(o.customer_notes)}</div>` : ''}
          <ul>${(o.order_items || []).map(itemLine).join('')}</ul>
          <div class="order-foot">
            <span>التوصيل: ${o.delivery_fee > 0 ? money(o.delivery_fee) : 'مجاني'} · <span class="tot">${money(o.total)}</span></span>
            <button class="btn btn-sm btn-ghost danger" data-del-order="${o.id}">حذف</button>
            <label>الحالة <select data-order="${o.id}">${Object.keys(STATUS).map(k => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${STATUS[k]}</option>`).join('')}</select></label>
          </div>
        </article>`;
      }).join('') || '<p class="empty-note">ما كاين حتى طلب فهاد التصنيف.</p>'}`;
  }

  function renderStock() {
    const cats = Array.from(new Set(products.map(p => p.category)));
    const q = sq.trim().toLowerCase();
    const list = products.filter(p => (scat === 'all' || p.category === scat) &&
      (!q || (p.name_ar + ' ' + p.slug).toLowerCase().includes(q)));
    $('#panel').innerHTML = `
      <div class="toolbar">
        <input type="search" id="sq" placeholder="بحث عن منتج" value="${esc(sq)}">
        <select id="scat"><option value="all">كل الأقسام</option>${cats.map(c => `<option value="${esc(c)}" ${c === scat ? 'selected' : ''}>${esc(CATS[c] || c)}</option>`).join('')}</select>
        <button class="btn btn-sm btn-primary" data-edit-product="">+ منتج جديد</button>
        <small>فارغ = غير محدود. المنتج اللي مخزونو 0 أو ماشي "معروض" كيختفي من الموقع.</small>
      </div>
      <div class="stock-wrap"><table class="admin-table">
        <thead><tr><th>المنتج</th><th>القسم</th><th>الثمن (${esc(F.config.currency)})</th><th>المخزون</th><th>معروض</th><th></th></tr></thead>
        <tbody>${list.map(p => {
          const st = p.stock_quantity;
          const badge = st === null ? '' : st <= 0 ? '<span class="badge out">منتهي</span>' : st <= LOW ? '<span class="badge low">قليل</span>' : '';
          return `<tr data-pid="${p.id}" class="${st !== null && st <= LOW ? 'low' : ''} ${p.is_active ? '' : 'off'}">
            <td>${esc(p.name_ar)} ${badge}<br><small>${esc(p.slug)}</small></td>
            <td>${CATS[p.category] ? esc(CATS[p.category]) : '<span class="badge low" title="هاد المنتج ما كيبانش فالموقع">قسم غير صالح</span>'}</td>
            <td><input type="number" min="0" step="0.5" name="price" value="${p.price}"></td>
            <td><input type="number" min="0" step="1" name="stock" value="${st === null ? '' : st}" placeholder="∞"></td>
            <td><input type="checkbox" name="active" ${p.is_active ? 'checked' : ''}></td>
            <td class="nowrap"><button class="btn btn-sm btn-primary" data-save>حفظ</button> <button class="btn btn-sm btn-ghost" data-edit-product="${p.id}">تعديل</button></td></tr>`;
        }).join('') || '<tr><td colspan="6" class="empty-note">لا نتائج.</td></tr>'}</tbody></table></div>`;
  }

  /* ---------- الإحصائيات التجارية ---------- */
  const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const dayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  function barRows(rows, fmt) {
    const max = Math.max.apply(null, rows.map(r => r.v).concat([1]));
    return rows.length ? `<div class="hbars">${rows.map(r => `
      <div class="hbar"><span class="hb-l">${esc(r.l)}</span>
        <span class="hb-t"><i style="width:${Math.max(2, r.v / max * 100)}%"></i></span>
        <b class="hb-v">${fmt ? fmt(r) : money(r.v)}</b></div>`).join('')}</div>` : '<p class="empty-note">لا معطيات.</p>';
  }

  function columnChart(points) {
    const W = 640, H = 190, pad = 22, max = Math.max.apply(null, points.map(p => p.v).concat([1]));
    const bw = (W - pad * 2) / points.length;
    const every = Math.ceil(points.length / 8);
    return `<svg viewBox="0 0 ${W} ${H + 24}" class="colchart" role="img" aria-label="المبيعات عبر الزمن">
      <line x1="${pad}" y1="${H}" x2="${W - pad}" y2="${H}" stroke="currentColor" opacity=".25"/>
      ${points.map((p, i) => { const h = p.v / max * (H - 16); const x = pad + i * bw;
        return `<rect x="${(x + bw * .15).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw * .7).toFixed(1)}" height="${Math.max(h, p.v ? 2 : 0).toFixed(1)}" rx="3" fill="var(--terracotta)"><title>${esc(p.l)}: ${money(p.v)}</title></rect>`
          + (i % every === 0 ? `<text x="${(x + bw / 2).toFixed(1)}" y="${H + 16}" text-anchor="middle" font-size="11" fill="currentColor" opacity=".7">${esc(p.l)}</text>` : ''); }).join('')}
    </svg>`;
  }

  function renderStats() {
    const now = new Date();
    const since = period === 'all' ? null : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (Number(period) - 1));
    const inP = orders.filter(o => !since || new Date(o.created_at) >= since);
    const valid = inP.filter(o => o.status !== 'cancelled');
    const cancelled = inP.length - valid.length;
    const rev = valid.reduce((a, o) => a + Number(o.total), 0);
    const goods = valid.reduce((a, o) => a + Number(o.subtotal), 0);
    const fees = valid.reduce((a, o) => a + Number(o.delivery_fee), 0);
    const itemsSold = valid.reduce((a, o) => a + (o.order_items || []).reduce((x, i) => x + i.quantity, 0), 0);
    const avg = valid.length ? rev / valid.length : 0;
    const phones = {}; valid.forEach(o => { phones[o.customer_phone] = (phones[o.customer_phone] || 0) + 1; });
    const custN = Object.keys(phones).length, repeatN = Object.values(phones).filter(n => n > 1).length;
    const done = inP.filter(o => o.status === 'completed').length;

    // time series
    let pts = [];
    if (period === 'all') {
      const m = {}; valid.forEach(o => { const d = new Date(o.created_at); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); m[k] = (m[k] || 0) + Number(o.total); });
      pts = Object.keys(m).sort().map(k => ({ l: k, v: m[k] }));
    } else {
      const n = Number(period), m = {}; valid.forEach(o => { const k = dayKey(new Date(o.created_at)); m[k] = (m[k] || 0) + Number(o.total); });
      for (let i = 0; i < n; i++) { const d = new Date(since.getFullYear(), since.getMonth(), since.getDate() + i); const k = dayKey(d); pts.push({ l: d.getDate() + '/' + (d.getMonth() + 1), v: m[k] || 0 }); }
    }

    // products
    const prod = {}; valid.forEach(o => (o.order_items || []).forEach(i => { const p = prod[i.product_name] || (prod[i.product_name] = { q: 0, v: 0 }); p.q += i.quantity; p.v += Number(i.line_total); }));
    const topProd = Object.entries(prod).sort((a, b) => b[1].v - a[1].v).slice(0, 8).map(([l, x]) => ({ l, v: x.v, q: x.q }));
    const city = {}; valid.forEach(o => { const k = o.customer_city.trim().toLowerCase(); city[k] = city[k] || { v: 0, n: 0 }; city[k].v += Number(o.total); city[k].n++; });
    const topCity = Object.entries(city).sort((a, b) => b[1].v - a[1].v).slice(0, 8).map(([l, x]) => ({ l, v: x.v, n: x.n }));
    const del = {}; valid.forEach(o => { del[o.delivery_method] = (del[o.delivery_method] || 0) + 1; });
    const wd = [0, 0, 0, 0, 0, 0, 0]; valid.forEach(o => { wd[new Date(o.created_at).getDay()] += Number(o.total); });
    const stat = Object.keys(STATUS).map(k => ({ l: STATUS[k], v: inP.filter(o => o.status === k).length }));

    $('#panel').innerHTML = `
      <div class="toolbar">
        ${[['7', '7 أيام'], ['30', '30 يوم'], ['90', '90 يوم'], ['all', 'الكل']].map(([k, l]) => `<button class="chip ${period === k ? 'on' : ''}" data-period="${k}">${l}</button>`).join('')}
        <button class="btn btn-sm btn-ghost" id="btn-csv">تصدير الطلبات CSV</button>
      </div>
      <div class="stats">
        <div class="stat"><b>${money(rev)}</b><span>رقم المعاملات (مع التوصيل)</span></div>
        <div class="stat"><b>${valid.length}</b><span>طلبات (بدون الملغاة)</span></div>
        <div class="stat"><b>${money(Math.round(avg))}</b><span>متوسط قيمة الطلب</span></div>
        <div class="stat"><b>${itemsSold}</b><span>قطع مباعة</span></div>
        <div class="stat"><b>${money(goods)}</b><span>مبيعات المنتجات</span></div>
        <div class="stat"><b>${money(fees)}</b><span>رسوم التوصيل المحصّلة</span></div>
        <div class="stat"><b>${custN}</b><span>زبناء (حسب الهاتف)</span></div>
        <div class="stat"><b>${pct(repeatN, custN)}%</b><span>زبناء عاودو الطلب</span></div>
        <div class="stat ${cancelled ? 'warn' : ''}"><b>${pct(cancelled, inP.length)}%</b><span>نسبة الإلغاء (${cancelled})</span></div>
        <div class="stat"><b>${pct(done, inP.length)}%</b><span>طلبات مكتملة</span></div>
      </div>
      <div class="card-box"><h3>المبيعات عبر الزمن</h3>${valid.length ? columnChart(pts) : '<p class="empty-note">ما كاين حتى طلب فهاد المدة.</p>'}</div>
      <div class="grid2">
        <div class="card-box"><h3>أفضل المنتجات (حسب المبيعات)</h3>${barRows(topProd, r => money(r.v) + ' · ' + r.q + ' قطعة')}</div>
        <div class="card-box"><h3>أفضل المدن</h3>${barRows(topCity, r => money(r.v) + ' · ' + r.n + ' طلب')}</div>
        <div class="card-box"><h3>المبيعات حسب اليوم</h3>${barRows(DAYS.map((l, i) => ({ l, v: wd[i] })))}</div>
        <div class="card-box"><h3>طرق التوصيل</h3>${barRows(Object.keys(del).map(k => ({ l: DELIVERY[k] || k, v: del[k] })), r => r.v + ' طلب')}
          <h3 style="margin-top:18px">حالات الطلبات</h3>${barRows(stat, r => r.v + ' طلب')}</div>
      </div>`;
  }

  /* ---------- المسؤولون ---------- */
  async function renderAdmins() {
    $('#panel').innerHTML = '<p>جاري التحميل...</p>';
    try { admins = await S.listAdmins(); adminErr = ''; }
    catch (e) { admins = null; adminErr = e.message || String(e); }
    if (!admins) {
      $('#panel').innerHTML = `<div class="card-box"><h3>إدارة المسؤولين</h3>
        <p class="form-error">${esc(adminErr)}</p>
        <p>غالباً ما شغلتيش ملف <b>backend/admin-management.sql</b>. حلو، انسخو، لصقو فـ Supabase ← SQL Editor ← Run، ومن بعد كبّس "تحديث".</p></div>`;
      return;
    }
    $('#panel').innerHTML = `
      <div class="card-box"><h3>المسؤولون (${admins.length})</h3>
        <ul class="admin-list">${admins.map(a => `
          <li><span>${esc(a.email)} ${a.user_id === me ? '<span class="badge">أنت</span>' : ''}<br><small>${new Date(a.created_at).toLocaleDateString('fr-MA')}</small></span>
            ${a.user_id === me ? '' : `<button class="btn btn-sm btn-ghost danger" data-rm-admin="${a.user_id}" data-email="${esc(a.email)}">إزالة</button>`}</li>`).join('')}</ul>
      </div>
      <form id="add-admin" class="form card-box" style="max-width:520px">
        <h3 style="margin:0">زيد مسؤول</h3>
        <p style="margin:0;color:var(--brown-soft)">كتب إيميل وكلمة سر (10 أحرف على الأقل) باش يتصاوب الحساب مباشرة. إلا كان الحساب كاين، خلي كلمة السر فارغة.</p>
        <div class="field"><label for="n-admin">Email</label><input id="n-admin" type="email" required placeholder="name@example.com" autocomplete="off"></div>
        <div class="field"><label for="n-pass">كلمة السر (للحساب الجديد)</label><input id="n-pass" type="text" minlength="10" autocomplete="off"></div>
        <p class="form-error" id="add-admin-err" hidden></p>
        <button class="btn btn-primary" type="submit">زيد كمسؤول</button>
      </form>`;
  }

  function downloadCSV() {
    // quote everything, and defuse spreadsheet formulas (=, +, -, @) in customer-supplied text
    const q = v => { let t = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    const rows = [['رقم', 'التاريخ', 'الاسم', 'الهاتف', 'المدينة', 'العنوان', 'التوصيل', 'المنتجات', 'المجموع الفرعي', 'رسوم التوصيل', 'المجموع', 'الحالة', 'ملاحظات']];
    orders.forEach(o => rows.push([o.order_number, o.created_at, o.customer_name, o.customer_phone, o.customer_city, o.customer_address, DELIVERY[o.delivery_method] || o.delivery_method,
      (o.order_items || []).map(i => i.quantity + 'x ' + i.product_name).join(' | '), o.subtotal, o.delivery_fee, o.total, STATUS[o.status] || o.status, o.customer_notes || '']));
    const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- نافذة المنتج (إضافة / تعديل / حذف) ---------- */
  function slugify(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  function openProduct(id) {
    const p = id ? products.find(x => x.id === id) : { name_ar: '', name_fr: '', description: '', category: (F.categories[0] || {}).id, price: '', unit: 'قطعة', stock_quantity: null, is_active: true, image_url: '' };
    if (!p) return;
    let dlg = $('#pdlg');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'pdlg'; document.body.appendChild(dlg); }
    const catOpts = (F.categories || []).map(c => `<option value="${esc(c.id)}" ${c.id === p.category ? 'selected' : ''}>${esc(c.ar)}</option>`).join('')
      + (CATS[p.category] || !p.category ? '' : `<option value="${esc(p.category)}" selected>${esc(p.category)} (غير صالح)</option>`);
    dlg.innerHTML = `
      <form id="pform" class="form" data-id="${id || ''}" data-slug="${esc(p.slug || '')}">
        <h2 style="margin:0">${id ? 'تعديل المنتج' : 'منتج جديد'}</h2>
        <div class="field"><label>الاسم بالعربية *</label><input name="name_ar" required maxlength="80" value="${esc(p.name_ar)}"></div>
        <div class="field"><label>الاسم بالفرنسية</label><input name="name_fr" maxlength="80" value="${esc(p.name_fr || '')}"></div>
        <div class="field"><label>الوصف</label><textarea name="description" rows="3" maxlength="400">${esc(p.description || '')}</textarea></div>
        <div class="row2">
          <div class="field"><label>القسم *</label><select name="category" required>${catOpts}</select></div>
          <div class="field"><label>الوحدة</label><input name="unit" maxlength="30" value="${esc(p.unit || '')}" placeholder="قطعة / علبة 250غ"></div>
        </div>
        <div class="row2">
          <div class="field"><label>الثمن (${esc(F.config.currency)}) *</label><input name="price" type="number" min="0" step="0.5" required value="${esc(p.price)}"></div>
          <div class="field"><label>المخزون (فارغ = غير محدود)</label><input name="stock" type="number" min="0" step="1" value="${p.stock_quantity === null || p.stock_quantity === undefined ? '' : p.stock_quantity}"></div>
        </div>
        <div class="field"><label>الصورة</label>
          <div class="img-row"><img id="pimg" alt="" ${p.image_url ? `src="${esc(p.image_url)}"` : 'hidden'}>
            <div><input type="file" name="image" accept="image/jpeg,image/png,image/webp">
              <button type="button" class="btn btn-sm btn-ghost" id="p-img-clear" ${p.image_url ? '' : 'hidden'}>حذف الصورة</button></div></div>
          <input type="hidden" name="image_url" value="${esc(p.image_url || '')}">
        </div>
        <label class="field-inline"><input type="checkbox" name="active" ${p.is_active ? 'checked' : ''}> معروض فالموقع</label>
        <p class="form-error" id="p-err" hidden></p>
        <div class="dlg-actions">
          <button class="btn btn-primary" type="submit">حفظ</button>
          <button class="btn btn-ghost" type="button" id="p-cancel">إلغاء</button>
          ${id ? '<button class="btn btn-ghost danger" type="button" id="p-delete">حذف المنتج</button>' : ''}
        </div>
      </form>`;
    dlg.showModal();
  }

  // resize + convert to JPEG (max 1000px) before upload
  function toJpegBlob(file) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error('تعذّر معالجة الصورة')), 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('ملف الصورة غير صالح')); };
      img.src = url;
    });
  }

  async function saveProductForm(f) {
    const err = $('#p-err'); err.hidden = true;
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      const g = n => f.elements[n];
      const price = parseFloat(g('price').value);
      const stock = g('stock').value.trim();
      if (!g('name_ar').value.trim()) throw new Error('الاسم بالعربية مطلوب');
      if (!Number.isFinite(price) || price < 0) throw new Error('ثمن غير صالح');
      if (stock !== '' && !(parseInt(stock, 10) >= 0)) throw new Error('مخزون غير صالح');
      let image_url = g('image_url').value.trim() || null;
      const file = g('image').files[0];
      if (file) {
        if (file.size > 12 * 1024 * 1024) throw new Error('الصورة كبيرة بزاف (12MB كحد أقصى)');
        image_url = await S.uploadImage(await toJpegBlob(file));
      }
      const row = { name_ar: g('name_ar').value.trim(), name_fr: g('name_fr').value.trim() || null, description: g('description').value.trim() || null,
        category: g('category').value, unit: g('unit').value.trim() || null, price, stock_quantity: stock === '' ? null : parseInt(stock, 10),
        is_active: g('active').checked, image_url };
      const id = f.dataset.id;
      if (id) await S.updateProduct(id, row);
      else {
        let slug = slugify(row.name_fr || '') || 'p-' + Date.now().toString(36);
        if (products.some(p => p.slug === slug)) slug += '-' + Math.random().toString(36).slice(2, 5);
        await S.createProduct(Object.assign({ slug }, row));
      }
      $('#pdlg').close();
      products = await S.listAllProducts();
      toast('تم الحفظ ✓'); render();
    } catch (ex) {
      console.error(ex);
      err.textContent = /bucket|storage|not found/i.test(ex.message || '') ? 'تعذّر رفع الصورة. تأكد أنك شغّلتي backend/admin-full.sql.' : (ex.message || 'تعذّر الحفظ');
      err.hidden = false; btn.disabled = false;
    }
  }

  /* ---------- الأحداث ---------- */
  document.addEventListener('submit', async e => {
    if (e.target.id === 'pform') { e.preventDefault(); return saveProductForm(e.target); }
    if (e.target.id === 'add-admin') {
      e.preventDefault();
      const err = $('#add-admin-err'); err.hidden = true;
      const email = $('#n-admin').value.trim();
      const pw = $('#n-pass').value;
      try {
        if (pw) {
          try { await S.createAdminAccount(email, pw); }
          catch (ex) { if (ex.status === 409) await S.addAdmin(email); else throw ex; }
        } else await S.addAdmin(email);
        toast('تمت الإضافة ✓'); renderAdmins();
      } catch (ex) {
        const m = ex.message || '';
        err.textContent = /not found/i.test(m) ? 'ما لقيتش حساب بهاد الإيميل. كتب كلمة سر باش يتصاوب الحساب.'
          : /Failed to send|FunctionsFetch|Function not found|404/i.test(m) ? 'دالة create-admin ما مفعّلاش. شوف backend/functions/create-admin.' : (m || 'تعذّرت الإضافة');
        err.hidden = false;
      }
      return;
    }
    if (e.target.id !== 'login') return;
    e.preventDefault();
    const err = $('#login-err'); err.hidden = true;
    const btn = e.target.querySelector('button'); btn.disabled = true;
    try {
      const r = await S.signInAdmin(e.target.email.value.trim(), e.target.password.value);
      me = r.user.id;
      start();
    } catch (ex) { err.textContent = ex.message || 'فشل الدخول'; err.hidden = false; btn.disabled = false; }
  });

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-tab],[data-ofilter],#btn-refresh,#btn-logout,[data-save],[data-period],#btn-csv,[data-del-order],#btn-del-cancelled,[data-rm-admin],[data-edit-product]');
    if (!t) return;
    if (t.hasAttribute('data-edit-product')) return openProduct(t.dataset.editProduct);
    if (t.dataset.period) { period = t.dataset.period; return renderStats(); }
    if (t.id === 'btn-csv') return downloadCSV();
    if (t.dataset.delOrder) {
      const o = orders.find(x => x.id === t.dataset.delOrder);
      if (!o || !confirm('حذف الطلب #' + o.order_number + ' نهائياً؟ هاد العملية ما كتتراجعش.\n(المخزون ما كيرجعش تلقائياً إلا ألغيتي الطلب قبل.)')) return;
      try { await S.deleteOrders([o.id]); orders = orders.filter(x => x.id !== o.id); toast('تم الحذف'); render(); }
      catch (ex) { console.error(ex); toast('تعذّر الحذف'); }
      return;
    }
    if (t.id === 'btn-del-cancelled') {
      const ids = orders.filter(o => o.status === 'cancelled').map(o => o.id);
      if (!ids.length || !confirm('حذف ' + ids.length + ' طلب ملغى نهائياً؟')) return;
      try { await S.deleteOrders(ids); orders = orders.filter(o => o.status !== 'cancelled'); toast('تم الحذف'); render(); }
      catch (ex) { console.error(ex); toast('تعذّر الحذف'); }
      return;
    }
    if (t.dataset.rmAdmin) {
      if (!confirm('إزالة ' + t.dataset.email + ' من المسؤولين؟')) return;
      try { await S.removeAdmin(t.dataset.rmAdmin); toast('تمت الإزالة'); renderAdmins(); }
      catch (ex) { toast(ex.message || 'تعذّرت الإزالة'); }
      return;
    }
    if (t.dataset.tab) { tab = t.dataset.tab; return render(); }
    if (t.dataset.ofilter) { ofilter = t.dataset.ofilter; return renderOrders(); }
    if (t.id === 'btn-refresh') { await load(); return toast('تم التحديث'); }
    if (t.id === 'btn-logout') { try { await S.signOut(); } catch (x) {} return showLogin(); }
    if (t.hasAttribute('data-save')) {
      const tr = t.closest('tr'); const g = n => tr.querySelector('[name=' + n + ']');
      const stock = g('stock').value.trim(); const price = parseFloat(g('price').value);
      if (!Number.isFinite(price) || price < 0 || (stock !== '' && !(parseInt(stock, 10) >= 0))) return toast('قيم غير صالحة');
      t.disabled = true;
      try {
        const patch = { price, stock_quantity: stock === '' ? null : parseInt(stock, 10), is_active: g('active').checked };
        await S.updateProduct(tr.dataset.pid, patch);
        Object.assign(products.find(p => p.id === tr.dataset.pid), patch);
        toast('تم الحفظ ✓'); renderStock();
      } catch (ex) { console.error(ex); toast('تعذّر الحفظ'); t.disabled = false; }
    }
  });

  document.addEventListener('click', async e => {
    if (e.target.id === 'p-cancel') return $('#pdlg').close();
    if (e.target.id === 'p-img-clear') { const f = $('#pform'); f.elements.image_url.value = ''; f.elements.image.value = ''; $('#pimg').hidden = true; e.target.hidden = true; return; }
    if (e.target.id === 'p-delete') {
      const f = $('#pform'); const p = products.find(x => x.id === f.dataset.id);
      if (!p || !confirm('حذف "' + p.name_ar + '" نهائياً؟ الطلبات القديمة كتبقى، والمنتج كيختفي من الموقع.')) return;
      try { await S.deleteProduct(p.id); products = products.filter(x => x.id !== p.id); $('#pdlg').close(); toast('تم الحذف'); render(); }
      catch (ex) { console.error(ex); toast('تعذّر الحذف'); }
    }
  });
  document.addEventListener('change', e => {
    if (e.target.name === 'image' && e.target.files[0]) { const im = $('#pimg'); im.src = URL.createObjectURL(e.target.files[0]); im.hidden = false; const c = $('#p-img-clear'); if (c) c.hidden = false; }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'oq') { oq = e.target.value; const pos = e.target.selectionStart; renderOrders(); const n = $('#oq'); n.focus(); n.setSelectionRange(pos, pos); }
    if (e.target.id === 'sq') { sq = e.target.value; const pos = e.target.selectionStart; renderStock(); const n = $('#sq'); n.focus(); n.setSelectionRange(pos, pos); }
  });

  document.addEventListener('change', async e => {
    if (e.target.id === 'scat') { scat = e.target.value; return renderStock(); }
    const id = e.target.dataset && e.target.dataset.order; if (!id) return;
    const o = orders.find(x => x.id === id); const prev = o.status;
    try { await S.setOrderStatus(id, e.target.value); o.status = e.target.value; toast('تم تغيير الحالة'); render(); }
    catch (ex) { console.error(ex); e.target.value = prev; toast('تعذّر تغيير الحالة'); }
  });

  boot();
})();
