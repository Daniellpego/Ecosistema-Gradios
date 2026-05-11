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
    const setMenu = (open) => {
      mnav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    setMenu(false);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenu(!mnav.classList.contains('open'));
    });
    mnav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mnav.classList.contains('open')) setMenu(false);
    });
    document.addEventListener('click', (e) => {
      if (!mnav.classList.contains('open')) return;
      if (mnav.contains(e.target) || toggle.contains(e.target)) return;
      setMenu(false);
    });
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
    const panelEl = document.querySelector('.tweaks-panel');
    if (panelEl) panelEl.classList.remove('open');
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

  // ---------- contact form (real submit → Supabase Edge Function)
  // Defina LEAD_ENDPOINT no <script> da página ou via window.GRADIOS_LEAD_ENDPOINT.
  // Fallback: usa o projeto Supabase oficial da Gradios.
  const LEAD_ENDPOINT =
    (typeof window !== 'undefined' && window.GRADIOS_LEAD_ENDPOINT) ||
    'https://urpuiznydrlwmaqhdids.supabase.co/functions/v1/site-lead-submit';

  // ---------- marquee setores: touch pause (mobile equivalente ao hover desktop)
  document.querySelectorAll('.segments-marquee').forEach((m) => {
    let pauseTimer = null;
    const track = m.querySelector('.segments-track');
    if (!track) return;
    m.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
      if (pauseTimer) clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => { track.style.animationPlayState = ''; }, 3000);
    }, { passive: true });
  });

  document.querySelectorAll('form[data-contact]').forEach((form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitOriginalHTML = submitBtn ? submitBtn.innerHTML : '';

    // ---------- form auto-save (preserva valores em refresh ou erro de submit)
    const STORAGE_KEY = 'gradios-contact-draft-' + (form.id || 'home');
    const persistableFields = form.querySelectorAll('input:not([type="hidden"]):not([name="website"]), select, textarea');
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved) {
        persistableFields.forEach((f) => {
          if (saved[f.name] && !f.value) f.value = saved[f.name];
        });
      }
    } catch (_) { /* localStorage indisponível — silent */ }
    const saveDraft = () => {
      try {
        const data = {};
        persistableFields.forEach((f) => { if (f.name) data[f.name] = f.value; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (_) { /* silent */ }
    };
    persistableFields.forEach((f) => f.addEventListener('input', saveDraft));
    const clearDraft = () => { try { localStorage.removeItem(STORAGE_KEY); } catch (_) {} };
    let errorBox = form.querySelector('[data-form-error]');
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.setAttribute('data-form-error', '');
      errorBox.setAttribute('role', 'alert');
      errorBox.style.cssText =
        'display:none;margin-top:12px;padding:12px 14px;border-radius:8px;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;font-size:14px;line-height:20px;';
      form.appendChild(errorBox);
    }

    function showError(message, withMail = true) {
      errorBox.innerHTML = withMail
        ? message + ' <a href="mailto:contato@gradios.com.br" style="color:inherit;text-decoration:underline;font-weight:600;">Enviar por email</a>.'
        : message;
      errorBox.style.display = 'block';
    }

    function getParam(name) {
      try {
        return new URLSearchParams(window.location.search).get(name) || undefined;
      } catch (_) {
        return undefined;
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.style.display = 'none';

      let valid = true;
      form.querySelectorAll('[required]').forEach((f) => {
        const v = f.value.trim();
        const ok = v.length > 0 && (f.type !== 'email' || /\S+@\S+\.\S+/.test(v));
        f.classList.toggle('error', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        showError('Preencha os campos obrigatórios.', false);
        return;
      }

      // Compat: home tem email+whatsapp separados; contato.html tem campo único "contato"
      const emailField = form.querySelector('[name="email"]')?.value.trim() ?? '';
      const whatsField = form.querySelector('[name="whatsapp"]')?.value.trim() ?? '';
      const contatoLegacy = form.querySelector('[name="contato"]')?.value.trim() ?? '';
      const contatoCombined = [emailField, whatsField].filter(Boolean).join(' · ') || contatoLegacy;

      const data = {
        nome: form.querySelector('[name="nome"]')?.value.trim() ?? '',
        contato: contatoCombined,
        email: emailField || null,
        whatsapp: whatsField || null,
        empresa: form.querySelector('[name="empresa"]')?.value.trim() || null,
        tipo: form.querySelector('[name="tipo"]')?.value.trim() ?? '',
        mensagem: form.querySelector('[name="mensagem"]')?.value.trim() ?? '',
        website: form.querySelector('[name="website"]')?.value.trim() ?? '', // honeypot
        origem: window.location.pathname,
        utm_source: getParam('utm_source'),
        utm_medium: getParam('utm_medium'),
        utm_campaign: getParam('utm_campaign'),
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando…';
      }

      try {
        const res = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.status === 429) {
          showError('Muitas tentativas em pouco tempo. Tente novamente em alguns minutos.', false);
          return;
        }
        if (!res.ok) {
          let detail = '';
          try { detail = (await res.json()).error || ''; } catch (_) {}
          const isValidation = detail === 'tipo_invalido' || detail === 'mensagem_invalida' || detail === 'nome_invalido' || detail === 'contato_invalido';
          showError(
            isValidation
              ? 'Algum campo não passou na validação. Revise e envie novamente.'
              : 'Não conseguimos enviar agora. Tente de novo em instantes.',
            !isValidation
          );
          return;
        }

        form.style.display = 'none';
        const ok = form.parentElement && form.parentElement.querySelector('[data-success]');
        if (ok) ok.style.display = 'block';
        clearDraft();
      } catch (_) {
        showError('Sem conexão com o servidor. Tente novamente.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitOriginalHTML;
        }
      }
    });
  });

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

  // ---------- process timeline: scroll-driven sync (rail + active step + side card)
  const tlist = document.querySelector('.timeline-list');
  if (tlist) {
    const rail   = tlist.querySelector('.tline-rail-fill');
    const steps  = Array.from(tlist.querySelectorAll('.tline-step'));
    const total  = steps.length;
    const panel  = document.querySelector('.process-panel');
    const cardName = panel && panel.querySelector('.proc-status-name');
    const cardMeta = panel && panel.querySelector('.proc-status-meta');
    const progress = panel && panel.querySelector('.proc-progress-fill');

    // reveal-stagger inicial via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const tio = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            tlist.classList.add('is-revealed');
            tio.unobserve(tlist);
          }
        });
      }, { threshold: 0.18 });
      tio.observe(tlist);
    }

    // sync contínuo conforme o scroll passa pela timeline
    let lastIdx = -1;
    let ticking = false;

    const sync = () => {
      ticking = false;
      const rect = tlist.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const focusY = vh * 0.4; // linha de foco a 40% do topo da viewport

      // progresso vertical dentro da lista (0..1) baseado em quanto a focusY entrou na lista
      const listTop = rect.top;
      const listHeight = rect.height;
      let p = (focusY - listTop) / listHeight;
      p = Math.max(0, Math.min(1, p));

      // rail fill contínuo
      if (rail) rail.style.height = (p * 100) + '%';

      // qual step está mais perto da linha de foco
      let bestIdx = 0;
      let bestDist = Infinity;
      steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - focusY);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      });

      // só atualiza se o step ativo mudou
      if (bestIdx !== lastIdx) {
        lastIdx = bestIdx;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === bestIdx));

        // atualiza o card lateral
        const active = steps[bestIdx];
        const name = active.dataset.cardName || (active.querySelector('h3') || {}).textContent || '';
        const stepNum = parseInt(active.dataset.step, 10) || (bestIdx + 1);

        if (cardName) {
          // fade rápido na troca de texto
          cardName.style.opacity = '0';
          setTimeout(() => {
            cardName.textContent = name;
            cardName.style.opacity = '1';
          }, 140);
        }
        if (cardMeta) cardMeta.textContent = `${stepNum} de ${total} etapas`;
        if (progress) progress.style.width = ((stepNum / total) * 100) + '%';
      }
    };

    // CSS auxiliar pro fade do nome
    if (cardName) {
      cardName.style.transition = 'opacity 220ms cubic-bezier(.2,.7,0,1)';
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sync);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    sync(); // estado inicial
  }

  // ---------- solutions tabs (substitui o grid de 6 cards) — WAI-ARIA compliant
  const solTabs = Array.from(document.querySelectorAll('.solutions-tab'));
  const solPanels = Array.from(document.querySelectorAll('.solutions-panel'));
  if (solTabs.length && solPanels.length) {
    const activateTab = (tab, focus = false) => {
      const target = tab.dataset.target;
      solTabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.setAttribute('tabindex', active ? '0' : '-1');
      });
      solPanels.forEach(p => {
        const active = p.dataset.tab === target;
        p.classList.toggle('is-active', active);
        if (active) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
      if (focus) tab.focus();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    };
    solTabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (e) => {
        let nextIdx = null;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % solTabs.length;
        else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + solTabs.length) % solTabs.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = solTabs.length - 1;
        if (nextIdx !== null) {
          e.preventDefault();
          activateTab(solTabs[nextIdx], true);
        }
      });
    });
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

  // ---------- diff feature mini-flow + card hover sync
  const flow = document.querySelector('.diff-flow');
  const diffFeature = document.querySelector('.diff-feature');
  const diffCards = document.querySelectorAll('.diff-card[data-flow-target]');
  if (flow) {
    const fill = flow.querySelector('.diff-flow-line-fill');
    const steps = Array.from(flow.querySelectorAll('.diff-flow-step'));

    // reveal: linha preenche e todos os nodes ficam ligados em estado idle
    if ('IntersectionObserver' in window) {
      let started = false;
      const fio = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting && !started) {
            started = true;
            if (fill) fill.style.width = '100%';
            // todos os steps em idle "is-on" pra mostrar o caminho completo
            steps.forEach(s => s.classList.add('is-on'));
            fio.unobserve(flow);
          }
        });
      }, { threshold: 0.35 });
      fio.observe(flow);
    } else {
      if (fill) fill.style.width = '100%';
      steps.forEach(s => s.classList.add('is-on'));
    }

    // hover dos cards → spotlight cyan no step correspondente do flow
    const setPin = (idx) => {
      steps.forEach((s, i) => s.classList.toggle('is-pinned', i === idx));
      if (diffFeature) diffFeature.classList.toggle('has-pin', idx !== -1);
    };
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    diffCards.forEach(card => {
      const target = parseInt(card.dataset.flowTarget, 10);
      if (isNaN(target)) return;
      card.addEventListener('mouseenter', () => setPin(target));
      card.addEventListener('focusin',    () => setPin(target));
      card.addEventListener('mouseleave', () => setPin(-1));
      card.addEventListener('focusout',   () => setPin(-1));
      // mobile/touch: tap acende o flow por 2s (compensa ausência de hover)
      if (isCoarsePointer) {
        let pinTimer = null;
        card.addEventListener('click', () => {
          setPin(target);
          if (pinTimer) clearTimeout(pinTimer);
          pinTimer = setTimeout(() => setPin(-1), 2000);
        });
      }
    });
  }

  // ---------- year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();


// hero parallax (subtle) — opt-out em reduced-motion e em ponteiros coarse (touch)
(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return;
  const el = document.querySelector('[data-parallax]');
  if (!el) return;
  const sec = el.closest('section') || el.parentElement;
  if (!sec) return;
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
