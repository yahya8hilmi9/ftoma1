/* ============================================================
   FATOUMA — التطبيق: Router + الأحداث + الأنيميشن
   ============================================================ */
(function () {
  const F = window.FATOUMA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  let pendingScroll = null;
  let io = null;

  /* ---------- Reveal on scroll ---------- */
  function observe() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(e => e.classList.add('in')); return; }
    if (!io) {
      io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }), { threshold: 0.12 });
    }
    $$('.reveal:not(.in)').forEach(e => io.observe(e));
  }

  /* ---------- Router ---------- */
  function parse() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const params = {};
    (qs || '').split('&').forEach(p => { if (p) { const [k, v] = p.split('='); params[k] = decodeURIComponent(v || ''); } });
    return { path, params };
  }

  function render() {
    const { path, params } = parse();
    const main = $('#main');
    let html;
    if (path === '/') html = F.views.home();
    else if (path.indexOf('/category/') === 0) html = F.views.category(path.split('/')[2]);
    else if (path === '/shop') html = F.views.shop(params);
    else if (path.indexOf('/product/') === 0) html = F.views.product(path.split('/')[2]);
    else if (path === '/checkout') html = F.views.checkout();
    else if (path === '/admin') { location.replace('admin.html'); return; }
    else if (path === '/success') html = F.views.success(params);
    else if (path === '/track') html = F.views.track(params);
    else if (path.indexOf('/occasion/') === 0) html = F.views.occasion(path.split('/')[2]);
    else if (path === '/breakfast') html = F.views.breakfast();
    else if (path === '/corporate') html = F.views.corporate();
    else html = F.views.notFound();
    main.innerHTML = html;
    closeMenu();
    if (pendingScroll) {
      const t = document.getElementById(pendingScroll); pendingScroll = null;
      if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 60);
    } else window.scrollTo(0, 0);
    if (path === '/shop' && params.focus) { const q = $('#shop-q'); if (q) q.focus(); }
    observe();
    bindWalkIn(path === '/');
    afterRender(path);
  }

  function afterRender(path) {
    F.seoFor(path);
    F.tickCutoff(); F.tickCountdown();
    if (F.i18n) F.i18n.apply();
    if (document.querySelector('.reviews')) F.fillReviews().then(() => F.i18n && F.i18n.apply());
    F.showInstall();
  }

  /* الدخول للبيت: كلما نزل الزائر، كبرات صورة الباب وكأنه داخل للدار */
  let walkOff = null;
  function bindWalkIn(on) {
    if (walkOff) { walkOff(); walkOff = null; }
    const art = document.querySelector('.hero-art');
    if (!on || !art || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const hero = art.closest('.hero');
    const max = window.innerWidth < 860 ? 1.22 : 1.28;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.max(0, Math.min(1, window.scrollY / (hero.offsetHeight * 0.75)));
      art.style.setProperty('--walk', (1 + (max - 1) * p).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    walkOff = () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }

  /* ---------- Cart UI ---------- */
  function renderDrawer() {
    $('#drawer-root').innerHTML = F.views.drawer();
    F.cart.prev = {}; F.cart.lines().forEach(l => { F.cart.prev[l.key] = l.qty; });
    $('#cart-count').textContent = F.cart.count();
    $('#cart-count').classList.toggle('on', F.cart.count() > 0);
  }
  const openCart = () => { renderDrawer(); document.body.classList.add('cart-open');  };
  const closeCart = () => document.body.classList.remove('cart-open');
  function closeModal() { document.body.classList.remove('modal-open'); $('#modal-root').innerHTML = ''; }

  function readComp(b) {
    const c = {};
    $$('.bd-row', b).forEach(r => { const q = +r.querySelector('.bd-val').textContent; if (q > 0) c[r.dataset.cid] = q; });
    return c;
  }
  function refreshBuilder(b) {
    const it = F.byId(b.dataset.id), comp = readComp(b), total = F.compTotal(comp);
    const price = total ? F.packPrice(it, comp) : 0;
    b.querySelector('.bd-price').textContent = F.money(price);
    b.querySelector('.bd-old').textContent = F.isCustomComp(it, comp) ? F.money(it.price) : '';
    b.querySelector('.bd-count').textContent = total + ' قطعة';
    $$('.bd-row', b).forEach(r => r.classList.toggle('on', +r.querySelector('.bd-val').textContent > 0));
    const w = b.querySelector('.bd-fill-wrap'); if (w) w.hidden = !F.compHasMamar(comp);
    const host = b.closest('.pdp');
    if (host) {
      const pe = host.querySelector('.pdp-price'); if (pe) pe.innerHTML = price + '<small> ' + F.config.currency + '</small>';
      const ab = host.querySelector('[data-action=add]'); if (ab) ab.disabled = !total;
    }
  }

  function closeMenu() { document.body.classList.remove('menu-open'); }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  F.cart.on(() => {
    renderDrawer();
    if (F.discount.code) F.applyCode(F.discount.code, true);
    if (F.i18n) F.i18n.apply();
    const sum = $('#summary');
    if (sum) {
      const d = $('input[name=delivery]:checked');
      if (F.cart.lines().length) { sum.innerHTML = F.views.summary(d ? d.value : 'city'); if (F.i18n) F.i18n.apply(); } else render();
    }
  });

  /* ---------- Events ---------- */
  document.addEventListener('click', e => {
    const sc = e.target.closest('[data-scroll]');
    if (sc) {
      e.preventDefault();
      const id = sc.dataset.scroll;
      if (parse().path === '/') { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }
      else { pendingScroll = id; location.hash = '#/'; }
      return;
    }
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    const card = el.closest('[data-id]');

    switch (a) {
      case 'toggle-lang': F.i18n.toggle(); break;
      case 'toggle-menu': document.body.classList.toggle('menu-open'); break;
      case 'open-cart': openCart(); break;
      case 'close-cart': closeCart(); break;
      case 'qty-inc': case 'qty-dec': {
        const v = el.parentElement.querySelector('.qty-val');
        v.textContent = Math.max(1, Math.min(99, (+v.textContent) + (a === 'qty-inc' ? 1 : -1)));
        break;
      }
      case 'add': {
        const it = F.byId(card.dataset.id);
        const qty = +card.querySelector('.card-actions .qty-val').textContent || 1;
        const bd = card.querySelector('.builder');
        let option = null, comp = null;
        if (bd) {
          comp = readComp(bd);
          if (!F.compTotal(comp)) { toast('اختر قطعة واحدة على الأقل'); break; }
          const sel = bd.querySelector('.bd-fill');
          option = F.compHasMamar(comp) && sel ? sel.value : null;
        } else {
          const sel = card.querySelector('.filling');
          option = sel ? sel.value : null;
        }
        F.cart.add(it.id, qty, option, comp);
        document.body.classList.add('cart-open');
        break;
      }
      case 'line-inc': case 'line-dec': {
        const key = el.closest('.cart-line').dataset.key;
        const l = F.cart.lines().find(x => x.key === key);
        if (l) F.cart.setQty(key, l.qty + (a === 'line-inc' ? 1 : -1));
        break;
      }
      case 'line-remove': F.cart.remove(el.closest('.cart-line').dataset.key); break;
      case 'wa-cart': window.open(F.waLink(F.orderMessage(null, 'city')), '_blank'); break;
      case 'wa-item': {
        const it = F.byId(card.dataset.id);
        const qty = +card.querySelector('.card-actions .qty-val').textContent || 1;
        const bd = card.querySelector('.builder');
        let option = null, comp = null;
        if (bd) { comp = readComp(bd); const sel = bd.querySelector('.bd-fill'); option = F.compHasMamar(comp) && sel ? sel.value : null; }
        else { const sel = card.querySelector('.filling'); option = sel ? sel.value : null; }
        window.open(F.waLink(F.itemMessage(it, qty, option, comp)), '_blank');
        break;
      }
      case 'comp-inc': case 'comp-dec': {
        const v = el.parentElement.querySelector('.bd-val');
        v.textContent = Math.max(0, Math.min(99, (+v.textContent) + (a === 'comp-inc' ? 1 : -1)));
        refreshBuilder(el.closest('.builder')); break;
      }
      case 'comp-reset': {
        const bd = el.closest('.builder'), it = F.byId(bd.dataset.id), d = F.defaultComp(it);
        $$('.bd-row', bd).forEach(r => { r.querySelector('.bd-val').textContent = d[r.dataset.cid] || 0; });
        refreshBuilder(bd); break;
      }
      case 'edit-pack': {
        const l = F.cart.lines().find(x => x.key === el.closest('.cart-line').dataset.key);
        if (!l) break;
        $('#modal-root').innerHTML = F.views.packModal(l);
        document.body.classList.add('modal-open'); break;
      }
      case 'comp-save': {
        const m = el.closest('.modal'), bd = m.querySelector('.builder'), comp = readComp(bd);
        if (!F.compTotal(comp)) { toast('اختر قطعة واحدة على الأقل'); break; }
        const sel = bd.querySelector('.bd-fill');
        closeModal();
        F.cart.setComp(m.dataset.key, comp, sel ? sel.value : null);
        break;
      }
      case 'close-modal': closeModal(); break;
      case 'pdp-filling': {
        const f = el.dataset.f;
        $$('#pdp-fillings .chip').forEach(c => c.classList.toggle('active', c === el));
        card.querySelector('input.filling').value = f;
        const it = F.byId(card.dataset.id);
        $('#pdp-art').innerHTML = F.artHtml(it, f) + F.badge(it);
        break;
      }
      case 'shop-tab': {
        F.views.shopState.cat = el.dataset.cat;
        $$('#shop-tabs .chip').forEach(c => c.classList.toggle('active', c === el));
        refreshShop(); break;
      }
      case 'finder': {
        $$('#finder-chips .chip').forEach(c => c.classList.toggle('active', c === el));
        const list = F.filterItems({ finder: el.dataset.key });
        $('#finder-results').innerHTML = F.grid(list.slice(0, 4)) +
          (list.length > 4 ? `<div class="center"><a class="btn btn-light" href="#/shop?finder=${el.dataset.key}">عرض الكل (${list.length})</a></div>` : '');
        observe(); break;
      }
    }
  });

  function refreshShop() {
    const r = $('#shop-results'); if (!r) return;
    r.innerHTML = F.views.shopResults(); observe();
  }

  document.addEventListener('input', e => {
    const s = F.views.shopState;
    if (e.target.id === 'shop-q') { s.q = e.target.value; refreshShop(); }
    if (e.target.id === 'cart-notes') F.cart.setNotes(e.target.value);
  });
  document.addEventListener('change', e => {
    const s = F.views.shopState;
    if (e.target.id === 'shop-occ') { s.occ = e.target.value; refreshShop(); }
    if (e.target.id === 'shop-tier') { s.tier = e.target.value; refreshShop(); }
    if (e.target.id === 'shop-sort') { s.sort = e.target.value; refreshShop(); }
    if (e.target.name === 'delivery') $('#summary').innerHTML = F.views.summary(e.target.value);
    if (e.target.classList.contains('bd-fill')) {
      const pm = $('#pdp-art');
      if (pm) { const it = F.byId(e.target.closest('.builder').dataset.id); pm.innerHTML = F.artHtml(it, e.target.value) + F.badge(it); }
    }
    if (e.target.dataset.action === 'filling-change') {
      const card = e.target.closest('[data-id]');
      const it = F.byId(card.dataset.id);
      const media = card.querySelector('.card-media');
      if (media && !it.image) {
        media.querySelector('svg').outerHTML = F.art(it, e.target.value);
      }
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCart(); closeMenu(); } });

  /* ---------- تتبع الطلب ---------- */
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'track-form') return;
    e.preventDefault();
    const f = e.target, out = $('#track-result'), btn = f.querySelector('button');
    const num = f.elements.number.value.replace(/[^0-9]/g, ''), phone = f.elements.phone.value.replace(/[\s.-]/g, '');
    const check = (name, ok, msg) => { const fl = f.elements[name].closest('.field'); fl.classList.toggle('invalid', !ok); fl.querySelector('.err').textContent = ok ? '' : msg; return ok; };
    const a = check('number', /^[0-9]{1,12}$/.test(num), 'أدخل رقم الطلب');
    const b = check('phone', /^(\+212|0)[5-7]\d{8}$/.test(phone), 'رقم هاتف مغربي غير صالح');
    if (!a || !b) return;
    btn.disabled = true; out.innerHTML = '<p class="muted">...</p>';
    try {
      const o = await F.supabase.trackOrder(num, phone);
      F.lastTracked = o;
      out.innerHTML = F.views.trackResult(o);
      if (F.i18n) F.i18n.apply();
    } catch (err) {
      out.innerHTML = '<div class="track-card track-miss">' + (/too many/i.test(String(err && err.message)) ? 'محاولات بزاف. عاود من بعد شوية.' : 'وقع مشكل فـ الاتصال. عاود من بعد.') + '</div>';
    } finally { btn.disabled = false; }
  });

  /* ---------- Checkout ---------- */
  document.addEventListener('submit', e => {
    if (e.target.id !== 'checkout-form') return;
    e.preventDefault();
    const f = e.target;
    const data = Object.fromEntries(new FormData(f).entries());
    let ok = true;
    const rules = {
      name: v => v.trim().length >= 3 || 'أدخل اسمك الكامل',
      phone: v => /^(\+212|0)[5-7]\d{8}$/.test(v.replace(/[\s.-]/g, '')) || 'رقم هاتف مغربي غير صالح',
      city: v => v.trim().length >= 2 || 'أدخل المدينة',
      address: v => v.trim().length >= 5 || 'أدخل العنوان'
    };
    Object.keys(rules).forEach(k => {
      const field = f.elements[k].closest('.field'); const r = rules[k](data[k] || '');
      field.classList.toggle('invalid', r !== true);
      field.querySelector('.err').textContent = r === true ? '' : r;
      if (r !== true) ok = false;
    });
    if (data.delivery_date && data.delivery_date < F.minDeliveryDate()) {
      const fl = f.elements.delivery_date.closest('.field'); fl.classList.add('invalid'); fl.querySelector('.err').textContent = 'أقرب موعد ممكن هو ' + F.minDeliveryDate();
      f.elements.delivery_date.focus(); return;
    } else if (f.elements.delivery_date) f.elements.delivery_date.closest('.field').classList.remove('invalid');
    if (!ok) { const bad = $('.field.invalid input', f); if (bad) bad.focus(); return; }
    const mode = (e.submitter && e.submitter.value) || 'wa';
    if (data.website) { location.hash = '#/success'; return; } // honeypot: bots only
    if (mode === 'site') return submitSiteOrder(f, data);
    const msg = F.orderMessage(data, data.delivery, extraOf(data));
    // لا نفرغ السلة هنا: فتح WhatsApp لا يعني أن الزبون أرسل الطلب.
    const waWindow = window.open(F.waLink(msg), '_blank');
    if (!waWindow) {
      alert('تعذّر فتح WhatsApp. سمح بالنوافذ المنبثقة ثم عاود المحاولة. السلة ديالك ما زالت محفوظة.');
      return;
    }
    location.hash = '#/success';
  });

  function extraOf(data) {
    const gift = data.gift === 'on';
    return {
      delivery_date: data.delivery_date || null, delivery_slot: data.delivery_slot || null,
      discount_code: F.discount.code || null,
      gift, gift_to: gift ? (data.gift_to || '').trim() : null, gift_message: gift ? (data.gift_message || '').trim() : null
    };
  }

  /* ---------- طلب داخل الموقع: يُسجَّل في Supabase ---------- */
  async function submitSiteOrder(f, data) {
    const btns = $$('button[type=submit]', f);
    const err = $('#order-error');
    const setBusy = b => btns.forEach(x => { x.disabled = b; });
    err.hidden = true;
    setBusy(true);
    try {
      const cust = { name: data.name.trim(), phone: data.phone, city: data.city.trim(), address: data.address.trim(), notes: (data.notes || '').trim() };
      const res = await F.supabase.createOrder(cust, data.delivery, F.cart.lines(), F.cart.notes(), extraOf(data));
      F.clearDiscount(); F.cart.clear();
      renderDrawer();
      location.hash = '#/success?n=' + encodeURIComponent(res.order_number);
    } catch (ex) {
      console.error('[Supabase] order failed', ex);
      err.textContent = /invalid code/i.test(String(ex && ex.message)) ? 'كود الخصم لم يعد صالحاً. أزله وعاود المحاولة.'
        : /invalid date/i.test(String(ex && ex.message)) ? 'موعد التوصيل غير صالح. اختر تاريخ آخر.'
        : 'تعذّر تسجيل الطلب فالموقع. حاول مرة أخرى أو أرسل الطلب عبر واتساب. السلة ديالك محفوظة.';
      err.hidden = false;
      setBusy(false);
    }
  }

  /* ---------- Init ---------- */
  window.addEventListener('scroll', () => {
    $('#header').classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
  window.addEventListener('hashchange', render);
  setInterval(() => { F.tickCutoff(); F.tickCountdown(); }, 30000);
  setInterval(F.tickCountdown, 60000);

  document.addEventListener('DOMContentLoaded', () => {
    $('#site-header').innerHTML = F.views.header();
    $('#site-footer').innerHTML = F.views.footer();
    renderDrawer();
    render();
    F.tickCutoff();
    // Pull live data from Supabase (catalog + site settings), then re-render. Local data is the fallback.
    if (F.supabase && F.supabase.configured) {
      Promise.allSettled([F.supabase.syncCatalog(), F.supabase.loadSettings()]).then(rs => {
        rs.forEach(r => { if (r.status === 'rejected') console.warn('[Supabase]', r.reason && r.reason.message || r.reason); });
        $('#site-header').innerHTML = F.views.header();
        $('#site-footer').innerHTML = F.views.footer();
        renderDrawer(); render();
      });
    }
  });
})();
