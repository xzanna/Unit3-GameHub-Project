/* GameHub Day 3 check panel: feature cards.
   Students never change this file. It measures the page the browser drew
   (boxes and computed styles), never the CSS text, so any palette and any
   correct way of writing the CSS passes. It runs again when the window is
   resized, so try it wide and narrow. */
(function () {
  "use strict";

  var TOTAL = 6;

  function px(value) {
    var n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  /* "rgb(30, 58, 138)" -> [30, 58, 138, 1] */
  function rgba(value) {
    var m = String(value).match(/rgba?\(([^)]+)\)/);
    if (!m) { return null; }
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }

  function sameColour(a, b) {
    var x = rgba(a), y = rgba(b);
    if (!x || !y) { return false; }
    return Math.abs(x[0] - y[0]) < 2 && Math.abs(x[1] - y[1]) < 2 &&
      Math.abs(x[2] - y[2]) < 2 && Math.abs(x[3] - y[3]) < 0.02;
  }

  function luminance(c) {
    var v = c.slice(0, 3).map(function (n) {
      n = n / 255;
      return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function contrast(a, b) {
    var x = luminance(rgba(a)), y = luminance(rgba(b));
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  /* The student's own palette: every custom property on :root that holds a
     colour, turned into the rgb() the browser uses. Names come from the
     computed style (or the style sheet when the browser lists none there). */
  function paletteColours() {
    var names = [];
    var cs = getComputedStyle(document.documentElement);
    for (var i = 0; i < cs.length; i++) {
      if (cs[i].indexOf("--") === 0) { names.push(cs[i]); }
    }
    if (!names.length) {
      try {
        Array.prototype.forEach.call(document.styleSheets, function (sheet) {
          Array.prototype.forEach.call(sheet.cssRules || [], function (rule) {
            if (rule.selectorText && rule.selectorText.indexOf(":root") !== -1) {
              for (var j = 0; j < rule.style.length; j++) {
                if (rule.style[j].indexOf("--") === 0) { names.push(rule.style[j]); }
              }
            }
          });
        });
      } catch (e) { /* a page opened from a file: the style sheet cannot be read */ }
    }
    var probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    var colours = [];
    names.forEach(function (name) {
      var value = cs.getPropertyValue(name).trim();
      if (!value || !CSS.supports("color", value)) { return; }
      probe.style.color = value;
      colours.push(getComputedStyle(probe).color);
    });
    probe.remove();
    return colours;
  }

  function inPalette(colour, palette) {
    return palette.some(function (c) { return sameColour(c, colour); });
  }

  /* Cards whose tops line up are one row. */
  function rows(cards) {
    var out = [];
    cards.forEach(function (card) {
      var box = card.getBoundingClientRect();
      var row = out.find(function (r) { return Math.abs(r.top - box.top) < 2; });
      if (!row) { row = { top: box.top, boxes: [] }; out.push(row); }
      row.boxes.push(box);
    });
    return out;
  }

  function run() {
    var wrap = document.querySelector(".cards");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
    var results = [];
    if (!wrap || cards.length < 2) {
      results.push([false, "The page has the .cards box and its cards (use day 3's gamehub.html)"]);
      return results;
    }
    var w = getComputedStyle(wrap);
    var c = getComputedStyle(cards[0]);
    var lines = rows(cards);
    var body = getComputedStyle(document.body);
    var palette = paletteColours();

    // 1. A flex row with a gap: measured between the first two cards.
    var a = cards[0].getBoundingClientRect(), b = cards[1].getBoundingClientRect();
    var space = Math.abs(a.top - b.top) < 2 ? b.left - a.right : b.top - a.bottom;
    results.push([/flex/.test(w.display) && space >= 16,
      "Cards sit in a row with a gap (display: flex; gap)"]);

    // 2. The card is a box: a background of its own and room inside.
    var bg = c.backgroundColor;
    var pad = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
      .every(function (side) { return px(c[side]) >= 16; });
    var filled = rgba(bg) && rgba(bg)[3] > 0 && !sameColour(bg, body.backgroundColor);
    results.push([pad && filled, "Each card has a background and padding (16px+)"]);

    // 3. Round corners and a shadow.
    results.push([px(c.borderTopLeftRadius) >= 4 && c.boxShadow && c.boxShadow !== "none",
      "Cards have round corners and a shadow"]);

    // 4. Wrapping: cards that do not fit move down to a new row.
    results.push([w.flexWrap === "wrap" && lines.length > 1,
      "Cards wrap onto new rows (flex-wrap)"]);

    // 5. Equal shares: in every row the cards are one width and fill it, none under 250px.
    var inner = wrap.clientWidth - px(w.paddingLeft) - px(w.paddingRight);
    var even = lines.every(function (r) {
      var widths = r.boxes.map(function (x) { return x.width; });
      var used = widths.reduce(function (s, n) { return s + n; }, 0) + px(w.columnGap) * (widths.length - 1);
      return Math.max.apply(null, widths) - Math.min.apply(null, widths) < 2 && Math.abs(used - inner) < 3;
    });
    var narrowest = Math.min.apply(null, cards.map(function (k) { return k.getBoundingClientRect().width; }));
    results.push([px(c.flexGrow) >= 1 && even && narrowest >= 249.5,
      "Cards share each row equally, 250px+ wide (flex: 1 1 300px)"]);

    // 6. The student's own colours on the card: an accent edge and a heading colour
    //    from :root, the heading easy to read on the card.
    var h3 = cards[0].querySelector("h3");
    var hc = h3 ? getComputedStyle(h3).color : "";
    var edge = px(c.borderTopWidth) >= 2 && inPalette(c.borderTopColor, palette);
    var head = h3 && inPalette(hc, palette) && !sameColour(hc, body.color) &&
      filled && contrast(hc, bg) >= 3;
    results.push([!!(edge && head), "Your palette on the cards: a top edge and the heading (contrast 3+)"]);
    return results;
  }

  var panel = document.createElement("aside");
  panel.id = "gh-check";
  panel.setAttribute("aria-label", "Day 3 checks");
  panel.setAttribute("aria-live", "polite");
  panel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;width:300px;max-width:calc(100vw - 24px);" +
    "background:#ffffff;color:#1f2933;border:1px solid #c5ccd6;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);" +
    "font:14px/1.4 system-ui,'Segoe UI',Arial,sans-serif;padding:10px 12px;";

  function draw() {
    var results = run();
    var score = results.filter(function (r) { return r[0]; }).length;
    panel.dataset.score = score;
    var html = "<div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px'>" +
      "<b>GameHub · Day 3</b><b style='font-size:18px'>" + score + "/" + TOTAL + "</b></div>" +
      "<ol style='margin:0;padding:0;list-style:none'>";
    results.forEach(function (r, i) {
      html += "<li style='display:flex;gap:8px;padding:3px 0'>" +
        "<span aria-hidden='true' style='flex:none;width:20px;height:20px;border-radius:50%;text-align:center;line-height:20px;" +
        "font-weight:700;color:#fff;background:" + (r[0] ? "#2f7d4a" : "#b42318") + "'>" + (r[0] ? "✓" : "✗") + "</span>" +
        "<span><b>" + (i + 1) + "</b> " + r[1] + "<span class='sr-only' style='position:absolute;left:-9999px'>" +
        (r[0] ? " done" : " not yet") + "</span></span></li>";
    });
    html += "</ol><div style='margin-top:6px;font-size:12px;color:#5b6b82'>Window " + window.innerWidth + "px wide</div>";
    panel.innerHTML = html;
  }

  function start() {
    document.body.appendChild(panel);
    draw();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 150); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
