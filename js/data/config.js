/* ============================================================
   FATOUMA — إعدادات الموقع (غيّر هنا الرقم، التوصيل، الروابط)
   ============================================================ */
window.FATOUMA = window.FATOUMA || {};

window.FATOUMA.config = {
  brand: { ar: 'فطومة', fr: 'Fatouma', tagline: 'مذاق مغربي أصيل… بحب فطومة' },

  // إعدادات Supabase: المفتاح publishable مخصص للواجهة، وتبقى الحماية مع RLS.
  supabase: {
    url: 'https://mwejjmzmdwyxqkxmduwc.supabase.co',
    publishableKey: 'sb_publishable_EJBV-f-wiswHlUykCSc1-g_I6aZyObh'
  },

  // رقم واتساب بصيغة دولية بدون + (مثال: 212612345678)
  whatsapp: '212707656096',

  // مؤسسو المشروع (كيبانو فـ الفوتر)
  founders: ['Yahya Hilmi', 'Fatima Aoussah'],

  currency: 'د.م',

  // خيارات التوصيل
  delivery: [
    { id: 'city',   ar: 'توصيل داخل المدينة',        fr: 'Livraison ville',     fee: 25, freeFrom: 300, eta: 'نفس اليوم / الغد' },
    { id: 'nation', ar: 'توصيل لباقي المدن',         fr: 'Livraison nationale', fee: 40, freeFrom: null, eta: '24 – 48 ساعة' },
    { id: 'pickup', ar: 'الاستلام من المحل',         fr: 'Retrait en boutique', fee: 0,  freeFrom: null, eta: 'جاهز خلال ساعتين' }
  ],

  social: {
    instagram: 'https://www.instagram.com/ftoma.maroc/'
  },

  contact: {
    phone: '+212 7 07 65 60 96',
    email: '',
    address: 'الدار البيضاء، المغرب'
  },

  hours: [
    { d: 'الإثنين – الجمعة', h: '08:00 – 20:00' },
    { d: 'السبت – الأحد',     h: '07:00 – 21:00' }
  ]
};
