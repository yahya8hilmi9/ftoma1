/* ============================================================
   FATOUMA — مكوّنات قابلة لإعادة الاستخدام (HTML templates)
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8a3 3 0 016 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    whatsapp: '<path d="M4 20l1.3-4.2A8 8 0 118 18.8L4 20z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-1-.4-2-1.4-2.4-2.4l.7-1-1-2L9 9z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".6"/>',
    facebook: '<path d="M14 8h2V5h-2.5C11.3 5 10 6.4 10 8.5V11H8v3h2v6h3v-6h2.2l.5-3H13V8.7c0-.4.3-.7 1-.7z"/>',
    arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>',
    ring: '<circle cx="12" cy="15" r="5"/><path d="M9 6l3-3 3 3-3 3-3-3z"/>',
    home: '<path d="M4 11l8-7 8 7v9H4v-9z"/><path d="M10 20v-6h4v6"/>',
    gift: '<rect x="4" y="9" width="16" height="11"/><path d="M12 9v11M3 6h18v3H3zM12 6c-2-3-6-3-5 0M12 6c2-3 6-3 5 0"/>',
    tea: '<path d="M6 10h10v4a5 5 0 01-10 0v-4zM16 11h2a2 2 0 010 4h-2M9 4c0 2 2 2 0 4M13 4c0 2 2 2 0 4"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 18.5a1.5 1.5 0 100-.01M17 18.5a1.5 1.5 0 100-.01"/>',
    hand: '<path d="M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7c0 4-2 7-6 7-3 0-5-2-6-5l-1-4a1.5 1.5 0 013-.5l1 2"/>',
    leaf: '<path d="M5 19C5 10 10 5 20 5c0 10-5 15-14 15M5 19l8-8"/>'
  };

  F.icon = (name, size) =>
    `<svg class="ic" width="${size || 22}" height="${size || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- عناصر صغيرة ---------- */
  F.qtyControl = (val) =>
    `<div class="qty" role="group" aria-label="الكمية">
       <button type="button" data-action="qty-dec" aria-label="أنقص">${F.icon('minus', 16)}</button>
       <span class="qty-val">${val || 1}</span>
       <button type="button" data-action="qty-inc" aria-label="زد">${F.icon('plus', 16)}</button>
     </div>`;

  F.fillingSelect = (selected) =>
    `<label class="field-inline"><span>الحشوة</span>
       <select class="filling" data-action="filling-change">
         ${F.fillings.map(f => `<option value="${f.id}" ${f.id === selected ? 'selected' : ''}>${f.ar} · ${f.fr}</option>`).join('')}
       </select></label>`;

  F.badge = (it) => {
    if (it.tier === 'vip') return '<span class="badge badge-vip">VIP</span>';
    if (it.tier === 'premium') return '<span class="badge badge-gold">Premium</span>';
    if ((it.tags || []).indexOf('best') > -1) return '<span class="badge">الأكثر طلباً</span>';
    return '';
  };

  F.sectionTitle = (kicker, title, sub) =>
    `<header class="section-head reveal">
       <span class="kicker">${kicker}</span>
       <h2>${title}</h2>
       <div class="ornament" aria-hidden="true"><i></i><b></b><i></i></div>
       ${sub ? `<p>${sub}</p>` : ''}
     </header>`;

  /* ---------- بطاقة المنتج ---------- */
  F.card = (it) => {
    const placeholder = it.image ? '' : '<span class="ph-tag">صورة توضيحية</span>';
    const includes = it.includes
      ? `<ul class="includes">${it.includes.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
    return `
    <article class="card reveal" data-id="${it.id}">
      <a class="card-media" href="#/product/${it.id}" aria-label="${it.ar}">
        ${F.artHtml(it)}${F.badge(it)}${placeholder}
      </a>
      <div class="card-body">
        <div class="card-fr">${it.fr}</div>
        <h3 class="card-title"><a href="#/product/${it.id}">${it.ar}</a></h3>
        <p class="card-desc">${it.desc}</p>
        ${includes}
        ${it.fillings ? F.fillingSelect('khlii') : ''}
        <div class="price-row"><span class="price">${it.price}<small> ${F.config.currency}</small></span><span class="unit">/ ${it.unit}</span></div>
        ${it.comp ? `<a class="customize" href="#/product/${it.id}">✎ خصّص الـ Pack ديالك</a>` : ''}
        <div class="card-actions">
          ${F.qtyControl(1)}
          <button class="btn btn-primary btn-sm" data-action="add" type="button">Ajouter au panier</button>
        </div>
      </div>
    </article>`;
  };

  F.grid = (items) => items.length
    ? `<div class="grid">${items.map(F.card).join('')}</div>`
    : `<div class="empty"><p>ما لقينا شي حاجة بهاد البحث 🌿</p><a class="btn btn-ghost" href="#/shop">عرض كل المنتجات</a></div>`;

  /* ---------- منشئ الـ Pack: تعديل المحتوى مع تحديث السعر ---------- */
  F.packBuilder = (it, comp, option) => {
    comp = comp || F.defaultComp(it);
    const cur = F.config.currency;
    const rows = F.packAllowed(it).map(a => `
      <li class="bd-row ${comp[a.id] ? 'on' : ''}" data-cid="${a.id}">
        <div class="bd-thumb">${F.artHtml(a)}</div>
        <div class="bd-name"><strong>${a.ar}</strong><small>${a.price} ${cur} / ${a.unit}</small></div>
        <div class="qty qty-sm">
          <button type="button" data-action="comp-dec" aria-label="أنقص">${F.icon('minus', 14)}</button>
          <span class="bd-val">${comp[a.id] || 0}</span>
          <button type="button" data-action="comp-inc" aria-label="زد">${F.icon('plus', 14)}</button>
        </div>
      </li>`).join('');
    const hasM = F.compHasMamar(comp);
    const price = F.packPrice(it, comp);
    const custom = F.isCustomComp(it, comp);
    const canMamar = it.cat !== 'packs-sweets';
    return `
    <div class="builder" data-id="${it.id}">
      <div class="bd-head"><h4>خصّص الـ Pack ديالك ✎</h4><button type="button" class="link-btn" data-action="comp-reset">إعادة الضبط</button></div>
      <ul class="bd-list">${rows}</ul>
      ${canMamar ? `<label class="field-inline bd-fill-wrap" ${hasM ? '' : 'hidden'}><span>حشوة المعمّر</span>
        <select class="bd-fill">${F.fillings.map(f => `<option value="${f.id}" ${f.id === (option || 'khlii') ? 'selected' : ''}>${f.ar}</option>`).join('')}</select></label>` : ''}
      <div class="bd-total">
        <span><b class="bd-count">${F.compTotal(comp)} قطعة</b> في الـ Pack</span>
        <span class="bd-pricebox"><s class="bd-old">${custom ? F.money(it.price) : ''}</s><b class="bd-price">${F.money(price)}</b></span>
      </div>
      <p class="bd-note">السعر يتغير مع كل تعديل، محسوب حسب الأسعار الأساسية للقطع (مع خصم الـ Pack).</p>
    </div>`;
  };

  /* ---------- الصندوق الكرتوني: القطع الفردية تسقط فيه، والـ Packs تظهر كـ Packs ---------- */
  const COLS = 6, ROWS = 4, CELL = 44;
  const shapeOf = it => (it.art && it.art.shapes && it.art.shapes[0]) || 'msemen';

  function singleSvg(it, option) {
    const sh = shapeOf(it);
    const tone = (it.art && it.art.tone) || F.TONES[sh];
    let o = F.SHAPES[sh](0, 0, sh === 'fekkas' ? 16 : 18, tone);
    if (it.fillings) {
      const f = F.fillingById(option || 'khlii');
      o += `<circle cx="13" cy="13" r="6" fill="${f.color}" stroke="#fff" stroke-width="2"/>`;
    }
    return o;
  }

  function packSvg(l) {
    const it = l.item;
    const comp = l.comp || it.comp;
    const t = it.tier === 'vip' ? ['#4A2F12', '#E3C58A', '#2E1C0A'] : it.tier === 'premium' ? ['#C99A45', '#F6E3B4', '#9A7430'] : ['#EBD9B0', '#B8893A', '#C8A25E'];
    const shapes = Object.entries(comp).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => shapeOf(F.byId(id)));
    const n = shapes.length || 1, w = 82;
    let ico = '';
    shapes.forEach((sh, k) => { ico += F.SHAPES[sh](-w / 2 + (w / n) * (k + .5), 4, 9, F.TONES[sh]); });
    const custom = l.comp && F.isCustomComp(it, l.comp);
    return `<rect x="-41" y="-20" width="82" height="40" rx="6" fill="${t[0]}" stroke="#7A4E24" stroke-width="1.8"/>
      <rect x="-41" y="-20" width="82" height="11" rx="5" fill="${t[2]}" opacity=".85"/>
      <rect x="-4" y="-20" width="8" height="40" fill="${t[1]}"/>
      ${ico}
      <circle cx="0" cy="-15" r="4.5" fill="${t[1]}" stroke="#7A4E24" stroke-width="1"/>
      <circle cx="31" cy="13" r="9" fill="#3B2416" stroke="#fff" stroke-width="1.5"/>
      <text x="31" y="16.5" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="Tajawal,sans-serif">${F.compTotal(comp)}</text>
      ${custom ? '<circle cx="-33" cy="-13" r="6" fill="#B5532F" stroke="#fff" stroke-width="1.2"/><text x="-33" y="-9.5" text-anchor="middle" font-size="9" fill="#fff">✎</text>' : ''}`;
  }

  F.boxScene = (lines, prev) => {
    prev = prev || {};
    const units = [];
    lines.forEach(l => { for (let u = 0; u < l.qty; u++) units.push({ l, u, w: l.item.comp ? 2 : 1 }); });
    const x0 = 160 - (COLS * CELL) / 2 + CELL / 2, y0 = 33 + (206 - ROWS * CELL) / 2 + CELL / 2;
    const placed = [], used = {};
    let col = 0, row = 0, extra = 0;
    units.forEach(un => {
      if (col + un.w > COLS) { col = 0; row++; }
      if (row >= ROWS) { extra++; return; }
      placed.push({ un, col, row });
      for (let c = 0; c < un.w; c++) used[row + ',' + (col + c)] = 1;
      col += un.w; if (col >= COLS) { col = 0; row++; }
    });
    let slots = '', items = '';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!used[r + ',' + c]) slots += `<circle cx="${x0 + c * CELL}" cy="${y0 + r * CELL}" r="18" fill="none" stroke="#6B4520" stroke-width="1.3" stroke-dasharray="3 4" opacity=".3"/>`;
    }
    placed.forEach((p, i) => {
      const cx = x0 + (p.col + (p.un.w - 1) / 2) * CELL + ((i * 37) % 5 - 2);
      const cy = y0 + p.row * CELL + ((i * 53) % 5 - 2);
      const rot = p.un.w === 2 ? ((i * 29) % 7 - 3) : ((i * 29) % 26) - 13;
      const isNew = p.un.u >= (prev[p.un.l.key] || 0);
      const body = p.un.w === 2 ? packSvg(p.un.l) : singleSvg(p.un.l.item, p.un.l.option);
      items += `<g transform="translate(${cx} ${cy}) rotate(${rot})"><g class="pc${isNew ? ' pc-new' : ''}" style="animation-delay:${(0.3 + (i % 6) * 0.08).toFixed(2)}s">${body}</g></g>`;
    });
    const empty = units.length ? '' : '<text x="160" y="132" text-anchor="middle" font-size="15" fill="#5E3A18" opacity=".55" font-family="Tajawal,sans-serif">ضع منتجاتك هنا 🌿</text>';
    return `<svg viewBox="0 0 320 250" class="box-scene" role="img" aria-label="صندوقك">
      <defs>
        <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9B27A"/><stop offset="1" stop-color="#B98A4E"/></linearGradient>
        <linearGradient id="cav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8F6330"/><stop offset=".25" stop-color="#B58648"/><stop offset="1" stop-color="#BE9254"/></linearGradient>
      </defs>
      <ellipse cx="160" cy="246" rx="140" ry="5" fill="#3B2416" opacity=".18"/>
      <rect x="6" y="6" width="308" height="236" rx="12" fill="url(#kraft)" stroke="#8A5A2B" stroke-width="2"/>
      <rect x="20" y="22" width="280" height="206" rx="7" fill="url(#cav)" stroke="#7A4E24" stroke-width="1.5"/>
      <path d="M20 22h280v16c-60 8-220 8-280 0z" fill="#000" opacity=".16"/>
      <g stroke="#7A4E24" stroke-width=".8" opacity=".15">${[70, 118, 166, 214].map(y => `<path d="M24 ${y}H296"/>`).join('')}</g>
      <text x="160" y="239" text-anchor="middle" font-size="9" letter-spacing="4" fill="#6B4520" font-family="Cormorant Garamond,serif">FATOUMA · فطومة</text>
      ${slots}${empty}${items}
      ${extra > 0 ? `<g><circle cx="282" cy="210" r="15" fill="#B5532F" stroke="#fff" stroke-width="2"/><text x="282" y="215" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Tajawal,sans-serif">+${extra}</text></g>` : ''}
    </svg>`;
  };

  /* ---------- سطر مضغوط لتعديل كل عنصر في الصندوق ---------- */
  F.cartLine = (l) => {
    const it = l.item, opt = F.lineLabel(l);
    const isPack = !!it.comp;
    const custom = isPack && l.comp && F.isCustomComp(it, l.comp);
    const comp = l.comp || it.comp;
    const sub = [opt, isPack ? '' : it.unit].filter(Boolean).join(' · ');
    return `
    <li class="cart-line box-row" data-key="${l.key}">
      <div class="br-thumb">${F.artHtml(it, l.option)}</div>
      <div class="br-info">
        <strong>${it.ar}${custom ? ' <em class="mod-tag">معدّل</em>' : ''}</strong>
        ${sub ? `<span>${sub}</span>` : ''}
        ${isPack ? `<div class="br-comp">${F.compLabels(comp).map(c => `<span>${c}</span>`).join('')}</div>
          <button type="button" class="link-btn br-edit" data-action="edit-pack">✎ تعديل الـ Pack</button>` : ''}
        <div class="br-ctl">
          <div class="qty qty-sm">
            <button type="button" data-action="line-dec" aria-label="أنقص">${F.icon('minus', 14)}</button>
            <span class="qty-val">${l.qty}</span>
            <button type="button" data-action="line-inc" aria-label="زد">${F.icon('plus', 14)}</button>
          </div>
          <b class="br-price">${F.money(F.unitPrice(l) * l.qty)}</b>
          <button type="button" class="br-x" data-action="line-remove" aria-label="حذف">${F.icon('trash', 16)}</button>
        </div>
      </div>
    </li>`;
  };
})();
