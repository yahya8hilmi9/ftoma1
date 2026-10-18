/* ============================================================
   FATOUMA — الصفحات (Views)
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});
  const cfg = F.config;
  const V = (F.views = {});

  /* ---------- Header / Footer ---------- */
  V.header = () => `
    <header class="site-header" id="header">
      <div class="container header-inner">
        <button class="icon-btn burger" data-action="toggle-menu" aria-label="القائمة">${F.icon('menu')}</button>
        <a href="#/" class="brand" aria-label="فطومة">
          <span class="brand-ar">فطومة</span><span class="brand-fr">Fatouma</span>
        </a>
        <nav class="main-nav" id="nav" aria-label="التنقل الرئيسي">
          <a href="#/">الرئيسية</a>
          <a href="#/category/fatayer">الفطائر</a>
          <a href="#/category/sweets">الحلويات</a>
          <a href="#/category/packs-fatayer">Les Packs</a>
          <a href="#/" data-scroll="occasions">المناسبات</a>
          <a href="#/" data-scroll="about">من نحن</a>
          <a href="#/track">تتبع طلبك</a>
        </nav>
        <div class="header-actions">
          <a class="icon-btn" href="#/shop?focus=1" aria-label="بحث">${F.icon('search')}</a>
          <button class="cart-btn" data-action="open-cart" aria-label="السلة">
            ${F.icon('bag')}<span class="cart-count" id="cart-count">0</span>
          </button>
        </div>
      </div>
    </header>`;

  V.footer = () => `
    <footer class="site-footer zellige">
      <div class="container footer-grid">
        <div class="f-brand">
          <div class="brand brand-light"><span class="brand-ar">فطومة</span><span class="brand-fr">Fatouma</span></div>
          <p>${cfg.brand.tagline}</p>
          <div class="socials">
            <a href="${cfg.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${F.icon('instagram')}</a>
            ${cfg.social.facebook ? `<a href="${cfg.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${F.icon('facebook')}</a>` : ''}
            <a href="${F.waLink('السلام عليكم، بغيت نسول على فطومة')}" target="_blank" rel="noopener" aria-label="WhatsApp">${F.icon('whatsapp')}</a>
          </div>
        </div>
        <div>
          <h4>الموقع</h4>
          <ul>
            <li><a href="#/category/fatayer">الفطائر</a></li>
            <li><a href="#/category/sweets">الحلويات</a></li>
            <li><a href="#/category/packs-fatayer">Les Packs</a></li>
            <li><a href="#/" data-scroll="occasions">المناسبات</a></li>
            <li><a href="#/" data-scroll="about">من نحن</a></li>
            <li><a href="#/track">تتبع طلبك</a></li>
          </ul>
        </div>
        <div>
          <h4>Horaires</h4>
          <ul>${cfg.hours.map(h => `<li>${h.d}<br><span>${h.h}</span></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Livraison</h4>
          <ul>${cfg.delivery.map(d => `<li>${d.ar}<br><span>${d.fee ? d.fee + ' ' + cfg.currency : 'مجاني'} · ${d.eta}</span></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:${cfg.contact.phone.replace(/\s/g, '')}">${cfg.contact.phone}</a></li>
            ${cfg.contact.email ? `<li><a href="mailto:${cfg.contact.email}">${cfg.contact.email}</a></li>` : ''}
            <li>${cfg.contact.address}</li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        ${cfg.founders && cfg.founders.length ? `<div class="founders">المؤسسون · Fondateurs : <strong>${cfg.founders.map(n => n).join(' &amp; ')}</strong></div>` : ''}
        <div>© ${new Date().getFullYear()} فطومة · Fatouma — صُنع بحب في المغرب</div>
      </div>
    </footer>
    <a class="wa-float" href="${F.waLink('السلام عليكم، بغيت نسول على فطومة')}" target="_blank" rel="noopener" aria-label="WhatsApp">${F.icon('whatsapp', 28)}</a>`;

  /* ---------- الرئيسية ---------- */
  V.home = () => {
    const pick = (cat, n) => F.filterItems({ cat }).slice(0, n || 99);
    const featuredPacks = ['pack-msemen-mamar', 'mix-medium', 'pack-mochakal', 'pack-premium'].map(F.byId);
    return `
    <section class="hero zellige">
      <div class="container hero-inner">
        <div class="hero-text">
          <span class="kicker kicker-gold">Fatouma · فطائر وحلويات مغربية</span>
          <h1><span class="h1-ar">فطومة</span><span class="h1-sub">مذاق مغربي أصيل، محضّر بحب</span></h1>
          <p>مسمن، حرشة، بغرير وحلويات تقليدية بأيادٍ مغربية، من مطبخنا إلى مائدتك.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#/" data-scroll="categories">اكتشف المنتجات</a>
            <a class="btn btn-light" href="#/" data-scroll="finder">اطلب الآن</a>
          </div>
          <ul class="hero-points">
            <li>${F.icon('hand', 20)} عجن يدوي</li>
            <li>${F.icon('leaf', 20)} مكونات طبيعية</li>
            <li>${F.icon('truck', 20)} توصيل لباب الدار</li>
          </ul>
        </div>
        <div class="hero-art"><div class="float">${F.heroArt()}</div></div>
      </div>
    </section>

    <section class="section section-cats" id="categories">
      <div class="container">
        ${F.sectionTitle('Nos Catégories', 'اختر قسمك', 'من الفطائر الطازجة إلى الحلويات والـ Packs، كل شيء بنقرة.')}
        <div class="cat-grid">
          ${F.categories.map(c => {
            const cover = F.byId(c.cover);
            const n = F.items.filter(i => i.cat === c.id).length;
            return `<a class="cat reveal" href="#/category/${c.id}">
              <div class="cat-media">${F.artHtml(c.image ? { image: c.image, ar: c.ar } : cover, 'khlii')}</div>
              <div class="cat-label"><strong>${c.ar}</strong><span>${c.fr}</span><em>${n} منتج</em></div>
            </a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="bestsellers">
      <div class="container">
        ${F.sectionTitle('Les Favoris', 'الأكثر طلباً', 'اختيارات زبائننا المفضلة، والباقي في صفحات الأقسام.')}
        ${F.grid(['msemen-mamar', 'baghrir', 'kaab-ghzal', 'mix-medium'].map(F.byId))}
        <div class="center"><a class="btn btn-ghost" href="#/shop">عرض كل المنتجات</a></div>
      </div>
    </section>

    <section class="section section-olive zellige" id="finder">
      <div class="container">
        ${F.sectionTitle('Choisissez votre pack', 'شنو باغي اليوم؟', 'اختر وغادي نعرضو عليك الأنسب.')}
        <div class="chips" id="finder-chips">
          ${[['fatayer', 'فطائر'], ['mamar', 'فطائر معمّرين'], ['sweets', 'حلويات'], ['mix', 'Mix'], ['family', 'Pack عائلي'], ['premium', 'Pack Premium'], ['vip', 'Pack VIP']]
            .map(([k, t]) => `<button type="button" class="chip" data-action="finder" data-key="${k}">${t}</button>`).join('')}
        </div>
        <div id="finder-results" class="finder-results"><p class="finder-hint">اختر من فوق وغادي تظهر لك المنتجات هنا ✨</p></div>
      </div>
    </section>

    <section class="section" id="occasions">
      <div class="container">
        ${F.sectionTitle('Occasions', 'لكل مناسبة Pack', 'من فطور الأحد إلى العرس، عندنا ما يليق بالمائدة.')}
        <div class="occ-grid">
          ${F.occasions.map(o => `
            <a class="occ reveal" href="#/shop?occ=${o.id}">
              ${F.icon(o.icon, 34)}
              <strong>${o.ar}</strong><span>${o.fr}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section-sand" id="about">
      <div class="container about">
        <div class="about-art reveal" aria-hidden="true"><div class="arch-frame zellige"><span>فطومة</span></div></div>
        <div class="about-text reveal">
          <span class="kicker">À propos</span>
          <h2>حكاية فطومة</h2>
          <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
          <p>فطومة علامة تحافظ على المذاق المغربي التقليدي. نحضّر الفطائر والحلويات بعناية، بمكونات جيدة ووصفات ورثناها عن الجدات، لتصلك طازجة كأنها من مطبخ البيت.</p>
          <a class="btn btn-ghost" href="#/shop">تصفح المنتجات</a>
        </div>
      </div>
    </section>`;
  };

  /* ---------- صفحة قسم مستقلة ---------- */
  V.category = (id) => {
    const c = F.categories.find(x => x.id === id);
    if (!c) return V.notFound();
    const items = F.items.filter(i => i.cat === id);
    const others = F.categories.filter(x => x.id !== id);
    return `
    <section class="page-head zellige cat-head">
      <div class="container">
        <nav class="crumbs crumbs-head"><a href="#/">الرئيسية</a> / <span>${c.ar}</span></nav>
        <span class="kicker">${c.fr}</span>
        <h1>${c.ar}</h1>
        <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
        <p>${c.blurb || ''}</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="chips chips-scroll cat-switch">
          ${F.categories.map(x => `<a class="chip ${x.id === id ? 'active' : ''}" href="#/category/${x.id}">${x.ar}</a>`).join('')}
        </div>
        <p class="result-count">${items.length} منتج</p>
        ${F.grid(items)}
        <div class="related">
          <h3>اكتشف أقسامنا الأخرى</h3>
          <div class="cat-grid cat-grid-sm">
            ${others.map(o => `<a class="cat reveal" href="#/category/${o.id}"><div class="cat-media">${F.artHtml(o.image ? { image: o.image, ar: o.ar } : F.byId(o.cover), 'khlii')}</div><div class="cat-label"><strong>${o.ar}</strong><span>${o.fr}</span></div></a>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  };

  /* ---------- المتجر ---------- */
  V.shopState = { cat: 'all', q: '', occ: '', tier: '', sort: '' };

  V.shop = (params) => {
    const s = V.shopState;
    s.cat = params.cat || 'all'; s.occ = params.occ || ''; s.q = ''; s.tier = ''; s.sort = ''; s.finder = params.finder || '';
    const tabs = [{ id: 'all', ar: 'الكل' }, { id: 'packs', ar: 'كل الـ Packs' }].concat(F.categories);
    return `
    <section class="page-head zellige">
      <div class="container">
        <h1>المتجر <small>La Boutique</small></h1>
        <p>اختر، صفّي، وأضف إلى السلة.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="toolbar">
          <label class="search"><span class="sr-only">بحث</span>${F.icon('search', 18)}
            <input id="shop-q" type="search" placeholder="ابحث: مسمن، كعب الغزال، Premium…" autocomplete="off">
          </label>
          <select id="shop-occ" aria-label="المناسبة">
            <option value="">كل المناسبات</option>
            ${F.occasions.map(o => `<option value="${o.id}" ${o.id === s.occ ? 'selected' : ''}>${o.ar}</option>`).join('')}
          </select>
          <select id="shop-tier" aria-label="المستوى">
            <option value="">كل المستويات</option>
            ${F.tiers.map(t => `<option value="${t.id}">${t.ar}</option>`).join('')}
          </select>
          <select id="shop-sort" aria-label="الترتيب">
            <option value="">الترتيب الافتراضي</option>
            <option value="asc">السعر: الأقل أولاً</option>
            <option value="desc">السعر: الأعلى أولاً</option>
          </select>
        </div>
        <div class="chips chips-scroll" id="shop-tabs">
          ${tabs.map(t => `<button type="button" class="chip ${t.id === s.cat ? 'active' : ''}" data-action="shop-tab" data-cat="${t.id}">${t.ar}</button>`).join('')}
        </div>
        <div id="shop-results">${V.shopResults()}</div>
      </div>
    </section>`;
  };

  V.shopResults = () => {
    const list = F.filterItems(V.shopState);
    return `<p class="result-count">${list.length} منتج</p>${F.grid(list)}`;
  };

  /* ---------- صفحة المنتج ---------- */
  V.product = (id) => {
    const it = F.byId(id);
    if (!it) return V.notFound();
    const catName = (F.categories.find(c => c.id === it.cat) || {}).ar || '';
    const occ = (it.occ || []).map(o => (F.occasions.find(x => x.id === o) || {}).ar).filter(Boolean);
    const related = F.items.filter(i => i.cat === it.cat && i.id !== it.id).slice(0, 4);
    return `
    <section class="section section-tight">
      <div class="container">
        <nav class="crumbs"><a href="#/">الرئيسية</a> / <a href="#/category/${it.cat}">${catName}</a> / <span>${it.ar}</span></nav>
        <div class="pdp" data-id="${it.id}">
          <div class="pdp-media" id="pdp-art">${F.artHtml(it, 'khlii')}${F.badge(it)}</div>
          <div class="pdp-info">
            <div class="card-fr">${it.fr}</div>
            <h1>${it.ar}</h1>
            <div class="price-row price-lg"><span class="price pdp-price">${it.price}<small> ${cfg.currency}</small></span><span class="unit">/ ${it.unit}</span></div>
            <p class="pdp-desc">${it.desc}</p>
            ${it.includes && !it.comp ? `<h4>يحتوي على</h4><ul class="includes includes-lg">${it.includes.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
            ${it.comp ? F.packBuilder(it) : ''}
            ${it.fillings && !it.comp ? `<h4>اختر الحشوة</h4><div class="chips" id="pdp-fillings">${F.fillings.map((f, i) => `<button type="button" class="chip ${i === 0 ? 'active' : ''}" data-action="pdp-filling" data-f="${f.id}">${f.ar}</button>`).join('')}</div><input type="hidden" class="filling" value="khlii">` : ''}
            ${occ.length ? `<h4>مناسب لـ</h4><div class="tags">${occ.map(o => `<span>${o}</span>`).join('')}</div>` : ''}
            <div class="card-actions pdp-actions">
              ${F.qtyControl(1)}
              <button class="btn btn-primary" data-action="add" type="button">Ajouter au panier</button>
            </div>
            <button class="btn btn-wa" type="button" data-action="wa-item">${F.icon('whatsapp', 20)} اطلب مباشرة عبر واتساب</button>
          </div>
        </div>
        ${related.length ? `<div class="related"><h3>قد يعجبك أيضاً</h3>${F.grid(related)}</div>` : ''}
      </div>
    </section>`;
  };

  /* ---------- الطلب ---------- */
  V.checkout = () => {
    const lines = F.cart.lines();
    if (!lines.length) {
      return `<section class="section"><div class="container empty">
        <h1>السلة فارغة</h1><p>أضف شي حاجة لذيذة قبل ما تكمل الطلب.</p>
        <a class="btn btn-primary" href="#/shop">تصفح المنتجات</a></div></section>`;
    }
    return `
    <section class="page-head zellige"><div class="container"><h1>Commande <small>إتمام الطلب</small></h1><p>صفحة واحدة، بدون تعقيد.</p></div></section>
    <section class="section section-tight">
      <div class="container checkout">
        <form id="checkout-form" class="form" novalidate>
          <div class="field"><label for="c-name">الاسم الكامل</label><input id="c-name" name="name" required autocomplete="name"><small class="err"></small></div>
          <div class="field"><label for="c-phone">رقم الهاتف</label><input id="c-phone" name="phone" type="tel" inputmode="tel" placeholder="06 00 00 00 00" required autocomplete="tel"><small class="err"></small></div>
          <div class="field"><label for="c-city">المدينة</label><input id="c-city" name="city" required autocomplete="address-level2"><small class="err"></small></div>
          <div class="field"><label for="c-address">العنوان</label><input id="c-address" name="address" required autocomplete="street-address"><small class="err"></small></div>
          <div class="field"><label for="c-notes">ملاحظات (اختياري)</label><textarea id="c-notes" name="notes" rows="2"></textarea></div>
          <fieldset class="delivery">
            <legend>طريقة التوصيل</legend>
            ${cfg.delivery.map((d, i) => `
              <label class="radio">
                <input type="radio" name="delivery" value="${d.id}" ${i === 0 ? 'checked' : ''}>
                <span><strong>${d.ar}</strong><em>${d.eta}</em></span>
                <b>${d.fee ? d.fee + ' ' + cfg.currency : 'مجاني'}</b>
              </label>`).join('')}
          </fieldset>
          <p class="pay-note">${F.icon('check', 18)} الدفع عند الاستلام. اختر كيف تبغي ترسل الطلب.</p>
          <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="form-error" id="order-error" role="alert" hidden></p>
          <button class="btn btn-primary btn-block" type="submit" name="mode" value="site" id="btn-order-site">${F.icon('check', 20)} تأكيد الطلب في الموقع</button>
          <button class="btn btn-wa btn-block" type="submit" name="mode" value="wa">${F.icon('whatsapp', 20)} أو أرسل الطلب عبر واتساب</button>
        </form>
        <aside class="summary" id="summary">${V.summary('city')}</aside>
      </div>
    </section>`;
  };

  V.summary = (deliveryId) => {
    const lines = F.cart.lines();
    const sub = F.cart.subtotal();
    const fee = F.deliveryFee(deliveryId, sub);
    return `
      <h3>ملخص الطلب</h3>
      <ul>${lines.map(l => `<li><span>${l.qty} × ${l.item.ar}${(l.comp && l.item.comp) ? ' (معدّل)' : ''}${F.lineLabel(l) ? ' · ' + F.lineLabel(l) : ''}</span><b>${F.money(F.unitPrice(l) * l.qty)}</b></li>`).join('')}</ul>
      <div class="sum-row"><span>المجموع الفرعي</span><b>${F.money(sub)}</b></div>
      <div class="sum-row"><span>التوصيل</span><b>${fee ? F.money(fee) : 'مجاني'}</b></div>
      <div class="sum-row sum-total"><span>المجموع</span><b>${F.money(sub + fee)}</b></div>`;
  };

  V.success = (params) => {
    const n = params && params.n;
    return `
    <section class="section"><div class="container empty">
      <div class="done">${F.icon('check', 40)}</div>
      <h1>شكراً لك! 🌿</h1>
      <p>${n ? `تسجل طلبك فالموقع. رقم الطلب: <b>#${String(n).replace(/[^0-9]/g, '')}</b>. غادي نتواصلو معك لتأكيد الطلب والتوصيل.` : 'فتحنا واتساب بطلبك. غادي نتواصلو معك لتأكيد الطلب والتوصيل.'}</p>
      ${n ? `<p><a class="btn btn-ghost" href="#/track?n=${String(n).replace(/[^0-9]/g, '')}">تتبع طلبك</a></p>` : ''}
      <a class="btn btn-primary" href="#/">العودة للرئيسية</a></div></section>`;
  };

  /* ---------- تتبع الطلب ---------- */
  V.track = (params) => {
    const n = String((params && params.n) || '').replace(/[^0-9]/g, '');
    return `
    <section class="section"><div class="container track-wrap">
      <h1>تتبع طلبك</h1>
      <p class="muted">دخل رقم الطلب (اللي توصلتي بيه من بعد الطلب) ورقم الهاتف اللي استعملتي فـ الطلب.</p>
      <form id="track-form" class="form" novalidate>
        <div class="field"><label for="t-num">رقم الطلب</label><input id="t-num" name="number" inputmode="numeric" placeholder="مثال: 125" value="${n}" required autocomplete="off"><small class="err"></small></div>
        <div class="field"><label for="t-phone">رقم الهاتف</label><input id="t-phone" name="phone" type="tel" inputmode="tel" placeholder="06 00 00 00 00" required autocomplete="tel"><small class="err"></small></div>
        <button class="btn btn-primary btn-block" type="submit">تتبع</button>
      </form>
      <div id="track-result" aria-live="polite"></div>
    </div></section>`;
  };

  const TRACK_STEPS = [['new', 'تسجل الطلب'], ['confirmed', 'تأكد'], ['preparing', 'قيد التحضير'], ['shipped', 'في الطريق'], ['completed', 'تسلّمتي الطلب']];
  V.trackResult = (o) => {
    if (!o) return `<div class="track-card track-miss">ما لقينا حتى طلب بهاد الرقم والهاتف. تأكد من المعلومات وعاود.</div>`;
    const money = v => Number(v) + ' ' + cfg.currency;
    const cancelled = o.status === 'cancelled';
    const idx = TRACK_STEPS.findIndex(x => x[0] === o.status);
    const steps = cancelled
      ? `<div class="track-cancel">هاد الطلب تلغى. إلا بغيتي تستفسر، تواصل معنا فـ واتساب.</div>`
      : `<ol class="track-steps">${TRACK_STEPS.map((x, i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}"><span>${i < idx ? '✓' : i + 1}</span>${x[1]}</li>`).join('')}</ol>`;
    const lines = (o.items || []).map(i => {
      const op = i.options || {};
      const base = (op.slug && F.byId(op.slug)) || F.items.find(x => x.ar === i.name);
      const comp = op.comp || (base && base.comp);
      const parts = comp ? Object.entries(comp).filter(([, q]) => q > 0).map(([k, q]) => q + ' × ' + ((F.byId(k) || {}).ar || k)) : [];
      const nm = String(i.name == null ? '' : i.name).replace(/[<>&"]/g, '');
      return `<li><span>${Number(i.qty)} × ${nm}${parts.length ? `<small>${parts.join('، ')}</small>` : ''}</span><b>${money(i.total)}</b></li>`;
    }).join('');
    return `<div class="track-card">
      <h2>طلب #${Number(o.order_number)}</h2>
      <small>${new Date(o.created_at).toLocaleString('fr-MA')}</small>
      ${steps}
      <ul class="track-items">${lines}</ul>
      <div class="track-total"><span>التوصيل</span><b>${Number(o.delivery_fee) ? money(o.delivery_fee) : 'مجاني'}</b></div>
      <div class="track-total big"><span>المجموع</span><b>${money(o.total)}</b></div>
    </div>`;
  };

  V.notFound = () => `
    <section class="section"><div class="container empty"><h1>404</h1><p>هاد الصفحة ما لقيناهاش.</p><a class="btn btn-primary" href="#/">الرئيسية</a></div></section>`;

  /* ---------- نافذة تعديل Pack داخل الصندوق ---------- */
  V.packModal = (l) => `
    <div class="modal-overlay" data-action="close-modal"></div>
    <div class="modal" role="dialog" aria-modal="true" data-key="${l.key}">
      <header class="drawer-head"><h3>${l.item.ar} <small>${l.item.fr}</small></h3>
        <button class="icon-btn" data-action="close-modal" aria-label="إغلاق">${F.icon('close')}</button></header>
      <div class="modal-body">${F.packBuilder(l.item, l.comp || F.defaultComp(l.item), l.option)}</div>
      <footer class="modal-foot"><button class="btn btn-primary btn-block" type="button" data-action="comp-save">حفظ التعديل</button></footer>
    </div>`;

  /* ---------- درج السلة ---------- */
  V.drawer = () => {
    const lines = F.cart.lines();
    const sub = F.cart.subtotal();
    const city = cfg.delivery[0];
    const left = city.freeFrom ? Math.max(0, city.freeFrom - sub) : 0;
    return `
    <div class="drawer-overlay" data-action="close-cart"></div>
    <aside class="drawer" role="dialog" aria-label="السلة" aria-modal="true">
      <header class="drawer-head"><h3>Ma Boîte <small>صندوق فطومة</small></h3>
        <button class="icon-btn" data-action="close-cart" aria-label="إغلاق">${F.icon('close')}</button></header>
      <div class="box-hero">${F.boxScene(lines, F.cart.prev)}
        <p>${lines.length ? `<b>${F.cart.count()}</b> قطعة في صندوقك · ${lines.length} صنف` : 'صندوقك فارغ، اختر ما تشتهي 🌿'}</p></div>
      ${lines.length ? `
        <ul class="cart-list">${lines.map(F.cartLine).join('')}</ul>
        <div class="drawer-foot">
          ${city.freeFrom ? `<p class="free-note">${left ? `باقي ${F.money(left)} للتوصيل المجاني داخل المدينة` : '🎉 توصيلك داخل المدينة مجاني'}</p>` : ''}
          <label class="notes"><span>ملاحظات للطلب</span><textarea id="cart-notes" rows="2" placeholder="مثال: بدون سكر، تغليف هدية…">${F.cart.notes() || ''}</textarea></label>
          <div class="sum-row sum-total"><span>المجموع</span><b>${F.money(sub)}</b></div>
          <a class="btn btn-primary btn-block" href="#/checkout" data-action="close-cart">Commander</a>
          <button class="btn btn-ghost btn-block" type="button" data-action="close-cart">+ متابعة التسوق</button>
          <button class="btn btn-wa btn-block" type="button" data-action="wa-cart">${F.icon('whatsapp', 20)} اطلب عبر واتساب</button>
        </div>` : `
        <div class="empty drawer-empty"><p>الصندوق فارغ</p><a class="btn btn-ghost" href="#/shop" data-action="close-cart">تصفح المنتجات</a></div>`}
    </aside>`;
  };
})();
