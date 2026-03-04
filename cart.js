const Cart = {
  items: [],

  init() {
    this.items = JSON.parse(localStorage.getItem('aa_cart') || '[]');
    this.injectCartHTML();
    this.bindEvents();
    this.updateBadge();
    this.render();
  },

  save() {
    localStorage.setItem('aa_cart', JSON.stringify(this.items));
  },

  addItem(product) {
    const itemKey = (product.shade || '') + '|' + (product.length || '');
    const existing = this.items.find(i => this.getItemKey(i) === itemKey);
    if (existing) {
      existing.qty += 1;
      existing.price = product.price;
      existing.stripeUrl = product.stripeUrl || existing.stripeUrl;
    } else {
      this.items.push({
        name: product.name,
        shade: product.shade,
        length: product.length || '',
        price: product.price,
        stripeUrl: product.stripeUrl || '',
        qty: 1
      });
    }
    this.save();
    this.updateBadge();
    this.render();
    this.open();
    this.showConfirmation();
  },

  getItemKey(item) {
    return (item.shade || '') + '|' + (item.length || '');
  },

  removeItem(key) {
    this.items = this.items.filter(i => this.getItemKey(i) !== key);
    this.save();
    this.updateBadge();
    this.render();
  },

  updateQty(key, delta) {
    const item = this.items.find(i => this.getItemKey(i) === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(key);
      return;
    }
    this.save();
    this.updateBadge();
    this.render();
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0).toFixed(2);
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  open() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    if (panel && overlay) {
      panel.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  close() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    if (panel && overlay) {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  showConfirmation() {
    const toast = document.getElementById('cartToast');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  },

  render() {
    const body = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    if (!body || !footer) return;

    if (this.items.length === 0) {
      body.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">\u2662</div><p>Your bag is empty</p><a href="/products/22-swiss-hd-body-wave/" class="btn btn-solid">Shop The Crown</a></div>';
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    let html = '';
    this.items.forEach(item => {
      const key = this.getItemKey(item);
      const lengthInfo = item.length ? ' \u00b7 ' + item.length : '';
      const unitPrice = parseFloat(item.price) || 0;
      const lineTotal = (unitPrice * item.qty).toFixed(2);
      html += '<div class="cart-item">' +
        '<div class="cart-item-info">' +
          '<h4>' + item.name + '</h4>' +
          '<p class="cart-item-shade">' + item.shade + lengthInfo + '</p>' +
          '<p class="cart-item-price">$' + unitPrice.toFixed(2) + (item.qty > 1 ? ' \u00d7 ' + item.qty + ' = $' + lineTotal : '') + '</p>' +
        '</div>' +
        '<div class="cart-item-controls">' +
          '<div class="qty-control">' +
            '<button class="qty-btn" data-key="' + key + '" data-delta="-1" aria-label="Decrease quantity">\u2212</button>' +
            '<span class="qty-value">' + item.qty + '</span>' +
            '<button class="qty-btn" data-key="' + key + '" data-delta="1" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button class="cart-remove" data-key="' + key + '" aria-label="Remove item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    });
    body.innerHTML = html;

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '$' + this.getTotal();

    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      if (this.items.length === 1) {
        const item = this.items[0];
        const url = item.stripeUrl || '';
        if (url) {
          checkoutBtn.href = url;
          checkoutBtn.textContent = 'Checkout \u2014 $' + this.getTotal();
        } else {
          checkoutBtn.href = '/products/22-swiss-hd-body-wave/';
          checkoutBtn.textContent = 'Checkout \u2014 $' + this.getTotal();
        }
        checkoutBtn.classList.remove('cart-checkout-multi');
      } else {
        checkoutBtn.removeAttribute('href');
        checkoutBtn.textContent = 'Checkout \u2014 $' + this.getTotal();
        checkoutBtn.classList.add('cart-checkout-multi');
      }
    }

    if (this.items.length > 1) {
      let itemBtns = '';
      this.items.forEach(item => {
        const key = this.getItemKey(item);
        const label = item.shade + (item.length ? ' \u00b7 ' + item.length : '');
        if (item.stripeUrl) {
          itemBtns += '<a href="' + item.stripeUrl + '" class="cart-item-checkout" data-key="' + key + '">Buy ' + label + ' \u2014 $' + ((parseFloat(item.price) || 0) * item.qty).toFixed(2) + '</a>';
        }
      });
      if (itemBtns) {
        const multiNote = '<div class="cart-multi-checkout">' +
          '<p class="cart-multi-note">Checkout each item separately:</p>' +
          itemBtns +
        '</div>';
        const existingMulti = footer.querySelector('.cart-multi-checkout');
        if (existingMulti) existingMulti.remove();
        checkoutBtn.insertAdjacentHTML('afterend', multiNote);
      }
    } else {
      const existingMulti = footer.querySelector('.cart-multi-checkout');
      if (existingMulti) existingMulti.remove();
    }

    body.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const delta = parseInt(btn.getAttribute('data-delta'));
        Cart.updateQty(key, delta);
      });
    });

    body.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.removeItem(btn.getAttribute('data-key'));
      });
    });
  },

  injectCartHTML() {
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'cartPanel';
    panel.className = 'cart-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Shopping bag');
    panel.innerHTML =
      '<div class="cart-header">' +
        '<h3>Your Bag</h3>' +
        '<button class="cart-close" id="cartCloseBtn" aria-label="Close bag">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="cart-body" id="cartBody"></div>' +
      '<div class="cart-footer" id="cartFooter" style="display:none;">' +
        '<div class="cart-subtotal">' +
          '<span>Subtotal</span>' +
          '<span id="cartTotal">$0</span>' +
        '</div>' +
        '<p class="cart-shipping-note">Shipping calculated at checkout</p>' +
        '<a id="cartCheckoutBtn" class="btn btn-solid cart-checkout-btn">Checkout</a>' +
        '<a href="/products/22-swiss-hd-body-wave/" class="cart-continue">Continue Shopping</a>' +
      '</div>';
    document.body.appendChild(panel);

    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    toast.innerHTML = '<span>\u2713</span> Added to bag';
    document.body.appendChild(toast);
  },

  bindEvents() {
    document.querySelectorAll('.cart-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Cart.open();
      });
    });

    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => Cart.close());

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', () => Cart.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Cart.close();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
