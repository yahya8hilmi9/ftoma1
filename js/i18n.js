/* ============================================================
   FATOUMA — تبديل اللغة عربي ⇄ Français
   الموقع مكتوب بالعربية. هاد الملف كيترجم النصوص الظاهرة للفرنسية عبر قاموس.
   زيد ترجمة جديدة: أضف سطر "النص العربي": "Traduction" فـ DICT.
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});
  const KEY = 'fatouma_lang';
  let lang = 'ar';
  try { lang = localStorage.getItem(KEY) === 'fr' ? 'fr' : 'ar'; } catch (e) {}
  F.lang = lang;

  const DICT = {
    // أوصاف وأخرى
    "مسمن محشو بعناية، اختر حشوتك: خليع، خضرة أو شحمة.": "Msemen soigneusement fourré : choisissez khlii, légumes ou chahma.",
    "الفطيرة ذات الألف عين، خفيفة كالسحاب تشرب العسل والزبدة.": "La crêpe aux mille trous, légère comme un nuage, qui boit le miel et le beurre.",
    "هلال من اللوز المعطر بماء الزهر، في عجينة رقيقة كالحرير.": "Croissant d’amandes parfumé à la fleur d’oranger, dans une pâte fine comme la soie.",
    "خمس قطع من كل نوع: مسمن، حرشة، بغرير وبطبوط.": "Cinq pièces de chaque : msemen, harcha, baghrir et batbout.",
    "مذاق مغربي أصيل… بحب فطومة": "Un goût marocain authentique… avec l’amour de Fatouma",
    "الإثنين – الجمعة": "Lundi – Vendredi",
    "السبت – الأحد": "Samedi – Dimanche",
    "الدار البيضاء، المغرب": "Casablanca, Maroc",
    "رقائق ذهبية مطوية باليد، مقرمشة من الخارج وطرية من الداخل.": "Fines feuilles dorées pliées à la main, croustillantes dehors, moelleuses dedans.",
    "سميد ذهبي بقشرة مقرمشة وقلب طري، على أصولها بالزبدة.": "Semoule dorée, croûte croustillante et cœur tendre, dans les règles de l’art au beurre.",
    "خبز مغربي منتفخ على الطاجين، يصلح للحشو أو للأكل مع الجبن والزيتون.": "Pain marocain gonflé sur le tajine, à fourrer ou à manger avec fromage et olives.",
    "بطبوط طري محشو، وجبة كاملة في قطعة واحدة.": "Batbout moelleux fourré, un repas complet en une pièce.",
    "غريبة هشة تذوب في الفم، بالسميد والعسل والسمن البلدي.": "Ghriba fondante, à la semoule, au miel et au smen.",
    "بسكويت مقرمش مرتين بالسمسم واللوز، رفيق الشاي المثالي.": "Biscuit croquant deux fois cuit au sésame et aux amandes, compagnon idéal du thé.",
    "مثلثات مقرمشة بحشوة اللوز، مغموسة في العسل.": "Triangles croustillants à la farce d’amandes, trempés dans le miel.",
    "وردة مقلية بالسمسم والعسل، نجمة مائدة رمضان.": "Rose frite au sésame et au miel, star de la table du Ramadan.",
    "غريبة غنية باللوز المطحون، برائحة الليمون وماء الزهر.": "Ghriba riche en amandes moulues, parfumée au citron et à la fleur d’oranger.",
    "بسكويت مغربي صغير بنكهات متنوعة، لكل مناسبة ولكل ذوق.": "Petits biscuits marocains aux saveurs variées, pour chaque occasion et chaque goût.",
    "كرات ناعمة من اللوز والسكر، تقدم في الأعراس والأعياد.": "Boules fondantes d’amandes et de sucre, servies aux mariages et aux fêtes.",
    "عشر قطع من المسمن الطازج، جاهزة للفطور العائلي.": "Dix msemen frais, prêts pour le petit-déjeuner en famille.",
    "ثماني حرشات ذهبية بالسميد، مقرمشة وطرية.": "Huit harchas dorées à la semoule, croustillantes et tendres.",
    "خليط بين خفة البغرير وطراوة البطبوط.": "Un mélange entre la légèreté du baghrir et le moelleux du batbout.",
    "ست قطع من البطبوط المحشو، بالحشوة التي تختارها.": "Six batbouts fourrés, avec la garniture de votre choix.",
    "ست قطع من المسمن المعمّر، اختر: خليع، خضرة أو شحمة.": "Six msemen fourrés : choisissez khlii, légumes ou chahma.",
    "تذوق صغير لكل أنواع الفطائر، مناسب لشخصين أو ثلاثة.": "Petite dégustation de tous nos fatayer, pour deux ou trois personnes.",
    "مائدة عائلية كاملة من الفطائر الطازجة.": "Une table familiale complète de fatayer frais.",
    "للمناسبات الكبيرة: كل الأنواع مع المسمن والبطبوط المعمّرين.": "Pour les grandes occasions : tous les types avec msemen et batbout fourrés.",
    "كيلوغرام كامل من كعب الغزال، في علبة أنيقة.": "Un kilo de cornes de gazelle, dans une jolie boîte.",
    "كيلوغرام كامل من غريبة، في علبة أنيقة.": "Un kilo de ghriba, dans une jolie boîte.",
    "كيلوغرام كامل من فقاص، في علبة أنيقة.": "Un kilo de fekkas, dans une jolie boîte.",
    "كيلوغرام كامل من بريوات، في علبة أنيقة.": "Un kilo de briwat, dans une jolie boîte.",
    "كيلوغرام كامل من الشباكية، في علبة أنيقة.": "Un kilo de chebakia, dans une jolie boîte.",
    "كيلوغرام كامل من غريبة اللوز، في علبة أنيقة.": "Un kilo de ghriba aux amandes, dans une jolie boîte.",
    "تشكيلة من أحلى ما عندنا: كعب الغزال، غريبة، فقاص وشباكية.": "Assortiment de nos meilleures douceurs : cornes de gazelle, ghriba, fekkas et chebakia.",
    "علبة بسيطة ولذيذة للاستهلاك اليومي مع الشاي.": "Boîte simple et délicieuse pour le thé au quotidien.",
    "اختيار فاخر من الحلويات المغربية في تغليف أنيق بشريط ذهبي.": "Sélection raffinée de pâtisseries marocaines, emballage élégant au ruban doré.",
    "أفخم تشكيلة، في صندوق خشبي مبطن، للهدايا والمناسبات الكبيرة.": "Notre plus belle sélection, en coffret bois capitonné, pour cadeaux et grandes occasions.",
    "© 2026 فطومة · Fatouma — صُنع بحب في المغرب": "© 2026 Fatouma — Fait avec amour au Maroc",
    "FATOUMA · فطومة": "FATOUMA",
    // الرأس والتنقل
    'الرئيسية': 'Accueil', 'الفطائر': 'Fatayer', 'الحلويات': 'Pâtisseries', 'المناسبات': 'Occasions', 'من نحن': 'À propos',
    'تتبع طلبك': 'Suivre ma commande', 'اشتراك الفطور': 'Abonnement petit-déj', 'طلبات الشركات': 'Entreprises',
    'القائمة': 'Menu', 'بحث': 'Rechercher', 'السلة': 'Panier', 'الموقع': 'Site', 'إغلاق': 'Fermer',
    // الرئيسية
    'Fatouma · فطائر وحلويات مغربية': 'Fatouma · Fatayer & pâtisseries marocaines',
    'فطومة': 'Fatouma', 'مذاق مغربي أصيل، محضّر بحب': 'Un goût marocain authentique, préparé avec amour',
    'مسمن، حرشة، بغرير وحلويات تقليدية بأيادٍ مغربية، من مطبخنا إلى مائدتك.': 'Msemen, harcha, baghrir et pâtisseries traditionnelles faites main, de notre cuisine à votre table.',
    'اكتشف المنتجات': 'Découvrir les produits', 'اطلب الآن': 'Commander', 'عجن يدوي': 'Pétri à la main', 'مكونات طبيعية': 'Ingrédients naturels', 'توصيل لباب الدار': 'Livraison à domicile',
    'اختر قسمك': 'Choisissez votre rayon', 'من الفطائر الطازجة إلى الحلويات والـ Packs، كل شيء بنقرة.': 'Des fatayer frais aux pâtisseries et packs, tout en un clic.',
    'الأكثر طلباً': 'Les plus commandés', 'اختيارات زبائننا المفضلة، والباقي في صفحات الأقسام.': 'Les favoris de nos clients ; le reste est dans les rayons.', 'عرض كل المنتجات': 'Voir tous les produits',
    'شنو باغي اليوم؟': 'Que désirez-vous aujourd’hui ?', 'اختر وغادي نعرضو عليك الأنسب.': 'Choisissez et nous vous proposons le plus adapté.',
    'فطائر': 'Fatayer', 'فطائر معمّرين': 'Fatayer fourrés', 'حلويات': 'Pâtisseries', 'Pack عائلي': 'Pack familial',
    'اختر من فوق وغادي تظهر لك المنتجات هنا ✨': 'Choisissez ci-dessus et les produits apparaîtront ici ✨',
    'لكل مناسبة Pack': 'Un pack pour chaque occasion', 'من فطور الأحد إلى العرس، عندنا ما يليق بالمائدة.': 'Du petit-déjeuner du dimanche au mariage, nous avons ce qu’il faut.',
    'حكاية فطومة': 'L’histoire de Fatouma', 'تصفح المنتجات': 'Parcourir les produits',
    'فطومة علامة تحافظ على المذاق المغربي التقليدي. نحضّر الفطائر والحلويات بعناية، بمكونات جيدة ووصفات ورثناها عن الجدات، لتصلك طازجة كأنها من مطبخ البيت.': 'Fatouma préserve le goût marocain traditionnel. Nous préparons fatayer et pâtisseries avec soin, avec de bons ingrédients et des recettes héritées des grands-mères, pour qu’ils vous arrivent frais comme à la maison.',
    '☀️ فطور الأسبوع': '☀️ Petit-déj de la semaine', 'اشترك وتوصلك فطورة مغربية طازجة كل أسبوع': 'Abonnez-vous et recevez un petit-déjeuner marocain frais chaque semaine',
    '🏢 للشركات والمناسبات': '🏢 Entreprises & événements', 'طلبات كبيرة؟ عرض ثمن في 24 ساعة': 'Grosse commande ? Devis sous 24 h',
    '🌙 رمضان والأعياد': '🌙 Ramadan & fêtes', 'تحضّر للمناسبة من دابا': 'Préparez l’occasion dès maintenant',
    'آراء زبنائنا': 'Avis de nos clients', 'شنو قالو علينا. وإلا جربتي فطومة، شاركنا رأيك.': 'Ce qu’ils disent de nous. Vous avez essayé Fatouma ? Donnez votre avis.',
    // الفوتر
    'الموقع ': 'Site', 'اشتراك فطور الأسبوع': 'Abonnement petit-déj', 'طلبات الشركات والمناسبات': 'Entreprises & événements', '📲 ثبّت الموقع كتطبيق': '📲 Installer l’application',
    'المؤسسون · Fondateurs :': 'Fondateurs :', 'مجاني': 'Gratuit',
    // المتجر والمنتج
    'المتجر': 'Boutique', 'اختر، صفّي، وأضف إلى السلة.': 'Choisissez, filtrez et ajoutez au panier.', 'ابحث: مسمن، كعب الغزال، Premium…': 'Rechercher : msemen, kaab ghzal, Premium…',
    'كل المناسبات': 'Toutes les occasions', 'كل المستويات': 'Tous les niveaux', 'الترتيب الافتراضي': 'Tri par défaut', 'السعر: الأقل أولاً': 'Prix croissant', 'السعر: الأعلى أولاً': 'Prix décroissant',
    'الكل': 'Tout', 'كل الـ Packs': 'Tous les packs', 'اكتشف أقسامنا الأخرى': 'Découvrez nos autres rayons', 'قد يعجبك أيضاً': 'Vous aimerez aussi',
    'يحتوي على': 'Contient', 'اختر الحشوة': 'Choisissez la garniture', 'مناسب لـ': 'Idéal pour', 'الحشوة': 'Garniture', 'حشوة المعمّر': 'Garniture du fourré',
    'اطلب مباشرة عبر واتساب': 'Commander via WhatsApp', 'شارك هاد المنتج': 'Partager ce produit', 'اطلب عبر واتساب': 'Commander via WhatsApp',
    'ما لقينا شي حاجة بهاد البحث 🌿': 'Aucun résultat pour cette recherche 🌿', 'صورة توضيحية': 'Image illustrative',
    '✎ خصّص الـ Pack ديالك': '✎ Personnalisez votre pack', 'خصّص الـ Pack ديالك ✎': 'Personnalisez votre pack ✎', 'إعادة الضبط': 'Réinitialiser',
    'السعر يتغير مع كل تعديل، محسوب حسب الأسعار الأساسية للقطع (مع خصم الـ Pack).': 'Le prix s’ajuste à chaque modification, calculé sur les prix de base (avec remise pack).',
    'اختر قطعة واحدة على الأقل': 'Choisissez au moins une pièce', 'الأكثر طلباً ': 'Best-seller', 'Premium': 'Premium',
    'الكمية': 'Quantité', 'أنقص': 'Moins', 'زد': 'Plus', 'حذف': 'Supprimer', 'معدّل': 'Modifié', '✎ تعديل الـ Pack': '✎ Modifier le pack', 'حفظ التعديل': 'Enregistrer',
    // السلة
    'صندوق فطومة': 'Boîte Fatouma', 'صندوقك فارغ، اختر ما تشتهي 🌿': 'Votre boîte est vide, choisissez ce qui vous fait envie 🌿', 'ملاحظات للطلب': 'Notes pour la commande',
    'مثال: بدون سكر، تغليف هدية…': 'Ex. : sans sucre, emballage cadeau…', 'المجموع': 'Total', '+ متابعة التسوق': '+ Continuer vos achats', 'الصندوق فارغ': 'La boîte est vide',
    'ضع منتجاتك هنا 🌿': 'Placez vos produits ici 🌿', '🎉 توصيلك داخل المدينة مجاني': '🎉 Livraison gratuite en ville',
    // الطلب
    'إتمام الطلب': 'Finaliser la commande', 'صفحة واحدة، بدون تعقيد.': 'Une seule page, sans complication.', 'الاسم الكامل': 'Nom complet', 'رقم الهاتف': 'Téléphone', 'المدينة': 'Ville', 'العنوان': 'Adresse',
    'ملاحظات (اختياري)': 'Notes (facultatif)', '📅 موعد التوصيل (اختياري)': '📅 Date de livraison (facultatif)', 'اليوم': 'Jour', 'الوقت': 'Heure', 'أقرب وقت ممكن': 'Dès que possible',
    'الصباح (9:00 – 12:00)': 'Matin (9h – 12h)', 'بعد الظهر (12:00 – 17:00)': 'Après-midi (12h – 17h)', 'المساء (17:00 – 20:00)': 'Soir (17h – 20h)',
    '🎁 هاد الطلب هدية': '🎁 C’est un cadeau', 'لمن؟': 'Pour qui ?', 'اسم الشخص المهدى إليه': 'Nom du destinataire', 'رسالة تتكتب على البطاقة': 'Message sur la carte', 'عيد مبارك سعيد 🌿': 'Joyeuse fête 🌿',
    'غادي نغلفو الطلب كهدية وما كنكتبوش الثمن على البطاقة.': 'Nous emballons en cadeau, sans prix sur la carte.',
    'طريقة التوصيل': 'Mode de livraison', 'توصيل داخل المدينة': 'Livraison en ville', 'توصيل لباقي المدن': 'Livraison nationale', 'الاستلام من المحل': 'Retrait en boutique',
    'نفس اليوم / الغد': 'Jour même / lendemain', '24 – 48 ساعة': '24 – 48 h', 'جاهز خلال ساعتين': 'Prêt en 2 h',
    'الدفع عند الاستلام. اختر كيف تبغي ترسل الطلب.': 'Paiement à la livraison. Choisissez comment envoyer la commande.',
    'تأكيد الطلب في الموقع': 'Confirmer la commande sur le site', 'أو أرسل الطلب عبر واتساب': 'Ou envoyer la commande via WhatsApp',
    'ملخص الطلب': 'Récapitulatif', 'المجموع الفرعي': 'Sous-total', 'التوصيل': 'Livraison', 'كود الخصم': 'Code promo', 'تطبيق': 'Appliquer',
    'أدخل اسمك الكامل': 'Entrez votre nom complet', 'رقم هاتف مغربي غير صالح': 'Numéro marocain invalide', 'أدخل المدينة': 'Entrez la ville', 'أدخل العنوان': 'Entrez l’adresse',
    'السلة فارغة': 'Panier vide', 'أضف شي حاجة لذيذة قبل ما تكمل الطلب.': 'Ajoutez quelque chose de délicieux avant de commander.',
    'شكراً لك! 🌿': 'Merci ! 🌿', 'احتفظ برقم الطلب باش تتبعو 🌿': 'Gardez votre numéro de commande pour le suivre 🌿', 'العودة للرئيسية': 'Retour à l’accueil',
    // التتبع
    'دخل رقم الطلب (اللي توصلتي بيه من بعد الطلب) ورقم الهاتف اللي استعملتي فـ الطلب.': 'Entrez le numéro de commande reçu après l’achat et le téléphone utilisé.',
    'رقم الطلب': 'N° de commande', 'تتبع': 'Suivre', 'تسجل الطلب': 'Commande enregistrée', 'تأكد': 'Confirmée', 'قيد التحضير': 'En préparation', 'في الطريق': 'En route', 'تسلّمتي الطلب': 'Livrée',
    'ما لقينا حتى طلب بهاد الرقم والهاتف. تأكد من المعلومات وعاود.': 'Aucune commande trouvée avec ce numéro et ce téléphone.', '🔁 عاود نفس الطلب': '🔁 Recommander la même chose',
    'هاد الطلب تلغى. إلا بغيتي تستفسر، تواصل معنا فـ واتساب.': 'Cette commande est annulée. Contactez-nous sur WhatsApp.', 'الخصم': 'Remise',
    // التقييمات والنماذج
    '✍️ اكتب رأيك': '✍️ Écrire un avis', 'اسمك': 'Votre nom', 'التقييم': 'Note', 'رأيك': 'Votre avis', 'إرسال الرأي': 'Envoyer l’avis', 'كيبان فالموقع من بعد مراجعتنا.': 'Visible après modération.',
    'كون أول واحد يقيّم 🌿': 'Soyez le premier à donner votre avis 🌿', 'هاد الخانة مطلوبة': 'Champ obligatoire',
    'اشتراك فطور الأسبوع ☀️': 'Abonnement petit-déjeuner ☀️', 'فطورة مغربية طازجة كتوصلك كل أسبوع فنفس اليوم: مسمن، حرشة، بغرير، بطبوط وغيرها، بلا ما تفكر.': 'Un petit-déjeuner marocain frais chaque semaine, le même jour : msemen, harcha, baghrir, batbout… sans y penser.',
    'تختار الباقة واليوم المناسب ليك': 'Vous choisissez la formule et le jour', 'كنعيطو ليك لتأكيد الثمن والتفاصيل': 'Nous vous appelons pour confirmer prix et détails', 'تقدر توقف أو تبدل الاشتراك فأي وقت': 'Vous pouvez modifier ou arrêter à tout moment',
    'الباقة': 'Formule', 'فردي (1–2 أشخاص)': 'Solo (1–2 pers.)', 'عائلي (3–5 أشخاص)': 'Familial (3–5 pers.)', 'كبير (6 أشخاص أو أكثر)': 'Grand (6 pers. ou +)',
    'كل جمعة': 'Chaque vendredi', 'كل سبت': 'Chaque samedi', 'كل أحد': 'Chaque dimanche', 'السبت والأحد': 'Samedi et dimanche', 'كل أيام الأسبوع': 'Tous les jours', 'ملاحظات (حساسية، تفضيلات…)': 'Notes (allergies, préférences…)', 'اشترك': 'S’abonner',
    'طلبات الشركات والمناسبات 🏢': 'Entreprises & événements 🏢', 'اجتماعات، ندوات، أعراس، عقيقة، أو هدايا الزبناء: كميات كبيرة بتغليف مرتب وعرض ثمن فـ 24 ساعة.': 'Réunions, séminaires, mariages, naissances ou cadeaux clients : grandes quantités, emballage soigné et devis sous 24 h.',
    'الاسم': 'Nom', 'الشركة / الجهة (اختياري)': 'Société (facultatif)', 'الهاتف': 'Téléphone', 'Email (اختياري)': 'Email (facultatif)', 'تاريخ المناسبة': 'Date de l’événement', 'عدد الأشخاص': 'Nombre de personnes', 'شنو محتاج؟': 'Votre besoin ?',
    'مثال: فطور لـ 40 شخص، مسمن وبغرير وحلويات…': 'Ex. : petit-déj pour 40 personnes, msemen, baghrir, pâtisseries…', 'أرسل الطلب': 'Envoyer la demande', 'أو تواصل معنا عبر واتساب': 'Ou contactez-nous via WhatsApp',
    'شكراً على رأيك! غادي يبان من بعد المراجعة. 🌿': 'Merci pour votre avis ! Il sera publié après modération. 🌿', 'توصلنا بطلبك! غادي نتواصلو معك قريباً. 🌿': 'Demande reçue ! Nous vous contactons très vite. 🌿',
    // المناسبات
    'رمضان': 'Ramadan', 'الأعياد': 'Fêtes', 'الأعراس': 'Mariages', 'العقيقة والمناسبات العائلية': 'Naissances & événements familiaux', 'الفطور': 'Petit-déjeuner', 'المناسبات العائلية': 'Famille', 'الهدايا': 'Cadeaux', 'الضيافة': 'Hospitalité',
    'مائدة رمضان مع فطومة': 'La table du Ramadan avec Fatouma', 'حلويات العيد': 'Pâtisseries de l’Aïd', 'حلويات الأعراس والحفلات': 'Pâtisseries pour mariages et fêtes', 'العقيقة، الولادة والمناسبات العائلية': 'Naissances et événements familiaux',
    'من الحرشة والبغرير للسحور، للشباكية وسلو والحلويات للفطور. حضّر مائدتك من قبل الزحمة.': 'De la harcha et du baghrir pour le s’hour, aux chebakia, sellou et pâtisseries pour l’iftar. Préparez votre table avant la foule.',
    'غريبة، كعب الغزال، فقاص وحلويات العيد باش تستقبل الضيوف بالمذاق الأصيل.': 'Ghriba, cornes de gazelle, fekkas et douceurs de l’Aïd pour accueillir vos invités avec authenticité.',
    'طلبات كبيرة لأفراحكم: أطباق مرتبة وحلويات تقليدية بكميات على قدر الحفلة.': 'Grandes commandes pour vos fêtes : plateaux soignés et pâtisseries traditionnelles à la mesure de l’événement.',
    'فرحة المولود والجمعات العائلية: فطائر وحلويات تكفي الجميع، وتوصلك على الوقت.': 'La joie d’une naissance et les réunions de famille : fatayer et douceurs pour tous, livrés à temps.',
    'اطلب 48 ساعة قبل على الأقل فـ أيام رمضان الأولى': 'Commandez au moins 48 h à l’avance en début de Ramadan', 'الـ Packs العائلية كتوفر عليك التحضير': 'Les packs familiaux vous évitent la préparation', 'تقدر تحدد وقت التوصيل قبل الفطور': 'Choisissez l’heure de livraison avant l’iftar',
    'اطلب قبل العيد بـ 3 أيام باش تضمن الموعد': 'Commandez 3 jours avant l’Aïd pour garantir la date', 'علب هدايا بتغليف خاص': 'Boîtes cadeaux avec emballage spécial', 'Packs Premium و VIP للعائلة والأصدقاء': 'Packs Premium et VIP pour la famille et les amis',
    'اطلب قبل أسبوع على الأقل': 'Commandez au moins une semaine avant', 'للكميات الكبيرة استعمل طلب عرض الثمن': 'Pour de grandes quantités, demandez un devis', 'ممكن نخصصو التغليف': 'Emballage personnalisable',
    'اطلب قبل 3 أيام': 'Commandez 3 jours avant', 'حدد موعد التوصيل فـ الصباح أو العشية': 'Choisissez une livraison matin ou après-midi', 'Packs عائلية جاهزة وقابلة للتعديل': 'Packs familiaux prêts et modifiables',
    'بداية رمضان (تاريخ تقريبي)': 'Début du Ramadan (date approximative)', 'عيد الفطر (تاريخ تقريبي)': 'Aïd el-Fitr (date approximative)', 'كل منتجات هاد المناسبة': 'Tous les produits de cette occasion', 'اطلب عرض ثمن لكمية كبيرة': 'Demander un devis grande quantité', 'استفسر عبر واتساب': 'Se renseigner via WhatsApp',
    "قطعة": "pièce",
    "علبة 250غ": "boîte 250 g",
    "علبة 500غ": "boîte 500 g",
    "علبة 1 كلغ": "boîte 1 kg",
    "علبة": "boîte",
    "كلغ": "kg",
    "منتج": "produits",
    "منتج مقترح": "produits suggérés",
    "يوم": "j",
    "ساعة": "h",
    "دقيقة": "min",
    "الشباكية": "Chebakia",
    "شباكية": "Chebakia",
    "صندوق 2.5 كلغ": "coffret 2,5 kg",
    "علب جاهزة للفطائر، من المسمن إلى البطبوط المعمّر.": "Boîtes prêtes de fatayer, du msemen au batbout fourré.",
    '404': '404', 'هاد الصفحة ما لقيناهاش.': 'Page introuvable.', 'الاستلام': 'Retrait'
  };
  const RULES = [
    [/^\/ (.+)$/, (m, u) => '/ ' + tr(u)], [/^© (\d{4}) فطومة.*$/, '© $1 Fatouma — Fait avec amour au Maroc'],
    [/^(.+) · (Khlii|Légumes|Chahma)$/, '$2'], [/^(.+) ×(\d+)$/, (m, n, q) => tr(n) + ' ×' + q],
    [/^(\d+) كلغ (.+)$/, (m, q, n) => q + ' kg ' + tr(n)], [/^قطعة في صندوقك · (\d+) صنف$/, 'pièces dans votre boîte · $1 articles'],
    [/^(.+) · (.+)$/, (m, a, b) => tr(a) + ' · ' + tr(b)],
    [/^(\d+) (?!×)(.+)$/, (m, q, n) => q + ' ' + tr(n)],
    [/^(\d+) منتج مقترح$/, '$1 produits suggérés'], [/^(\d+) منتج$/, '$1 produits'], [/^(\d+) قطعة$/, '$1 pièces'],
    [/^باقي (\d+) فقط$/, 'Plus que $1'], [/^باقي (.+) للتوصيل المجاني داخل المدينة$/, 'Encore $1 pour la livraison gratuite en ville'],
    [/^(\d+) صنف$/, '$1 articles'], [/^طلب #(\d+)$/, 'Commande #$1'],
    [/^(\d+) قطعة في صندوقك · (\d+) صنف$/, '$1 pièces dans votre boîte · $2 articles'],
    [/^⏰ اطلب فـ (?:(\d+) س و )?(\d+) د الجاية ويوصلك اليوم \(داخل المدينة\)\.$/, (m, h, mi) => '⏰ Commandez dans ' + (h ? h + ' h ' : '') + mi + ' min pour être livré aujourd’hui (en ville).'],
    [/^🌙 سالات طلبات اليوم.*$/, '🌙 Commandes du jour closes. Votre commande sera livrée demain, inch’Allah.'],
    [/^تسجل طلبك فالموقع\. رقم الطلب: #(\d+)\..*$/, 'Commande enregistrée. N° #$1. Nous vous contactons pour confirmer la livraison.'],
    [/^فتحنا واتساب بطلبك\..*$/, 'WhatsApp est ouvert avec votre commande. Nous vous contactons pour confirmer.'],
    [/^أقرب موعد ممكن هو (.+)$/, 'Date la plus proche : $1'], [/^هاد الكود كيتطلب طلب بـ (.+) على الأقل\.$/, 'Ce code exige une commande d’au moins $1.'],
    [/^كود غير صالح أو منتهي\.$/, 'Code invalide ou expiré.'], [/^📅 موعد التوصيل: (.+)$/, '📅 Livraison : $1'],
    [/^(\d+) يوم (\d+) ساعة (\d+) دقيقة$/, '$1 j $2 h $3 min'], [/^(\d+) × (.+)$/, (m, q, n) => q + ' × ' + tr(n)],
    [/^(.+) — (.+)$/, (m, a, b) => tr(a) + ' — ' + tr(b)]
  ];
  let extra = null;
  const buildExtra = () => {
    extra = {};
    (F.items || []).concat(Object.values(F.hiddenById || {})).forEach(i => { if (i.fr) extra[i.ar] = i.fr; });
    (F.categories || []).forEach(c => { if (c.fr) extra[c.ar] = c.fr; });
    (F.occasions || []).forEach(o => { if (o.fr) extra[o.ar] = o.fr; });
    (F.fillings || []).forEach(f => { if (f.fr) extra[f.ar] = f.fr; });
    (F.config.delivery || []).forEach(d => { if (d.fr) extra[d.ar] = d.fr; });
    (F.categories || []).forEach(c => { if (c.blurb) extra[c.blurb] = extra[c.blurb] || c.blurb; });
  };
  function tr(t) {
    const k = t.trim(); if (!k) return t;
    let r = DICT[k] || (extra && extra[k]);
    if (!r) for (const [re, to] of RULES) { if (re.test(k)) { r = k.replace(re, to); break; } }
    if (!r) r = k.replace(/د\.م/g, 'DH');
    if (r === k && !/[؀-ۿ]/.test(k)) return t;
    return t.replace(k, r.replace(/د\.م/g, 'DH'));
  }
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const orig = new WeakMap(), origAttr = new WeakMap();
  const ROOTS = ['#site-header', '#main', '#site-footer', '#drawer-root', '#modal-root', '#toast'];
  F.i18n = {
    missing: [],
    apply() {
      document.documentElement.lang = F.lang; document.documentElement.dir = F.lang === 'fr' ? 'ltr' : 'rtl';
      document.body.classList.toggle('lang-fr', F.lang === 'fr');
      const bt = document.querySelector('.lang-btn'); if (bt) bt.textContent = F.lang === 'fr' ? 'عربية' : 'FR';
      if (F.lang !== 'fr') return; // الأصل عربي: الصفحة كتتبني بالعربية، ما كاين ما نترجمو
      if (!extra) buildExtra();
      this.missing = [];
      ROOTS.forEach(sel => {
        const root = document.querySelector(sel); if (!root) return;
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) {
          const p = n.parentNode && n.parentNode.nodeName; if (p === 'SCRIPT' || p === 'STYLE' || (n.parentNode.classList && n.parentNode.classList.contains('lang-btn'))) continue;
          if (!/[؀-ۿ]/.test(n.nodeValue)) continue;
          const t = tr(n.nodeValue);
          if (/[؀-ۿ]/.test(t)) this.missing.push(n.nodeValue.trim());
          if (t !== n.nodeValue) n.nodeValue = t;
        }
        root.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(el => ATTRS.forEach(a => {
          const v = el.getAttribute(a); if (v && /[؀-ۿ]/.test(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); }
        }));
      });
    },
    toggle() {
      F.lang = F.lang === 'fr' ? 'ar' : 'fr';
      try { localStorage.setItem(KEY, F.lang); } catch (e) {}
      location.reload(); // أبسط وأضمن: الصفحة كتتبني من جديد باللغة المختارة
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    if (F.lang !== 'fr' || !window.MutationObserver) return;
    let q = 0;
    new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; F.i18n.apply(); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  document.addEventListener('DOMContentLoaded', () => { document.documentElement.lang = F.lang; document.documentElement.dir = F.lang === 'fr' ? 'ltr' : 'rtl'; });
})();
