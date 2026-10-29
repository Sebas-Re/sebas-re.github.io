const projectDialog = document.querySelector('#project-dialog');
const projectDialogTitle = document.querySelector('#project-dialog-title');
const projectGallery = document.querySelector('#project-gallery');
const projectGalleryEmpty = document.querySelector('#project-gallery-empty');
const projectDialogClose = document.querySelector('.project-dialog-close');
const projectImageDialog = document.querySelector('#project-image-dialog');
const projectImageFull = document.querySelector('#project-image-full');
const projectImageCaption = document.querySelector('#project-image-caption');
const projectImageClose = document.querySelector('.project-image-close');
let activeProject = null;
let activeImageTrigger = null;

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
  const galleryTemplate = project.querySelector('.project-gallery');
  const images = galleryTemplate.content.cloneNode(true);
  const hasImages = images.childElementCount > 0;

  projectGallery.replaceChildren(images);
  if (document.documentElement.lang === 'en') {
    projectGallery.querySelectorAll('figcaption[data-i18n]').forEach((caption) => {
      caption.textContent = window.I18N_EN[caption.dataset.i18n];
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
  projectGallery.hidden = !hasImages;
  projectGalleryEmpty.hidden = hasImages;
  projectDialogTitle.textContent = project.querySelector('h3').textContent.trim();
  activeProject = project;
  project.setAttribute('aria-expanded', 'true');
  projectDialog.showModal();
};

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
