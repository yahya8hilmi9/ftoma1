/* FTOMA / FATOUMA — Supabase browser client
 * Only the Project URL and publishable key belong here. Never add a secret/service_role key.
 */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});
  const cfg = F.config && F.config.supabase;
  F.supabase = {
    client: null,
    configured: Boolean(cfg && cfg.url && cfg.publishableKey),
    async init() {
      if (!this.configured) throw new Error('Supabase configuration is missing.');
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('Supabase client library did not load. Check your internet connection.');
      }
      if (!this.client) {
        this.client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
      }
      return this.client;
    },
    async checkConnection() {
      const client = await this.init();
      const { data, error } = await client.from('products').select('id').limit(1);
      if (error) throw error;
      return { ok: true, sampleCount: Array.isArray(data) ? data.length : 0 };
    },
    async getActiveProducts() {
      const client = await this.init();
      const { data, error } = await client.from('products')
        .select('id,slug,name_ar,name_fr,description,category,price,unit,image_url,stock_quantity')
        .eq('is_active', true).order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    /* Build the storefront catalog from Supabase (source of truth once it answers).
       Local items keep their artwork; new products created in admin.html appear automatically. */
    /* Strings coming from the database end up in innerHTML: neutralise tag / attribute injection. */
    safeText(v) { return String(v == null ? '' : v).replace(/[<>]/g, '').replace(/"/g, '\u201D').slice(0, 600); },
    safeUrl(v, httpsOnly) { const u = String(v || '').trim(); return /^https:\/\/[^\s"'<>`]+$/.test(u) || (!httpsOnly && /^http:\/\/[^\s"'<>`]+$/.test(u)) ? u : ''; },
    async syncCatalog() {
      const rows = await this.getActiveProducts();
      const bySlug = {}; rows.forEach(r => { bySlug[r.slug] = r; });
      const catIds = (F.categories || []).map(c => c.id);
      const apply = (it, r) => {
        const price = Number(r.price);
        if (Number.isFinite(price)) it.price = price;
        if (r.name_ar) it.ar = this.safeText(r.name_ar);
        if (r.name_fr) it.fr = this.safeText(r.name_fr);
        if (r.description) it.desc = this.safeText(r.description);
        if (r.unit) it.unit = this.safeText(r.unit);
        if (this.safeUrl(r.image_url, true)) it.image = this.safeUrl(r.image_url, true);
        it.stock = r.stock_quantity;
        return it;
      };
      const inStock = r => r.stock_quantity === null || r.stock_quantity === undefined || r.stock_quantity > 0;
      const out = [], used = {};
      F.hiddenById = {};
      F.items.forEach(it => {
        const r = bySlug[it.id];
        if (r && inStock(r)) { out.push(apply(it, r)); used[it.id] = true; }
        else F.hiddenById[it.id] = it; // hidden, but still needed to price packs
      });
      rows.forEach(r => {
        if (used[r.slug] || F.hiddenById[r.slug] || !inStock(r) || catIds.indexOf(r.category) < 0) return;
        out.push(apply({ id: String(r.slug).replace(/[^a-z0-9-]/gi, ''), cat: r.category, ar: this.safeText(r.name_ar), fr: this.safeText(r.name_fr), desc: this.safeText(r.description), price: 0, unit: this.safeText(r.unit), art: { shapes: ['msemen'] }, occ: [], tags: [] }, r));
      });
      F.items = out;
      // category covers must point to a visible item
      (F.categories || []).forEach(c => { if (!out.some(i => i.id === c.cover)) { const f = out.find(i => i.cat === c.id); if (f) c.cover = f.id; } });
      return { total: rows.length, shown: out.length };
    },
    /* Site settings edited in admin (WhatsApp, contact, social, hours, delivery fees) */
    applySettings(v) {
      if (!v) return;
      const c = F.config;
      if (v.whatsapp) c.whatsapp = String(v.whatsapp).replace(/[^0-9]/g, '');
      if (v.tagline) c.brand.tagline = this.safeText(v.tagline);
      ['phone', 'email', 'address'].forEach(k => { if (v[k]) c.contact[k] = this.safeText(v[k]); });
      ['instagram', 'facebook'].forEach(k => { const u = this.safeUrl(v[k], true); if (u) c.social[k] = u; });
      if (Array.isArray(v.hours) && v.hours.length) c.hours = v.hours.filter(h => h && h.d && h.h).map(h => ({ d: this.safeText(h.d), h: this.safeText(h.h) }));
      if (v.delivery) c.delivery.forEach(d => {
        const x = v.delivery[d.id]; if (!x) return;
        if (x.fee !== undefined && x.fee !== null && x.fee !== '') d.fee = Number(x.fee);
        if ('freeFrom' in x) d.freeFrom = (x.freeFrom === null || x.freeFrom === '' || Number(x.freeFrom) <= 0) ? null : Number(x.freeFrom);
        if (x.eta) d.eta = this.safeText(x.eta);
      });
    },
    async loadSettings() {
      const client = await this.init();
      const { data, error } = await client.from('site_settings').select('value').eq('key', 'config').maybeSingle();
      if (error) throw error;
      if (data) this.applySettings(data.value);
      return data ? data.value : null;
    },
    async saveSettings(value) {
      const client = await this.init();
      const { error } = await client.from('site_settings').upsert({ key: 'config', value, updated_at: new Date().toISOString() });
      if (error) throw error;
      this.applySettings(value);
    },
    async createProduct(row) {
      const client = await this.init();
      const { error } = await client.from('products').insert(row);
      if (error) throw error;
    },
    async deleteProduct(id) {
      const client = await this.init();
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    async uploadImage(blob) {
      const client = await this.init();
      const path = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
      const { error } = await client.storage.from('product-images').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (error) throw error;
      return client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    },
    /* Save an order in Supabase via the server-side create_order() function.
       Prices/fees are recomputed on the server; the client only sends ids, quantities and options. */
    async createOrder(customer, deliveryId, lines, cartNotes) {
      const client = await this.init();
      const items = lines.map(l => ({ id: l.id, qty: l.qty, option: l.option || null, comp: l.comp || null }));
      const { data, error } = await client.rpc('create_order', {
        payload: { customer, delivery: deliveryId, cart_notes: cartNotes || '', items }
      });
      if (error) throw error;
      return data;
    },
    async signInAdmin(email, password) {
      const client = await this.init();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: admin, error: adminError } = await client.from('admin_users')
        .select('user_id').eq('user_id', data.user.id).maybeSingle();
      if (adminError || !admin) {
        await client.auth.signOut();
        throw new Error('هاد الحساب ما مسجلش كمسؤول فقاعدة البيانات.');
      }
      return data;
    },
    async getAdminSession() {
      const client = await this.init();
      const { data } = await client.auth.getSession();
      if (!data.session) return null;
      const { data: admin } = await client.from('admin_users').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
      return admin ? data.session : null;
    },
    async listOrders() {
      const client = await this.init();
      const cols = 'id,order_number,customer_name,customer_phone,customer_city,customer_address,customer_notes,delivery_method,subtotal,delivery_fee,total,status,created_at,order_items(product_name,quantity,unit_price,line_total,options)';
      let all = [];
      for (let from = 0; from < 20000; from += 1000) {
        const { data, error } = await client.from('orders').select(cols)
          .order('created_at', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < 1000) break;
      }
      return all;
    },
    async deleteOrders(ids) {
      const client = await this.init();
      const { error } = await client.from('orders').delete().in('id', ids);
      if (error) throw error;
    },
    async listAdmins() {
      const client = await this.init();
      const { data, error } = await client.rpc('list_admins');
      if (error) throw error;
      return data || [];
    },
    async addAdmin(email) {
      const client = await this.init();
      const { error } = await client.rpc('add_admin', { p_email: email });
      if (error) throw error;
    },
    async removeAdmin(userId) {
      const client = await this.init();
      const { error } = await client.rpc('remove_admin', { p_user_id: userId });
      if (error) throw error;
    },
    async listAllProducts() {
      const client = await this.init();
      const { data, error } = await client.from('products')
        .select('id,slug,name_ar,name_fr,description,category,price,unit,image_url,stock_quantity,is_active,created_at').order('category').order('name_ar');
      if (error) throw error;
      return data || [];
    },
    async updateProduct(id, patch) {
      const client = await this.init();
      const { error } = await client.from('products').update(patch).eq('id', id);
      if (error) throw error;
    },
    async createAdminAccount(email, password) {
      const client = await this.init();
      const { data, error } = await client.functions.invoke('create-admin', { body: { email, password } });
      if (error) {
        let msg = error.message;
        try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch (e) {}
        const err = new Error(msg); err.status = error.context && error.context.status; throw err;
      }
      return data;
    },
    async setOrderStatus(id, status) {
      const client = await this.init();
      const { error } = await client.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    async signOut() {
      if (!this.client) return;
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
    }
  };
})();
