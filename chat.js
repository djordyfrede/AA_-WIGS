var AAChat = {
  isOpen: false,
  hasGreeted: false,

  knowledge: {
    product: {
      name: 'AA Signature Body Wave',
      type: '13x6 Swiss HD Lace Frontal Wig',
      hair: '100% Virgin Human Hair',
      density: '180%',
      lengths: ['18"', '20"', '22"', '24"', '26"'],
      colors: ['1B Natural Black', 'Soft Black', 'Chocolate Brown', 'Honey Highlight', 'Burgundy Wine', 'Platinum Blonde'],
      features: ['Glueless adjustable band', 'Pre-plucked hairline', 'Heat safe up to 392F', 'Swiss HD lace'],
      priceRange: '$289 - $479',
      defaultPrice: '$379',
      url: '/products/22-swiss-hd-body-wave/'
    },
    shipping: {
      method: 'Free standard U.S. shipping',
      processing: '1-3 business days',
      delivery: '3-7 business days',
      tracking: 'Yes, tracking number sent via email',
      international: 'U.S. only at this time'
    },
    returns: {
      window: '14 days from delivery',
      conditions: ['Item must be unworn', 'Lace must not be cut', 'No alterations', 'Original packaging required'],
      refundTime: '5-7 business days after approval'
    },
    packaging: {
      box: 'Luxury magnetic burgundy box with gold foil logo',
      interior: 'Champagne satin lining',
      includes: ['Care guide card', 'Thank-you / confidence card', 'Protective satin storage bag']
    }
  },

  patterns: [
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'whats up'],
      response: function() {
        return "Hello! Welcome to AA Wigs. I'm here to help you find your perfect luxury wig. How can I assist you today?";
      },
      followUps: ['What wigs do you sell?', 'Pricing info', 'Shipping details']
    },
    {
      keywords: ['price', 'cost', 'how much', 'pricing', 'expensive', 'cheap', 'afford', 'dollar', '$'],
      response: function(k) {
        return 'Our AA Signature Body Wave ranges from <strong>' + k.product.priceRange + '</strong> depending on length and color. The most popular option (22", 1B Natural Black) is <strong>' + k.product.defaultPrice + '</strong>. Free U.S. shipping included!';
      },
      followUps: ['Available lengths', 'Color options', 'Shop now']
    },
    {
      keywords: ['length', 'long', 'short', 'inch', 'inches', '18', '20', '22', '24', '26', 'size'],
      response: function(k) {
        return 'We offer five lengths: <strong>' + k.product.lengths.join(', ') + '</strong>.<br><br>Our most popular is 22" - it falls around mid-back and works beautifully for most face shapes. Shorter lengths (18"-20") are perfect for everyday wear, while 24"-26" give a dramatic, glamorous look.';
      },
      followUps: ['Pricing info', 'Best for beginners?', 'Shop now']
    },
    {
      keywords: ['color', 'shade', 'black', 'brown', 'blonde', 'burgundy', 'honey', '1b', '613', '99j', 'natural', 'platinum', 'chocolate', 'soft'],
      response: function() {
        return 'We offer six beautiful shades:<br><br><strong>1B Natural Black</strong> - bestseller, available now<br><strong>Soft Black</strong><br><strong>Chocolate Brown</strong><br><strong>Honey Highlight</strong><br><strong>Burgundy Wine</strong><br><strong>Platinum Blonde</strong><br><br>1B Natural Black is available for immediate purchase. Other shades can be reserved through our waitlist.';
      },
      followUps: ['Join the waitlist', 'Pricing info', 'Shop now']
    },
    {
      keywords: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'long to get', 'when will', 'tracking', 'track'],
      response: function(k) {
        return 'We offer <strong>free standard shipping</strong> on all U.S. orders!<br><br><strong>Processing:</strong> ' + k.shipping.processing + '<br><strong>Delivery:</strong> ' + k.shipping.delivery + '<br><strong>Tracking:</strong> ' + k.shipping.tracking + '<br><br>We currently ship within the U.S. only.';
      },
      followUps: ['International shipping?', 'Return policy', 'Shop now']
    },
    {
      keywords: ['return', 'refund', 'exchange', 'send back', 'money back', 'not satisfied', 'wrong'],
      response: function(k) {
        return 'We accept returns within <strong>' + k.returns.window + '</strong>. Requirements:<br><br>' + k.returns.conditions.map(function(c) { return '&bull; ' + c; }).join('<br>') + '<br><br>Approved refunds are processed within <strong>' + k.returns.refundTime + '</strong>. Email <strong>hello@aawigs.com</strong> to start a return.';
      },
      followUps: ['Contact us', 'Shipping details', 'Shop now']
    },
    {
      keywords: ['glueless', 'glue', 'adhesive', 'tape', 'install', 'put on', 'wear', 'apply', 'application'],
      response: function() {
        return 'Our wig is <strong>100% glueless</strong>! It features an adjustable band and combs inside for a secure, comfortable fit - no adhesive needed. Simply place it on your head, adjust the straps, and go. The Swiss HD lace melts seamlessly into your skin for a natural, undetectable hairline.';
      },
      followUps: ['Beginner friendly?', 'What is HD lace?', 'Shop now']
    },
    {
      keywords: ['hd lace', 'lace', 'swiss', 'hairline', 'natural look', 'undetectable', 'invisible', 'melt'],
      response: function() {
        return 'We use <strong>Swiss HD (High Definition) lace</strong> - an ultra-thin, sheer material that blends into any skin tone. The 13x6 lace frontal provides a wide parting space for versatile styling. The lace virtually disappears against your scalp, creating the illusion that hair is growing directly from your head.';
      },
      followUps: ['Is it pre-plucked?', 'Is it glueless?', 'Shop now']
    },
    {
      keywords: ['care', 'wash', 'maintain', 'shampoo', 'conditioner', 'style', 'heat', 'curl', 'straighten', 'store', 'storage', 'last', 'lifespan', 'how long', 'durable'],
      response: function() {
        return 'With proper care, our wigs last <strong>12-18 months or longer</strong>. Key tips:<br><br>&bull; Wash every 7-10 wears with sulfate-free shampoo<br>&bull; Deep condition regularly<br>&bull; Heat protectant before styling (safe up to 392F)<br>&bull; Store on a wig stand or in the included satin bag<br>&bull; Detangle gently from ends to roots<br><br>A care guide card is included with every order!';
      },
      followUps: ['Full care guide', 'What comes in the box?', 'Shop now']
    },
    {
      keywords: ['package', 'packaging', 'box', 'unbox', 'include', 'come with', "what's in", 'whats in', 'gift'],
      response: function(k) {
        return 'Every order arrives in a <strong>luxury magnetic burgundy box</strong> with gold foil logo. Inside:<br><br>&bull; Champagne satin lining<br>&bull; ' + k.packaging.includes.join('<br>&bull; ') + '<br><br>Many customers say it feels like opening a gift!';
      },
      followUps: ['Pricing info', 'Shipping details', 'Shop now']
    },
    {
      keywords: ['density', '180', 'thick', 'thin', 'full', 'volume', 'natural density'],
      response: function() {
        return 'Our wigs feature <strong>180% density</strong> - full and voluminous while still looking natural. This density strikes the ideal balance: not too thin (which can look flat) and not too thick (which can look unnatural). Perfect for everyday confidence.';
      },
      followUps: ['Hair type?', 'Available lengths', 'Shop now']
    },
    {
      keywords: ['hair type', 'virgin', 'human hair', 'real hair', 'synthetic', 'quality', 'material', 'body wave', 'texture', 'pattern'],
      response: function() {
        return 'Our wigs use <strong>100% virgin human hair</strong> in a body wave pattern:<br><br>&bull; Never chemically processed<br>&bull; Can be colored, bleached, and heat styled<br>&bull; Moves naturally with gorgeous bounce<br>&bull; Soft, tangle-resistant, long-lasting<br><br>Body wave is our most versatile texture - stunning both straight and curly.';
      },
      followUps: ['Can I color it?', 'How long does it last?', 'Shop now']
    },
    {
      keywords: ['beginner', 'first wig', 'first time', 'new to wigs', 'never worn', 'recommend', 'suggestion', 'best', 'popular'],
      response: function(k) {
        return 'Welcome! For first-time buyers, we recommend:<br><br><strong>Length:</strong> 22" - the perfect middle ground<br><strong>Color:</strong> 1B Natural Black - our bestseller<br><strong>Price:</strong> ' + k.product.defaultPrice + '<br><br>It\'s glueless with an adjustable band, making it incredibly beginner-friendly. No salon visit needed - install it yourself in minutes!';
      },
      followUps: ['Is it glueless?', 'What comes in the box?', 'Shop now']
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'speak', 'customer service', 'support', 'help me'],
      response: function() {
        return 'We\'d love to help! Reach us at:<br><br><strong>Email:</strong> hello@aawigs.com<br><strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank">@aawigshair</a><br><strong>Contact form:</strong> <a href="/contact.html">Contact page</a><br><br>We respond within 24 hours. For the fastest reply, DM us on Instagram!';
      },
      followUps: ['Return policy', 'Order status', 'Shop now']
    },
    {
      keywords: ['payment', 'pay', 'checkout', 'stripe', 'credit card', 'debit', 'secure', 'safe'],
      response: function() {
        return 'We use <strong>Stripe</strong> for all payments - one of the most trusted processors in the world. Your payment info is fully encrypted and secure. We accept all major credit/debit cards, Apple Pay, and Google Pay.';
      },
      followUps: ['Shipping details', 'Return policy', 'Shop now']
    },
    {
      keywords: ['waitlist', 'notify', 'restock', 'back in stock', 'sold out', 'available', 'when available'],
      response: function() {
        return 'Some shades sell out fast! If your preferred shade isn\'t available, <a href="/waitlist.html">join our waitlist</a> and we\'ll notify you by email the moment it\'s back. Takes just a few seconds!';
      },
      followUps: ['Color options', 'Available shades', 'Shop now']
    },
    {
      keywords: ['pre-plucked', 'preplucked', 'plucked', 'baby hair', 'natural hairline'],
      response: function() {
        return 'Yes! Our wig comes <strong>pre-plucked</strong> with a natural hairline right out of the box. Baby hairs are already customized to mimic a real hairline. No plucking, no cutting - just place it on and go. The 13x6 Swiss HD lace ensures a completely seamless transition.';
      },
      followUps: ['Is it glueless?', 'What is HD lace?', 'Shop now']
    },
    {
      keywords: ['order', 'where is my', 'track my', 'status', 'shipped', 'processing'],
      response: function() {
        return 'If you\'ve placed an order, you should have received a confirmation email. Once shipped (within 1-3 business days), you\'ll get a tracking number via email. No update yet? Email us at <strong>hello@aawigs.com</strong> with your order number and we\'ll check right away!';
      },
      followUps: ['Shipping details', 'Contact us', 'Shop now']
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'awesome', 'perfect', 'wonderful'],
      response: function() {
        return "You're welcome! If you have any other questions, I'm always here. We hope to be part of your confidence journey!";
      },
      followUps: ['Shop now', 'Contact us']
    },
    {
      keywords: ['international', 'outside us', 'canada', 'uk', 'europe', 'africa', 'asia', 'nigeria', 'abroad'],
      response: function() {
        return 'We currently ship within the <strong>United States only</strong>. International shipping is coming soon! <a href="/waitlist.html">Join our waitlist</a> to be notified when international shipping launches.';
      },
      followUps: ['U.S. shipping details', 'Join the waitlist', 'Shop now']
    }
  ],

  findResponse: function(message) {
    var msg = message.toLowerCase().trim();
    var bestMatch = null;
    var bestScore = 0;

    for (var i = 0; i < this.patterns.length; i++) {
      var pattern = this.patterns[i];
      var score = 0;
      for (var j = 0; j < pattern.keywords.length; j++) {
        if (msg.indexOf(pattern.keywords[j].toLowerCase()) !== -1) {
          score += pattern.keywords[j].length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    if (bestMatch && bestScore > 0) {
      return {
        text: bestMatch.response(this.knowledge),
        followUps: bestMatch.followUps || []
      };
    }

    return {
      text: "I'd be happy to help with information about our wigs, pricing, shipping, returns, or care. You can also reach our team directly at <strong>hello@aawigs.com</strong>. What would you like to know?",
      followUps: ['What wigs do you sell?', 'Pricing info', 'Shipping details', 'Shop now']
    };
  },

  logoPath: '/assets/aa-logo.png',

  init: function() {
    this.injectHTML();
    this.bindEvents();
  },

  injectHTML: function() {
    var widget = document.createElement('div');
    widget.id = 'aaChatWidget';
    widget.innerHTML =
      '<button class="chat-fab" id="chatFab" aria-label="Chat with AA Wigs">' +
        '<img class="chat-fab-logo" src="' + this.logoPath + '" alt="AA Wigs" width="60" height="60">' +
        '<svg class="chat-fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '<span class="chat-fab-badge">1</span>' +
      '</button>' +

      '<div class="chat-window" id="chatWindow">' +

        '<div class="chat-header">' +
          '<div class="chat-header-left">' +
            '<button class="chat-back-btn" id="chatBackBtn" aria-label="Close chat">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>' +
            '</button>' +
            '<img class="chat-header-logo" src="' + this.logoPath + '" alt="AA Wigs" width="44" height="44">' +
            '<div class="chat-header-text">' +
              '<span class="chat-header-name">AA Wigs</span>' +
              '<span class="chat-header-status"><span class="chat-status-dot"></span>Typically replies instantly</span>' +
            '</div>' +
          '</div>' +
          '<button class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +

        '<div class="chat-body" id="chatBody">' +
          '<div class="chat-welcome">' +
            '<img class="chat-welcome-logo" src="' + this.logoPath + '" alt="AA Wigs" width="64" height="64">' +
            '<h3 class="chat-welcome-title">AA Wigs</h3>' +
            '<p class="chat-welcome-sub">Where Luxury Meets Confidence</p>' +
          '</div>' +
        '</div>' +

        '<div class="chat-footer">' +
          '<div class="chat-input-wrap">' +
            '<input type="text" class="chat-input" id="chatInput" placeholder="Type your message..." autocomplete="off">' +
            '<button class="chat-send" id="chatSend" aria-label="Send">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="chat-powered">Powered by AA Wigs</div>' +
        '</div>' +

      '</div>';

    document.body.appendChild(widget);
  },

  bindEvents: function() {
    var self = this;
    document.getElementById('chatFab').addEventListener('click', function() { self.toggle(); });
    document.getElementById('chatCloseBtn').addEventListener('click', function() { self.close(); });
    document.getElementById('chatBackBtn').addEventListener('click', function() { self.close(); });
    document.getElementById('chatSend').addEventListener('click', function() { self.sendMessage(); });
    document.getElementById('chatInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') self.sendMessage();
    });
  },

  toggle: function() {
    this.isOpen ? this.close() : this.open();
  },

  open: function() {
    this.isOpen = true;
    var widget = document.getElementById('aaChatWidget');
    widget.classList.add('chat-open');
    var badge = widget.querySelector('.chat-fab-badge');
    if (badge) badge.style.display = 'none';
    document.body.classList.add('chat-body-lock');

    var self = this;
    setTimeout(function() {
      document.getElementById('chatInput').focus();
    }, 350);

    if (!this.hasGreeted) {
      this.hasGreeted = true;
      setTimeout(function() {
        var welcome = document.querySelector('.chat-welcome');
        if (welcome) welcome.style.display = 'none';
        self.addBotMessage("Hi! Welcome to <strong>AA Wigs</strong>. I'm here to help you find your perfect luxury human hair wig. What can I help you with?", ['What wigs do you sell?', 'Pricing info', 'Color options', 'Shipping details']);
      }, 500);
    }
  },

  close: function() {
    this.isOpen = false;
    document.getElementById('aaChatWidget').classList.remove('chat-open');
    document.body.classList.remove('chat-body-lock');
  },

  sendMessage: function() {
    var input = document.getElementById('chatInput');
    var msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    this.addUserMessage(msg);

    var lower = msg.toLowerCase();

    var quickActions = {
      'shop now': { text: 'Let me take you to our signature collection!<br><br><a href="' + this.knowledge.product.url + '" class="chat-cta-link">Shop the Signature Body Wave</a>', followUps: [] },
      'shop': { text: 'Let me take you to our signature collection!<br><br><a href="' + this.knowledge.product.url + '" class="chat-cta-link">Shop the Signature Body Wave</a>', followUps: [] },
      'buy now': { text: 'Let me take you to our signature collection!<br><br><a href="' + this.knowledge.product.url + '" class="chat-cta-link">Shop the Signature Body Wave</a>', followUps: [] },
      'buy': { text: 'Let me take you to our signature collection!<br><br><a href="' + this.knowledge.product.url + '" class="chat-cta-link">Shop the Signature Body Wave</a>', followUps: [] },
      'join the waitlist': { text: 'Join our waitlist to be notified when your preferred shade returns!<br><br><a href="/waitlist.html" class="chat-cta-link">Join the Waitlist</a>', followUps: [] },
      'waitlist': { text: 'Join our waitlist to be notified when your preferred shade returns!<br><br><a href="/waitlist.html" class="chat-cta-link">Join the Waitlist</a>', followUps: [] },
      'full care guide': { text: 'Here\'s our complete care guide:<br><br><a href="/care.html" class="chat-cta-link">View Care Guide</a>', followUps: [] },
      'contact us': { text: 'You can reach our team here:<br><br><a href="/contact.html" class="chat-cta-link">Contact Us</a>', followUps: [] },
      'contact support': { text: 'You can reach our team here:<br><br><a href="/contact.html" class="chat-cta-link">Contact Us</a>', followUps: [] }
    };

    if (quickActions[lower]) {
      var action = quickActions[lower];
      this.addBotMessage(action.text, action.followUps);
      return;
    }

    var self = this;
    this.showTyping();
    var delay = 500 + Math.random() * 700;
    setTimeout(function() {
      self.hideTyping();
      var result = self.findResponse(msg);
      self.addBotMessage(result.text, result.followUps);
    }, delay);
  },

  addUserMessage: function(text) {
    var body = document.getElementById('chatBody');
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg-user';
    div.innerHTML = '<div class="chat-bubble chat-bubble-user">' + this.escapeHtml(text) + '</div>';
    body.appendChild(div);
    this.scrollToBottom();
  },

  addBotMessage: function(html, followUps) {
    var body = document.getElementById('chatBody');
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';

    var content =
      '<div class="chat-msg-row">' +
        '<img class="chat-msg-avatar" src="' + this.logoPath + '" alt="" width="32" height="32">' +
        '<div class="chat-bubble chat-bubble-bot">' + html + '</div>' +
      '</div>';

    if (followUps && followUps.length > 0) {
      content += '<div class="chat-quick-replies">';
      for (var i = 0; i < followUps.length; i++) {
        content += '<button class="chat-quick-btn" data-msg="' + this.escapeAttr(followUps[i]) + '">' + followUps[i] + '</button>';
      }
      content += '</div>';
    }
    div.innerHTML = content;
    body.appendChild(div);

    var self = this;
    div.querySelectorAll('.chat-quick-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.getElementById('chatInput').value = btn.getAttribute('data-msg');
        self.sendMessage();
      });
    });

    this.scrollToBottom();
  },

  showTyping: function() {
    var body = document.getElementById('chatBody');
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot chat-typing-indicator';
    div.innerHTML =
      '<div class="chat-msg-row">' +
        '<img class="chat-msg-avatar" src="' + this.logoPath + '" alt="" width="32" height="32">' +
        '<div class="chat-bubble chat-bubble-bot chat-typing-dots"><span></span><span></span><span></span></div>' +
      '</div>';
    body.appendChild(div);
    this.scrollToBottom();
  },

  hideTyping: function() {
    var el = document.querySelector('.chat-typing-indicator');
    if (el) el.remove();
  },

  scrollToBottom: function() {
    var body = document.getElementById('chatBody');
    requestAnimationFrame(function() {
      body.scrollTop = body.scrollHeight;
    });
  },

  escapeHtml: function(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  },

  escapeAttr: function(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  AAChat.init();
});
