// GameHub Day 1 checker. It MEASURES where boxes landed and reads the
// styles the browser worked out; it never reads your CSS file.
// Do not change this file.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var box = function (el) { return el.getBoundingClientRect(); };
  var css = function (el) { return getComputedStyle(el); };
  var px = function (v) { return parseFloat(v) || 0; };
  var near = function (a, b, d) { return Math.abs(a - b) <= (d || 4); };
  var mid = function (b) { return b.top + b.height / 2; };
  var sameRow = function (els) { var t = mid(box(els[0])); return els.every(function (e) { return near(mid(box(e)), t, 6); }); };

  var checks = [
    ["1 Container", function () {
      var c = $(".nav"), b = box(c), s = css(c), w = document.documentElement.clientWidth;
      return px(s.paddingLeft) === 24 && px(s.paddingRight) === 24 && b.width <= 1100.5
        && near(b.left, w - b.right, 3) && (w < 1150 || near(b.width, 1100, 1));
    }, "At most 1100px wide, centered, 24px padding left and right."],
    ["2 Header", function () {
      var nav = box($(".nav")), logo = box($(".logo")), links = box($(".nav-links"));
      return css($(".site-header")).backgroundColor !== "rgba(0, 0, 0, 0)"
        && near(logo.left, nav.left + 24, 3) && near(links.right, nav.right - 24, 3)
        && near(mid(logo), mid(links), 4) && px(css($(".nav")).paddingTop) === 16;
    }, "A background colour; logo left, links right, centered up and down; 16px padding top and bottom."],
    ["3 Nav links", function () {
      var li = $$(".nav-links li"), ul = css($(".nav-links")), a = css($(".nav-links a"));
      return sameRow(li) && near(box(li[1]).left - box(li[0]).right, 24, 2) && ul.listStyleType === "none"
        && px(ul.paddingLeft) === 0 && px(ul.marginTop) === 0 && a.textDecorationLine === "none"
        && a.color === "rgb(255, 255, 255)";
    }, "In a row, 24px apart; no bullets, margin or padding; white, no underline."],
    ["4 Logo", function () {
      var s = css($(".logo"));
      return near(px(s.fontSize), 25.6, 0.6) && px(s.fontWeight) >= 700 && s.color === "rgb(255, 255, 255)"
        && s.textDecorationLine === "none";
    }, "1.6rem, bold, white, no underline."],
    ["5 Hero", function () {
      var h = $(".hero"), hb = box(h), cb = box($(".hero-content")), s = css(h), h1 = box($(".hero h1"));
      return hb.height >= window.innerHeight * 0.7 - 2 && s.backgroundColor !== "rgba(0, 0, 0, 0)"
        && s.color === "rgb(255, 255, 255)" && near(mid(cb), mid(hb), 6)
        && near(h1.left + h1.width / 2, hb.left + hb.width / 2, 4) && s.textAlign === "center";
    }, "At least 70vh tall, a background, white text, centered both ways."],
    ["6 Buttons", function () {
      var b = $$(".hero-buttons .btn"), s = css(b[0]), h = box($(".hero"));
      var gap = box(b[1]).left - box(b[0]).right, both = (box(b[0]).left + box(b[1]).right) / 2;
      return sameRow(b) && near(gap, 16, 2) && near(both, h.left + h.width / 2, 4)
        && px(s.paddingTop) === 12 && px(s.paddingLeft) === 28 && px(s.borderTopLeftRadius) > 0
        && s.textDecorationLine === "none" && s.backgroundColor !== css(b[1]).backgroundColor;
    }, "Side by side, centered, 16px apart; padding 12px 28px, rounded, no underline; two looks."]
  ];

  var panel = document.createElement("aside");
  panel.setAttribute("aria-live", "polite");
  panel.style.cssText = "position:fixed;right:12px;bottom:12px;background:#fff;color:#1f2933;border:2px solid #1f2933;border-radius:10px;padding:10px 14px;font:14px/1.6 system-ui,sans-serif;z-index:999;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.2)";
  document.body.appendChild(panel);

  function run() {
    var done = 0, rows = checks.map(function (c) {
      var ok = false;
      try { ok = c[1](); } catch (e) { ok = false; }
      if (ok) done++;
      return "<div title=\"" + c[2] + "\">" + (ok ? "<b style=\"color:#0b6e4f\">&#10003;</b> " : "<b style=\"color:#b42318\">&#10007;</b> ") + c[0] + "</div>";
    });
    panel.innerHTML = "<strong>Day 1 check " + done + "/" + checks.length + "</strong>" + rows.join("");
  }
  window.addEventListener("load", run);
  window.addEventListener("resize", run);
})();
