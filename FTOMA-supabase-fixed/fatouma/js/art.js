/* ============================================================
   FATOUMA — صور مؤقتة (SVG مرسومة بالكود)
   تُستعمل فقط عندما لا يكون للمنتج حقل image.
   ============================================================ */
(function () {
  const F = (window.FATOUMA = window.FATOUMA || {});

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = v => Math.max(0, Math.min(255, v + amt));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function rng(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  const TONES = {
    msemen: '#E0A94E', harcha: '#D9983F', baghrir: '#EACB82', batbout: '#D8A25A',
    cookie: '#F3E8D2', crescent: '#F0E2C4', flower: '#8A4B1F', triangle: '#C98B3A',
    fekkas: '#D9B06A', ball: '#EADFB8'
  };

  const SHAPES = {
    msemen(x, y, r, c) {
      let o = '';
      for (let i = 2; i >= 0; i--) {
        o += `<rect x="${x - r + i * 3}" y="${y - r - i * 7 + 8}" width="${2 * r}" height="${2 * r}" rx="${r * 0.22}" fill="${shade(c, -i * 10)}" stroke="${shade(c, -45)}" stroke-width="2"/>`;
      }
      const t = y - r + 8;
      o += `<path d="M${x - r / 3} ${t} V${t + 2 * r} M${x + r / 3} ${t} V${t + 2 * r} M${x - r} ${y + 8} H${x + r}" stroke="${shade(c, -35)}" stroke-width="1.6" fill="none" opacity=".55"/>`;
      return o;
    },
    harcha(x, y, r, c) {
      const rnd = rng(7); let o = `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${shade(c, -45)}" stroke-width="2.5"/>`;
      o += `<circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="${shade(c, 14)}" opacity=".6"/>`;
      for (let i = 0; i < 26; i++) {
        const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * 0.85;
        o += `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="${1.2 + rnd() * 1.4}" fill="${shade(c, -38)}" opacity=".7"/>`;
      }
      o += `<path d="M${x - r * 0.55} ${y - r * 0.2} L${x + r * 0.55} ${y + r * 0.2} M${x - r * 0.55} ${y + r * 0.2} L${x + r * 0.55} ${y - r * 0.2}" stroke="${shade(c, -35)}" stroke-width="1.4" opacity=".45"/>`;
      return o;
    },
    baghrir(x, y, r, c) {
      const rnd = rng(11); let o = `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${shade(c, -40)}" stroke-width="2.5"/>`;
      for (let i = 0; i < 38; i++) {
        const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * 0.88;
        o += `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="${1.6 + rnd() * 2.4}" fill="${shade(c, -26)}" opacity=".75"/>`;
      }
      o += `<ellipse cx="${x - r * 0.3}" cy="${y - r * 0.4}" rx="${r * 0.4}" ry="${r * 0.18}" fill="#fff" opacity=".28"/>`;
      return o;
    },
    batbout(x, y, r, c) {
      let o = `<ellipse cx="${x}" cy="${y + 4}" rx="${r}" ry="${r * 0.82}" fill="${c}" stroke="${shade(c, -45)}" stroke-width="2.5"/>`;
      o += `<ellipse cx="${x}" cy="${y + 4}" rx="${r * 0.85}" ry="${r * 0.68}" fill="none" stroke="${shade(c, -30)}" stroke-width="2" stroke-dasharray="4 5" opacity=".55"/>`;
      o += `<ellipse cx="${x - r * 0.25}" cy="${y - r * 0.28}" rx="${r * 0.42}" ry="${r * 0.2}" fill="#fff" opacity=".3"/>`;
      return o;
    },
    cookie(x, y, r, c) {
      const rnd = rng(19); let o = `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${shade(c, -42)}" stroke-width="2.5"/>`;
      o += `<path d="M${x - r * 0.6} ${y - r * 0.1} L${x - r * 0.1} ${y + r * 0.1} L${x + r * 0.2} ${y - r * 0.3} M${x + r * 0.05} ${y + r * 0.1} L${x + r * 0.5} ${y + r * 0.4}" stroke="${shade(c, -35)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 20; i++) {
        const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * 0.9;
        o += `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="1.3" fill="#fff" opacity=".9"/>`;
      }
      return o;
    },
    crescent(x, y, r, c) {
      const yy = y + r * 0.3;
      let o = `<path d="M${x - r} ${yy} A${r} ${r} 0 0 1 ${x + r} ${yy} A${r * 1.3} ${r * 1.3} 0 0 0 ${x - r} ${yy} Z" fill="${c}" stroke="${shade(c, -45)}" stroke-width="2.5" stroke-linejoin="round"/>`;
      const rnd = rng(3);
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + rnd() * Math.PI, d = r * (0.82 + rnd() * 0.12);
        o += `<circle cx="${x + Math.cos(a) * d}" cy="${yy + Math.sin(a) * d * 0.7 + r * 0.1}" r="1.4" fill="#fff" opacity=".85"/>`;
      }
      return o;
    },
    flower(x, y, r, c) {
      let o = '';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.28;
        o += `<circle cx="${x + Math.cos(a) * r * 0.58}" cy="${y + Math.sin(a) * r * 0.58}" r="${r * 0.38}" fill="${c}" stroke="${shade(c, -35)}" stroke-width="2"/>`;
      }
      o += `<circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="${shade(c, 14)}" stroke="${shade(c, -35)}" stroke-width="2"/>`;
      const rnd = rng(5);
      for (let i = 0; i < 18; i++) {
        const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * 0.95;
        o += `<ellipse cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" rx="1.8" ry="1" fill="#F6E6BC" opacity=".9"/>`;
      }
      return o;
    },
    triangle(x, y, r, c) {
      let o = `<path d="M${x} ${y - r} L${x + r} ${y + r * 0.8} L${x - r} ${y + r * 0.8} Z" fill="${c}" stroke="${shade(c, -45)}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M${x} ${y - r * 0.5} L${x + r * 0.5} ${y + r * 0.5} L${x - r * 0.5} ${y + r * 0.5} Z" fill="${shade(c, 20)}" opacity=".6"/>`;
      o += `<circle cx="${x}" cy="${y + r * 0.1}" r="${r * 0.12}" fill="${shade(c, -35)}"/>`;
      return o;
    },
    fekkas(x, y, r, c) {
      const rnd = rng(23);
      let o = `<g transform="rotate(-18 ${x} ${y})"><rect x="${x - r * 1.1}" y="${y - r * 0.42}" width="${r * 2.2}" height="${r * 0.84}" rx="${r * 0.3}" fill="${c}" stroke="${shade(c, -45)}" stroke-width="2.5"/>`;
      for (let i = 0; i < 22; i++) {
        o += `<ellipse cx="${x - r + rnd() * r * 2}" cy="${y - r * 0.3 + rnd() * r * 0.6}" rx="2" ry="1.1" fill="${shade(c, -50)}" opacity=".7"/>`;
      }
      return o + '</g>';
    },
    ball(x, y, r, c) {
      let o = `<circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="${c}" stroke="${shade(c, -40)}" stroke-width="2.5"/>`;
      o += `<circle cx="${x - r * 0.25}" cy="${y - r * 0.28}" r="${r * 0.24}" fill="#fff" opacity=".35"/>`;
      o += `<path d="M${x - r * 0.3} ${y} l8 -6 l3 9 z M${x + r * 0.15} ${y + r * 0.2} l8 -6 l3 9 z" fill="#C9A66B" opacity=".9"/>`;
      return o;
    }
  };

  F.SHAPES = SHAPES; F.TONES = TONES; F.shade = shade;

  const LAYOUTS = {
    1: [[200, 160, 72]],
    2: [[142, 165, 58], [258, 165, 58]],
    3: [[138, 190, 52], [262, 190, 52], [200, 118, 52]],
    4: [[135, 118, 44], [265, 118, 44], [135, 205, 44], [265, 205, 44]]
  };

  const BG = {
    fatayer: ['#F4E4C1', '#E6C98D'], mamar: ['#F1DCC0', '#DDB98A'],
    sweets: ['#F3DDD0', '#E3B9A0'], 'packs-fatayer': ['#EEE3C2', '#D6C58D'],
    'packs-mix': ['#EFE0BE', '#D9BE86'], 'packs-sweets': ['#E9D8C6', '#CFA98B']
  };

  let uid = 0;

  function frame(inner, bg, id) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <radialGradient id="cu${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#D9A064"/><stop offset=".6" stop-color="#B8733C"/><stop offset="1" stop-color="#8A4E26"/></radialGradient>
        <pattern id="zl${id}" width="40" height="40" patternUnits="userSpaceOnUse"><g fill="none" stroke="#8A5A2B" stroke-width=".8" opacity=".12"><rect x="10" y="10" width="20" height="20"/><rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)"/></g></pattern>
      </defs>
      <rect width="400" height="300" fill="url(#bg${id})"/>
      <rect width="400" height="300" fill="url(#zl${id})"/>
      ${inner}
    </svg>`;
  }

  /** يرسم صورة مؤقتة لمنتج. filling: معرّف الحشوة (اختياري) */
  F.art = function (item, filling) {
    const id = ++uid;
    const spec = item.art || { shapes: ['msemen'] };
    const shapes = spec.shapes.slice(0, 4);
    const pos = LAYOUTS[shapes.length];
    const bg = BG[item.cat] || BG.fatayer;
    let inner = `<ellipse cx="200" cy="268" rx="130" ry="12" fill="#3B2416" opacity=".18"/>`;
    inner += `<circle cx="200" cy="165" r="128" fill="url(#cu${id})"/><circle cx="200" cy="165" r="112" fill="none" stroke="#F0CF9A" stroke-width="1.5" stroke-dasharray="3 6" opacity=".7"/><circle cx="200" cy="165" r="100" fill="#000" opacity=".06"/>`;
    shapes.forEach((s, i) => {
      const p = pos[i];
      const tone = (spec.tone && shapes.length === 1) ? spec.tone : TONES[s];
      inner += (SHAPES[s] || SHAPES.msemen)(p[0], p[1], p[2], tone);
    });
    // معاينة الحشوة للمعمّر
    if (item.fillings) {
      const f = F.fillingById(filling || 'khlii');
      inner += `<g><circle cx="318" cy="70" r="30" fill="#F6EEDD" stroke="#B8893A" stroke-width="2"/><circle cx="318" cy="70" r="20" fill="${f.color}" stroke="#3B2416" stroke-opacity=".3" stroke-width="1.5"/><text x="318" y="112" text-anchor="middle" font-size="13" fill="#3B2416" font-family="Tajawal,sans-serif" font-weight="700">${f.ar}</text></g>`;
    }
    // شريط التغليف
    if (item.tier === 'premium' || item.tier === 'vip') {
      inner += `<rect x="0" y="238" width="400" height="22" fill="#B8893A" opacity=".92"/><rect x="0" y="238" width="400" height="3" fill="#F0CF9A"/>`;
      inner += `<path d="M200 250 l-26 -20 a14 14 0 1 1 26 20 z M200 250 l26 -20 a14 14 0 1 0 -26 20 z" fill="#8F6A22" stroke="#F0CF9A" stroke-width="1.5"/>`;
    }
    if (item.tier === 'vip') {
      inner += `<g transform="translate(70 62)"><path d="M0 -26 L7 -8 L26 -8 L11 3 L17 22 L0 10 L-17 22 L-11 3 L-26 -8 L-7 -8 Z" fill="#F0CF9A" stroke="#8F6A22" stroke-width="2"/><text y="6" text-anchor="middle" font-size="11" font-weight="800" fill="#5a3b10" font-family="sans-serif">VIP</text></g>`;
    }
    return frame(inner, bg, id);
  };

  /** HTML للصورة: صورة حقيقية إن وجدت، وإلا SVG مؤقت */
  F.artHtml = function (item, filling) {
    if (item.image) {
      return `<img src="${item.image}" alt="${item.ar}" loading="lazy">`;
    }
    return F.art(item, filling);
  };

  /** رسم الـ Hero: قوس مغربي + صينية نحاسية + مسمن وحرشة وبغرير */
  F.heroArt = function () {
    const id = ++uid;
    return `<svg viewBox="0 0 480 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="مسمن وحرشة وبغرير على صينية نحاسية">
      <defs>
        <linearGradient id="ar${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4633A"/><stop offset="1" stop-color="#8E3E1E"/></linearGradient>
        <radialGradient id="cu${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#E0AA6E"/><stop offset=".6" stop-color="#B8733C"/><stop offset="1" stop-color="#8A4E26"/></radialGradient>
        <pattern id="zl${id}" width="48" height="48" patternUnits="userSpaceOnUse"><g fill="none" stroke="#F0CF9A" stroke-width="1" opacity=".22"><rect x="12" y="12" width="24" height="24"/><rect x="12" y="12" width="24" height="24" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="3"/></g></pattern>
      </defs>
      <path d="M30 550 V230 A210 210 0 0 1 450 230 V550 Z" fill="#B8893A"/>
      <path d="M42 550 V232 A198 198 0 0 1 438 232 V550 Z" fill="url(#ar${id})"/>
      <path d="M42 550 V232 A198 198 0 0 1 438 232 V550 Z" fill="url(#zl${id})"/>
      <path d="M62 550 V236 A178 178 0 0 1 418 236 V550 Z" fill="none" stroke="#F0CF9A" stroke-width="1.5" stroke-dasharray="2 7" opacity=".8"/>
      <g transform="translate(240 110)"><path d="M0 -26 L7 -8 L26 -8 L11 3 L17 22 L0 10 L-17 22 L-11 3 L-26 -8 L-7 -8 Z" fill="#F0CF9A" opacity=".95"/></g>
      <ellipse cx="240" cy="538" rx="190" ry="16" fill="#000" opacity=".25"/>
      <circle cx="240" cy="388" r="180" fill="url(#cu${id})"/>
      <circle cx="240" cy="388" r="162" fill="none" stroke="#F0CF9A" stroke-width="2" stroke-dasharray="3 8" opacity=".75"/>
      <circle cx="240" cy="388" r="140" fill="#000" opacity=".07"/>
      ${SHAPES.msemen(168, 355, 66, TONES.msemen)}
      ${SHAPES.harcha(318, 345, 58, TONES.harcha)}
      ${SHAPES.baghrir(240, 470, 62, TONES.baghrir)}
    </svg>`;
  };
})();
