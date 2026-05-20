/* NexusKey Theme — Vanilla JS, no dependencies */
'use strict';

/* ---- Mobile Menu ---- */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

/* ---- Cart Notification ---- */
function showCartNotification(message) {
  const el = document.getElementById('cart-notification');
  if (!el) return;
  el.querySelector('.cart-notification__message').textContent = message;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

/* ---- Cart Count Update ---- */
async function updateCartCount() {
  try {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = cart.item_count;
      el.dataset.count = cart.item_count;
    });
  } catch(e) {}
}

/* ---- Add to Cart (AJAX) ---- */
document.addEventListener('submit', async (e) => {
  const form = e.target.closest('[data-atc-form]');
  if (!form) return;
  e.preventDefault();

  const btn = form.querySelector('[data-atc-btn]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Se adauga...';

  try {
    const formData = new FormData(form);
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: formData
    });

    if (res.ok) {
      const item = await res.json();
      await updateCartCount();
      showCartNotification(`"${item.product_title}" a fost adaugat in cos!`);
      btn.textContent = 'Adaugat ✓';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    } else {
      throw new Error('Failed');
    }
  } catch(err) {
    btn.textContent = 'Eroare — incearca din nou';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = originalText; }, 3000);
  }
});

/* ---- Cart Item Remove ---- */
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-remove-item]');
  if (!btn) return;
  const line = btn.dataset.removeItem;
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ line, quantity: 0 })
    });
    window.location.reload();
  } catch(e) {}
});

/* ---- Product Tabs ---- */
document.querySelectorAll('.product-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.tab;
    document.querySelectorAll('.product-tab-btn').forEach(b => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });
    document.querySelectorAll('.product-tab-panel').forEach(p => {
      p.classList.toggle('is-active', p.id === panel);
    });
  });
});

/* ---- Sticky header shadow ---- */
const header = document.querySelector('.site-header');
if (header) {
  const observer = new IntersectionObserver(
    ([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting),
    { threshold: 0, rootMargin: `-${header.offsetHeight}px 0px 0px 0px` }
  );
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  observer.observe(sentinel);
}

/* ---- Collection Sort ---- */
const sortSelect = document.querySelector('[data-collection-sort]');
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', sortSelect.value);
    window.location.href = url.toString();
  });
}

/* ---- Init cart count on load ---- */
updateCartCount();
