/* Home page: i18n (EN/AR + RTL) and dynamic rendering. Effects live in site.js */
(function () {
  'use strict';
  var LANG_DEFAULT = 'en';
  var dirMap = { en: 'ltr', ar: 'rtl' };
  var htmlEl = document.documentElement;
  var cache = {};
  var T = null; // current translation
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var set = function (id, v) { var e = $(id); if (e && v != null) e.textContent = v; };
  var FX = function () { return window.SiteFX || { refresh: function () {}, splitTitle: function () {}, typed: function () {} }; };

  var params = new URLSearchParams(location.search);
  var initLang = params.get('lang');
  if (initLang !== 'ar' && initLang !== 'en') initLang = null;
  var stored = null;
  try { stored = localStorage.getItem('lang'); } catch (e) {}
  var currentLang = initLang || (stored === 'ar' || stored === 'en' ? stored : LANG_DEFAULT);

  function renderProjects() {
    var list = $('projects_list');
    var q = ($('projectSearch').value || '').trim().toLowerCase();
    var items = (T.projects || []).filter(function (p) {
      return [p.name, p.desc, (p.stack || []).join(',')].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    if (!items.length) { list.innerHTML = '<p class="empty">' + esc(T.no_results) + '</p>'; return; }
    list.innerHTML = items.map(function (p, i) {
      var img = p.image ? (p.image.charAt(0) === '/' ? p.image : '/' + p.image) : '';
      return '<article class="card proj" data-reveal style="--d:' + (i % 3) + '">' +
        '<div class="proj-media">' +
        (img ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" data-fallback />' : '') +
        '<span class="fallback" style="' + (img ? 'display:none' : '') + '"><i class="bi bi-window-stack"></i></span></div>' +
        '<div class="proj-body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.desc) + '</p>' +
        (p.stack ? '<div class="tags">' + p.stack.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="proj-links">' +
        (p.link ? '<a class="btn btn-primary btn-sm" href="' + esc(p.link) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + esc(T.view) + '</a>' : '') +
        (p.repo ? '<a class="btn btn-ghost btn-sm" href="' + esc(p.repo) + '" target="_blank" rel="noopener"><i class="bi bi-github"></i> ' + esc(T.code) + '</a>' : '') +
        '</div></div></article>';
    }).join('');
    FX().refresh(list);
  }

  function render() {
    var t = T, r = t.resume || {};
    document.title = t.title;
    set('title', t.title);
    set('logo', t.logo);
    ['about', 'services', 'projects', 'resume', 'blog', 'contact'].forEach(function (k) { set('nav_' + k, t['nav_' + k]); });
    set('hero_status', t.hero_status);
    set('hero_subtitle', t.hero_subtitle);
    set('hero_btn', t.hero_btn);
    set('hero_btn2', t.hero_btn2);
    var h1 = $('hero_title'); h1.textContent = t.hero_title; FX().splitTitle(h1);
    FX().typed(document.querySelector('.typed-line'), t.hero_roles);

    set('about_title', t.about_title);
    set('about_text', t.about_text);
    $('about_tags').innerHTML = (t.skills || []).map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('');
    $('stats').innerHTML = (t.stats || []).map(function (s) {
      return '<div class="stat"><b data-count="' + s.value + '" data-suffix="' + esc(s.suffix) + '">0</b><small>' + esc(s.label) + '</small></div>';
    }).join('');

    // marquee: skills duplicated for a seamless loop
    var words = (t.skills || []).map(esc);
    var row = '<span>' + words.join('</span><span>') + '</span>';
    $('marquee').innerHTML = row + row;

    set('services_title', t.services_title);
    $('services_cards').innerHTML = (t.services || []).map(function (s, i) {
      return '<article class="card" data-reveal style="--d:' + (i % 3) + '"><div class="icon-badge"><i class="bi ' + esc(s.icon) + '"></i></div><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></article>';
    }).join('');

    set('projects_title', t.projects_title);
    $('projectSearch').placeholder = t.search_placeholder || 'Search projects';
    renderProjects();

    // experience & education (from the resume block of the JSON)
    set('resume_title', t.resume_title);
    set('resume_summary', r.summary);
    set('exp_title', t.exp_title);
    set('edu_title', t.edu_title);
    set('courses_title', t.courses_title);
    set('tech_title', t.tech_title);
    $('experience').innerHTML = (r.experience || []).map(function (x, i) {
      return '<article class="card tl-item" data-reveal data-notilt style="--d:' + i + '"><div class="tl-meta"><h3>' + esc(x.role) + '</h3><span class="period">' + esc(x.period) + '</span></div><span class="company">' + esc(x.company) + '</span><ul>' +
        (x.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></article>';
    }).join('');
    $('education').innerHTML = (r.education || []).map(function (e) {
      return '<li><b>' + esc(e.degree) + '</b><span>' + esc(e.school) + '</span><small>' + esc(e.period) + '</small></li>';
    }).join('');
    $('courses').innerHTML = (r.courses || []).map(function (c) { return '<li><span>' + esc(c) + '</span></li>'; }).join('');
    var labels = t.tech_labels || {};
    $('tech').innerHTML = Object.keys(r.tech || {}).map(function (k) {
      return '<div class="tech-group"><h4>' + esc(labels[k] || k.replace(/_/g, ' ')) + '</h4><div class="chips">' +
        r.tech[k].map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('') + '</div></div>';
    }).join('');

    set('contact_title', t.contact_title);
    set('contact_text', t.contact_text);
    set('contact_btn_text', t.contact_btn);
    set('cv_btn_text', t.cv_btn_text);
    set('footer_text', t.footer_text);

    var meta = function (sel, v) { var e = document.querySelector(sel); if (e && v) e.setAttribute('content', v); };
    meta('meta[name="description"]', t.meta_description);
    meta('meta[property="og:title"]', t.title);
    meta('meta[property="og:description"]', t.meta_description);
    meta('meta[name="twitter:title"]', t.title);
    meta('meta[name="twitter:description"]', t.meta_description);

    FX().refresh();
  }

  function loadLang(lang) {
    var p = cache[lang] ? Promise.resolve(cache[lang]) : fetch('/lang/' + lang + '.json').then(function (r) {
      if (!r.ok) throw new Error('lang ' + r.status); return r.json();
    }).then(function (j) { cache[lang] = j; return j; });
    return p.then(function (j) {
      T = j; currentLang = lang;
      htmlEl.lang = lang; htmlEl.dir = dirMap[lang] || 'ltr';
      try { localStorage.setItem('lang', lang); } catch (e) {}
      $('langSwitcher').value = lang;
      render();
    }).catch(function (e) { console.error('Failed to load language', e); });
  }

  $('langSwitcher').addEventListener('change', function (e) {
    var next = e.target.value;
    loadLang(next);
    var qs = new URLSearchParams(location.search); qs.set('lang', next);
    history.replaceState({}, '', location.pathname + '?' + qs.toString() + location.hash);
  });
  $('projectSearch').addEventListener('input', function () { if (T) renderProjects(); });

  loadLang(currentLang);
})();
