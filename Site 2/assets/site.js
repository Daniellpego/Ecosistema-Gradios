// Gradios — site-wide interactive layer
(function () {
  // ---------- header scroll state
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 16) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const mnav = document.querySelector('.mobile-nav');
  if (toggle && mnav) {
    toggle.addEventListener('click', () => mnav.classList.toggle('open'));
    mnav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mnav.classList.remove('open'))
    );
  }

  // ---------- tweaks panel
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "primary": "neutral"
  }/*EDITMODE-END*/;
  let tweaks = { ...TWEAK_DEFAULTS };
  try {
    const stored = localStorage.getItem('gradios-tweaks');
    if (stored) tweaks = { ...tweaks, ...JSON.parse(stored) };
  } catch (e) {}

  function applyTweaks() {
    document.body.setAttribute('data-primary', tweaks.primary);
    document.querySelectorAll('.tweaks-options button[data-primary]').forEach(b => {
      b.classList.toggle('active', b.dataset.primary === tweaks.primary);
    });
    try { localStorage.setItem('gradios-tweaks', JSON.stringify(tweaks)); } catch (e) {}
  }
  applyTweaks();

  // listener BEFORE announce
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === '__activate_edit_mode') {
      const p = document.querySelector('.tweaks-panel');
      if (p) p.classList.add('open');
    } else if (e.data.type === '__deactivate_edit_mode') {
      const p = document.querySelector('.tweaks-panel');
      if (p) p.classList.remove('open');
    }
  });
  window.parent && window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  document.querySelectorAll('.tweaks-options button[data-primary]').forEach(b => {
    b.addEventListener('click', () => {
      tweaks.primary = b.dataset.primary;
      applyTweaks();
      window.parent && window.parent.postMessage({
        type: '__edit_mode_set_keys',
        edits: { primary: tweaks.primary }
      }, '*');
    });
  });
  const close = document.querySelector('.tweaks-close');
  if (close) close.addEventListener('click', () => {
    document.querySelector('.tweaks-panel').classList.remove('open');
    window.parent && window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  });

  // ---------- count-up on view
  const countUpEls = document.querySelectorAll('[data-count]');
  if (countUpEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !en.target.dataset.counted) {
          en.target.dataset.counted = '1';
          const target = parseFloat(en.target.dataset.count);
          const suffix = en.target.dataset.suffix || '';
          const dur = 1200;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const ease = 1 - Math.pow(1 - p, 3);
            const v = Math.floor(target * ease);
            en.target.textContent = v.toLocaleString('pt-BR') + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else en.target.textContent = target.toLocaleString('pt-BR') + suffix;
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    countUpEls.forEach(el => io.observe(el));
  }

  // ---------- contact form (simple validation)
  const form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        const ok = f.value.trim().length > 0 && (f.type !== 'email' || /\S+@\S+\.\S+/.test(f.value));
        f.classList.toggle('error', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      form.style.display = 'none';
      const ok = form.parentElement.querySelector('[data-success]');
      if (ok) ok.style.display = 'block';
    });
  }

  // ---------- live dashboard tabs (hero)
  const tabs = document.querySelectorAll('[data-dash-tab]');
  if (tabs.length) {
    tabs.forEach(t => t.addEventListener('click', () => {
      const target = t.dataset.dashTab;
      tabs.forEach(x => x.classList.toggle('active', x === t));
      document.querySelectorAll('[data-dash-pane]').forEach(p => {
        p.style.display = p.dataset.dashPane === target ? 'block' : 'none';
      });
    }));
  }

  // ---------- live ticking KPI in hero
  const tickEls = document.querySelectorAll('[data-tick]');
  if (tickEls.length) {
    let i = 0;
    const cycle = () => {
      tickEls.forEach((el, idx) => {
        el.classList.toggle('tick-on', idx === i % tickEls.length);
      });
      i++;
    };
    cycle();
    setInterval(cycle, 2400);
  }

  // ---------- process timeline scroll reveal + rail fill
  const tlist = document.querySelector('.timeline-list');
  if (tlist && 'IntersectionObserver' in window) {
    const rail = tlist.querySelector('.tline-rail-fill');
    const activeIdx = parseInt(tlist.dataset.activeStep || '3', 10);
    const steps = tlist.querySelectorAll('.tline-step');
    const tio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tlist.classList.add('is-revealed');
          if (rail && steps.length) {
            // fill up to active step
            const pct = ((activeIdx - 0.5) / steps.length) * 100;
            rail.style.height = pct + '%';
          }
          tio.unobserve(tlist);
        }
      });
    }, { threshold: 0.18 });
    tio.observe(tlist);
  }

  // ---------- progress bar fill in process panel
  const progressEls = document.querySelectorAll('.proc-progress-fill[data-progress]');
  if (progressEls.length && 'IntersectionObserver' in window) {
    const pio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const pct = parseInt(en.target.dataset.progress, 10) || 0;
          requestAnimationFrame(() => { en.target.style.width = pct + '%'; });
          pio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    progressEls.forEach(el => pio.observe(el));
  }

  // ---------- generic stagger reveal (.reveal-stagger)
  const revealEls = document.querySelectorAll('.reveal-stagger');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-revealed');
          rio.unobserve(en.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(el => rio.observe(el));
  }

  // ---------- diff feature mini-flow animated highlight
  const flow = document.querySelector('.diff-flow');
  if (flow && 'IntersectionObserver' in window) {
    const fill = flow.querySelector('.diff-flow-line-fill');
    const steps = flow.querySelectorAll('.diff-flow-step');
    let started = false;
    const fio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !started) {
          started = true;
          if (fill) fill.style.width = '100%';
          let i = 0;
          const cycle = () => {
            steps.forEach((s, idx) => s.classList.toggle('is-on', idx <= i % steps.length));
            i++;
          };
          cycle();
          setInterval(cycle, 1300);
          fio.unobserve(flow);
        }
      });
    }, { threshold: 0.35 });
    fio.observe(flow);
  }

  // ---------- year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();


// hero parallax (subtle)
(function(){
  const el = document.querySelector('[data-parallax]');
  if (!el) return;
  const sec = el.closest('section') || el.parentElement;
  let raf = 0;
  sec.addEventListener('mousemove', (e) => {
    const r = sec.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      el.style.transform = 'translate(' + (x*10).toFixed(2) + 'px,' + (y*8).toFixed(2) + 'px)';
      raf = 0;
    });
  });
  sec.addEventListener('mouseleave', () => { el.style.transform = ''; });
})();
