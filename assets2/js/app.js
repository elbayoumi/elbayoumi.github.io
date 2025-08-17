// i18n + direction
const LANG_DEFAULT = 'en';
const dirMap = { en: 'ltr', ar: 'rtl' };

// DOM cache
const els = {
  title: document.getElementById('title'),
  logo: document.getElementById('logo'),
  nav_about: document.getElementById('nav_about'),
  nav_projects: document.getElementById('nav_projects'),
  nav_services: document.getElementById('nav_services'),
  nav_contact: document.getElementById('nav_contact'),
  hero_title: document.getElementById('hero_title'),
  hero_subtitle: document.getElementById('hero_subtitle'),
  hero_btn: document.getElementById('hero_btn'),
  hero_btn2: document.getElementById('hero_btn2'),
  about_title: document.getElementById('about_title'),
  about_text: document.getElementById('about_text'),
  about_tags: document.getElementById('about_tags'),
  services_title: document.getElementById('services_title'),
  services_cards: document.getElementById('services_cards'),
  projects_title: document.getElementById('projects_title'),
  projects_list: document.getElementById('projects_list'),
  contact_title: document.getElementById('contact_title'),
  contact_text: document.getElementById('contact_text'),
  contact_btn: document.getElementById('contact_btn'),
  footer_text: document.getElementById('footer_text'),
  cv_btn_text: document.getElementById('cv_btn_text'),
  search: document.getElementById('projectSearch'),
  langSwitcher: document.getElementById('langSwitcher')
};

let currentLang = localStorage.getItem('lang') || LANG_DEFAULT;
// Keep current projects in memory to avoid re-fetch on each search input
window.__allProjects = [];

/* ---------- Helpers ---------- */

/**
 * Returns base path without extension.
 * Example: "/a/b/pos-system.png" -> "/a/b/pos-system"
 */
function baseWithoutExt(path = '') {
  return String(path).replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');
}

/**
 * Build responsive <picture> HTML for a project card.
 * Expects that you have generated the three sizes: -388, -640, -1024 (avif, webp, jpg)
 * width/height are fixed to stabilize layout and reduce CLS.
 */
function buildProjectPictureHTML(src, altText) {
  const base = baseWithoutExt(src || 'assets2/img/project-placeholder');
  const sizes = '(min-width:1200px) 388px, (min-width:992px) 33vw, (min-width:576px) 50vw, 100vw';

  return `
    <picture>
      <source type="image/avif"
        srcset="${base}-388.avif 388w, ${base}-640.avif 640w, ${base}-1024.avif 1024w"
        sizes="${sizes}" />
      <source type="image/webp"
        srcset="${base}-388.webp 388w, ${base}-640.webp 640w, ${base}-1024.webp 1024w"
        sizes="${sizes}" />
      <img class="card-img-top"
        src="${base}-388.jpg"
        srcset="${base}-388.jpg 388w, ${base}-640.jpg 640w, ${base}-1024.jpg 1024w"
        sizes="${sizes}"
        width="388" height="259"
        alt="${altText || 'Project'}"
        loading="lazy" decoding="async" />
    </picture>`;
}

/**
 * Simple debounce for input
 */
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), ms);
  };
}

/* ---------- Rendering ---------- */

function renderSkills(skills = []) {
  els.about_tags.innerHTML = '';
  skills.forEach(s => {
    const b = document.createElement('span');
    b.className = 'badge text-bg-light';
    b.textContent = s;
    els.about_tags.appendChild(b);
  });
}

function renderServices(services = []) {
  els.services_cards.innerHTML = '';
  services.forEach(s => {
    els.services_cards.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-lg-4">
        <div class="card hover h-100 border-0">
          <div class="card-body p-4">
            <div class="d-flex align-items-start gap-3">
              <i class="bi ${s.icon} fs-2"></i>
              <div>
                <h3 class="h5 mb-1">${s.title}</h3>
                <p class="text-secondary mb-0">${s.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  });
}

function renderProjects(projects = []) {
  const q = (els.search.value || '').toLowerCase().trim();
  els.projects_list.innerHTML = '';

  projects
    .filter(p => [p.name, p.desc, (p.stack || []).join(',')].join(' ').toLowerCase().includes(q))
    .forEach(p => {
      const pictureHTML = buildProjectPictureHTML(p.image, p.name);
      const stackHTML = (p.stack && p.stack.length)
        ? `<div class="d-flex flex-wrap gap-2">${p.stack.map(s => `<span class='badge text-bg-light'>${s}</span>`).join('')}</div>`
        : '';

      els.projects_list.insertAdjacentHTML('beforeend', `
        <div class="col-md-6 col-lg-4">
          <div class="card hover h-100 border-0">
            ${pictureHTML}
            <div class="card-body">
              <h3 class="h5">${p.name}</h3>
              <p class="text-secondary">${p.desc}</p>
              ${stackHTML}
            </div>
            <div class="card-footer bg-transparent border-0">
              ${p.link ? `<a href="${p.link}" class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener">View</a>` : ''}
              ${p.repo ? `<a href="${p.repo}" class="btn btn-sm btn-outline-secondary ms-2" target="_blank" rel="noopener">Code</a>` : ''}
            </div>
          </div>
        </div>`);
    });
}

/* ---------- i18n loader ---------- */

async function loadLang(lang) {
  // Fetch language JSON (no cache to allow quick edits)
  const res = await fetch(`lang/${lang}.json`, { cache: 'no-store' });
  const t = await res.json();

  // Basic text
  els.title.textContent = t.title;
  document.title = t.title;
  els.logo.textContent = t.logo;
  els.nav_about.textContent = t.nav_about;
  els.nav_projects.textContent = t.nav_projects;
  els.nav_services.textContent = t.nav_services;
  els.nav_contact.textContent = t.nav_contact;

  els.hero_title.textContent = t.hero_title;
  els.hero_subtitle.textContent = t.hero_subtitle;
  els.hero_btn.textContent = t.hero_btn;
  els.hero_btn2.textContent = t.hero_btn2;

  els.about_title.textContent = t.about_title;
  els.about_text.textContent = t.about_text;

  renderSkills(t.skills || []);

  els.services_title.textContent = t.services_title;
  renderServices(t.services || []);

  els.projects_title.textContent = t.projects_title;

  // Cache projects globally to avoid re-fetch on search
  window.__allProjects = Array.isArray(t.projects) ? t.projects : [];
  renderProjects(window.__allProjects);

  els.contact_title.textContent = t.contact_title;
  els.contact_text.textContent = t.contact_text;
  els.contact_btn.textContent = t.contact_btn;
  els.footer_text.textContent = t.footer_text;
  els.cv_btn_text.textContent = t.cv_btn_text;

  // Placeholder update
  els.search.placeholder = t.search_placeholder || 'Search projects';

  // Lang + direction
  document.documentElement.lang = lang;
  document.documentElement.dir = dirMap[lang] || 'ltr';

  // Persist
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Sync switcher UI
  if (els.langSwitcher) els.langSwitcher.value = lang;
}

/* ---------- Events ---------- */

// Language switch
els.langSwitcher.addEventListener('change', e => {
  loadLang(e.target.value);
});

// Debounced search over cached projects
const onSearch = debounce(() => renderProjects(window.__allProjects), 150);
els.search.addEventListener('input', onSearch);

/* ---------- Init ---------- */
loadLang(currentLang);
