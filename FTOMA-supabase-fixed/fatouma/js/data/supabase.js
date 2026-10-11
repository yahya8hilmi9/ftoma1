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
    /* Overlay live data (price, availability, stock) from Supabase onto the local catalog.
       Matching is done on products.slug === local item id. Falls back silently to local data. */
    async syncCatalog() {
      const rows = await this.getActiveProducts();
      const bySlug = {};
      rows.forEach(r => { bySlug[r.slug] = r; });
      const all = F.items.slice();
      let matched = 0;
      F.items = all.filter(item => {
        const r = bySlug[item.id];
        if (!r) return true; // not in DB yet: keep local version
        matched++;
        const price = Number(r.price);
        if (Number.isFinite(price)) item.price = price;
        if (r.unit) item.unit = r.unit;
        if (r.image_url) item.image = r.image_url;
        item.stock = r.stock_quantity;
        return r.stock_quantity === null || r.stock_quantity === undefined || r.stock_quantity > 0;
      });
      return { total: rows.length, matched };
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
      const { data, error } = await client.from('orders')
        .select('id,order_number,customer_name,customer_phone,customer_city,customer_address,customer_notes,delivery_method,subtotal,delivery_fee,total,status,created_at,order_items(product_name,quantity,unit_price,line_total,options)')
        .order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
    async listAllProducts() {
      const client = await this.init();
      const { data, error } = await client.from('products')
        .select('id,slug,name_ar,category,price,unit,stock_quantity,is_active').order('category').order('name_ar');
      if (error) throw error;
      return data || [];
    },
    async updateProduct(id, patch) {
      const client = await this.init();
      const { error } = await client.from('products').update(patch).eq('id', id);
      if (error) throw error;
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
