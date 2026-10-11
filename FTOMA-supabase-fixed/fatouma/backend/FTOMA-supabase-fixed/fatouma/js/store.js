/* ============================================================
   FATOUMA — حالة الموقع: السلة، البحث، الفلترة، رسالة واتساب
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});
  const KEY = 'fatouma_cart_v1';
  const cfg = F.config;

  F.money = n => `${n} ${cfg.currency}`;

  /* ---------- Packs قابلة للتعديل: السعر من أسعار القطع الأساسية ---------- */
  const cleanComp = c => { const o = {}; Object.keys(c || {}).forEach(k => { const q = Math.floor(+c[k]); if (q > 0 && F.byId(k)) o[k] = Math.min(q, 99); }); return o; };
  const compStr = c => Object.keys(c).sort().map(k => k + '=' + c[k]).join(',');
  F.cleanComp = cleanComp;
  F.defaultComp = it => Object.assign({}, it.comp || {});
  F.isCustomComp = (it, comp) => !!(it.comp && comp && compStr(cleanComp(comp)) !== compStr(it.comp));
  F.compHasMamar = comp => Object.keys(comp || {}).some(id => { const x = F.byId(id); return x && x.mamar; });
  F.compTotal = comp => Object.values(cleanComp(comp)).reduce((a, q) => a + q, 0);
  F.compLabels = comp => Object.entries(cleanComp(comp)).map(([id, q]) => q + ' × ' + F.byId(id).ar);
  F.packAllowed = it => F.items.filter(x => it.cat === 'packs-sweets' ? x.cat === 'sweets' : (x.cat === 'fatayer' || x.cat === 'mamar'));
  F.packPrice = (it, comp) => {
    if (!it.comp) return it.price;
    const sum = c => Object.entries(c).reduce((a, [id, q]) => a + q * (((F.byId(id) || (F.hiddenById || {})[id]) || { price: 0 }).price), 0);
    return Math.round(sum(cleanComp(comp)) * (it.price / sum(it.comp)));
  };
  F.unitPrice = l => (l.comp && l.item.comp) ? F.packPrice(l.item, l.comp) : l.item.price;

  /* ---------- السلة ---------- */
  let state = { lines: [], notes: '' };
  const listeners = [];
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.lines)) state = s; } catch (e) {}

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    listeners.forEach(fn => fn());
  }
  const keyOf = (id, option, comp) => id + (option ? ':' + option : '') + (comp ? '#' + compStr(comp) : '');

  F.cart = {
    on(fn) { listeners.push(fn); },
    lines() {
      return state.lines
        .map(l => ({ ...l, item: F.byId(l.id) }))
        .filter(l => l.item);
    },
    add(id, qty, option, comp) {
      qty = Math.max(1, qty || 1);
      const it = F.byId(id);
      if (it && it.comp && F.isCustomComp(it, comp)) { comp = cleanComp(comp); option = F.compHasMamar(comp) ? (option || 'khlii') : null; }
      else comp = null;
      const key = keyOf(id, option, comp);
      F.cart.lastKey = key;
      const ex = state.lines.find(l => l.key === key);
      if (ex) ex.qty = Math.min(99, ex.qty + qty);
      else state.lines.push({ key, id, qty, option: option || null, comp: comp || null });
      persist();
    },
    setComp(key, comp, option) {
      const l = state.lines.find(x => x.key === key); if (!l) return;
      const it = F.byId(l.id);
      if (F.isCustomComp(it, comp)) { comp = cleanComp(comp); option = F.compHasMamar(comp) ? (option || 'khlii') : null; }
      else { comp = null; option = F.compHasMamar(it.comp) ? (option || 'khlii') : null; }
      const nk = keyOf(l.id, option, comp);
      const other = state.lines.find(x => x.key === nk && x !== l);
      if (other) { other.qty = Math.min(99, other.qty + l.qty); state.lines = state.lines.filter(x => x !== l); }
      else { l.key = nk; l.comp = comp; l.option = option; }
      persist();
    },
    setQty(key, qty) {
      const l = state.lines.find(x => x.key === key);
      if (!l) return;
      if (qty <= 0) return F.cart.remove(key);
      l.qty = Math.min(99, qty);
      persist();
    },
    remove(key) { state.lines = state.lines.filter(l => l.key !== key); persist(); },
    clear() { state.lines = []; state.notes = ''; persist(); },
    count() { return state.lines.reduce((a, l) => a + l.qty, 0); },
    subtotal() { return F.cart.lines().reduce((a, l) => a + F.unitPrice(l) * l.qty, 0); },
    notes() { return state.notes; },
    setNotes(t) { state.notes = t; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  };

  F.deliveryFee = function (deliveryId, subtotal) {
    const d = cfg.delivery.find(x => x.id === deliveryId) || cfg.delivery[0];
    if (d.freeFrom && subtotal >= d.freeFrom) return 0;
    return d.fee;
  };

  F.lineLabel = function (l) {
    if (!l.option) return '';
    const f = F.fillingById(l.option);
    return f ? f.ar : '';
  };

  /* ---------- البحث والفلترة ---------- */
  const norm = s => (s || '').toString().toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  F.finderRules = {
    fatayer: i => i.cat === 'fatayer' || i.cat === 'packs-fatayer',
    mamar:   i => !!i.mamar,
    sweets:  i => i.cat === 'sweets' || i.cat === 'packs-sweets',
    mix:     i => i.cat === 'packs-mix',
    family:  i => i.size === 'family' || i.size === 'grande' || (i.occ || []).indexOf('family') > -1 && i.cat.indexOf('packs') === 0,
    premium: i => i.tier === 'premium',
    vip:     i => i.tier === 'vip'
  };

  F.filterItems = function (o) {
    o = o || {};
    let list = F.items.slice();
    if (o.cat === 'packs') list = list.filter(i => i.cat.indexOf('packs') === 0);
    else if (o.cat && o.cat !== 'all') list = list.filter(i => i.cat === o.cat);
    if (o.occ) list = list.filter(i => (i.occ || []).indexOf(o.occ) > -1);
    if (o.tier) list = list.filter(i => (i.tier || '') === o.tier);
    if (o.finder && F.finderRules[o.finder]) list = list.filter(F.finderRules[o.finder]);
    if (o.q) {
      const q = norm(o.q);
      list = list.filter(i => norm([i.ar, i.fr, i.desc, (i.includes || []).join(' ')].join(' ')).indexOf(q) > -1);
    }
    if (o.sort === 'asc') list.sort((a, b) => a.price - b.price);
    if (o.sort === 'desc') list.sort((a, b) => b.price - a.price);
    return list;
  };

  /* ---------- رسالة واتساب ---------- */
  F.waLink = function (text) {
    return `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  F.orderMessage = function (customer, deliveryId) {
    const lines = F.cart.lines();
    const sub = F.cart.subtotal();
    const d = cfg.delivery.find(x => x.id === deliveryId) || cfg.delivery[0];
    const fee = F.deliveryFee(d.id, sub);
    let t = `🌿 *طلب جديد من موقع فطومة*\n\n`;
    lines.forEach(l => {
      const opt = F.lineLabel(l);
      const mod = (l.comp && l.item.comp) ? ' [معدّل: ' + F.compLabels(l.comp).join('، ') + ']' : '';
      t += `• ${l.qty} × ${l.item.ar}${opt ? ' (' + opt + ')' : ''}${mod} — ${F.unitPrice(l) * l.qty} ${cfg.currency}\n`;
    });
    t += `\nالمجموع الفرعي: ${sub} ${cfg.currency}`;
    t += `\nالتوصيل (${d.ar}): ${fee === 0 ? 'مجاني' : fee + ' ' + cfg.currency}`;
    t += `\n*المجموع: ${sub + fee} ${cfg.currency}*\n`;
    if (F.cart.notes()) t += `\nملاحظات السلة: ${F.cart.notes()}`;
    if (customer) {
      t += `\n\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.city} — ${customer.address}`;
      if (customer.notes) t += `\n📝 ${customer.notes}`;
    }
    return t;
  };

  F.itemMessage = function (item, qty, option, comp) {
    const f = option ? F.fillingById(option) : null;
    const custom = item.comp && F.isCustomComp(item, comp);
    const unit = custom ? F.packPrice(item, comp) : item.price;
    return `السلام عليكم، بغيت نطلب ${qty} × ${item.ar}${f ? ' ' + f.ar : ''}${custom ? ' معدّل (' + F.compLabels(comp).join('، ') + ')' : ''} (${unit * qty} ${cfg.currency}) من فطومة.`;
  };
})();
