/**
 * EPIC Party Hire — no-framework browser interactions.
 * Keeps the website fast, portable, and easy to edit in Cursor.
 */

'use strict';

const EMAIL = 'melbourne@epicpartyhire.com.au';
const nav = document.getElementById('primary-nav');
const menuToggle = document.querySelector('.menu-toggle');

function closeMenu() {
  nav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open menu');
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  nav?.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
    closeMenu();
    menuToggle?.focus();
  }
});
// Close mobile navigation after tapping elsewhere.
document.addEventListener('click', (e) => {
  if (nav?.classList.contains('is-open') && !nav.contains(e.target) && !menuToggle?.contains(e.target)) closeMenu();
});

// Package carousel scroll buttons; touch / trackpad swipes work natively.
const rail = document.getElementById('package-rail');
for (const [id, direction] of [['prev-package', -1], ['next-package', 1]]) {
  document.getElementById(id)?.addEventListener('click', () => {
    const card = rail?.querySelector('.deal-card');
    if (!rail || !card) return;
    rail.scrollBy({
      left: (card.getBoundingClientRect().width + 22) * direction,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
}

const hireSelect = document.getElementById('event-item');
function preselectProduct(item) {
  if (!hireSelect || !item) return;
  const match = [...hireSelect.options].find((o) => o.value === item || o.textContent.trim() === item);
  hireSelect.value = match?.value ?? 'Something else / not sure yet';
}

// "Order & pay" on a package remembers the package so the order form is prefilled.
document.querySelectorAll('.order-link').forEach((link) => {
  link.addEventListener('click', () => preselectProduct(link.dataset.item));
});

// Copy bank transfer details to the clipboard.
document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', async () => {
    const field = button.parentElement?.querySelector('.bank-value');
    const value = (field?.dataset.copy || field?.textContent || '').trim();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'COPIED';
    } catch {
      button.textContent = 'COPY FAILED';
    }
    setTimeout(() => { button.textContent = 'COPY'; }, 1800);
  });
});

document.querySelectorAll('.enquire-link, .choose-deal').forEach((link) => {
  link.addEventListener('click', () => {
    preselectProduct(link.dataset.item);
    if (link.matches('button')) {
      document.getElementById('contact')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  });
});

const form = document.getElementById('event-form');
const errorBox = document.getElementById('form-error');
const statusBox = document.getElementById('form-status');
const submitButton = form?.querySelector('button[type="submit"]');

// Time the form was shown; the server rejects submissions completed implausibly fast (bots).
const formStartedAt = Date.now();

const getValue = (name) => form?.elements.namedItem(name)?.value?.trim() ?? '';

function setStatus(message, isError = false, fallbackHref = null) {
  if (!statusBox) return;
  statusBox.replaceChildren(document.createTextNode(message));
  statusBox.hidden = false;
  statusBox.dataset.state = isError ? 'error' : 'success';
  if (fallbackHref) {
    statusBox.append(document.createTextNode(' '));
    const link = document.createElement('a');
    link.href = fallbackHref;
    link.textContent = 'Open my email app instead ↗';
    statusBox.append(link);
  }
}

function makeMailto(details) {
  const subject = `EPIC Party Hire enquiry — ${details.item || 'New event'}`;
  const body = [
    'Hi EPIC Party Hire crew,', '',
    'I would like to enquire about an event:', '',
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone || 'Not supplied'}`,
    `Event date: ${details.date || 'Not supplied'}`,
    `Event type: ${details.eventType || 'Not supplied'}`,
    `Event suburb: ${details.suburb || 'Not supplied'}`,
    `Hire / package: ${details.item || 'Not sure yet'}`,
    `Notes: ${details.notes || 'None'}`, '',
    'Could you please confirm availability, inclusions, delivery and final pricing?', '',
    'Thanks!',
  ].join('\n');
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nameInput = document.getElementById('customer-name');
  const emailInput = document.getElementById('customer-email');
  const details = {
    name: getValue('name'),
    email: getValue('email'),
    phone: getValue('phone'),
    date: getValue('date'),
    eventType: getValue('eventType'),
    suburb: getValue('suburb'),
    item: getValue('item'),
    notes: getValue('notes'),
    website: getValue('website'), // spam trap; should stay blank
  };
  const payload = { ...details, startedAt: formStartedAt };

  if (errorBox) errorBox.hidden = true;
  if (statusBox) statusBox.hidden = true;
  const firstInvalid = !details.name ? nameInput : (!details.email || !emailInput.checkValidity() ? emailInput : null);
  if (firstInvalid) {
    if (errorBox) errorBox.hidden = false;
    firstInvalid.focus();
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.firstChild.textContent = 'SENDING ENQUIRY ';
  }

  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('Email delivery is not configured or is temporarily unavailable.');
    setStatus('Thanks! Your enquiry has been sent to the EPIC Party Hire team. This is not a confirmed booking.');
    form.reset();
  } catch {
    setStatus(
      'Your enquiry was not sent automatically. You can send it directly from your email app:',
      true,
      makeMailto(details),
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.firstChild.textContent = 'SEND EVENT ENQUIRY ';
    }
  }
});

// Current year and date picker: avoid accidental requests for past dates.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
const date = document.getElementById('event-date');
if (date) {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  date.min = localDate;
}

// Product prices rail arrows (any button with data-rail / data-dir).
document.querySelectorAll('[data-rail]').forEach((button) => {
  button.addEventListener('click', () => {
    const track = document.getElementById(button.dataset.rail);
    const card = track?.querySelector('.deal-card');
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 22;
    track.scrollBy({
      left: (card.getBoundingClientRect().width + gap) * Number(button.dataset.dir || 1),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
});

// Product pop-up: big flyer + prices + inclusions. Full-size flyer only loads when opened.
const productModal = document.getElementById('product-modal');
if (productModal && typeof productModal.showModal === 'function') {
  const media = productModal.querySelector('.product-modal__media');
  const content = productModal.querySelector('.product-modal__content');
  const enquire = productModal.querySelector('.product-modal__enquire');
  let lastTrigger = null;

  const openProduct = (card, trigger) => {
    const more = card.querySelector('.product-card__more');
    if (!more) return;
    const clone = more.cloneNode(true);
    const img = clone.querySelector('img');
    if (img) {
      // Show the already-loaded card preview instantly, then swap in the sharp full flyer once it arrives.
      const full = img.dataset.src;
      img.removeAttribute('data-src');
      const preview = card.querySelector('.deal-card__image img');
      if (preview) preview.loading = 'eager';
      img.src = preview?.currentSrc || preview?.src || full;
      if (full && !img.src.endsWith(full)) {
        const hiRes = new Image();
        hiRes.decoding = 'async';
        hiRes.onload = () => { if (img.isConnected) img.src = full; };
        hiRes.src = full;
      }
    }
    const meta = clone.querySelector('.product-modal__item');
    enquire.dataset.item = meta?.dataset.item || '';
    const label = productModal.querySelector('.product-modal__book-label');
    if (label) label.textContent = meta?.dataset.kind === 'package' ? 'BOOK THIS PACKAGE' : 'BOOK THIS ITEM';
    const title = clone.querySelector('h3');
    if (title) title.id = 'product-modal-title';
    media.replaceChildren(...(img ? [img] : []));
    content.replaceChildren(...[...clone.childNodes].filter((n) => n !== img));
    lastTrigger = trigger;
    productModal.showModal();
    document.documentElement.classList.add('modal-open');
    productModal.querySelector('.product-modal__inner').scrollTop = 0;
  };

  document.querySelectorAll('.product-card').forEach((card) => {
    card.querySelectorAll('.product-card__open, .product-card__details-btn').forEach((btn) => {
      btn.addEventListener('click', () => openProduct(card, btn));
    });
  });

  const openById = (id, trigger) => {
    const card = document.querySelector(`.product-card[data-product="${id}"]`);
    if (card) openProduct(card, trigger);
  };
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openById(btn.dataset.open, btn));
  });
  document.querySelectorAll('.category-card--clickable').forEach((tile) => {
    const btn = tile.querySelector('[data-open]');
    tile.addEventListener('click', (e) => { if (btn && !e.target.closest('button,a')) openById(btn.dataset.open, btn); });
  });

  const closeProduct = () => productModal.close();
  productModal.querySelector('.product-modal__close')?.addEventListener('click', closeProduct);
  // Tap outside the panel closes it.
  productModal.addEventListener('click', (e) => { if (e.target === productModal) closeProduct(); });
  productModal.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    lastTrigger?.focus({ preventScroll: true });
  });
  productModal.querySelector('.product-modal__pay')?.addEventListener('click', () => {
    preselectProduct(enquire.dataset.item);
    closeProduct();
  });
  enquire.addEventListener('click', () => {
    preselectProduct(enquire.dataset.item);
    closeProduct();
  });
}
