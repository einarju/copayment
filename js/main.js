/* ── PCB particle-line "texture" canvas (shared, was duplicated per-page) ── */
function startPCB(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (canvas.dataset.pcbStarted) return; /* guard in case a page calls this twice for the same canvas */
  canvas.dataset.pcbStarted = '1';
  var ctx = canvas.getContext('2d');
  var r   = parseInt(canvas.dataset.r   || '0');
  var g   = parseInt(canvas.dataset.g   || '172');
  var b   = parseInt(canvas.dataset.b   || '255');
  var mul = parseFloat(canvas.dataset.mul || '1');
  var rc  = r+','+g+','+b;
  var bgPaths = [], active = [];

  function makePath() {
    var segs=[], x=Math.random()*canvas.width, y=Math.random()*canvas.height;
    var hz=Math.random()<.5, n=1+Math.floor(Math.random()*3);
    for(var i=0;i<n;i++){
      var len=35+Math.random()*170, dir=Math.random()<.5?1:-1;
      var x2=x+(hz?dir*len:0), y2=y+(hz?0:dir*len);
      segs.push({x1:x,y1:y,x2:x2,y2:y2}); x=x2; y=y2; hz=!hz;
    }
    return segs;
  }
  function buildBg(){
    bgPaths=[];
    var n=Math.max(18,Math.floor((canvas.width*canvas.height)/11000));
    for(var i=0;i<n;i++) bgPaths.push(makePath());
  }
  function totalLen(segs){ return segs.reduce(function(s,g){ return s+Math.abs(g.x2-g.x1)+Math.abs(g.y2-g.y1); },0); }
  function headAt(segs,t){
    var rem=t*totalLen(segs);
    for(var i=0;i<segs.length;i++){
      var sl=Math.abs(segs[i].x2-segs[i].x1)+Math.abs(segs[i].y2-segs[i].y1);
      if(rem<=sl||i===segs.length-1){ var f=sl>0?Math.min(rem/sl,1):1; return{x:segs[i].x1+(segs[i].x2-segs[i].x1)*f,y:segs[i].y1+(segs[i].y2-segs[i].y1)*f}; }
      rem-=sl;
    }
    var ls=segs[segs.length-1]; return{x:ls.x2,y:ls.y2};
  }
  function spawn(){ active.push({segs:makePath(),p:0,spd:.0035+Math.random()*.006,life:0,max:160+Math.floor(Math.random()*130)}); }
  function resize(){ canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; buildBg(); }
  resize(); window.addEventListener('resize',resize);
  for(var i=0;i<4;i++) spawn();

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.lineWidth=.75;
    bgPaths.forEach(function(path){
      path.forEach(function(s){
        ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2);
        ctx.strokeStyle='rgba('+rc+','+(0.07*mul)+')'; ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x1,s.y1,1.4,0,Math.PI*2);
        ctx.fillStyle='rgba('+rc+','+(0.14*mul)+')'; ctx.fill();
      });
      var ls=path[path.length-1]; ctx.beginPath(); ctx.arc(ls.x2,ls.y2,1.6,0,Math.PI*2);
      ctx.fillStyle='rgba('+rc+','+(0.18*mul)+')'; ctx.fill();
    });
    ctx.restore();
    if(active.length<5&&Math.random()<.022) spawn();
    active=active.filter(function(tr){
      tr.life++; tr.p=Math.min(1,tr.p+tr.spd);
      var t=tr.life/tr.max, a=t<.15?t/.15:t>.75?(1-t)/.25:1;
      var tlen=totalLen(tr.segs),drawn=tr.p*tlen,acc=0;
      ctx.save(); ctx.lineWidth=1.2; ctx.shadowBlur=5; ctx.shadowColor='rgba('+rc+','+(0.85*mul)+')';
      for(var i=0;i<tr.segs.length;i++){
        var s=tr.segs[i],slen=Math.abs(s.x2-s.x1)+Math.abs(s.y2-s.y1);
        if(acc>=drawn) break;
        var frac=Math.min((drawn-acc)/slen,1),ex=s.x1+(s.x2-s.x1)*frac,ey=s.y1+(s.y2-s.y1)*frac;
        ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(ex,ey);
        ctx.strokeStyle='rgba('+rc+','+(a*0.55*mul)+')'; ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x1,s.y1,2,0,Math.PI*2);
        ctx.fillStyle='rgba('+rc+','+(a*mul)+')'; ctx.shadowBlur=9; ctx.fill(); ctx.shadowBlur=5;
        if(frac>=1){
          ctx.beginPath(); ctx.arc(s.x2,s.y2,2.5,0,Math.PI*2);
          ctx.fillStyle='rgba('+rc+','+(a*mul)+')'; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=5;
        }
        acc+=slen;
      }
      var h=headAt(tr.segs,tr.p);
      ctx.beginPath(); ctx.arc(h.x,h.y,3.2,0,Math.PI*2);
      ctx.fillStyle='rgba('+rc+','+(a*mul)+')'; ctx.shadowBlur=18; ctx.shadowColor='rgba('+rc+',1)';
      ctx.fill(); ctx.restore();
      return tr.life<tr.max;
    });
    requestAnimationFrame(draw);
  }
  draw();
}
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
    }, 350);
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
