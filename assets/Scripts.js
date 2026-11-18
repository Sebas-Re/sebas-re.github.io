const projectDialog = document.querySelector('#project-dialog');
const projectDialogTitle = document.querySelector('#project-dialog-title');
const projectGallery = document.querySelector('#project-gallery');
const projectGalleryEmpty = document.querySelector('#project-gallery-empty');
const projectShowcaseTabs = document.querySelector('.project-showcase-tabs');
const projectShowcaseAside = document.querySelector('.project-showcase-aside');
const projectShowcaseDescription = document.querySelector('#project-showcase-description');
const projectShowcaseTechnologies = document.querySelector('#project-showcase-technologies');
const projectDialogClose = document.querySelector('.project-dialog-close');
const projectImageDialog = document.querySelector('#project-image-dialog');
const projectImageFull = document.querySelector('#project-image-full');
const projectImageCaption = document.querySelector('#project-image-caption');
const projectImageClose = document.querySelector('.project-image-close');
let activeProject = null;
let activeImageTrigger = null;

const translateTemplateText = (node) => {
  const key = node.dataset.i18n;
  return document.documentElement.lang === 'en' ? window.I18N_EN[key] : node.textContent.trim();
};

const renderProjectShowcaseSection = (project, sectionNumber) => {
  const template = project.querySelector(`template[data-showcase-section="${sectionNumber}"]`);
  if (!template) throw new Error(`Missing freelance showcase section ${sectionNumber}`);

  const content = template.content.cloneNode(true);
  const description = content.querySelector('[data-showcase-description]');
  projectShowcaseDescription.textContent = translateTemplateText(description);

  const technologies = [...content.querySelectorAll('[data-showcase-technologies] .tag')];
  projectShowcaseTechnologies.replaceChildren(...technologies.map((tag) => {
    const technology = document.createElement('span');
    technology.className = 'project-showcase-tech';
    technology.textContent = tag.textContent.trim();
    return technology;
  }));

  const figures = [...content.querySelectorAll('[data-showcase-gallery] figure')];
  projectGallery.replaceChildren(...figures);
  projectGallery.querySelectorAll('figcaption[data-i18n]').forEach((caption) => {
    caption.textContent = translateTemplateText(caption);
  });
  projectGallery.querySelectorAll('figure img').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
    const figure = image.closest('figure');
    const trigger = document.createElement('button');
    trigger.className = 'project-image-open';
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.append(image);
    figure.prepend(trigger);
  });
  projectGallery.hidden = figures.length === 0;
  projectGalleryEmpty.hidden = figures.length > 0;

  projectShowcaseTabs.querySelectorAll('[data-showcase-section]').forEach((tab) => {
    const isCurrent = tab.dataset.showcaseSection === sectionNumber;
    tab.classList.toggle('is-current', isCurrent);
    tab.setAttribute('aria-pressed', String(isCurrent));
  });
};

const closeProjectGallery = () => {
  activeProject?.setAttribute('aria-expanded', 'false');
  projectDialog.close();
};

const closeProjectImage = () => {
  const trigger = activeImageTrigger;
  projectImageDialog.close();
  setTimeout(() => trigger?.focus(), 0);
};

const openProjectImage = (image, trigger) => {
  const caption = image.closest('figure').querySelector('figcaption')?.textContent.trim();

  projectImageFull.src = image.currentSrc || image.src;
  projectImageFull.alt = image.alt;
  projectImageCaption.textContent = caption || image.alt;
  activeImageTrigger = trigger;
  projectImageDialog.showModal();
  projectImageClose.focus();
};

const openProjectGallery = (project) => {
  const isShowcase = project.hasAttribute('data-project-showcase');

  projectDialog.classList.toggle('is-showcase', isShowcase);
  projectShowcaseTabs.hidden = !isShowcase;
  projectShowcaseAside.hidden = !isShowcase;
  if (isShowcase) {
    renderProjectShowcaseSection(project, '1');
  } else {
    const galleryTemplate = project.querySelector('.project-gallery');
    const images = galleryTemplate.content.cloneNode(true);
    const figures = [...images.querySelectorAll('figure')];
    projectGallery.replaceChildren(...figures);
    if (document.documentElement.lang === 'en') {
      projectGallery.querySelectorAll('figcaption[data-i18n]').forEach((caption) => {
        caption.textContent = translateTemplateText(caption);
      });
    }
    projectGallery.querySelectorAll('figure img').forEach((image) => {
      image.loading = 'lazy';
      image.decoding = 'async';
      const figure = image.closest('figure');
      const trigger = document.createElement('button');
      trigger.className = 'project-image-open';
      trigger.type = 'button';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.append(image);
      figure.prepend(trigger);
    });
    projectGallery.hidden = figures.length === 0;
    projectGalleryEmpty.hidden = figures.length > 0;
    projectShowcaseDescription.textContent = '';
    projectShowcaseTechnologies.replaceChildren();
  }
  projectDialogTitle.textContent = project.querySelector('h3').textContent.trim();
  activeProject = project;
  project.setAttribute('aria-expanded', 'true');
  projectDialog.showModal();
};

projectShowcaseTabs.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const tab = event.target.closest('[data-showcase-section]');
  if (tab && activeProject) renderProjectShowcaseSection(activeProject, tab.dataset.showcaseSection);
});

projectGallery.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const trigger = event.target.closest('.project-image-open');
  if (trigger) openProjectImage(trigger.querySelector('img'), trigger);
});

document.querySelectorAll('.project[data-project-gallery]').forEach((project) => {
  project.addEventListener('click', () => openProjectGallery(project));
  project.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectGallery(project);
    }
  });
});

projectDialogClose.addEventListener('click', closeProjectGallery);
projectDialog.addEventListener('click', (event) => {
  if (event.target === projectDialog) closeProjectGallery();
});
projectDialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeProjectGallery();
  }
});
projectDialog.addEventListener('close', () => {
  activeProject?.setAttribute('aria-expanded', 'false');
  activeProject?.focus();
  activeProject = null;
});

projectImageClose.addEventListener('click', closeProjectImage);
projectImageDialog.addEventListener('click', (event) => {
  if (event.target === projectImageDialog) closeProjectImage();
});
projectImageDialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeProjectImage();
  }
});
projectImageDialog.addEventListener('close', () => {
  activeImageTrigger = null;
  projectImageFull.removeAttribute('src');
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const items = document.querySelectorAll('.scene:not(.hero) .wrap > *, .project, .credential');
  items.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
  });
  const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.classList.add('is-visible'); observer.unobserve(target); }
  }), { threshold: .12 });
  items.forEach((item) => observer.observe(item));

  // Parallax suave de las ilustraciones de los márgenes (solo escritorio)
  const decos = [...document.querySelectorAll('.deco[data-speed]')].filter((deco) => +deco.dataset.speed);
  let ticking = false;
  const parallax = () => {
    const mid = window.innerHeight / 2;
    decos.forEach((deco) => {
      const box = deco.parentElement.getBoundingClientRect();
      deco.style.transform = `translateY(${((box.top + box.height / 2 - mid) * deco.dataset.speed).toFixed(1)}px)`;
    });
    ticking = false;
  };
  if (window.matchMedia('(min-width: 1280px)').matches) {
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }
}
