/* GameHub day 2 checks: measures what the browser shows (computed styles and
   the page's own rules). Your colours and font are your own choice, so no
   check tests an exact colour. Never change this file. */
(function () {
  function lum(c) { // relative luminance of [r,g,b] (WCAG)
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function rgbs(s) { return (s.match(/rgba?\([^)]*\)/g) || []).map(function (m) { return m.match(/[\d.]+/g).slice(0, 3).map(Number); }); }
  function px(sel) { var e = document.querySelector(sel); return e ? parseFloat(getComputedStyle(e).fontSize) : 0; }
  var link = document.querySelector('link[rel=stylesheet][href$="style.css"]');
  fetch(link ? link.href : 'style.css').then(function (r) { return r.text(); }).catch(function () { return ''; }).then(run);
  function run(css) {
  var root = (css.match(/:root\s*\{([^}]*)\}/) || ['', ''])[1];
  var names = root.match(/--[\w-]+\s*:/g) || [];
  var uses = (css.replace(/:root\s*\{[^}]*\}/, '').match(/var\(--/g) || []).length;
  var body = getComputedStyle(document.body), h1 = getComputedStyle(document.querySelector('h1'));
  var hero = document.querySelector('.hero'), hs = getComputedStyle(hero);
  var stops = rgbs(hs.backgroundImage), ok6 = stops.length > 0;
  ['h1', '.tagline'].forEach(function (s) {
    var t = rgbs(getComputedStyle(document.querySelector(s)).color)[0];
    stops.forEach(function (st) { if (!t || contrast(t, st) < 4.5) ok6 = false; });
  });
  var checks = [
    ['1 Palette in :root (3+ variables)', names.length >= 3],
    ['2 Colours use var() (4+ times)', uses >= 4],
    ['3 One body font, line-height set', body.fontFamily.indexOf('Times') < 0 && h1.fontFamily === body.fontFamily && body.lineHeight !== 'normal'],
    ['4 Headings: h1 40px+, h2 28px+, h3 20px+', px('h1') >= 40 && px('h2') >= 28 && px('h3') >= 20 && px('h1') > px('h2') && px('h2') > px('h3')],
    ['5 Hero has a gradient', hs.backgroundImage.indexOf('gradient') > -1],
    ['6 Hero text contrast 4.5+', ok6]
  ];
  var n = checks.filter(function (c) { return c[1]; }).length;
  var p = document.createElement('aside');
  p.setAttribute('aria-label', 'Checks');
  p.style.cssText = 'position:fixed;right:12px;bottom:12px;background:#111827;color:#fff;font:14px system-ui;padding:10px 14px;border-radius:8px;z-index:99';
  p.innerHTML = '<b>' + n + '/6</b><br>' + checks.map(function (c) { return (c[1] ? '✅ ' : '❌ ') + c[0]; }).join('<br>');
  document.body.appendChild(p);
  window.__checks = n;
  }
})();
