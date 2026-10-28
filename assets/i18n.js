// Cambio de idioma ES/EN. El español vive en el HTML; acá están las traducciones al inglés.
// Los elementos con data-i18n="clave" cambian su contenido; los que tienen
// data-i18n-attr="atributo:clave;..." cambian esos atributos.
(function () {
  const EN = {
    'meta.title': 'Sebastián Ré | SOC & Software',
    'meta.desc': 'Portfolio of Sebastián Ré, SOC L1 analyst in training and full-stack developer.',
    'nav.label': 'Main navigation',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.training': 'Training',
    'nav.contact': 'Contact',
    'lang.label': 'Language',
    'hero.title': 'I read signs.<br>I build <em>solutions.</em>',
    'hero.intro': 'I’m Sebastián Ré, a SOC L1 analyst in training and a full-stack developer. I like finding patterns in the noise, whether in a log, a system, or a good cup of coffee. Results-driven and committed to continuous learning.',
    'hero.projects': 'See projects',
    'hero.cv': 'View CV',
    'hero.cvHref': 'assets/CV_SebastianRe_EN.pdf',
    'hero.status': 'in training<br>and always curious',
    'hero.plantAlt': 'Oscularia deltoides branch with two pink flowers',
    'about.kicker': '01 / Profile',
    'about.title': 'Technology with a human touch.',
    'about.copy': 'I combine a programming background with hands-on practice focused on security operations. My goal is to bring judgment, curiosity and order to incident detection and investigation, and to the backend development of useful solutions.',
    'about.focus': 'Focus',
    'about.focusValue': 'SOC, SIEM and backend development',
    'about.lang': 'Languages',
    'about.langValue': 'Native Spanish · English B2',
    'about.next': 'Next goal',
    'about.nextValue': 'Specializing in DFIR',
    'proj.kicker': '02 / Labs & projects',
    'proj.title': 'Investigate, document, improve.',
    'proj.1.title': 'Elastic SIEM on Ubuntu',
    'proj.1.text': 'Deployed Elasticsearch, Kibana and Logstash; collected data with Elastic Agent and analyzed web logs to identify failed login attempts and probes against sensitive paths.',
    'proj.2.title': 'Active Directory pentest',
    'proj.2.text': 'Capstone project on a Windows Server 2016 environment: reconnaissance, controlled exploitation, identity auditing and a technical and executive report with CVSS severity ratings and mitigations.',
    'proj.3.title': 'Freelance development',
    'proj.3.text': 'A web-based digital catalog and a Python Discord bot integrated with the OpenAI API. I work with APIs, automation and backend development of solutions focused on real needs.',
    'proj.4.title': 'More on GitHub',
    'proj.4.text': 'Explore my repositories and progress: programming, automation and continuous learning with a practical approach.',
    'proj.4.link': 'Open GitHub ↗',
    'tools.kicker': '03 / Toolbox',
    'tools.title': 'Defense, code and coffee to solve complex problems.',
    'cred.kicker': '04 / Continuous learning',
    'cred.title': 'Credentials and training.',
    'cred.sep': 'September 2026 ↗',
    'cred.oct': 'October 2026 ↗',
    'contact.kicker': '05 / Let’s talk',
    'contact.title': 'Got a challenge that deserves a careful look?',
    'contact.text': 'I’m open to junior opportunities in cybersecurity and backend development, as well as interesting projects and conversations.',
  };

  if (typeof window !== 'undefined') window.I18N_EN = EN;
  if (typeof document === 'undefined') return;

  const STORAGE_KEY = 'lang';
  const attrPairs = (node) => node.dataset.i18nAttr.split(';').map((pair) => pair.split(':'));
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')];
  const spanishText = new Map(textNodes.map((node) => [node, node.innerHTML]));
  const spanishAttrs = new Map(attrNodes.map((node) => [node, attrPairs(node).map(([attr]) => node.getAttribute(attr))]));

  const apply = (lang) => {
    textNodes.forEach((node) => { node.innerHTML = lang === 'en' ? EN[node.dataset.i18n] : spanishText.get(node); });
    attrNodes.forEach((node) => attrPairs(node).forEach(([attr, key], i) => {
      node.setAttribute(attr, lang === 'en' ? EN[key] : spanishAttrs.get(node)[i]);
    }));
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === lang));
    });
  };

  // Prioridad: ?lang= en la URL, después la elección guardada, después el idioma del navegador.
  const fromUrl = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* almacenamiento bloqueado */ }
  const browser = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  const valid = (lang) => lang === 'es' || lang === 'en';
  apply(valid(fromUrl) ? fromUrl : valid(saved) ? saved : browser);

  document.querySelectorAll('[data-set-lang]').forEach((button) => button.addEventListener('click', () => {
    const lang = button.dataset.setLang;
    apply(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* almacenamiento bloqueado */ }
    if (fromUrl) {
      const url = new URL(location.href);
      url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    }
  }));
})();
