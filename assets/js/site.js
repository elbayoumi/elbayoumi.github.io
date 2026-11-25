/* Shared UI effects: nav, progress, reveal, tilt, counters, typed text.
   Exposes window.SiteFX.refresh() so dynamically rendered content gets effects. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  doc.classList.add('js');

  /* ---- nav ---- */
  var nav = $('.nav'), links = $('.nav-links'), burger = $('.burger'), toTop = $('.to-top'), bar = $('.progress');
  function setBurger(open) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    var i = burger.querySelector('i'); if (i) i.className = open ? 'bi bi-x-lg' : 'bi bi-list';
  }
  if (burger && links) {
    burger.addEventListener('click', function () { setBurger(links.classList.toggle('open')); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) { links.classList.remove('open'); setBurger(false); } });
  }
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- active link on scroll (home page) ---- */
  var secLinks = $$('.nav-links a.link[href^="#"]');
  var secs = secLinks.map(function (a) { var id = a.getAttribute('href').slice(1); return id ? document.getElementById(id) : null; });
  if (secs.some(Boolean) && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) secLinks.forEach(function (a, i) { a.classList.toggle('active', secs[i] === e.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) so.observe(s); });
  }

  /* ---- cursor spotlight ---- */
  var spot = $('.spotlight');
  if (spot && fine && !reduce) {
    addEventListener('pointermove', function (e) {
      spot.style.setProperty('--sx', e.clientX + 'px');
      spot.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---- reveal ---- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  /* ---- counters ---- */
  var co = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', t0 = null, dur = 1600;
      if (reduce) { el.textContent = end + suf; return; }
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), v = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * v) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.6 }) : null;

  /* ---- card glow + tilt ---- */
  function bindCard(c) {
    if (c._fx) return; c._fx = 1;
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px');
      c.style.setProperty('--my', y + 'px');
      if (!reduce && !c.hasAttribute('data-notilt')) {
        c.style.setProperty('--ry', ((x / r.width - 0.5) * 7).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((0.5 - y / r.height) * 7).toFixed(2) + 'deg');
      }
    });
    c.addEventListener('pointerleave', function () {
      c.style.setProperty('--rx', '0deg');
      c.style.setProperty('--ry', '0deg');
    });
  }

  /* ---- magnetic buttons ---- */
  function bindMagnet(b) {
    if (b._mg) return; b._mg = 1;
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  }

  /* ---- split hero title into animated words ---- */
  function splitTitle(el) {
    if (!el) return;
    var txt = el.textContent.trim();
    if (!txt) return;
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w, i) {
      var safe = w.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return '<span class="word" aria-hidden="true"><span style="--i:' + i + '">' + safe + '</span></span>';
    }).join(' ');
    var last = el.lastElementChild;
    if (last) last.classList.add('grad-text');
  }

  /* ---- typed roles ---- */
  var typedTimer;
  function typed(el, words) {
    clearTimeout(typedTimer);
    if (!el || !words || !words.length) return;
    var txt = el.querySelector('.txt');
    if (!txt) return;
    if (reduce) { txt.textContent = words[0]; return; }
    var i = 0, j = 0, del = false;
    (function tick() {
      var w = words[i % words.length], d = del ? 35 : 75;
      j += del ? -1 : 1;
      txt.textContent = w.slice(0, j);
      if (!del && j === w.length) { del = true; d = 1500; }
      else if (del && j === 0) { del = false; i++; d = 350; }
      typedTimer = setTimeout(tick, d);
    })();
  }

  function refresh(root) {
    root = root || document;
    $$('[data-reveal]:not(.in)', root).forEach(function (el) {
      if (!io) { el.classList.add('in'); return; }
      if (!el._ro) { el._ro = 1; io.observe(el); }
    });
    $$('[data-count]', root).forEach(function (el) {
      if (co) { if (!el._co) { el._co = 1; co.observe(el); } }
      else el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
    if (fine) {
      $$('.card', root).forEach(bindCard);
      if (!reduce) $$('.btn-primary, .btn-ghost', root).forEach(bindMagnet);
    }
    $$('img[data-fallback]', root).forEach(function (img) {
      if (img._fb) return; img._fb = 1;
      var show = function () { img.style.display = 'none'; var f = img.parentNode.querySelector('.fallback'); if (f) f.style.display = 'grid'; };
      img.addEventListener('error', show);
      if (img.complete && img.naturalWidth === 0) show();
    });
  }

  window.SiteFX = { refresh: refresh, splitTitle: splitTitle, typed: typed };
  function init() {
    var h1 = $('[data-split]');
    if (h1 && !h1.hasAttribute('data-manual')) splitTitle(h1);
    refresh();
    $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
