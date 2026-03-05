const AAChat = {
  isOpen: false,
  hasGreeted: false,

  knowledge: {
    product: {
      name: 'AA Signature Body Wave',
      type: '13×6 Swiss HD Lace Frontal Wig',
      hair: '100% Virgin Human Hair',
      density: '180%',
      lengths: ['18"', '20"', '22"', '24"', '26"'],
      colors: ['1B Natural Black', 'Soft Black', 'Chocolate Brown', 'Honey Highlight', 'Burgundy Wine', 'Platinum Blonde'],
      features: ['Glueless adjustable band', 'Pre-plucked hairline', 'Heat safe up to 392°F', 'Swiss HD lace'],
      priceRange: '$185.99 – $259.99',
      defaultPrice: '$199.99',
      url: '/products/22-swiss-hd-body-wave/'
    },
    shipping: {
      method: 'Free standard U.S. shipping',
      processing: '1–3 business days',
      delivery: '3–7 business days',
      tracking: 'Yes, tracking number sent via email',
      international: 'U.S. only at this time'
    },
    returns: {
      window: '14 days from delivery',
      conditions: ['Item must be unworn', 'Lace must not be cut', 'No alterations', 'Original packaging required'],
      refundTime: '5–7 business days after approval'
    },
    packaging: {
      box: 'Luxury magnetic burgundy box with gold foil logo',
      interior: 'Champagne satin lining',
      includes: ['Care guide card', 'Thank-you / confidence card', 'Protective satin storage bag']
    }
  },

  patterns: [
    {
      keywords: ['price', 'cost', 'how much', 'pricing', 'expensive', 'cheap', 'afford', 'dollar', '$'],
      response: function(k) {
        return 'Our AA Signature Body Wave wig ranges from <strong>' + k.product.priceRange + '</strong> depending on the length and color you choose. The most popular option (22", 1B Natural Black) is <strong>' + k.product.defaultPrice + '</strong>. All orders include free U.S. shipping!';
      },
      followUps: ['What lengths are available?', 'What colors do you have?', 'Shop now']
    },
    {
      keywords: ['length', 'long', 'short', 'inch', 'inches', '18', '20', '22', '24', '26', 'size'],
      response: function(k) {
        return 'We offer five lengths: <strong>' + k.product.lengths.join(', ') + '</strong>. Our most popular length is 22" — it falls around mid-back and works beautifully for most face shapes. Shorter lengths (18"–20") are great for everyday wear, while longer lengths (24"–26") give a dramatic, glamorous look.';
      },
      followUps: ['How much does each length cost?', 'Which length is best for beginners?', 'Shop now']
    },
    {
      keywords: ['color', 'shade', 'black', 'brown', 'blonde', 'burgundy', 'honey', '1b', '613', '99j', 'natural'],
      response: function(k) {
        return 'We currently offer six beautiful shades:<br><br>• <strong>1B Natural Black</strong> — our bestseller, available now<br>• <strong>Soft Black</strong><br>• <strong>Chocolate Brown</strong><br>• <strong>Honey Highlight</strong><br>• <strong>Burgundy Wine</strong><br>• <strong>Platinum Blonde</strong><br><br>1B Natural Black is available for immediate purchase. Other shades can be reserved through our waitlist.';
      },
      followUps: ['Join the waitlist', 'What is the price for 1B?', 'Shop now']
    },
    {
      keywords: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'long to get', 'when will', 'tracking', 'track'],
      response: function(k) {
        return 'Great news — we offer <strong>free standard shipping</strong> on all U.S. orders! Here are the details:<br><br>• <strong>Processing:</strong> ' + k.shipping.processing + '<br>• <strong>Delivery:</strong> ' + k.shipping.delivery + '<br>• <strong>Tracking:</strong> ' + k.shipping.tracking + '<br><br>We currently ship within the U.S. only.';
      },
      followUps: ['Do you ship internationally?', 'What is the return policy?', 'Shop now']
    },
    {
      keywords: ['return', 'refund', 'exchange', 'send back', 'money back', 'not satisfied', 'wrong'],
      response: function(k) {
        return 'We accept returns within <strong>' + k.returns.window + '</strong>. To qualify:<br><br>• ' + k.returns.conditions.join('<br>• ') + '<br><br>Once approved, refunds are processed within <strong>' + k.returns.refundTime + '</strong> to your original payment method. Contact us at <strong>hello@aawigs.com</strong> to start a return.';
      },
      followUps: ['How do I contact you?', 'What about shipping?', 'Shop now']
    },
    {
      keywords: ['glueless', 'glue', 'adhesive', 'tape', 'install', 'put on', 'wear', 'apply', 'application'],
      response: function(k) {
        return 'Yes! Our wig is <strong>100% glueless</strong>. It features an adjustable band and combs inside for a secure, comfortable fit — no adhesive needed. Simply place it on your head, adjust the straps, and you\'re ready to go. The Swiss HD lace melts seamlessly into your skin for a natural, undetectable hairline.';
      },
      followUps: ['Is it beginner friendly?', 'What is HD lace?', 'Shop now']
    },
    {
      keywords: ['hd lace', 'lace', 'swiss', 'hairline', 'natural look', 'undetectable', 'invisible', 'melt'],
      response: function(k) {
        return 'Our wigs use <strong>Swiss HD (High Definition) lace</strong> — an ultra-thin, sheer lace material that blends into any skin tone. The 13×6 lace frontal provides a wide parting space so you can style it freely. The lace virtually disappears against your scalp, creating the illusion that the hair is growing directly from your head.';
      },
      followUps: ['Is it pre-plucked?', 'Is it glueless?', 'Shop now']
    },
    {
      keywords: ['care', 'wash', 'maintain', 'shampoo', 'conditioner', 'style', 'heat', 'curl', 'straighten', 'store', 'storage', 'last', 'lifespan', 'how long'],
      response: function(k) {
        return 'With proper care, our human hair wigs can last <strong>12–18 months or longer</strong>. Key care tips:<br><br>• Wash every 7–10 wears with sulfate-free shampoo<br>• Deep condition regularly<br>• Use heat protectant before styling (safe up to 392°F)<br>• Store on a wig stand or in the included satin bag<br>• Detangle gently from ends to roots<br><br>We include a care guide card with every order!';
      },
      followUps: ['View full care guide', 'What comes in the box?', 'Shop now']
    },
    {
      keywords: ['package', 'packaging', 'box', 'unbox', 'include', 'come with', 'what\'s in', 'whats in', 'gift'],
      response: function(k) {
        return 'Every AA Wigs order arrives in a <strong>luxury magnetic burgundy box</strong> with gold foil logo. Inside you\'ll find:<br><br>• ' + k.packaging.box + '<br>• ' + k.packaging.interior + '<br>• ' + k.packaging.includes.join('<br>• ') + '<br><br>It\'s a full unboxing experience — many of our customers say it feels like opening a gift!';
      },
      followUps: ['How much is the wig?', 'Is shipping free?', 'Shop now']
    },
    {
      keywords: ['density', '180', 'thick', 'thin', 'full', 'volume', 'natural density'],
      response: function(k) {
        return 'Our wigs feature <strong>180% density</strong>, which gives a full, voluminous look while still appearing natural. This density is perfect for most women — it\'s not too thin (which can look flat) and not too thick (which can look unnatural). It strikes the ideal balance for everyday confidence.';
      },
      followUps: ['What hair type is it?', 'What lengths are available?', 'Shop now']
    },
    {
      keywords: ['hair type', 'virgin', 'human hair', 'real hair', 'synthetic', 'quality', 'material', 'body wave', 'texture', 'pattern'],
      response: function(k) {
        return 'Our wigs are made with <strong>100% virgin human hair</strong> in a beautiful body wave pattern. This means:<br><br>• The hair has never been chemically processed<br>• It can be colored, bleached, and heat styled<br>• It moves naturally and has a gorgeous, bouncy wave<br>• It\'s soft, tangle-resistant, and long-lasting<br><br>Body wave is our most versatile texture — it looks stunning both straight and curly.';
      },
      followUps: ['Can I color the hair?', 'How long will it last?', 'Shop now']
    },
    {
      keywords: ['beginner', 'first wig', 'first time', 'new to wigs', 'never worn', 'recommend', 'suggestion', 'best', 'popular'],
      response: function(k) {
        return 'Welcome to the wig world! For first-time buyers, we recommend:<br><br>• <strong>Length:</strong> 22" — the perfect middle ground<br>• <strong>Color:</strong> 1B Natural Black — our bestseller<br>• <strong>Price:</strong> ' + k.product.defaultPrice + '<br><br>Our wig is glueless with an adjustable band, making it incredibly beginner-friendly. No salon visit needed — you can install it yourself in minutes. Plus, the pre-plucked hairline means it looks natural right out of the box!';
      },
      followUps: ['Is it really glueless?', 'What comes in the box?', 'Shop now']
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'speak', 'customer service', 'support', 'help me'],
      response: function(k) {
        return 'We\'d love to help! You can reach us at:<br><br>• <strong>Email:</strong> hello@aawigs.com<br>• <strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank">@aawigshair</a><br>• <strong>Contact form:</strong> <a href="/contact.html">Contact page</a><br><br>We typically respond within 24 hours. For the fastest response, DM us on Instagram!';
      },
      followUps: ['What is the return policy?', 'Where is my order?', 'Shop now']
    },
    {
      keywords: ['payment', 'pay', 'checkout', 'stripe', 'credit card', 'debit', 'secure', 'safe'],
      response: function(k) {
        return 'We use <strong>Stripe</strong> for all payments — one of the most trusted payment processors in the world. Your payment information is fully encrypted and secure. We accept all major credit cards, debit cards, and Apple Pay / Google Pay through Stripe checkout.';
      },
      followUps: ['Is shipping free?', 'What is the return policy?', 'Shop now']
    },
    {
      keywords: ['waitlist', 'notify', 'restock', 'back in stock', 'sold out', 'available', 'when available'],
      response: function(k) {
        return 'Some of our shades sell out quickly! If your preferred shade or length isn\'t currently available, you can <a href="/waitlist.html">join our waitlist</a> and we\'ll notify you by email the moment it\'s back in stock. It only takes a few seconds to sign up.';
      },
      followUps: ['What colors are available?', 'Which shades are in stock?', 'Shop now']
    },
    {
      keywords: ['pre-plucked', 'preplucked', 'plucked', 'baby hair', 'natural hairline'],
      response: function(k) {
        return 'Yes! Our wig comes <strong>pre-plucked</strong> with a natural-looking hairline right out of the box. The baby hairs along the front are already customized to mimic a real hairline. No plucking, no cutting — just place it on and go. The 13×6 Swiss HD lace ensures the transition looks completely seamless.';
      },
      followUps: ['Is it glueless?', 'What is HD lace?', 'Shop now']
    },
    {
      keywords: ['order', 'where is my', 'track my', 'status', 'shipped', 'processing'],
      response: function(k) {
        return 'If you\'ve already placed an order, you should have received a confirmation email. Once your order ships (within 2–4 business days), you\'ll receive a tracking number via email. If you haven\'t received an update, please email us at <strong>hello@aawigs.com</strong> with your order number and we\'ll look into it right away!';
      },
      followUps: ['How long does shipping take?', 'Contact support', 'Shop now']
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
      text: 'Thank you for your question! I\'d be happy to help with information about our wigs, pricing, shipping, returns, or care. You can also reach our team directly at <strong>hello@aawigs.com</strong> or visit our <a href="/contact.html">contact page</a>. What would you like to know?',
      followUps: ['What wigs do you sell?', 'How much does it cost?', 'How does shipping work?', 'Shop now']
    };
  },

  init: function() {
    this.injectHTML();
    this.bindEvents();
  },

  injectHTML: function() {
    var widget = document.createElement('div');
    widget.id = 'aaChatWidget';
    widget.innerHTML =
      '<button class="chat-fab" id="chatFab" aria-label="Open chat">' +
        '<svg class="chat-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
        '<svg class="chat-fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '<span class="chat-fab-pulse"></span>' +
      '</button>' +
      '<div class="chat-window" id="chatWindow">' +
        '<div class="chat-header">' +
          '<div class="chat-header-info">' +
            '<div class="chat-avatar">AA</div>' +
            '<div>' +
              '<div class="chat-header-name">AA Wigs</div>' +
              '<div class="chat-header-status"><span class="chat-status-dot"></span> Online now</div>' +
            '</div>' +
          '</div>' +
          '<button class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="chat-body" id="chatBody"></div>' +
        '<div class="chat-input-area">' +
          '<input type="text" class="chat-input" id="chatInput" placeholder="Ask us anything..." autocomplete="off">' +
          '<button class="chat-send" id="chatSend" aria-label="Send message">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(widget);
  },

  bindEvents: function() {
    var self = this;
    var fab = document.getElementById('chatFab');
    var closeBtn = document.getElementById('chatCloseBtn');
    var input = document.getElementById('chatInput');
    var sendBtn = document.getElementById('chatSend');

    fab.addEventListener('click', function() {
      self.toggle();
    });

    closeBtn.addEventListener('click', function() {
      self.close();
    });

    sendBtn.addEventListener('click', function() {
      self.sendMessage();
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') self.sendMessage();
    });
  },

  toggle: function() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  open: function() {
    this.isOpen = true;
    var widget = document.getElementById('aaChatWidget');
    widget.classList.add('chat-open');
    document.getElementById('chatInput').focus();

    if (!this.hasGreeted) {
      this.hasGreeted = true;
      var self = this;
      setTimeout(function() {
        self.addBotMessage('Hi there! 👋 Welcome to <strong>AA Wigs</strong>. I\'m here to help you find your perfect luxury human hair wig. What can I help you with?', ['What wigs do you sell?', 'How much does it cost?', 'What colors are available?', 'Is shipping free?']);
      }, 400);
    }
  },

  close: function() {
    this.isOpen = false;
    document.getElementById('aaChatWidget').classList.remove('chat-open');
  },

  sendMessage: function() {
    var input = document.getElementById('chatInput');
    var msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    this.addUserMessage(msg);

    if (msg.toLowerCase() === 'shop now' || msg.toLowerCase() === 'shop' || msg.toLowerCase() === 'buy' || msg.toLowerCase() === 'buy now') {
      this.addBotMessage('Let me take you to our signature wig! ✨<br><br><a href="' + this.knowledge.product.url + '" class="chat-cta-link">Shop the AA Signature Body Wave →</a>', []);
      return;
    }
    if (msg.toLowerCase() === 'join the waitlist' || msg.toLowerCase() === 'waitlist') {
      this.addBotMessage('You can join our waitlist to be notified when your preferred shade is back!<br><br><a href="/waitlist.html" class="chat-cta-link">Join the Waitlist →</a>', []);
      return;
    }
    if (msg.toLowerCase() === 'view full care guide' || msg.toLowerCase() === 'care guide') {
      this.addBotMessage('Here\'s our complete care guide with everything you need to know:<br><br><a href="/care.html" class="chat-cta-link">View Care Guide →</a>', []);
      return;
    }
    if (msg.toLowerCase() === 'contact support' || msg.toLowerCase() === 'contact') {
      this.addBotMessage('You can reach our team here:<br><br><a href="/contact.html" class="chat-cta-link">Contact Us →</a>', []);
      return;
    }

    var self = this;
    this.showTyping();
    var delay = 600 + Math.random() * 800;
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
    var content = '<div class="chat-bubble chat-bubble-bot">' + html + '</div>';

    if (followUps && followUps.length > 0) {
      content += '<div class="chat-quick-replies">';
      for (var i = 0; i < followUps.length; i++) {
        content += '<button class="chat-quick-btn" data-msg="' + this.escapeAttr(followUps[i]) + '">' + followUps[i] + '</button>';
      }
      content += '</div>';
    }
    div.innerHTML = content;
    body.appendChild(div);

    var btns = div.querySelectorAll('.chat-quick-btn');
    var self = this;
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var msg = btn.getAttribute('data-msg');
        document.getElementById('chatInput').value = msg;
        self.sendMessage();
      });
    });

    this.scrollToBottom();
  },

  showTyping: function() {
    var body = document.getElementById('chatBody');
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot chat-typing-indicator';
    div.innerHTML = '<div class="chat-bubble chat-bubble-bot"><span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span></div>';
    body.appendChild(div);
    this.scrollToBottom();
  },

  hideTyping: function() {
    var el = document.querySelector('.chat-typing-indicator');
    if (el) el.remove();
  },

  scrollToBottom: function() {
    var body = document.getElementById('chatBody');
    body.scrollTop = body.scrollHeight;
  },

  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr: function(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  AAChat.init();
});
