/* ── Navbar scroll effect ── */
const navbar = document.querySelector('.navbar');
function updateNavHeight() {
  const h = window.scrollY > 40 ? 64 : 72;
  document.documentElement.style.setProperty('--nav-h', h + 'px');
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateNavHeight, { passive: true });
updateNavHeight();

/* ── MEGA MENU ── */
(function () {
  /* Derive asset base path from the logo src (works at any folder depth) */
  const logoEl = document.querySelector('.navbar-logo img');
  const assetBase = logoEl ? logoEl.getAttribute('src').replace('assets/logo-horizontal.svg', '') : '';

  const megaConfig = {
    'Nosotros': {
      img: 'assets/team.jpg',
      overlay: 'linear-gradient(180deg, rgba(0,30,80,.25) 0%, rgba(0,30,80,.82) 100%)',
      tag: 'Conoce el equipo',
      label: 'Las personas detrás de la infraestructura de pagos de México'
    },
    'Lo que hacemos': {
      gradient: 'linear-gradient(145deg, #00327a 0%, #003f99 55%, #00acff 100%)',
      tag: 'Plataforma',
      label: 'Infraestructura de pagos de clase mundial'
    },
    'Soluciones': {
      gradient: 'linear-gradient(145deg, #002255 0%, #00327a 50%, #068e50 100%)',
      tag: 'Herramientas',
      label: 'Seguridad y operación para el ecosistema de pagos'
    },
    'Novedades': {
      img: 'assets/foro-gallery-01.jpg',
      overlay: 'linear-gradient(180deg, rgba(0,20,70,.2) 0%, rgba(0,20,70,.88) 100%)',
      tag: 'Comunidad',
      label: 'Foros, capacitaciones y recursos del sector'
    }
  };

  /* Inject backdrop */
  const backdrop = document.createElement('div');
  backdrop.id = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const navInner = document.querySelector('.navbar-inner');

  function positionDropdown(dropdown) {
    const navH = navbar ? navbar.getBoundingClientRect().height : 72;
    dropdown.style.top = navH + 'px';
  }

  /* Shared close timer — prevents backdrop flicker when moving between nav items */
  let backdropCloseTimer = null;

  function cancelClose() { clearTimeout(backdropCloseTimer); backdropCloseTimer = null; }
  function scheduleClose() {
    backdropCloseTimer = setTimeout(() => {
      if (!document.querySelector('.nav-item:hover')) backdrop.classList.remove('is-visible');
    }, 120);
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    const navLink = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown');
    if (!navLink || !dropdown) return;

    /* Get section name — text node before the SVG arrow */
    const sectionName = Array.from(navLink.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join('');

    const cfg = megaConfig[sectionName];
    if (!cfg) return;

    /* Wrap existing dropdown children in .mega-links */
    const isWide = dropdown.classList.contains('dropdown-wide');
    const megaLinks = document.createElement('div');
    megaLinks.className = 'mega-links ' + (isWide ? 'mega-links-wide' : 'mega-links-narrow');
    while (dropdown.firstChild) megaLinks.appendChild(dropdown.firstChild);

    /* Flatten anonymous wrapper divs (wide dropdowns wrap groups in bare <div>s) */
    Array.from(megaLinks.querySelectorAll(':scope > div:not(.dropdown-group)')).forEach(wrapper => {
      while (wrapper.firstChild) megaLinks.insertBefore(wrapper.firstChild, wrapper);
      megaLinks.removeChild(wrapper);
    });

    /* Build .mega-left panel */
    const megaLeft = document.createElement('div');
    megaLeft.className = 'mega-left';

    if (cfg.img) {
      megaLeft.innerHTML =
        '<img class="mega-left-img" src="' + assetBase + cfg.img + '" alt="" aria-hidden="true">' +
        '<div class="mega-left-overlay" style="background:' + cfg.overlay + '"></div>' +
        '<div class="mega-left-text">' +
          '<span class="mega-left-tag">' + cfg.tag + '</span>' +
          '<p class="mega-left-label">' + cfg.label + '</p>' +
        '</div>';
    } else {
      megaLeft.style.background = cfg.gradient;
      megaLeft.innerHTML =
        '<div class="mega-left-text">' +
          '<span class="mega-left-tag">' + cfg.tag + '</span>' +
          '<p class="mega-left-label">' + cfg.label + '</p>' +
        '</div>';
    }

    dropdown.appendChild(megaLeft);
    dropdown.appendChild(megaLinks);

    /* Position + backdrop on hover — shared timer prevents close/reopen between items */
    item.addEventListener('mouseenter', () => {
      cancelClose();
      positionDropdown(dropdown);
      backdrop.classList.add('is-visible');
    });
    item.addEventListener('mouseleave', scheduleClose);
    item.addEventListener('focusin', () => {
      cancelClose();
      positionDropdown(dropdown);
      backdrop.classList.add('is-visible');
    });
    item.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!item.contains(document.activeElement)) scheduleClose();
      }, 80);
    });
  });

  /* Reposition on resize */
  window.addEventListener('resize', () => {
    document.querySelectorAll('.nav-item:hover .dropdown, .nav-item:focus-within .dropdown').forEach(d => {
      positionDropdown(d);
    });
  });
})();

/* ── Mobile toggle ── */
const toggle = document.querySelector('.navbar-toggle');
const nav    = document.querySelector('.navbar-nav');
toggle?.addEventListener('click', () => nav?.classList.toggle('open'));

/* Mobile: tap nav-link to expand dropdown inline */
document.querySelectorAll('.nav-link[aria-haspopup]').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const item = link.closest('.nav-item');
      item?.classList.toggle('open');
    }
  });
});

/* ── Animate on scroll ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale-in').forEach(el => observer.observe(el));

/* ── Active nav link ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link[href]').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

/* ── Animated counter ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ── Close dropdowns on outside click ── */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-item')) {
    document.querySelectorAll('.dropdown').forEach(d => {
      d.closest('.nav-item')?.classList.remove('open');
    });
  }
});

/* ── Keyboard: aria-expanded + Escape to close ── */
document.querySelectorAll('.nav-link[aria-haspopup]').forEach(link => {
  const item = link.closest('.nav-item');
  item.addEventListener('focusin',  () => link.setAttribute('aria-expanded', 'true'));
  item.addEventListener('focusout', (e) => {
    setTimeout(() => {
      if (!item.contains(document.activeElement))
        link.setAttribute('aria-expanded', 'false');
    }, 80);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.nav-link[aria-expanded="true"]').forEach(link => {
      link.setAttribute('aria-expanded', 'false');
      link.blur();
    });
  }
});
