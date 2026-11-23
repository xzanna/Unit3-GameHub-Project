/* GameHub Day 5 check panel: image and text sections.
   Students never change this file. Row 5 can only be seen while it happens,
   so it checks when you hover a picture; its result is remembered. */
(function () {
  "use strict";
  var TOTAL = 6, KEY = "gh5-tried";
  var tried = {};
  try { tried = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { tried = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(tried)); } catch (e) {} }
  function $(s) { return document.querySelector(s); }
  function cs(el) { return getComputedStyle(el); }
  function num(v) { return parseFloat(v) || 0; }
  function scale(el) {                      /* how much a transform grows it */
    var t = cs(el).transform;
    if (t === "none") { return 1; }
    return new DOMMatrix(t).m11;
  }
  /* true when the resting element eases this property over 0.1s to 1s */
  function eases(el, prop) {
    var s = cs(el), props = s.transitionProperty.split(/,\s*/), times = s.transitionDuration.split(/,\s*/);
    for (var i = 0; i < props.length; i++) {
      var raw = times[i % times.length], t = parseFloat(raw) * (raw.indexOf("ms") > 0 ? 0.001 : 1);
      if ((props[i] === prop || props[i] === "all") && t >= 0.1 && t <= 1) { return true; }
    }
    return false;
  }
  function rgb(v) {                         /* "rgb(1, 2, 3)" -> [1, 2, 3], or null */
    var m = String(v).match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) { return null; }
    if (m.length > 3 && parseFloat(m[3]) === 0) { return null; }   /* transparent */
    return [+m[0], +m[1], +m[2]];
  }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(fg, bg) {
    if (!fg || !bg) { return 0; }
    var a = lum(fg), b = lum(bg), hi = Math.max(a, b), lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  }
  function behind(el) {                     /* the first real background colour above it */
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var c = rgb(cs(n).backgroundColor);
      if (c) { return c; }
    }
    return [255, 255, 255];
  }
  var rows = [
    ["Each section is a row, with a gap", "", function () {
      var s = $(".split"); if (!s) { return false; }
      return cs(s).display === "flex" && num(cs(s).columnGap) >= 16;
    }],
    ["The two halves are equal", "", function () {
      var m = $(".split .split-media"), t = $(".split .split-text");
      if (!m || !t) { return false; }
      return num(cs(m).flexGrow) > 0 && num(cs(t).flexGrow) > 0 &&
        Math.abs(m.offsetWidth - t.offsetWidth) <= 24;
    }],
    ["The second section is the other way round", "", function () {
      var s = $(".split-reverse");
      return !!s && cs(s).flexDirection === "row-reverse";
    }],
    ["Pictures fill their box without squashing", "", function () {
      var i = $(".split-media img"); if (!i) { return false; }
      /* offsetWidth, not the drawn box: a zoom on hover must not fail this row */
      return cs(i).objectFit === "cover" && i.offsetHeight >= 200 &&
        Math.abs(i.offsetWidth - $(".split-media").clientWidth) <= 2;
    }],
    ["A picture zooms on hover", "Hover a picture", function () {
      var i = $(".split-media img"), m = $(".split-media");
      return !!i && eases(i, "transform") && cs(m).overflow === "hidden";
    }],
    ["Join us can be read on the light section", "", function () {
      var b = $(".split .btn-secondary"); if (!b) { return false; }
      var bg = behind(b), s = cs(b);
      return contrast(rgb(s.color), bg) >= 4.5 && contrast(rgb(s.borderTopColor), bg) >= 3;
    }]
  ];
  function watch() {
    Array.prototype.forEach.call(document.querySelectorAll(".split-media"), function (m) {
      m.addEventListener("mouseenter", function () {
        setTimeout(function () {
          if (!m.matches(":hover")) { return; }
          var i = m.querySelector("img");
          tried[5] = !!i && scale(i) >= 1.02;
          save(); draw();
        }, 600);
      });
    });
  }
  var panel = document.createElement("aside");
  panel.id = "gh-check";
  panel.setAttribute("aria-label", "Day 5 checks");
  panel.setAttribute("aria-live", "polite");
  panel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;width:310px;max-width:calc(100vw - 24px);" +
    "background:#ffffff;color:#1f2933;border:1px solid #c5ccd6;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);" +
    "font:14px/1.4 system-ui,'Segoe UI',Arial,sans-serif;padding:10px 12px;";
  function result(i) {                      /* true, false, or null (not tried yet) */
    var live = rows[i][2]();
    if (!live) { return false; }
    if (!rows[i][1]) { return true; }
    return tried[i + 1] === undefined ? null : !!tried[i + 1];
  }
  function draw() {
    var res = rows.map(function (r, i) { return result(i); });
    var score = res.filter(function (r) { return r === true; }).length;
    panel.dataset.score = score;
    var html = "<div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px'>" +
      "<b>GameHub · Day 5</b><b style='font-size:18px'>" + score + "/" + TOTAL + "</b></div><ol style='margin:0;padding:0;list-style:none'>";
    res.forEach(function (r, i) {
      var mark = r === true ? "✓" : r === false ? "✗" : "?", bg = r === true ? "#2f7d4a" : r === false ? "#b42318" : "#5b6b82";
      html += "<li style='display:flex;gap:8px;padding:3px 0'><span aria-hidden='true' style='flex:none;width:20px;height:20px;" +
        "border-radius:50%;text-align:center;line-height:20px;font-weight:700;color:#fff;background:" + bg + "'>" + mark + "</span>" +
        "<span><b>" + (i + 1) + "</b> " + rows[i][0] + (r === null ? "<br><i style='color:#5b6b82'>" + rows[i][1] + "</i>" : "") +
        "<span style='position:absolute;left:-9999px'>" + (r === true ? " done" : r === false ? " not yet" : " try it") + "</span></span></li>";
    });
    panel.innerHTML = html + "</ol>";
  }
  function start() {
    document.body.appendChild(panel);
    watch(); draw();
    window.addEventListener("resize", draw);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
