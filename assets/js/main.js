/* ============================================================
   TriTail合同会社 — main.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Header scroll effect ---- */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile hamburger menu ---- */
  const hamburger  = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      const next   = !isOpen;
      hamburger.setAttribute('aria-expanded', String(next));
      mobileNav.classList.toggle('is-open', next);
      document.body.style.overflow = next ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  function closeMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ---- Active nav link ---- */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---- Intersection Observer animations ---- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.anim').forEach(el => io.observe(el));
  } else {
    /* Fallback: show all without animation */
    document.querySelectorAll('.anim').forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Contact form ---- */
  initContactForm();
});

/* ================================================================
   Contact form — validation + Cloudflare Turnstile + fetch submit
   ================================================================ */
function initContactForm() {
  const formSection = document.getElementById('contactForm');
  if (!formSection) return;

  const form       = formSection.querySelector('form[data-contact]');
  const loadingEl  = formSection.querySelector('.form-loading');
  const successEl  = formSection.querySelector('.form-success');
  if (!form) return;

  /* Validation rules: field name → validator function */
  const RULES = {
    name:    v => v.trim().length >= 1,
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone:   v => !v.trim() || /^[\d\-\+\(\)\s]{10,}$/.test(v.trim()),
    message: v => v.trim().length >= 10,
  };

  const MSGS = {
    name:    'お名前を入力してください',
    email:   '正しいメールアドレスを入力してください',
    phone:   '正しい電話番号を入力してください（10桁以上）',
    message: 'お問い合わせ内容を入力してください（10文字以上）',
  };

  /* Helpers */
  function getInput(name)  { return form.querySelector(`[name="${name}"]`); }
  function getError(name)  { return form.querySelector(`[data-error="${name}"]`); }

  function markError(name, msg) {
    const inp = getInput(name);
    const err = getError(name);
    if (inp) inp.classList.add('is-error');
    if (err) { err.textContent = msg; err.classList.add('is-visible'); }
  }

  function clearError(name) {
    const inp = getInput(name);
    const err = getError(name);
    if (inp) inp.classList.remove('is-error');
    if (err) err.classList.remove('is-visible');
  }

  /* Real-time: clear error on input, validate on blur */
  Object.keys(RULES).forEach(name => {
    const inp = getInput(name);
    if (!inp) return;
    inp.addEventListener('input', () => clearError(name));
    inp.addEventListener('blur',  () => {
      if (!RULES[name](inp.value)) markError(name, MSGS[name]);
    });
  });

  /* Submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Validate all required fields */
    let valid = true;
    Object.entries(RULES).forEach(([name, fn]) => {
      const inp = getInput(name);
      if (!inp) return;
      if (!fn(inp.value)) { markError(name, MSGS[name]); valid = false; }
      else clearError(name);
    });
    if (!valid) {
      const firstErr = form.querySelector('.is-error');
      if (firstErr) firstErr.focus();
      return;
    }

    /* Turnstile */
    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (!turnstileInput || !turnstileInput.value) {
      showAlert('セキュリティ確認（ロボット認証）を完了してください。');
      return;
    }

    /* Collect data */
    const payload = {
      company:        (getInput('company')?.value  || '').trim(),
      name:           (getInput('name')?.value     || '').trim(),
      email:          (getInput('email')?.value    || '').trim(),
      phone:          (getInput('phone')?.value    || '').trim(),
      message:        (getInput('message')?.value  || '').trim(),
      turnstileToken: turnstileInput.value,
    };

    /* Show loading */
    form.style.display    = 'none';
    if (loadingEl) loadingEl.classList.add('is-visible');

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      if (loadingEl) loadingEl.classList.remove('is-visible');
      if (successEl) successEl.classList.add('is-visible');
      successEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      if (loadingEl) loadingEl.classList.remove('is-visible');
      form.style.display = '';
      showAlert('送信に失敗しました。しばらく経ってから再度お試しいただくか、直接メール（info@tritail.co.jp）にてご連絡ください。');
      console.error('[ContactForm]', err);
    }
  });
}

function showAlert(msg) {
  /* Accessible alert — replace with a custom modal if desired */
  alert(msg); // eslint-disable-line no-alert
}
