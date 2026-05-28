/* ── Navbar scroll effect ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Mobile toggle ── */
const toggle = document.querySelector('.navbar-toggle');
const nav    = document.querySelector('.navbar-nav');
toggle?.addEventListener('click', () => nav?.classList.toggle('open'));

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
