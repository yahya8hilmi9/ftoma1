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
    else if (path === '/admin') { html = F.views.admin(); setTimeout(initAdmin, 0); }
    else if (path === '/success') html = F.views.success(params);
    else html = F.views.notFound();
    main.innerHTML = html;
    closeMenu();
    if (pendingScroll) {
      const t = document.getElementById(pendingScroll); pendingScroll = null;
      if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 60);
    } else window.scrollTo(0, 0);
    if (path === '/shop' && params.focus) { const q = $('#shop-q'); if (q) q.focus(); }
    observe();
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
    const sum = $('#summary');
    if (sum) {
      const d = $('input[name=delivery]:checked');
      if (F.cart.lines().length) sum.innerHTML = F.views.summary(d ? d.value : 'city'); else render();
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
    if (!ok) { const bad = $('.field.invalid input', f); if (bad) bad.focus(); return; }
    const mode = (e.submitter && e.submitter.value) || 'wa';
    if (mode === 'site') return submitSiteOrder(f, data);
    const msg = F.orderMessage(data, data.delivery);
    // لا نفرغ السلة هنا: فتح WhatsApp لا يعني أن الزبون أرسل الطلب.
    const waWindow = window.open(F.waLink(msg), '_blank');
    if (!waWindow) {
      alert('تعذّر فتح WhatsApp. سمح بالنوافذ المنبثقة ثم عاود المحاولة. السلة ديالك ما زالت محفوظة.');
      return;
    }
    location.hash = '#/success';
  });

  /* ---------- طلب داخل الموقع: يُسجَّل في Supabase ---------- */
  async function submitSiteOrder(f, data) {
    const btns = $$('button[type=submit]', f);
    const err = $('#order-error');
    const setBusy = b => btns.forEach(x => { x.disabled = b; });
    err.hidden = true;
    setBusy(true);
    try {
      const cust = { name: data.name.trim(), phone: data.phone, city: data.city.trim(), address: data.address.trim(), notes: (data.notes || '').trim() };
      const res = await F.supabase.createOrder(cust, data.delivery, F.cart.lines(), F.cart.notes());
      F.cart.clear();
      renderDrawer();
      location.hash = '#/success?n=' + encodeURIComponent(res.order_number);
    } catch (ex) {
      console.error('[Supabase] order failed', ex);
      err.textContent = 'تعذّر تسجيل الطلب فالموقع. حاول مرة أخرى أو أرسل الطلب عبر واتساب. السلة ديالك محفوظة.';
      err.hidden = false;
      setBusy(false);
    }
  }

  /* ---------- Admin: الطلبات ---------- */
  const STATUS = { new: 'جديد', confirmed: 'مؤكد', preparing: 'قيد التحضير', shipped: 'في الطريق', completed: 'مكتمل', cancelled: 'ملغى' };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function initAdmin() {
    const root = $('#admin-root'); if (!root) return;
    try {
      const session = await F.supabase.getAdminSession();
      if (session) return renderAdmin(root, adminTab);
    } catch (e) { console.warn(e); }
    root.innerHTML = `
      <form id="admin-login" class="form" style="max-width:420px">
        <div class="field"><label for="a-email">Email</label><input id="a-email" name="email" type="email" required autocomplete="username"></div>
        <div class="field"><label for="a-pass">كلمة السر</label><input id="a-pass" name="password" type="password" required autocomplete="current-password"></div>
        <p class="form-error" id="admin-err" hidden></p>
        <button class="btn btn-primary btn-block" type="submit">دخول</button>
      </form>`;
  }

  let adminTab = 'orders';
  function renderAdmin(root, tab) {
    adminTab = tab || 'orders';
    root.innerHTML = `
      <p class="admin-tabs">
        <button class="btn btn-sm ${adminTab === 'orders' ? 'btn-primary' : 'btn-ghost'}" data-action="admin-tab" data-tab="orders">الطلبات</button>
        <button class="btn btn-sm ${adminTab === 'stock' ? 'btn-primary' : 'btn-ghost'}" data-action="admin-tab" data-tab="stock">المخزون</button>
      </p><div id="admin-body"></div>`;
    (adminTab === 'stock' ? renderStock : renderOrders)($('#admin-body'));
  }

  async function renderStock(root) {
    root.innerHTML = '<p>جاري التحميل...</p>';
    let rows;
    try { rows = await F.supabase.listAllProducts(); }
    catch (e) { root.innerHTML = '<p class="form-error">تعذّر تحميل المنتجات.</p>'; return; }
    const low = rows.filter(r => r.stock_quantity !== null && r.stock_quantity <= 5).length;
    root.innerHTML = `
      <p><b>${rows.length}</b> منتج${low ? ` · <span style="color:#8a2a18">${low} مخزون قليل أو منتهي</span>` : ''}
        · فارغ = مخزون غير محدود (المنتج كيبقى معروض)</p>
      <div style="overflow-x:auto"><table class="admin-table">
        <thead><tr><th>المنتج</th><th>القسم</th><th>الثمن</th><th>المخزون</th><th>معروض</th><th></th></tr></thead>
        <tbody>${rows.map(r => `<tr data-pid="${r.id}">
          <td>${esc(r.name_ar)}<br><small>${esc(r.slug)}</small></td><td>${esc(r.category)}</td>
          <td><input type="number" min="0" step="0.5" name="price" value="${r.price}" style="width:80px"></td>
          <td><input type="number" min="0" step="1" name="stock" value="${r.stock_quantity === null ? '' : r.stock_quantity}" placeholder="∞" style="width:80px"></td>
          <td><input type="checkbox" name="active" ${r.is_active ? 'checked' : ''}></td>
          <td><button class="btn btn-sm btn-primary" data-action="admin-save-product">حفظ</button></td></tr>`).join('')}
        </tbody></table></div>`;
  }

  async function renderOrders(root) {
    root.innerHTML = '<p>جاري تحميل الطلبات...</p>';
    let orders;
    try { orders = await F.supabase.listOrders(); }
    catch (e) { root.innerHTML = '<p class="form-error">تعذّر تحميل الطلبات.</p>'; return; }
    const opts = cur => Object.keys(STATUS).map(k => `<option value="${k}" ${k === cur ? 'selected' : ''}>${STATUS[k]}</option>`).join('');
    root.innerHTML = `
      <p><button class="btn btn-ghost btn-sm" data-action="admin-refresh">تحديث</button>
         <button class="btn btn-ghost btn-sm" data-action="admin-logout">خروج</button>
         <b>${orders.length}</b> طلب</p>
      ${orders.map(o => `
        <article class="summary" style="margin:0 0 16px">
          <h3>#${o.order_number} · ${esc(o.customer_name)} <small>${new Date(o.created_at).toLocaleString('fr-MA')}</small></h3>
          <p>📞 <a href="tel:${esc(o.customer_phone)}">${esc(o.customer_phone)}</a> · 📍 ${esc(o.customer_city)} — ${esc(o.customer_address)}</p>
          ${o.customer_notes ? `<p>📝 ${esc(o.customer_notes).replace(/\n/g, '<br>')}</p>` : ''}
          <ul>${(o.order_items || []).map(i => {
            const op = i.options || {}; const f = op.filling && F.fillingById(op.filling);
            const comp = op.comp ? ' [معدّل: ' + Object.entries(op.comp).map(([k, q]) => q + '×' + (F.byId(k) ? F.byId(k).ar : k)).join('، ') + ']' : '';
            return `<li><span>${i.quantity} × ${esc(i.product_name)}${f ? ' (' + f.ar + ')' : ''}${esc(comp)}</span><b>${F.money(i.line_total)}</b></li>`;
          }).join('')}</ul>
          <div class="sum-row"><span>التوصيل (${esc(o.delivery_method)})</span><b>${F.money(o.delivery_fee)}</b></div>
          <div class="sum-row sum-total"><span>المجموع</span><b>${F.money(o.total)}</b></div>
          <label>الحالة: <select data-order="${o.id}">${opts(o.status)}</select></label>
        </article>`).join('') || '<p>ما كاين حتى طلب بعد.</p>'}`;
  }

  document.addEventListener('submit', async e => {
    if (e.target.id !== 'admin-login') return;
    e.preventDefault();
    const err = $('#admin-err'); err.hidden = true;
    try {
      await F.supabase.signInAdmin(e.target.email.value.trim(), e.target.password.value);
      renderAdmin($('#admin-root'), 'orders');
    } catch (ex) { err.textContent = ex.message || 'فشل الدخول'; err.hidden = false; }
  });
  document.addEventListener('change', async e => {
    const id = e.target.dataset && e.target.dataset.order; if (!id) return;
    try { await F.supabase.setOrderStatus(id, e.target.value); }
    catch (ex) { alert('تعذّر تغيير الحالة'); }
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-action^="admin-"]'); if (!b) return;
    if (b.dataset.action === 'admin-refresh') renderAdmin($('#admin-root'), adminTab);
    if (b.dataset.action === 'admin-tab') renderAdmin($('#admin-root'), b.dataset.tab);
    if (b.dataset.action === 'admin-save-product') {
      const tr = b.closest('tr'); const g = n => tr.querySelector('[name=' + n + ']');
      const stock = g('stock').value.trim();
      const price = parseFloat(g('price').value);
      if (!Number.isFinite(price) || price < 0 || (stock !== '' && !(parseInt(stock, 10) >= 0))) { alert('قيم غير صالحة'); return; }
      b.disabled = true;
      try {
        await F.supabase.updateProduct(tr.dataset.pid, { price, stock_quantity: stock === '' ? null : parseInt(stock, 10), is_active: g('active').checked });
        b.textContent = '✓';
      } catch (ex) { alert('تعذّر الحفظ'); b.textContent = 'حفظ'; }
      setTimeout(() => { b.disabled = false; b.textContent = 'حفظ'; }, 1200);
    }
    if (b.dataset.action === 'admin-logout') { await F.supabase.signOut(); initAdmin(); }
  });

  /* ---------- Init ---------- */
  window.addEventListener('scroll', () => {
    $('#header').classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
  window.addEventListener('hashchange', render);

  document.addEventListener('DOMContentLoaded', () => {
    $('#site-header').innerHTML = F.views.header();
    $('#site-footer').innerHTML = F.views.footer();
    renderDrawer();
    render();
    // Pull live data from Supabase, then re-render (local catalog is the fallback)
    if (F.supabase && F.supabase.configured) {
      F.supabase.syncCatalog()
        .then(r => { console.info('[Supabase] synced', r); renderDrawer(); render(); })
        .catch(e => console.warn('[Supabase] using local catalog:', e.message || e));
    }
  });
})();
