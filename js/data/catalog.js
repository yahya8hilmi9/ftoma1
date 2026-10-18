/* ============================================================
   FATOUMA — كتالوج المنتجات (مكان واحد لكل شيء)
   لتغيير صورة: ضع  image: 'img/msemen.jpg'  في المنتج المعني.
   لتغيير سعر: عدّل  price.
   لإضافة منتج: أضف سطراً جديداً في المصفوفة المناسبة.
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});

  F.fillings = [
    { id: 'khlii',  ar: 'بالخليع',  fr: 'Khlii',   color: '#7A2E1D' },
    { id: 'khodra', ar: 'بالخضرة',  fr: 'Légumes', color: '#5F7A2E' },
    { id: 'chahma', ar: 'بالشحمة',  fr: 'Chahma',  color: '#F1E3C2' }
  ];

  F.categories = [
    // cover = المنتج الذي تُؤخذ صورته لتمثيل القسم (يمكنك لاحقاً وضع image: 'img/cat-fatayer.jpg')
    { id: 'fatayer',       ar: 'الفطائر',          fr: 'Les Ftours',     cover: 'msemen', blurb: 'مسمن، حرشة، بغرير وبطبوط، طازجة كل صباح وعلى أصولها.' },
    { id: 'mamar',         ar: 'المعمّرين',         fr: 'Les Mamar',      cover: 'msemen-mamar', blurb: 'المسمن والبطبوط المحشوان: اختر بين الخليع والخضرة والشحمة.' },
    { id: 'sweets',        ar: 'الحلويات',         fr: 'Les Douceurs',   cover: 'kaab-ghzal', blurb: 'كعب الغزال، غريبة، فقاص، بريوات، شباكية وغيرها من حلويات الأجداد.' },
    { id: 'packs-fatayer', ar: 'Packs الفطائر',    fr: 'Packs Ftours',   cover: 'pack-baghrir-batbout', blurb: 'علب جاهزة للفطائر، من المسمن إلى البطبوط المعمّر.' },
    { id: 'packs-mix',     ar: 'Packs Mix',        fr: 'Assortiments',   cover: 'mix-medium', blurb: 'كل الأنواع في علبة واحدة، من Petit إلى Grande Famille.' },
    { id: 'packs-sweets',  ar: 'Packs الحلويات',   fr: 'Packs Douceurs', cover: 'pack-premium', blurb: 'حسب النوع، مشكّل، Classic، Premium وVIP للهدايا الفاخرة.' }
  ];

  F.occasions = [
    { id: 'breakfast',   ar: 'الفطور',           fr: 'Petit-déjeuner', icon: 'sun' },
    { id: 'ramadan',     ar: 'رمضان',            fr: 'Ramadan',        icon: 'moon' },
    { id: 'eid',         ar: 'الأعياد',          fr: 'Fêtes',          icon: 'star' },
    { id: 'wedding',     ar: 'الأعراس',          fr: 'Mariages',       icon: 'ring' },
    { id: 'family',      ar: 'المناسبات العائلية', fr: 'Famille',        icon: 'home' },
    { id: 'gift',        ar: 'الهدايا',          fr: 'Cadeaux',        icon: 'gift' },
    { id: 'hospitality', ar: 'الضيافة',          fr: 'Hospitalité',    icon: 'tea' }
  ];

  F.tiers = [
    { id: 'classic', ar: 'Classic' },
    { id: 'premium', ar: 'Premium' },
    { id: 'vip',     ar: 'VIP' }
  ];

  /* ---------- الفطائر ---------- */
  const fatayer = [
    { id: 'msemen',  cat: 'fatayer', ar: 'مسمن', fr: 'Msemen',
      desc: 'رقائق ذهبية مطوية باليد، مقرمشة من الخارج وطرية من الداخل.',
      price: 4, unit: 'قطعة', image: 'img/msemen.jpg', art: { shapes: ['msemen'] },
      occ: ['breakfast', 'ramadan', 'hospitality', 'family'], tags: ['best'] },
    { id: 'harcha',  cat: 'fatayer', ar: 'حرشة', fr: 'Harcha',
      desc: 'سميد ذهبي بقشرة مقرمشة وقلب طري، على أصولها بالزبدة.',
      price: 5, unit: 'قطعة', image: 'img/harcha.jpg', art: { shapes: ['harcha'] },
      occ: ['breakfast', 'ramadan', 'family'], tags: [] },
    { id: 'baghrir', cat: 'fatayer', ar: 'بغرير', fr: 'Baghrir',
      desc: 'الفطيرة ذات الألف عين، خفيفة كالسحاب تشرب العسل والزبدة.',
      price: 3, unit: 'قطعة', image: 'img/baghrir.jpg', art: { shapes: ['baghrir'] },
      occ: ['breakfast', 'ramadan', 'hospitality'], tags: ['best'] },
    { id: 'batbout', cat: 'fatayer', ar: 'بطبوط', fr: 'Batbout',
      desc: 'خبز مغربي منتفخ على الطاجين، يصلح للحشو أو للأكل مع الجبن والزيتون.',
      price: 4, unit: 'قطعة', art: { shapes: ['batbout'] },
      occ: ['breakfast', 'family', 'hospitality'], tags: [] }
  ];

  /* ---------- المعمّرين (مع اختيار الحشوة) ---------- */
  const mamar = [
    { id: 'msemen-mamar',  cat: 'mamar', ar: 'مسمن معمّر', fr: 'Msemen Mamar',
      desc: 'مسمن محشو بعناية، اختر حشوتك: خليع، خضرة أو شحمة.',
      price: 8, unit: 'قطعة', fillings: true, mamar: true, art: { shapes: ['msemen'] },
      occ: ['breakfast', 'ramadan', 'family', 'hospitality'], tags: ['best'] },
    { id: 'batbout-mamar', cat: 'mamar', ar: 'بطبوط معمّر', fr: 'Batbout Mamar',
      desc: 'بطبوط طري محشو، وجبة كاملة في قطعة واحدة.',
      price: 9, unit: 'قطعة', fillings: true, mamar: true, art: { shapes: ['batbout'] },
      occ: ['breakfast', 'family', 'hospitality'], tags: [] }
  ];

  /* ---------- الحلويات ---------- */
  const sweets = [
    { id: 'kaab-ghzal',  ar: 'كعب الغزال', fr: 'Cornes de gazelle',
      desc: 'هلال من اللوز المعطر بماء الزهر، في عجينة رقيقة كالحرير.',
      price: 70, art: { shapes: ['crescent'] }, occ: ['eid', 'wedding', 'gift', 'hospitality'], tags: ['best'] },
    { id: 'ghriba',      ar: 'غريبة', fr: 'Ghriba',
      desc: 'غريبة هشة تذوب في الفم، بالسميد والعسل والسمن البلدي.',
      price: 45, art: { shapes: ['cookie'] }, occ: ['eid', 'ramadan', 'hospitality', 'family'], tags: [] },
    { id: 'fekkas',      ar: 'فقاص', fr: 'Fekkas',
      desc: 'بسكويت مقرمش مرتين بالسمسم واللوز، رفيق الشاي المثالي.',
      price: 40, art: { shapes: ['fekkas'] }, occ: ['breakfast', 'hospitality', 'family'], tags: [] },
    { id: 'briwat',      ar: 'بريوات', fr: 'Briwates',
      desc: 'مثلثات مقرمشة بحشوة اللوز، مغموسة في العسل.',
      price: 60, art: { shapes: ['triangle'] }, occ: ['ramadan', 'eid', 'wedding', 'gift'], tags: [] },
    { id: 'chebakia',    ar: 'الشباكية', fr: 'Chebakia',
      desc: 'وردة مقلية بالسمسم والعسل، نجمة مائدة رمضان.',
      price: 45, art: { shapes: ['flower'] }, occ: ['ramadan', 'eid', 'family'], tags: ['best'] },
    { id: 'ghriba-louz', ar: 'غريبة اللوز', fr: 'Ghriba aux amandes',
      desc: 'غريبة غنية باللوز المطحون، برائحة الليمون وماء الزهر.',
      price: 65, art: { shapes: ['cookie'], tone: '#E6D9A8' }, occ: ['eid', 'wedding', 'gift', 'hospitality'], tags: [] },
    { id: 'cookies',     ar: 'كوكيات', fr: 'Biscuits Cookies',
      desc: 'بسكويت مغربي صغير بنكهات متنوعة، لكل مناسبة ولكل ذوق.',
      price: 40, art: { shapes: ['cookie'], tone: '#E0B87A' }, occ: ['family', 'hospitality'], tags: [] },
    { id: 'helwat-louz', ar: 'حلوة اللوز', fr: 'Douceur aux amandes',
      desc: 'كرات ناعمة من اللوز والسكر، تقدم في الأعراس والأعياد.',
      price: 75, art: { shapes: ['ball'] }, occ: ['wedding', 'eid', 'gift', 'hospitality'], tags: [] }
  ].map(s => Object.assign({ cat: 'sweets', unit: 'علبة 250غ' }, s));

  /* ---------- Packs الفطائر ---------- */
  const packsFatayer = [
    { id: 'pack-msemen', cat: 'packs-fatayer', ar: 'Pack مسمن', fr: 'Pack Msemen',
      desc: 'عشر قطع من المسمن الطازج، جاهزة للفطور العائلي.',
      price: 35, unit: 'pack', includes: ['10 مسمن'], art: { shapes: ['msemen'] },
      occ: ['breakfast', 'family'], tags: [] },
    { id: 'pack-harcha', cat: 'packs-fatayer', ar: 'Pack حرشة', fr: 'Pack Harcha',
      desc: 'ثماني حرشات ذهبية بالسميد، مقرمشة وطرية.',
      price: 36, unit: 'pack', includes: ['8 حرشة'], art: { shapes: ['harcha'] },
      occ: ['breakfast', 'family'], tags: [] },
    { id: 'pack-baghrir-batbout', cat: 'packs-fatayer', ar: 'Pack بغرير & بطبوط', fr: 'Pack Baghrir & Batbout',
      desc: 'خليط بين خفة البغرير وطراوة البطبوط.',
      price: 40, unit: 'pack', includes: ['6 بغرير', '6 بطبوط'], art: { shapes: ['baghrir', 'batbout'] },
      occ: ['breakfast', 'ramadan', 'hospitality'], tags: ['best'] },
    { id: 'pack-batbout-mamar', cat: 'packs-fatayer', ar: 'Pack بطبوط معمّر', fr: 'Pack Batbout Mamar',
      desc: 'ست قطع من البطبوط المحشو، بالحشوة التي تختارها.',
      price: 52, unit: 'pack', includes: ['6 بطبوط معمّر'], fillings: true, mamar: true,
      art: { shapes: ['batbout'] }, occ: ['breakfast', 'family', 'hospitality'], tags: [] },
    { id: 'pack-msemen-mamar', cat: 'packs-fatayer', ar: 'Pack مسمن معمّر', fr: 'Pack Msemen Mamar',
      desc: 'ست قطع من المسمن المعمّر، اختر: خليع، خضرة أو شحمة.',
      price: 44, unit: 'pack', includes: ['6 مسمن معمّر'], fillings: true, mamar: true,
      art: { shapes: ['msemen'] }, occ: ['breakfast', 'ramadan', 'family'], tags: ['best'] }
  ];

  /* ---------- Packs Mix ---------- */
  const packsMix = [
    { id: 'mix-petit', cat: 'packs-mix', size: 'petit', ar: 'Pack Mix Petit', fr: 'Petit — 2 à 3 personnes',
      desc: 'تذوق صغير لكل أنواع الفطائر، مناسب لشخصين أو ثلاثة.',
      price: 44, unit: 'pack', includes: ['3 مسمن', '3 حرشة', '3 بغرير', '3 بطبوط'],
      art: { shapes: ['msemen', 'harcha', 'baghrir', 'batbout'] }, occ: ['breakfast', 'gift'], tags: [] },
    { id: 'mix-medium', cat: 'packs-mix', size: 'medium', ar: 'Pack Découverte', fr: 'Medium — 4 à 5 personnes',
      desc: 'خمس قطع من كل نوع: مسمن، حرشة، بغرير وبطبوط.',
      price: 78, unit: 'pack', includes: ['5 مسمن', '5 حرشة', '5 بغرير', '5 بطبوط'],
      art: { shapes: ['msemen', 'harcha', 'baghrir', 'batbout'] }, occ: ['breakfast', 'family', 'hospitality'], tags: ['best'] },
    { id: 'mix-family', cat: 'packs-mix', size: 'family', ar: 'Pack Mix Family', fr: 'Family — 6 à 8 personnes',
      desc: 'مائدة عائلية كاملة من الفطائر الطازجة.',
      price: 120, unit: 'pack', includes: ['8 مسمن', '8 حرشة', '8 بغرير', '8 بطبوط'],
      art: { shapes: ['msemen', 'harcha', 'baghrir', 'batbout'] }, occ: ['family', 'ramadan', 'hospitality'], tags: [] },
    { id: 'mix-grande', cat: 'packs-mix', size: 'grande', ar: 'Pack Grande Famille', fr: 'Grande Famille — 12+ personnes',
      desc: 'للمناسبات الكبيرة: كل الأنواع مع المسمن والبطبوط المعمّرين.',
      price: 235, unit: 'pack',
      includes: ['12 مسمن', '12 حرشة', '12 بغرير', '12 بطبوط', '6 مسمن معمّر', '6 بطبوط معمّر'],
      fillings: true, mamar: true,
      art: { shapes: ['msemen', 'harcha', 'baghrir', 'batbout'] }, occ: ['family', 'eid', 'hospitality', 'wedding'], tags: [] }
  ];

  /* ---------- Packs الحلويات ---------- */
  // أ) حسب النوع — تُولَّد تلقائياً من الحلويات (1 كلغ بخصم صغير)
  const typePacks = ['kaab-ghzal', 'ghriba', 'fekkas', 'briwat', 'chebakia', 'ghriba-louz'].map(id => {
    const s = sweets.find(x => x.id === id);
    return {
      id: 'pack-' + s.id, cat: 'packs-sweets', ar: 'Pack ' + s.ar, fr: 'Pack ' + s.fr,
      desc: 'كيلوغرام كامل من ' + s.ar + '، في علبة أنيقة.',
      price: Math.round(s.price * 4 * 0.92), unit: 'علبة 1 كلغ',
      includes: ['1 كلغ ' + s.ar], art: s.art, occ: s.occ, tags: [], tier: 'classic'
    };
  });

  const packsSweets = typePacks.concat([
    { id: 'pack-mochakal', cat: 'packs-sweets', ar: 'Pack مشكّل', fr: 'Assortiment',
      desc: 'تشكيلة من أحلى ما عندنا: كعب الغزال، غريبة، فقاص وشباكية.',
      price: 180, unit: 'علبة 1 كلغ', includes: ['كعب الغزال', 'غريبة', 'فقاص', 'شباكية'],
      art: { shapes: ['crescent', 'cookie', 'fekkas', 'flower'] },
      occ: ['hospitality', 'family', 'eid', 'ramadan'], tags: ['best'], tier: 'classic' },
    { id: 'pack-classic', cat: 'packs-sweets', ar: 'Pack Classic', fr: 'Classic',
      desc: 'علبة بسيطة ولذيذة للاستهلاك اليومي مع الشاي.',
      price: 80, unit: 'علبة 500غ', includes: ['غريبة', 'فقاص'],
      art: { shapes: ['cookie', 'fekkas', 'cookie'] },
      occ: ['hospitality', 'family', 'breakfast'], tags: [], tier: 'classic' },
    { id: 'pack-premium', cat: 'packs-sweets', ar: 'Pack Premium', fr: 'Premium',
      desc: 'اختيار فاخر من الحلويات المغربية في تغليف أنيق بشريط ذهبي.',
      price: 280, unit: 'علبة 1 كلغ', includes: ['كعب الغزال', 'بريوات', 'غريبة اللوز', 'حلوة اللوز'],
      art: { shapes: ['crescent', 'triangle', 'cookie', 'ball'] },
      occ: ['gift', 'eid', 'wedding', 'hospitality'], tags: [], tier: 'premium' },
    { id: 'pack-vip', cat: 'packs-sweets', ar: 'Pack VIP', fr: 'VIP',
      desc: 'أفخم تشكيلة، في صندوق خشبي مبطن، للهدايا والمناسبات الكبيرة.',
      price: 590, unit: 'صندوق 2.5 كلغ', includes: ['كعب الغزال ×2', 'بريوات ×2', 'غريبة اللوز ×2', 'حلوة اللوز ×2', 'شباكية', 'فقاص'],
      art: { shapes: ['crescent', 'triangle', 'cookie', 'ball'] },
      occ: ['gift', 'wedding', 'eid'], tags: [], tier: 'vip' }
  ]);

  F.items = [].concat(fatayer, mamar, sweets, packsFatayer, packsMix, packsSweets);

  /* ---------- تركيب كل Pack (أساس تعديل الـ Pack وحساب سعره) ---------- */
  const COMP = {
    'pack-msemen': { msemen: 10 },
    'pack-harcha': { harcha: 8 },
    'pack-baghrir-batbout': { baghrir: 6, batbout: 6 },
    'pack-batbout-mamar': { 'batbout-mamar': 6 },
    'pack-msemen-mamar': { 'msemen-mamar': 6 },
    'mix-petit': { msemen: 3, harcha: 3, baghrir: 3, batbout: 3 },
    'mix-medium': { msemen: 5, harcha: 5, baghrir: 5, batbout: 5 },
    'mix-family': { msemen: 8, harcha: 8, baghrir: 8, batbout: 8 },
    'mix-grande': { msemen: 12, harcha: 12, baghrir: 12, batbout: 12, 'msemen-mamar': 6, 'batbout-mamar': 6 },
    'pack-mochakal': { 'kaab-ghzal': 1, ghriba: 1, fekkas: 1, chebakia: 1 },
    'pack-classic': { ghriba: 1, fekkas: 1 },
    'pack-premium': { 'kaab-ghzal': 1, briwat: 1, 'ghriba-louz': 1, 'helwat-louz': 1 },
    'pack-vip': { 'kaab-ghzal': 2, briwat: 2, 'ghriba-louz': 2, 'helwat-louz': 2, chebakia: 1, fekkas: 1 }
  };
  ['kaab-ghzal', 'ghriba', 'fekkas', 'briwat', 'chebakia', 'ghriba-louz'].forEach(id => { COMP['pack-' + id] = { [id]: 4 }; });
  F.items.forEach(i => { if (COMP[i.id]) i.comp = COMP[i.id]; });

  F.byId = id => F.items.find(i => i.id === id);
  F.fillingById = id => F.fillings.find(f => f.id === id);
})();
