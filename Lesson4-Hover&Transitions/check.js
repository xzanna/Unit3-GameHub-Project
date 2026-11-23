/* GameHub Day 4 check panel: hover and transitions.
Students never change this file. A hover can only be seen while it
happens, so rows 1, 4, 5 and 6 check when you hover, and row 2 when you
press Tab to a button. A result is remembered until you try it again. */
(function () {
"use strict";
var TOTAL = 6, KEY = "gh4-tried";
var tried = {};
try { tried = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { tried = {}; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(tried)); } catch (e) {} }
function $(s) { return document.querySelector(s); }
function cs(el) { return getComputedStyle(el); }
function lift(el) { /* how far up a transform moves it, in px */
var m = new DOMMatrix(cs(el).transform === "none" ? undefined : cs(el).transform);
return -m.m42;
}
/* true when the resting element eases this property over 0.1s to 1s */
function eases(el, prop) {
var s = cs(el), props = s.transitionProperty.split(/,\s/), times = s.transitionDuration.split(/,\s/);
for (var i = 0; i < props.length; i++) {
var t = parseFloat(times[i % times.length]) * (times[i % times.length].indexOf("ms") > 0 ? 0.001 : 1);
if ((props[i] === prop || props[i] === "all") && t >= 0.1 && t <= 1) { return true; }
}
return false;
}
var rest = {};
function remember() {
var b = $(".btn-primary"), c = $(".card"), a = $(".nav-links a");
rest = { bg: cs(b).backgroundColor, shadow: cs(c).boxShadow, link: cs(a).color };
}
/* rows: [label, hint while untried, live test or null] */
var rows = [
["Button hover changes its colour", "Hover a Get started button", null],
["Focus ring on buttons (3px, solid)", "Press Tab until a button is reached", null],
["Buttons ease (transition on .btn)", "", function () { var b = $(".btn"); return eases(b, "background-color") && eases(b, "transform"); }],
["Buttons lift on hover", "Hover any button", null],
["Cards ease and lift with a bigger shadow", "Hover a card", function () { return eases($(".card"), "transform"); }],
["Nav links change colour", "Hover a nav link", function () { return eases($(".nav-links a"), "color"); }]
];
function after(el, fn) { setTimeout(function () { if (el.matches(":hover")) { fn(); save(); draw(); } }, 450); }
function watch() {
Array.prototype.forEach.call(document.querySelectorAll(".btn"), function (b) {
b.addEventListener("mouseenter", function () {
after(b, function () {
if (b.classList.contains("btn-primary")) { tried[1] = cs(b).backgroundColor !== rest.bg; }
var up = lift(b); tried[4] = up >= 1 && up <= 10;
});
});
b.addEventListener("focus", function () {
if (!b.matches(":focus-visible")) { return; }
var s = cs(b);
tried[2] = s.outlineStyle === "solid" && parseFloat(s.outlineWidth) >= 2;
save(); draw();
});
});
Array.prototype.forEach.call(document.querySelectorAll(".card"), function (c) {
c.addEventListener("mouseenter", function () {
after(c, function () { tried[5] = lift(c) >= 2 && cs(c).boxShadow !== rest.shadow; });
});
});
Array.prototype.forEach.call(document.querySelectorAll(".nav-links a"), function (a) {
a.addEventListener("mouseenter", function () { after(a, function () { tried[6] = cs(a).color !== rest.link; }); });
});
}
var panel = document.createElement("aside");
panel.id = "gh-check";
panel.setAttribute("aria-label", "Day 4 checks");
panel.setAttribute("aria-live", "polite");
panel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;width:310px;max-width:calc(100vw - 24px);" +
"background:#ffffff;color:#1f2933;border:1px solid #c5ccd6;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);" +
"font:14px/1.4 system-ui,'Segoe UI',Arial,sans-serif;padding:10px 12px;";
function result(i) { /* true, false, or null (not tried yet) */
var n = i + 1, live = rows[i][2] ? rows[i][2]() : true, hov = rows[i][1] ? tried[n] : true;
if (!live) { return false; }
return hov === undefined ? null : !!hov;
}
function draw() {
var res = rows.map(function (r, i) { return result(i); });
var score = res.filter(function (r) { return r === true; }).length;
panel.dataset.score = score;
var html = "<div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px'>" +
"<b>GameHub · Day 4</b><b style='font-size:18px'>" + score + "/" + TOTAL + "</b></div><ol style='margin:0;padding:0;list-style:none'>";
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
remember(); watch(); draw();
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
}
if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();