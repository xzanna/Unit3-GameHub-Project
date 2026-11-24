/* GameHub Day 6 check panel: the game gallery.
   Students never change this file. Every row reads at rest, so nothing has to
   be hovered today. Sizes are read with offsetWidth/offsetHeight. */
(function () {
  "use strict";
  var TOTAL = 6;
  function $(s) { return document.querySelector(s); }
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function cs(el) { return getComputedStyle(el); }
  function num(v) { return parseFloat(v) || 0; }
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
  function tracks(el) {                     /* how many columns the grid is drawing */
    var t = cs(el).gridTemplateColumns;
    if (!t || t === "none") { return 0; }
    return t.split(" ").length;
  }
  function narrowTracks() {                 /* the same gallery again, in a 200px box */
    var g = $(".gallery");
    if (!g) { return 0; }
    var box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText = "position:fixed;left:-9999px;top:0;width:200px;";
    var copy = g.cloneNode(true);
    /* span 2 would make a second column of its own, so the copy has no featured tile */
    copy.querySelectorAll(".tile-featured").forEach(function (t) { t.classList.remove("tile-featured"); });
    box.appendChild(copy);
    document.body.appendChild(box);
    var n = tracks(copy);
    document.body.removeChild(box);
    return n;
  }
  var rows = [
    ["The gallery is a grid, with a gap", function () {
      var g = $(".gallery"); if (!g) { return false; }
      return cs(g).display === "grid" && num(cs(g).columnGap) >= 16;
    }],
    ["The columns fit themselves: many here, one when narrow", function () {
      var g = $(".gallery"); if (!g) { return false; }
      return tracks(g) >= 2 && narrowTracks() === 1;
    }],
    ["The featured game takes two columns", function () {
      var f = $(".tile-featured"), t = $(".tile:not(.tile-featured)");
      if (!f || !t || !t.offsetWidth) { return false; }
      return f.offsetWidth >= t.offsetWidth * 1.8;
    }],
    ["Every picture is the same shape, never squashed", function () {
      var i = $(".tile img"); if (!i || !i.parentElement) { return false; }
      /* offsetWidth, not the drawn box, so a transform could never fail this row */
      return cs(i).objectFit === "cover" && i.offsetHeight >= 140 &&
        Math.abs(i.offsetWidth - i.parentElement.clientWidth) <= 2;
    }],
    ["Each tile is a card, and it cuts its picture's corners", function () {
      var t = $(".tile"); if (!t) { return false; }
      return !!rgb(cs(t).backgroundColor) && num(cs(t).borderTopLeftRadius) >= 8 &&
        cs(t).overflow === "hidden";
    }],
    ["The caption has room, and both lines can be read", function () {
      var c = $(".tile-caption"); if (!c) { return false; }
      var s = cs(c), bg = behind(c);
      if (num(s.paddingTop) < 8 || num(s.paddingLeft) < 8) { return false; }
      var h = c.querySelector("h3"), g = c.querySelector(".tile-genre");
      if (!h || !g) { return false; }
      return contrast(rgb(cs(h).color), bg) >= 4.5 && contrast(rgb(cs(g).color), bg) >= 4.5;
    }]
  ];
  var panel = document.createElement("aside");
  panel.id = "gh-check";
  panel.setAttribute("aria-label", "Day 6 checks");
  panel.setAttribute("aria-live", "polite");
  panel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;width:310px;max-width:calc(100vw - 24px);" +
    "background:#ffffff;color:#1f2933;border:1px solid #c5ccd6;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);" +
    "font:14px/1.4 system-ui,'Segoe UI',Arial,sans-serif;padding:10px 12px;";
  function draw() {
    var res = rows.map(function (r) { return !!r[1](); });
    var score = res.filter(Boolean).length;
    panel.dataset.score = score;
    var html = "<div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px'>" +
      "<b>GameHub &middot; Day 6</b><b style='font-size:18px'>" + score + "/" + TOTAL + "</b></div><ol style='margin:0;padding:0;list-style:none'>";
    res.forEach(function (r, i) {
      var mark = r ? "✓" : "✗", bg = r ? "#2f7d4a" : "#b42318";
      html += "<li style='display:flex;gap:8px;padding:3px 0'><span aria-hidden='true' style='flex:none;width:20px;height:20px;" +
        "border-radius:50%;text-align:center;line-height:20px;font-weight:700;color:#fff;background:" + bg + "'>" + mark + "</span>" +
        "<span><b>" + (i + 1) + "</b> " + rows[i][0] +
        "<span style='position:absolute;left:-9999px'>" + (r ? " done" : " not yet") + "</span></span></li>";
    });
    panel.innerHTML = html + "</ol>";
  }
  function start() {
    document.body.appendChild(panel);
    draw();
    window.addEventListener("resize", draw);
    all(".tile img").forEach(function (i) { i.addEventListener("load", draw); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
