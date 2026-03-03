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