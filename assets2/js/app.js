const LANG_DEFAULT = 'en';
const dirMap = { en: 'ltr', ar: 'rtl' };

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
let cached = { en: null, ar: null };

async function fetchLang(lang){
  if (cached[lang]) return cached[lang];
  const res = await fetch(`assets2/lang/${lang}.json`, { cache: 'no-store' });
  const t = await res.json();
  cached[lang] = t; return t;
}

async function loadLang(lang){
  const t = await fetchLang(lang);

  document.title = t.title; els.title.textContent = t.title;
  els.logo.textContent = t.logo || 'Software Engineer';
  els.nav_about.textContent = t.nav_about; els.nav_projects.textContent = t.nav_projects;
  els.nav_services.textContent = t.nav_services; els.nav_contact.textContent = t.nav_contact;

  els.hero_title.textContent = t.hero_title; els.hero_subtitle.textContent = t.hero_subtitle;
  els.hero_btn.textContent = t.hero_btn; els.hero_btn2.textContent = t.hero_btn2;

  els.about_title.textContent = t.about_title; els.about_text.textContent = t.about_text;
  els.about_tags.innerHTML = '';
  (t.skills || []).forEach(s => {
    const b = document.createElement('span'); b.className = 'badge text-bg-light'; b.textContent = s; els.about_tags.appendChild(b);
  });

  els.services_title.textContent = t.services_title; els.services_cards.innerHTML = '';
  (t.services || []).forEach(s => {
    els.services_cards.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-lg-4">
        <div class="card hover h-100 border-0">
          <div class="card-body p-4">
            <div class="d-flex align-items-start gap-3">
              <i class="bi ${s.icon} fs-2" aria-hidden="true"></i>
              <div>
                <h3 class="h5 mb-1">${s.title}</h3>
                <p class="text-secondary mb-0">${s.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  });

  els.projects_title.textContent = t.projects_title;
  window.__allProjects = t.projects || [];
  renderProjects();

  els.contact_title.textContent = t.contact_title; els.contact_text.textContent = t.contact_text;
  els.contact_btn.textContent = t.contact_btn; els.footer_text.textContent = t.footer_text;
  if (els.cv_btn_text && t.cv_btn_text) els.cv_btn_text.textContent = t.cv_btn_text;

  document.documentElement.lang = lang; document.documentElement.dir = dirMap[lang] || 'ltr';
  localStorage.setItem('lang', lang);
  els.search.placeholder = t.search_placeholder || (lang === 'ar' ? 'ابحث في المشاريع' : 'Search projects');
}

function renderProjects(){
  const q = (els.search?.value || '').toLowerCase();
  const list = window.__allProjects || [];
  els.projects_list.innerHTML = '';
  list.filter(p => [p.name, p.desc, (p.stack||[]).join(',')].join(' ').toLowerCase().includes(q))
      .forEach(p => {
        els.projects_list.insertAdjacentHTML('beforeend', `
          <div class="col-md-6 col-lg-4">
            <div class="card hover h-100 border-0">
              <img class="card-img-top" src="${p.image || 'assets2/img/project-placeholder.webp'}" alt="${p.name}" loading="lazy" decoding="async" width="640" height="360" />
              <div class="card-body">
                <h3 class="h5">${p.name}</h3>
                <p class="text-secondary">${p.desc}</p>
                ${(p.stack||[]).length ? `<div class="d-flex flex-wrap gap-2">${p.stack.map(s=>`<span class='badge text-bg-light'>${s}</span>`).join('')}</div>` : ''}
              </div>
              <div class="card-footer bg-transparent border-0">
                ${p.link ? `<a href="${p.link}" class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener">View</a>` : ''}
                ${p.repo ? `<a href="${p.repo}" class="btn btn-sm btn-outline-secondary ms-2" target="_blank" rel="noopener">Code</a>` : ''}
              </div>
            </div>
          </div>`);
      });
}

els.langSwitcher.addEventListener('change', e => loadLang(e.target.value));
els.search.addEventListener('input', renderProjects);

// Init
loadLang(currentLang); els.langSwitcher.value = currentLang;