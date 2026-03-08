var Inventory = {
  data: {},
  loaded: false,

  getVariantKey: function(colorCode, length) {
    return 'body-wave-' + colorCode.toLowerCase() + '-' + length;
  },

  load: function(callback) {
    var self = this;
    fetch('/api/inventory')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          self.data = data.inventory;
          self.loaded = true;
        }
        if (callback) callback();
      })
      .catch(function(err) {
        console.error('Failed to load inventory:', err);
        if (callback) callback();
      });
  },

  getStock: function(colorCode, length) {
    var key = this.getVariantKey(colorCode, length);
    if (this.data[key]) {
      return this.data[key].stock;
    }
    return -1;
  },

  getStatus: function(colorCode, length) {
    var stock = this.getStock(colorCode, length);
    if (stock === -1) return { status: 'unknown', stock: -1, label: '', className: '' };
    if (stock === 0) return { status: 'sold-out', stock: 0, label: 'Sold Out', className: 'stock-sold-out' };
    if (stock <= 5) return { status: 'low', stock: stock, label: 'Low Stock \u2013 Only ' + stock + ' left', className: 'stock-low' };
    return { status: 'in-stock', stock: stock, label: 'In Stock', className: 'stock-in' };
  },

  updateProductPage: function(colorCode, length) {
    var info = this.getStatus(colorCode, length);

    var badge = document.getElementById('stockBadge');
    var addBtn = document.getElementById('addToCartBtn');
    var mobileBtn = document.getElementById('addToCartMobile');
    var buyNowContainer = document.querySelector('.product-actions');

    if (badge) {
      badge.textContent = info.label;
      badge.className = 'stock-badge ' + info.className;
      badge.style.display = info.label ? '' : 'none';
    }

    if (info.status === 'sold-out') {
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.textContent = 'Sold Out';
        addBtn.classList.add('btn-disabled');
      }
      if (mobileBtn) {
        mobileBtn.disabled = true;
        mobileBtn.textContent = 'Sold Out';
        mobileBtn.classList.add('btn-disabled');
      }
    } else {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Bag';
        addBtn.classList.remove('btn-disabled');
      }
      if (mobileBtn) {
        mobileBtn.disabled = false;
        mobileBtn.textContent = 'Add to Bag';
        mobileBtn.classList.remove('btn-disabled');
      }
    }
  },

  decrease: function(colorCode, length, callback) {
    var key = this.getVariantKey(colorCode, length);
    var self = this;
    fetch('/api/inventory/decrease', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantKey: key })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success && self.data[key]) {
        self.data[key].stock = data.variant.stock;
      }
      if (callback) callback(data);
    })
    .catch(function(err) {
      console.error('Stock decrease failed:', err);
      if (callback) callback({ success: false });
    });
  }
};
