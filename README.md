# فطومة · Fatouma — موقع E-commerce

موقع ثابت (HTML/CSS/JS بدون أدوات بناء). افتح `index.html` مباشرة أو شغّل أي خادم محلي.

## البنية
```
index.html
css/base.css          ← الألوان (tokens) والخطوط والأساسيات
css/components.css    ← الأزرار، البطاقات، السلة، الـ Footer…
js/data/config.js     ← رقم واتساب، التوصيل، الروابط، الساعات
js/data/catalog.js    ← كل المنتجات والـ Packs والمناسبات (مكان واحد)
js/art.js             ← صور مؤقتة SVG (تُستبدل بالصور الحقيقية)
js/store.js           ← السلة، البحث، الفلترة، رسالة واتساب
js/components.js      ← مكوّنات: card, qtyControl, cartLine…
js/views.js           ← الصفحات: home, shop, product, checkout
js/app.js             ← Router والأحداث والأنيميشن
```

## كيف تعدّل
- **رقم واتساب والتوصيل**: `js/data/config.js`
- **سعر**: غيّر `price` في `catalog.js`
- **صورة حقيقية**: أضف `image: 'img/msemen.jpg'` للمنتج، وستحل محل الصورة المؤقتة تلقائياً
- **منتج جديد**: أضف كائناً جديداً في المصفوفة المناسبة (`cat` يحدد القسم)
- **الألوان**: المتغيرات أعلى `css/base.css`

## الصفحات
`#/` الرئيسية · `#/shop` المتجر (بحث/فلاتر) · `#/product/ID` · `#/checkout` · السلة كدرج جانبي.

الأسعار والرقم الحالي أمثلة للتجربة فقط.

## النشر على GitHub Pages
1. كريي repo public، وحط محتوى هاد المجلد فـ الجذر (مع `.nojekyll`).
2. Settings ← Pages ← Deploy from a branch ← `main` / `(root)`.
3. الرابط: `https://USERNAME.github.io/REPO/` — زيدو فـ Supabase ← Authentication ← URL Configuration.
4. ملاحظة: `_headers` و `vercel.json` ما كيخدموش فـ GitHub Pages (غير CSP meta). للحماية الكاملة استعمل Cloudflare Pages/Netlify/Vercel.
5. ما تحط أبدا service_role / sb_secret / مفتاح CallMeBot فـ الـ repo.
