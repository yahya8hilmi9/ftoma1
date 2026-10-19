/* FATOUMA — تبويبات الـ admin الإضافية: التحضير، الزبناء، الخصومات، التقييمات، الاشتراكات والعروض */
(function () {
  const F = window.FATOUMA;
  F.adminTabs = F.adminTabs || {};
  F.slotName = id => { const s = (F.config.slots || []).find(x => x.id === id); return s ? s.ar : ''; };
  const C = () => F.adminCtx;
  const $ = (s, r) => (r || document).querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const db = async () => C().S.init();
  const last9 = p => String(p || '').replace(/[^0-9]/g, '').slice(-9);
  const waLink = (phone, text) => 'https://wa.me/' + String(phone).replace(/^0/, '212').replace(/^\+/, '').replace(/[^0-9]/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  function saveCSV(rows, name) {
    const q = v => { let t = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '-' + ymd(new Date()) + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const missingSql = (e) => /relation|does not exist|schema cache|function|permission/i.test(String(e && e.message))
    ? '<div class="card-box"><p class="form-error">هاد الميزة محتاجة تشغّل ملف <b>backend/features.sql</b> فـ Supabase ← SQL Editor، ومن بعد كبّس "تحديث".</p></div>' : '<p class="form-error">' + C().esc(e.message || e) + '</p>';

  /* ---------- 🧾 ورقة التحضير ---------- */
  let prepDate = null;
  F.adminTabs.prep = function () {
    const { orders, esc, products } = C();
    const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
    if (!prepDate) prepDate = ymd(tmr);
    const open = o => !['completed', 'cancelled'].includes(o.status);
    const dated = orders.filter(o => open(o) && o.delivery_date === prepDate);
    const undated = orders.filter(o => open(o) && !o.delivery_date);
    const agg = {};
    const add = (name, q) => { agg[name] = (agg[name] || 0) + q; };
    const expand = list => list.forEach(o => (o.order_items || []).forEach(i => {
      const pc = C().packContents(i);
      if (pc) C().compText(pc.comp).forEach(t => { const m = t.match(/^(\d+) × (.+)$/); if (m) add(m[2], Number(m[1]) * i.quantity); });
      else add(i.product_name, i.quantity);
    }));
    expand(dated);
    const rows = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    const bySlot = {}; dated.forEach(o => { (bySlot[o.delivery_slot || 'any'] = bySlot[o.delivery_slot || 'any'] || []).push(o); });
    const slotLabel = k => k === 'any' ? 'أي وقت' : F.slotName(k);
    C().panel().innerHTML = `
      <div class="toolbar no-print">
        <label>تاريخ التوصيل <input type="date" id="prep-date" value="${prepDate}"></label>
        <button class="btn btn-sm btn-primary" id="prep-print">🖨️ طباعة</button>
      </div>
      <div class="card-box prep-sheet">
        <h3>ورقة التحضير — ${prepDate} (${dated.length} طلب)</h3>
        ${rows.length ? `<table class="admin-table"><thead><tr><th>القطعة</th><th>الكمية الإجمالية</th></tr></thead><tbody>${rows.map(([n, q]) => `<tr><td>${esc(n)}</td><td><b>${q}</b></td></tr>`).join('')}</tbody></table>` : '<p class="empty-note">ما كاين حتى طلب بهاد الموعد.</p>'}
        ${Object.keys(bySlot).map(k => `<h4>${esc(slotLabel(k))}</h4><ul class="prep-orders">${bySlot[k].map(o => `<li>#${o.order_number} · ${esc(o.customer_name)} · ${esc(o.customer_phone)} · ${esc(o.customer_city)} — ${esc(o.customer_address)}${o.is_gift ? ' 🎁' : ''}</li>`).join('')}</ul>`).join('')}
      </div>
      ${undated.length ? `<div class="card-box no-print"><h4>طلبات بلا موعد محدد (${undated.length}) — أقرب وقت</h4><ul class="prep-orders">${undated.map(o => `<li>#${o.order_number} · ${esc(o.customer_name)} · ${esc(o.customer_city)} · ${C().money(o.total)}</li>`).join('')}</ul></div>` : ''}`;
  };

  /* ---------- 👥 الزبناء ---------- */
  let cq = '';
  F.adminTabs.customers = function () {
    const { orders, esc, money } = C();
    const m = {};
    orders.forEach(o => {
      const k = last9(o.customer_phone); const c = m[k] || (m[k] = { phone: o.customer_phone, name: o.customer_name, city: o.customer_city, n: 0, total: 0, last: o.created_at, all: 0 });
      c.all++; if (o.status !== 'cancelled') { c.n++; c.total += Number(o.total); }
      if (o.created_at > c.last) { c.last = o.created_at; c.name = o.customer_name; c.city = o.customer_city; }
    });
    const q = cq.trim().toLowerCase();
    const list = Object.values(m).filter(c => !q || (c.name + c.phone + c.city).toLowerCase().includes(q)).sort((a, b) => b.total - a.total);
    C().panel().innerHTML = `
      <div class="toolbar"><input type="search" id="cq" placeholder="بحث: اسم، هاتف، مدينة" value="${esc(cq)}"><button class="btn btn-sm btn-ghost" id="cust-csv">تصدير CSV</button><small>${list.length} زبون</small></div>
      <div class="stock-wrap"><table class="admin-table"><thead><tr><th>الزبون</th><th>المدينة</th><th>الطلبات</th><th>المجموع</th><th>آخر طلب</th><th></th></tr></thead><tbody>
      ${list.map(c => `<tr><td>${esc(c.name)} ${c.n >= 3 ? '<span class="badge">وفيّ</span>' : ''}<br><small>${esc(c.phone)}</small></td><td>${esc(c.city)}</td><td>${c.n}</td><td>${money(c.total)}</td><td>${new Date(c.last).toLocaleDateString('fr-MA')}</td>
        <td class="nowrap"><a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="${waLink(c.phone, 'السلام عليكم ' + c.name + '، معاك فطومة 🌿')}">واتساب</a></td></tr>`).join('') || '<tr><td colspan="6" class="empty-note">لا زبناء.</td></tr>'}</tbody></table></div>`;
    C().panel().dataset.custList = '1'; F._custList = list;
  };

  /* ---------- 🏷️ الخصومات ---------- */
  F.adminTabs.codes = async function () {
    const { esc, money } = C();
    C().panel().innerHTML = '<p>...</p>';
    let rows;
    try { const { data, error } = await (await db()).from('discount_codes').select('*').order('created_at', { ascending: false }); if (error) throw error; rows = data; }
    catch (e) { C().panel().innerHTML = missingSql(e); return; }
    C().panel().innerHTML = `
      <div class="card-box"><h3>كودات الخصم (${rows.length})</h3>
        <div class="stock-wrap"><table class="admin-table"><thead><tr><th>الكود</th><th>الخصم</th><th>الحد الأدنى</th><th>الاستعمال</th><th>ينتهي</th><th>مفعّل</th><th></th></tr></thead><tbody>
        ${rows.map(r => `<tr><td><b>${esc(r.code)}</b></td><td>${r.kind === 'percent' ? Number(r.value) + '%' : money(r.value)}</td><td>${money(r.min_total)}</td><td>${r.uses}${r.max_uses ? ' / ' + r.max_uses : ''}</td><td>${r.expires_at ? new Date(r.expires_at).toLocaleDateString('fr-MA') : '—'}</td>
          <td><input type="checkbox" data-code-active="${esc(r.code)}" ${r.active ? 'checked' : ''}></td><td><button class="btn btn-sm btn-ghost danger" data-code-del="${esc(r.code)}">حذف</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty-note">ما كاين حتى كود.</td></tr>'}</tbody></table></div></div>
      <form id="code-form" class="form card-box" style="max-width:560px"><h3 style="margin:0">كود جديد</h3>
        <div class="row2"><div class="field"><label>الكود (حروف/أرقام)</label><input name="code" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_-]+" placeholder="FATOUMA10"></div>
          <div class="field"><label>النوع</label><select name="kind"><option value="percent">نسبة %</option><option value="fixed">مبلغ ثابت</option></select></div></div>
        <div class="row2"><div class="field"><label>القيمة</label><input name="value" type="number" min="1" step="1" required></div>
          <div class="field"><label>الحد الأدنى للطلب</label><input name="min_total" type="number" min="0" step="1" value="0"></div></div>
        <div class="row2"><div class="field"><label>عدد الاستعمالات (فارغ = بلا حد)</label><input name="max_uses" type="number" min="1" step="1"></div>
          <div class="field"><label>ينتهي فـ (اختياري)</label><input name="expires" type="date"></div></div>
        <p class="form-error" id="code-err" hidden></p><button class="btn btn-primary" type="submit">إضافة الكود</button></form>`;
  };

  /* ---------- ⭐ التقييمات ---------- */
  F.adminTabs.reviews = async function () {
    const { esc } = C();
    C().panel().innerHTML = '<p>...</p>';
    let rows;
    try { const { data, error } = await (await db()).from('reviews').select('*').order('created_at', { ascending: false }).limit(200); if (error) throw error; rows = data; }
    catch (e) { C().panel().innerHTML = missingSql(e); return; }
    const pend = rows.filter(r => !r.approved);
    const card = r => `<article class="order ${r.approved ? 's-completed' : 's-new'}"><div class="order-top"><h3>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} · ${esc(r.name)}</h3><small>${new Date(r.created_at).toLocaleString('fr-MA')}${r.product_slug ? ' · ' + esc(r.product_slug) : ''}</small></div>
      <p>${esc(r.comment)}</p><div class="order-foot"><span></span>${r.approved ? `<button class="btn btn-sm btn-ghost" data-rev-hide="${r.id}">إخفاء</button>` : `<button class="btn btn-sm btn-primary" data-rev-ok="${r.id}">قبول ونشر</button>`}<button class="btn btn-sm btn-ghost danger" data-rev-del="${r.id}">حذف</button></div></article>`;
    C().panel().innerHTML = `<h3>فـ الانتظار (${pend.length})</h3>${pend.map(card).join('') || '<p class="empty-note">لا تقييمات جديدة.</p>'}<h3>منشورة</h3>${rows.filter(r => r.approved).map(card).join('') || '<p class="empty-note">لا شيء.</p>'}`;
  };

  /* ---------- 📩 الاشتراكات وطلبات الشركات ---------- */
  F.adminTabs.requests = async function () {
    const { esc } = C();
    C().panel().innerHTML = '<p>...</p>';
    let subs, quotes;
    try {
      const c = await db();
      const [a, b] = await Promise.all([c.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(200), c.from('quotes').select('*').order('created_at', { ascending: false }).limit(200)]);
      if (a.error) throw a.error; if (b.error) throw b.error; subs = a.data; quotes = b.data;
    } catch (e) { C().panel().innerHTML = missingSql(e); return; }
    const sel = (tbl, id, cur, opts) => `<select data-req-status="${tbl}:${id}">${opts.map(([k, l]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    C().panel().innerHTML = `
      <h3>اشتراكات الفطور (${subs.length})</h3>
      ${subs.map(s => `<article class="order s-${s.status === 'new' ? 'new' : s.status === 'active' ? 'completed' : 'cancelled'}"><div class="order-top"><h3>${esc(s.name)} · ${esc(s.plan)}</h3><small>${new Date(s.created_at).toLocaleString('fr-MA')}</small></div>
        <div class="order-meta"><span>📞 <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a> · <a target="_blank" rel="noopener" href="${waLink(s.phone, 'السلام عليكم ' + s.name + '، بخصوص اشتراك الفطور من فطومة')}">واتساب</a></span><span>📍 ${esc(s.city)} — ${esc(s.address)}</span><span>📅 ${esc(s.day || '')}</span></div>
        ${s.notes ? `<div class="note">📝 ${esc(s.notes)}</div>` : ''}<div class="order-foot"><span></span><label>الحالة ${sel('subscriptions', s.id, s.status, [['new', 'جديد'], ['active', 'نشط'], ['paused', 'متوقف'], ['cancelled', 'ملغى']])}</label></div></article>`).join('') || '<p class="empty-note">لا اشتراكات.</p>'}
      <h3>عروض الأثمنة للشركات والمناسبات (${quotes.length})</h3>
      ${quotes.map(q => `<article class="order s-${q.status === 'new' ? 'new' : 'completed'}"><div class="order-top"><h3>${esc(q.name)}${q.company ? ' · ' + esc(q.company) : ''}</h3><small>${new Date(q.created_at).toLocaleString('fr-MA')}</small></div>
        <div class="order-meta"><span>📞 <a href="tel:${esc(q.phone)}">${esc(q.phone)}</a> · <a target="_blank" rel="noopener" href="${waLink(q.phone, 'السلام عليكم ' + q.name + '، بخصوص طلب عرض الثمن من فطومة')}">واتساب</a></span>${q.email ? `<span>✉️ ${esc(q.email)}</span>` : ''}<span>📅 ${esc(q.event_date || '—')} · 👥 ${esc(q.people || '—')}</span></div>
        ${q.message ? `<div class="note">${esc(q.message)}</div>` : ''}<div class="order-foot"><span></span><label>الحالة ${sel('quotes', q.id, q.status, [['new', 'جديد'], ['answered', 'تم الرد'], ['done', 'مكتمل']])}</label></div></article>`).join('') || '<p class="empty-note">لا طلبات.</p>'}`;
  };

  /* ---------- الأحداث ---------- */
  document.addEventListener('input', e => {
    if (e.target.id === 'cq') { cq = e.target.value; const p = e.target.selectionStart; F.adminTabs.customers(); const n = $('#cq'); n.focus(); n.setSelectionRange(p, p); }
  });
  document.addEventListener('change', async e => {
    const t = e.target;
    try {
      if (t.id === 'prep-date') { prepDate = t.value; return F.adminTabs.prep(); }
      if (t.dataset.codeActive) { const { error } = await (await db()).from('discount_codes').update({ active: t.checked }).eq('code', t.dataset.codeActive); if (error) throw error; return C().toast('تم'); }
      if (t.dataset.reqStatus) { const [tbl, id] = t.dataset.reqStatus.split(':'); const { error } = await (await db()).from(tbl).update({ status: t.value }).eq('id', id); if (error) throw error; return C().toast('تم'); }
    } catch (ex) { console.error(ex); C().toast('تعذّر الحفظ'); }
  });
  document.addEventListener('click', async e => {
    const t = e.target.closest('#prep-print,#cust-csv,[data-code-del],[data-rev-ok],[data-rev-hide],[data-rev-del]'); if (!t) return;
    try {
      if (t.id === 'prep-print') return window.print();
      if (t.id === 'cust-csv') return saveCSV([['الاسم', 'الهاتف', 'المدينة', 'الطلبات', 'المجموع', 'آخر طلب']].concat((F._custList || []).map(c => [c.name, c.phone, c.city, c.n, c.total, c.last])), 'customers');
      const c = await db();
      if (t.dataset.codeDel) { if (!confirm('حذف الكود ' + t.dataset.codeDel + '؟')) return; const { error } = await c.from('discount_codes').delete().eq('code', t.dataset.codeDel); if (error) throw error; return F.adminTabs.codes(); }
      if (t.dataset.revOk || t.dataset.revHide) { const { error } = await c.from('reviews').update({ approved: !!t.dataset.revOk }).eq('id', t.dataset.revOk || t.dataset.revHide); if (error) throw error; return F.adminTabs.reviews(); }
      if (t.dataset.revDel) { if (!confirm('حذف هاد التقييم؟')) return; const { error } = await c.from('reviews').delete().eq('id', t.dataset.revDel); if (error) throw error; return F.adminTabs.reviews(); }
    } catch (ex) { console.error(ex); C().toast('تعذّرت العملية'); }
  });
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'code-form') return;
    e.preventDefault();
    const f = e.target, err = $('#code-err'); err.hidden = true;
    try {
      const g = n => f.elements[n].value.trim();
      const row = { code: g('code').toUpperCase(), kind: g('kind'), value: Number(g('value')), min_total: Number(g('min_total') || 0), max_uses: g('max_uses') ? parseInt(g('max_uses'), 10) : null, expires_at: g('expires') ? new Date(g('expires') + 'T23:59:59').toISOString() : null };
      if (row.kind === 'percent' && row.value > 100) throw new Error('النسبة لا يمكن أن تتجاوز 100');
      const { error } = await (await db()).from('discount_codes').insert(row); if (error) throw error;
      C().toast('تمت الإضافة ✓'); F.adminTabs.codes();
    } catch (ex) { err.textContent = /duplicate/i.test(ex.message) ? 'هاد الكود كاين من قبل.' : (ex.message || 'تعذّرت الإضافة'); err.hidden = false; }
  });
})();
