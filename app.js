document.addEventListener('DOMContentLoaded', () => {
  const curtain = document.getElementById('pageCurtain');
  if (curtain) {
    document.body.classList.add('curtain-active');
    setTimeout(() => {
      curtain.classList.add('lifted');
      document.body.classList.remove('curtain-active');
    }, 1000);
    setTimeout(() => {
      curtain.remove();
    }, 1800);
  }

  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (menuBtn && mobileNav) {
    menuBtn.setAttribute('aria-controls', 'mobileNav');
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuBtn.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const topbar = document.querySelector('.topbar');
        const topbarHeight = topbar ? topbar.offsetHeight : 0;
        const offset = headerHeight + topbarHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  }

  const shadeSwitches = document.querySelectorAll('.shade-swatch');
  shadeSwitches.forEach(swatch => {
    swatch.setAttribute('role', 'button');
    swatch.setAttribute('tabindex', '0');
    swatch.setAttribute('aria-label', swatch.getAttribute('data-shade') || 'Select shade');

    swatch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        swatch.click();
      }
    });

    swatch.addEventListener('click', () => {
      shadeSwitches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const shade = swatch.getAttribute('data-shade');
      const shadeLabel = document.getElementById('shadeLabel');
      if (shadeLabel && shade) {
        shadeLabel.textContent = shade;
      }
    });
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  const collectionCards = document.querySelectorAll('.collection-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      collectionCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const forms = document.querySelectorAll('form[data-redirect]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const redirect = form.getAttribute('data-redirect');
      window.location.href = redirect || 'success.html';
    });
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (question && answer) {
      const answerId = 'faq-answer-' + index;
      answer.id = answerId;
      question.setAttribute('aria-expanded', 'false');
      question.setAttribute('aria-controls', answerId);

      question.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        faqItems.forEach(i => {
          i.classList.remove('open');
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const prefilledShade = params.get('shade');
  if (prefilledShade) {
    const shadeSelect = document.getElementById('shade');
    if (shadeSelect) {
      for (let i = 0; i < shadeSelect.options.length; i++) {
        if (shadeSelect.options[i].value === prefilledShade) {
          shadeSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
});

// ── Cookie Consent Banner ──────────────────────────────────────────────
(function () {
  var KEY = 'aawigs-cookie-consent';
  if (localStorage.getItem(KEY)) return;

  var style = document.createElement('style');
  style.textContent = [
    '#aa-cb{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#3a0518;border-top:1px solid rgba(197,163,85,0.25);padding:20px 24px;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);opacity:0;}',
    '#aa-cb.aa-cb-in{transform:translateY(0);opacity:1;}',
    '#aa-cb-inner{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}',
    '#aa-cb-text{flex:1;min-width:220px;font-family:var(--font-sans,Inter,sans-serif);font-size:0.82rem;color:rgba(253,248,240,0.82);line-height:1.6;}',
    '#aa-cb-text a{color:#C5A355;text-decoration:underline;}',
    '#aa-cb-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex-shrink:0;}',
    '#aa-cb-accept{background:#C5A355;color:#1a0a04;border:none;padding:10px 22px;font-size:0.78rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border-radius:3px;font-family:var(--font-sans,Inter,sans-serif);white-space:nowrap;transition:opacity 0.2s;}',
    '#aa-cb-accept:hover{opacity:0.88;}',
    '#aa-cb-reject{background:transparent;color:#C5A355;border:1px solid rgba(197,163,85,0.5);padding:10px 22px;font-size:0.78rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border-radius:3px;font-family:var(--font-sans,Inter,sans-serif);white-space:nowrap;transition:border-color 0.2s,color 0.2s;}',
    '#aa-cb-reject:hover{border-color:#C5A355;color:#e0c07a;}',
    '#aa-cb-pref{background:none;border:none;color:rgba(197,163,85,0.55);font-size:0.75rem;cursor:pointer;font-family:var(--font-sans,Inter,sans-serif);text-decoration:underline;padding:4px 0;white-space:nowrap;}',
    '#aa-cb-pref:hover{color:#C5A355;}',
    '@media(max-width:640px){#aa-cb-inner{flex-direction:column;align-items:flex-start;}#aa-cb-actions{width:100%;flex-direction:column;align-items:stretch;}#aa-cb-accept,#aa-cb-reject{text-align:center;}}'
  ].join('');
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'aa-cb';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = '<div id="aa-cb-inner">' +
    '<p id="aa-cb-text">AA WIGS uses cookies to improve your browsing experience, analyze website performance, and provide a more personalized experience. By continuing to browse, you agree to our use of cookies. <a href="/cookie-policy/">Learn more</a></p>' +
    '<div id="aa-cb-actions">' +
      '<button id="aa-cb-accept">Accept All</button>' +
      '<button id="aa-cb-reject">Reject Non-Essential</button>' +
      '<button id="aa-cb-pref" onclick="window.location.href=\'/cookie-policy/\'">Cookie Preferences</button>' +
    '</div>' +
  '</div>';
  document.body.appendChild(banner);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { banner.classList.add('aa-cb-in'); });
  });

  function dismiss(choice) {
    localStorage.setItem(KEY, choice);
    banner.classList.remove('aa-cb-in');
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 420);
  }

  document.getElementById('aa-cb-accept').addEventListener('click', function () { dismiss('all'); });
  document.getElementById('aa-cb-reject').addEventListener('click', function () { dismiss('essential'); });
}());

// ── Legal Footer Links ─────────────────────────────────────────────────
(function () {
  var fb = document.querySelector('.footer-bottom');
  if (!fb) return;
  var s = document.createElement('style');
  s.textContent = '.footer-legal{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;margin-bottom:14px;}.footer-legal a{color:rgba(255,255,255,0.38);font-size:0.72rem;text-decoration:none;letter-spacing:0.03em;transition:color 0.2s;}.footer-legal a:hover{color:#C5A355;}';
  document.head.appendChild(s);
  var row = document.createElement('div');
  row.className = 'footer-legal';
  row.innerHTML = '<a href="/privacy-policy/">Privacy Policy</a><a href="/cookie-policy/">Cookie Policy</a><a href="/terms/">Terms &amp; Conditions</a><a href="/returns/">Returns &amp; Exchanges</a>';
  fb.insertBefore(row, fb.firstChild);
}());