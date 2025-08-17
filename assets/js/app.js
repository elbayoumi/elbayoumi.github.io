let currentLang = "en";

async function loadLang(lang) {
  const response = await fetch(`lang/${lang}.json`);
  const data = await response.json();

  document.getElementById("title").innerText = data.title;
  document.getElementById("logo").innerText = data.logo;
  document.getElementById("nav_about").innerText = data.nav_about;
  document.getElementById("nav_projects").innerText = data.nav_projects;
  document.getElementById("nav_contact").innerText = data.nav_contact;
  document.getElementById("hero_title").innerText = data.hero_title;
  document.getElementById("hero_subtitle").innerText = data.hero_subtitle;
  document.getElementById("hero_btn").innerText = data.hero_btn;
  document.getElementById("about_title").innerText = data.about_title;
  document.getElementById("about_text").innerText = data.about_text;
  document.getElementById("projects_title").innerText = data.projects_title;

  // Render projects dynamically
  const projectsList = document.getElementById("projects_list");
  projectsList.innerHTML = "";
  data.projects.forEach(p => {
    let div = document.createElement("div");
    div.className = "project-card";
    div.innerHTML = `<h3>${p.name}</h3><p>${p.desc}</p>`;
    projectsList.appendChild(div);
  });

  document.getElementById("contact_title").innerText = data.contact_title;
  document.getElementById("contact_text").innerText = data.contact_text;
  document.getElementById("contact_btn").innerText = data.contact_btn;

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

document.getElementById("langSwitcher").addEventListener("change", (e) => {
  currentLang = e.target.value;
  loadLang(currentLang);
});

// Load default
loadLang(currentLang);
