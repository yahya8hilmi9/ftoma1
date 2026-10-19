/* ============================================================
   FATOUMA — ميزات إضافية: الموعد، الخصم، الهدية، المناسبات، التقييمات،
   الاشتراك، طلبات الشركات، المشاركة، PWA، SEO
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});
  const cfg = F.config, V = F.views;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');

  /* ---------- الوقت بتوقيت المغرب ---------- */
  F.nowMA = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
  F.ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  F.ymdPlus = n => { const d = F.nowMA(); d.setDate(d.getDate() + n); return F.ymd(d); };
  F.minDeliveryDate = () => { const n = F.nowMA(); if (n.getHours() >= cfg.cutoffHour) n.setDate(n.getDate() + 1); return F.ymd(n); };
  F.slotName = id => { const s = (cfg.slots || []).find(x => x.id === id); return s ? s.ar : ''; };
  F.cutoffText = () => {
    const n = F.nowMA(), c = new Date(n); c.setHours(cfg.cutoffHour, 0, 0, 0);
    const ms = c - n;
    if (ms <= 0) return '🌙 سالات طلبات اليوم. طلبك دابا غادي يتوصل غدا بإذن الله.';
    const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    return '⏰ اطلب فـ ' + (h ? h + ' س و ' : '') + m + ' د الجاية ويوصلك اليوم (داخل المدينة).';
  };
  F.tickCutoff = () => { const t = F.cutoffText(); $$('.js-cutoff').forEach(e => { if (e.textContent !== t) e.textContent = t; }); };

  /* ---------- الأسماء والمخزون القليل ---------- */
  const baseBadge = F.badge;
  F.badge = it => {
    if (typeof it.stock === 'number' && it.stock > 0 && it.stock <= cfg.lowStock) return '<span class="badge badge-low">باقي ' + it.stock + ' فقط</span>';
    return baseBadge(it);
  };
  F.staticIds = (F.items || []).map(i => i.id); // المنتجات اللي عندها صفحة مشاركة جاهزة /share/<id>.html

  /* ---------- مشاركة منتج ---------- */
  F.shareUrl = it => cfg.siteUrl + (F.staticIds.indexOf(it.id) > -1 ? 'share/' + it.id + '.html' : '#/product/' + it.id);
  F.shareItem = async it => {
    const text = it.ar + ' — ' + F.money(it.price) + ' من فطومة 🌿';
    const url = F.shareUrl(it);
    if (navigator.share) { try { await navigator.share({ title: it.ar, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank');
  };

  /* ---------- صفحات المناسبات ---------- */
  F.occasionPages = {
    ramadan: { occ: 'ramadan', ar: 'رمضان', title: 'مائدة رمضان مع فطومة', icon: 'moon', date: '2027-02-08', dateLabel: 'بداية رمضان (تاريخ تقريبي)',
      blurb: 'من الحرشة والبغرير للسحور، للشباكية وسلو والحلويات للفطور. حضّر مائدتك من قبل الزحمة.',
      tips: ['اطلب 48 ساعة قبل على الأقل فـ أيام رمضان الأولى', 'الـ Packs العائلية كتوفر عليك التحضير', 'تقدر تحدد وقت التوصيل قبل الفطور'] },
    eid: { occ: 'eid', ar: 'الأعياد', title: 'حلويات العيد', icon: 'star', date: '2027-03-10', dateLabel: 'عيد الفطر (تاريخ تقريبي)',
      blurb: 'غريبة، كعب الغزال، فقاص وحلويات العيد باش تستقبل الضيوف بالمذاق الأصيل.',
      tips: ['اطلب قبل العيد بـ 3 أيام باش تضمن الموعد', 'علب هدايا بتغليف خاص', 'Packs Premium و VIP للعائلة والأصدقاء'] },
    wedding: { occ: 'wedding', ar: 'الأعراس', title: 'حلويات الأعراس والحفلات', icon: 'ring', date: '',
      blurb: 'طلبات كبيرة لأفراحكم: أطباق مرتبة وحلويات تقليدية بكميات على قدر الحفلة.',
      tips: ['اطلب قبل أسبوع على الأقل', 'للكميات الكبيرة استعمل طلب عرض الثمن', 'ممكن نخصصو التغليف'], quote: true },
    aqiqah: { occ: 'family', ar: 'العقيقة والمناسبات العائلية', title: 'العقيقة، الولادة والمناسبات العائلية', icon: 'home', date: '',
      blurb: 'فرحة المولود والجمعات العائلية: فطائر وحلويات تكفي الجميع، وتوصلك على الوقت.',
      tips: ['اطلب قبل 3 أيام', 'حدد موعد التوصيل فـ الصباح أو العشية', 'Packs عائلية جاهزة وقابلة للتعديل'], quote: true }
  };
  F.occasionPageFor = occId => Object.keys(F.occasionPages).find(k => F.occasionPages[k].occ === occId) || '';
  V.occasion = id => {
    const o = F.occasionPages[id]; if (!o) return V.notFound();
    const list = F.filterItems({ occ: o.occ });
    const items = list.length ? list : F.items.filter(i => i.cat.indexOf('packs') === 0);
    return `
    <section class="page-head zellige occ-head">
      <div class="container">
        <nav class="crumbs crumbs-head"><a href="#/">الرئيسية</a> / <span>${o.ar}</span></nav>
        ${F.icon(o.icon, 42)}
        <h1>${o.title}</h1>
        <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
        <p>${o.blurb}</p>
        ${o.date ? `<div class="countdown js-countdown" data-date="${o.date}" aria-live="off"><span class="cd-label">${o.dateLabel}</span><span class="cd-val"></span></div>` : ''}
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <ul class="tips">${o.tips.map(t => `<li>${F.icon('check', 18)} ${t}</li>`).join('')}</ul>
        <p class="result-count">${items.length} منتج مقترح</p>
        ${F.grid(items)}
        <div class="center cta-row">
          <a class="btn btn-ghost" href="#/shop?occ=${o.occ}">كل منتجات هاد المناسبة</a>
          ${o.quote ? '<a class="btn btn-primary" href="#/corporate">اطلب عرض ثمن لكمية كبيرة</a>' : ''}
          <a class="btn btn-wa" href="${F.waLink('السلام عليكم، بغيت نستفسر على طلب ' + o.ar)}" target="_blank" rel="noopener">${F.icon('whatsapp', 20)} استفسر عبر واتساب</a>
        </div>
      </div>
    </section>`;
  };
  F.tickCountdown = () => {
    $$('.js-countdown').forEach(el => {
      const ms = new Date(el.dataset.date + 'T00:00:00') - new Date();
      const v = el.querySelector('.cd-val'); if (!v) return;
      if (ms <= 0) { v.textContent = 'وصلات المناسبة 🌿'; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      v.innerHTML = `<b>${d}</b> يوم <b>${h}</b> ساعة <b>${m}</b> دقيقة`;
    });
  };

  /* ---------- التقييمات ---------- */
  V.reviewsBlock = slug => `
    <div class="reviews" data-slug="${esc(slug)}">
      <div class="reviews-list" aria-live="polite"><p class="muted">...</p></div>
      <details class="review-form-wrap"><summary class="btn btn-ghost btn-sm">✍️ اكتب رأيك</summary>
        <form class="form review-form" data-form="review" novalidate>
          <input type="hidden" name="slug" value="${esc(slug)}">
          <div class="field"><label>اسمك</label><input name="name" maxlength="60" required autocomplete="given-name"><small class="err"></small></div>
          <div class="field"><label>التقييم</label>
            <select name="rating" required>${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</option>`).join('')}</select></div>
          <div class="field"><label>رأيك</label><textarea name="comment" rows="3" maxlength="500" required></textarea><small class="err"></small></div>
          <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="form-msg" role="status" hidden></p>
          <button class="btn btn-primary" type="submit">إرسال الرأي</button>
          <small class="muted">كيبان فالموقع من بعد مراجعتنا.</small>
        </form></details>
    </div>`;
  F.fillReviews = async () => {
    const hosts = $$('.reviews'); if (!hosts.length || !F.supabase || !F.supabase.configured) { hosts.forEach(h => { h.querySelector('.reviews-list').innerHTML = ''; }); return; }
    for (const h of hosts) {
      const box = h.querySelector('.reviews-list');
      try {
        const rows = await F.supabase.getReviews(h.dataset.slug);
        if (!h.isConnected) continue;
        const sf = F.supabase.safeText.bind(F.supabase);
        box.innerHTML = rows.length
          ? `<ul class="review-cards">${rows.slice(0, h.dataset.slug ? 10 : 6).map(r => `<li class="review"><div class="stars" aria-label="${Number(r.rating)} / 5">${'★'.repeat(Math.max(1, Math.min(5, Number(r.rating))))}<span>${'★'.repeat(5 - Math.max(1, Math.min(5, Number(r.rating))))}</span></div><p>${esc(sf(r.comment))}</p><small>— ${esc(sf(r.name))}</small></li>`).join('')}</ul>`
          : '<p class="muted center">كون أول واحد يقيّم 🌿</p>';
      } catch (e) { box.innerHTML = ''; }
    }
  };

  /* ---------- صفحة اشتراك الفطور ---------- */
  V.breakfast = () => `
    <section class="page-head zellige"><div class="container"><span class="kicker">Abonnement</span><h1>اشتراك فطور الأسبوع ☀️</h1>
      <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
      <p>فطورة مغربية طازجة كتوصلك كل أسبوع فنفس اليوم: مسمن، حرشة، بغرير، بطبوط وغيرها، بلا ما تفكر.</p></div></section>
    <section class="section section-tight"><div class="container narrow">
      <ul class="tips"><li>${F.icon('check', 18)} تختار الباقة واليوم المناسب ليك</li><li>${F.icon('check', 18)} كنعيطو ليك لتأكيد الثمن والتفاصيل</li><li>${F.icon('check', 18)} تقدر توقف أو تبدل الاشتراك فأي وقت</li></ul>
      <form class="form" data-form="subscription" novalidate>
        <div class="field"><label>الاسم الكامل</label><input name="name" required maxlength="100" autocomplete="name"><small class="err"></small></div>
        <div class="field"><label>رقم الهاتف</label><input name="phone" type="tel" inputmode="tel" required placeholder="06 00 00 00 00" autocomplete="tel"><small class="err"></small></div>
        <div class="row2"><div class="field"><label>المدينة</label><input name="city" required maxlength="80" autocomplete="address-level2"><small class="err"></small></div>
          <div class="field"><label>العنوان</label><input name="address" required maxlength="250" autocomplete="street-address"><small class="err"></small></div></div>
        <div class="row2"><div class="field"><label>الباقة</label><select name="plan">
            <option value="فردي (1–2 أشخاص)">فردي (1–2 أشخاص)</option><option value="عائلي (3–5 أشخاص)">عائلي (3–5 أشخاص)</option><option value="كبير (6 أشخاص أو أكثر)">كبير (6 أشخاص أو أكثر)</option></select></div>
          <div class="field"><label>اليوم</label><select name="day"><option>كل جمعة</option><option>كل سبت</option><option>كل أحد</option><option>السبت والأحد</option><option>كل أيام الأسبوع</option></select></div></div>
        <div class="field"><label>ملاحظات (حساسية، تفضيلات…)</label><textarea name="notes" rows="2" maxlength="300"></textarea></div>
        <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" role="status" hidden></p>
        <button class="btn btn-primary btn-block" type="submit">اشترك</button>
      </form></div></section>`;

  /* ---------- صفحة طلبات الشركات ---------- */
  V.corporate = () => `
    <section class="page-head zellige"><div class="container"><span class="kicker">Entreprises & Événements</span><h1>طلبات الشركات والمناسبات 🏢</h1>
      <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
      <p>اجتماعات، ندوات، أعراس، عقيقة، أو هدايا الزبناء: كميات كبيرة بتغليف مرتب وعرض ثمن فـ 24 ساعة.</p></div></section>
    <section class="section section-tight"><div class="container narrow">
      <form class="form" data-form="quote" novalidate>
        <div class="row2"><div class="field"><label>الاسم</label><input name="name" required maxlength="100" autocomplete="name"><small class="err"></small></div>
          <div class="field"><label>الشركة / الجهة (اختياري)</label><input name="company" maxlength="100" autocomplete="organization"></div></div>
        <div class="row2"><div class="field"><label>الهاتف</label><input name="phone" type="tel" inputmode="tel" required placeholder="06 00 00 00 00" autocomplete="tel"><small class="err"></small></div>
          <div class="field"><label>Email (اختياري)</label><input name="email" type="email" maxlength="120" autocomplete="email"></div></div>
        <div class="row2"><div class="field"><label>تاريخ المناسبة</label><input name="event_date" type="date" min="${F.ymdPlus(0)}"></div>
          <div class="field"><label>عدد الأشخاص</label><input name="people" type="number" min="1" max="5000" inputmode="numeric"></div></div>
        <div class="field"><label>شنو محتاج؟</label><textarea name="message" rows="4" maxlength="600" placeholder="مثال: فطور لـ 40 شخص، مسمن وبغرير وحلويات…"></textarea></div>
        <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" role="status" hidden></p>
        <button class="btn btn-primary btn-block" type="submit">أرسل الطلب</button>
        <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="${F.waLink('السلام عليكم، بغيت عرض ثمن لطلب كبير من فطومة')}">${F.icon('whatsapp', 20)} أو تواصل معنا عبر واتساب</a>
      </form></div></section>`;

  /* ---------- معالجة النماذج (التقييم، الاشتراك، العروض) ---------- */
  const PHONE = /^(\+212|0)[5-7]\d{8}$/;
  const marks = { review: ['name', 'comment'], subscription: ['name', 'phone', 'city', 'address'], quote: ['name', 'phone'] };
  document.addEventListener('submit', async e => {
    const f = e.target; const kind = f.dataset && f.dataset.form; if (!kind) return;
    e.preventDefault();
    const msg = $('.form-msg', f), btn = $('button[type=submit]', f);
    const say = (t, bad) => { msg.textContent = t; msg.hidden = false; msg.className = 'form-msg ' + (bad ? 'form-error' : 'form-ok'); };
    const v = Object.fromEntries(new FormData(f).entries());
    if (v.website) return say('شكراً!');
    let ok = true;
    (marks[kind] || []).forEach(k => {
      const val = String(v[k] || '').trim();
      const good = k === 'phone' ? PHONE.test(val.replace(/[\s.-]/g, '')) : k === 'comment' ? val.length >= 3 : val.length >= (k === 'name' ? 2 : 2);
      const fl = f.elements[k].closest('.field'); fl.classList.toggle('invalid', !good);
      const er = fl.querySelector('.err'); if (er) er.textContent = good ? '' : (k === 'phone' ? 'رقم هاتف مغربي غير صالح' : 'هاد الخانة مطلوبة');
      if (!good) ok = false;
    });
    if (!ok) return;
    btn.disabled = true; msg.hidden = true;
    try {
      if (kind === 'review') await F.supabase.submitReview(v.slug, v.name.trim(), Number(v.rating), v.comment.trim());
      else await F.supabase.submitForm(kind, Object.assign({}, v, { website: undefined }));
      f.reset();
      say(kind === 'review' ? 'شكراً على رأيك! غادي يبان من بعد المراجعة. 🌿' : 'توصلنا بطلبك! غادي نتواصلو معك قريباً. 🌿');
    } catch (ex) {
      console.error(ex);
      say(/too many/i.test(String(ex && ex.message)) ? 'محاولات بزاف. عاود من بعد شوية.' : 'تعذّر الإرسال. عاود المحاولة أو تواصل معنا عبر واتساب.', true);
    } finally { btn.disabled = false; }
  });

  /* ---------- الخصم ---------- */
  F.applyCode = async (code, silent) => {
    const msg = $('#code-msg');
    code = String(code || '').trim().toUpperCase();
    if (!code) return;
    try {
      const r = await F.supabase.checkDiscount(code, F.cart.subtotal());
      if (r && r.ok) { F.discount = { code, amount: Number(r.amount) || 0, kind: r.kind, value: Number(r.value) }; }
      else {
        F.clearDiscount();
        if (msg && !silent) msg.textContent = r && r.reason === 'min' ? 'هاد الكود كيتطلب طلب بـ ' + F.money(r.min_total) + ' على الأقل.' : 'كود غير صالح أو منتهي.';
        if (silent) return refreshSummary();
        return;
      }
    } catch (ex) { if (msg && !silent) msg.textContent = 'تعذّر التحقق من الكود. عاود المحاولة.'; return; }
    refreshSummary();
  };
  function refreshSummary() { const s = $('#summary'); if (!s) return; const d = $('input[name=delivery]:checked'); s.innerHTML = V.summary(d ? d.value : 'city'); }
  F.refreshSummary = refreshSummary;

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]'); if (!el) return;
    const a = el.dataset.action;
    if (a === 'apply-code') F.applyCode(($('#c-code') || {}).value);
    else if (a === 'clear-code') { F.clearDiscount(); refreshSummary(); }
    else if (a === 'share-item') { const c = el.closest('[data-id]'); const it = c && F.byId(c.dataset.id); if (it) F.shareItem(it); }
    else if (a === 'reorder') {
      const o = F.lastTracked; if (!o) return;
      let n = 0;
      (o.items || []).forEach(i => {
        const op = i.options || {};
        const it = op.slug && F.byId(op.slug); if (!it) return;
        F.cart.add(it.id, Math.max(1, Number(i.qty) || 1), op.filling || null, op.comp || null); n++;
      });
      if (n) { document.body.classList.add('cart-open'); } else alert('بعض المنتجات ما بقاتش متوفرة دابا.');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'c-code') { e.preventDefault(); F.applyCode(e.target.value); } });
  document.addEventListener('change', e => {
    if (e.target.id === 'c-gift') { const g = $('#gift-fields'); if (g) g.hidden = !e.target.checked; }
  });

  /* ---------- SEO ديناميكي ---------- */
  F.setSeo = (title, desc, jsonld) => {
    document.title = title;
    const d = $('meta[name=description]'); if (d && desc) d.setAttribute('content', desc);
    let s = $('#jsonld-dyn');
    if (jsonld) { if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'jsonld-dyn'; document.head.appendChild(s); } s.textContent = JSON.stringify(jsonld); }
    else if (s) s.remove();
  };
  F.seoFor = (path) => {
    const base = 'فطومة · Fatouma';
    if (path.indexOf('/product/') === 0) {
      const it = F.byId(path.split('/')[2]);
      if (it) return F.setSeo(it.ar + ' — ' + base, it.desc || '', { '@context': 'https://schema.org', '@type': 'Product', name: it.ar, description: it.desc || '', brand: 'Fatouma', image: it.image ? new URL(it.image, cfg.siteUrl).href : undefined, offers: { '@type': 'Offer', priceCurrency: 'MAD', price: it.price, availability: 'https://schema.org/InStock' } });
    }
    const m = { '/shop': 'المتجر', '/checkout': 'إتمام الطلب', '/track': 'تتبع طلبك', '/breakfast': 'اشتراك فطور الأسبوع', '/corporate': 'طلبات الشركات والمناسبات' };
    if (path.indexOf('/occasion/') === 0 && F.occasionPages[path.split('/')[2]]) return F.setSeo(F.occasionPages[path.split('/')[2]].title + ' — ' + base, F.occasionPages[path.split('/')[2]].blurb);
    if (path.indexOf('/category/') === 0) { const c = F.categories.find(x => x.id === path.split('/')[2]); if (c) return F.setSeo(c.ar + ' — ' + base, c.blurb || ''); }
    if (m[path]) return F.setSeo(m[path] + ' — ' + base);
    F.setSeo('فطومة · Fatouma — فطائر وحلويات مغربية أصيلة', 'مذاق مغربي أصيل… بحب فطومة. مسمن، حرشة، بغرير، بطبوط وحلويات مغربية تقليدية مع Packs وتوصيل.');
  };

  /* ---------- PWA ---------- */
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; const b = $('#install-btn'); if (b) b.hidden = false; });
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action=install]'); if (!el || !deferred) return;
    deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; el.hidden = true; });
  });
  F.showInstall = () => { const b = $('#install-btn'); if (b && deferred) b.hidden = false; };
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
