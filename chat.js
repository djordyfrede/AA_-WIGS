var AAChat = {
  isOpen: false,
  hasGreeted: false,

  // ── STATE MACHINE ─────────────────────────────────────────────────────────
  state: { flow: null, step: 0, data: {} },

  resetState: function() {
    this.state = { flow: null, step: 0, data: {} };
  },

  // ── KNOWLEDGE BASE ────────────────────────────────────────────────────────
  knowledge: {
    product: {
      name: '22" 13×6 Swiss HD Lace Body Wave',
      type: '13×6 Swiss HD Lace Frontal Wig',
      hair: '100% Virgin Human Hair',
      density: '180%',
      lengths: ['18"', '20"', '22"', '24"', '26"'],
      colors: ['1B Natural Black', 'Dark Brown', 'Medium Brown', 'Honey Blonde (27)', '99J Burgundy', '613 Blonde'],
      features: ['Glueless adjustable band', 'Pre-plucked hairline', 'Heat safe up to 392°F', '13×6 Swiss HD lace'],
      priceRange: '$289–$479',
      defaultPrice: '$379',
      url: '/products/22-swiss-hd-body-wave/'
    },
    shipping: {
      method: 'Free standard U.S. shipping',
      processing: '1–3 business days',
      delivery: '3–7 business days',
      tracking: 'Yes — tracking number sent via email',
      international: 'U.S. only at this time'
    },
    returns: {
      window: '14 days from delivery',
      conditions: ['Item must be unworn', 'Lace must not be cut', 'No alterations', 'Original packaging required'],
      refundTime: '5–7 business days after approval'
    },
    packaging: {
      box: 'Luxury deep burgundy box with gold foil logo',
      interior: 'Cream satin lining',
      includes: ['Care guide card', 'Confidence card', 'Protective satin storage bag']
    }
  },

  logoPath: '/assets/aa-logo.png',

  mainMenuReplies: [
    'Is this my first luxury wig?',
    'Tell me about the signature piece',
    'What is HD lace?',
    'How do I care for it?',
    'Why does AA WIGS offer one product?',
    'What makes AA WIGS different?',
    'Speak with the AA WIGS team'
  ],

  // ── FLOW ENGINE ───────────────────────────────────────────────────────────
  startFlow: function(name) {
    this.state.flow = name;
    this.state.step = 0;
    this.state.data = {};
    this.showTyping();
    var self = this;
    setTimeout(function() {
      self.hideTyping();
      self.handleFlowStep(null);
    }, 480);
  },

  handleFlowStep: function(input) {
    switch (this.state.flow) {
      case 'firsttime': this.flowFirstTime(input); break;
      case 'length':    this.flowLength(input);    break;
      case 'color':     this.flowColor(input);     break;
      case 'hdlace':    this.flowHDLace();         break;
      case 'care':      this.flowCare();           break;
      case 'different': this.flowDifferent();      break;
      case 'oneprod':   this.flowOneProduct();     break;
      case 'speak':     this.flowSpeak();          break;
      default:          this.resetState();
    }
  },

  // Flow 1 — First-Time / Understand the Visitor (v3 Step 2)
  flowFirstTime: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'Is this your first luxury wig?',
        ["Yes — it's my first", "I've worn wigs before"]
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var isFirst = lower.indexOf('yes') !== -1 || lower.indexOf('first') !== -1;

    if (isFirst) {
      this.addBotMessage(
        "Welcome. You are in the right place.<br><br>" +
        "The AA WIGS signature piece is a <strong>22\" 13×6 Swiss HD Lace Body Wave</strong> — 100% virgin human hair, 180% density, completely glueless. Designed to be installed confidently at home from the very first wear, with no salon visit required.<br><br>" +
        "Before anything else, we always recommend educating yourself on what makes a wig truly luxury. These are a good place to start:<br><br>" +
        '<a href="/hd-lace-guide/" class="chat-link">Understanding HD Lace →</a><br>' +
        '<a href="/knowledge-center/aa-wigs-quality-standard/" class="chat-link">The AA WIGS Quality Standard →</a><br>' +
        '<a href="/wig-care/" class="chat-link">Caring For Your Wig →</a>',
        ['What is HD lace?', 'Tell me about the signature piece', 'Speak with the AA WIGS team', '← See all options']
      );
    } else {
      this.addBotMessage(
        "Welcome back. You already know the difference quality makes.<br><br>" +
        "The AA WIGS signature piece offers <strong>13×6 Swiss HD lace, 180% density, 100% virgin human hair</strong> — and a glueless, adjustable fit designed for an effortless install every time.<br><br>" +
        "If you have specific questions about fit, texture, or our quality standards, I'm here to help you evaluate whether this is the right piece for you.<br><br>" +
        '<a href="/knowledge-center/" class="chat-link">Knowledge Center →</a>',
        ['Tell me about the signature piece', 'What makes AA WIGS different?', 'Speak with the AA WIGS team', '← See all options']
      );
    }
    this.resetState();
  },

  // Flow 2 — Length Help
  flowLength: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'What kind of look are you hoping to achieve?',
        ['Natural, effortless everyday look', 'Elegant and versatile', 'Glamorous and striking', 'Maximum luxury statement']
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var rec = '';

    if (lower.indexOf('natural') !== -1 || lower.indexOf('everyday') !== -1 || lower.indexOf('effortless') !== -1) {
      rec = '<strong>18" or 20"</strong> — a practical, polished length for daily wear. Full body wave movement without excess weight. Beautiful and completely manageable.';
    } else if (lower.indexOf('elegant') !== -1 || lower.indexOf('versatile') !== -1) {
      rec = '<strong>22"</strong> — our most popular length. Bra-strap length with genuine versatility and natural movement. The most considered starting point for most lifestyles.';
    } else if (lower.indexOf('glamorous') !== -1 || lower.indexOf('striking') !== -1) {
      rec = '<strong>24"</strong> — mid-back length with a beautiful cascade. A statement that is confident without being overpowering.';
    } else if (lower.indexOf('maximum') !== -1 || lower.indexOf('luxury') !== -1) {
      rec = '<strong>26"</strong> — our longest option. Lower-back length with full presence and a truly powerful look.';
    } else {
      rec = '<strong>22"</strong> — our most popular and versatile length. A thoughtful starting point for most lifestyles.';
    }

    this.addBotMessage(
      'Based on what you have shared, we would suggest ' + rec +
      '<br><br>If you would like to explore further before deciding:<br>' +
      '<a href="/wig-length-guide/" class="chat-link">Full Length Guide →</a>',
      ['Tell me about the signature piece', 'What is HD lace?', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 3 — Color Help
  flowColor: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'What aesthetic feels most true to your style?',
        ['Classic and natural', 'Soft, warm brown', 'Warm highlighted look', 'Bold burgundy', 'Blonde luxury']
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var rec = '';

    if (lower.indexOf('classic') !== -1 || lower.indexOf('natural') !== -1) {
      rec = '<strong>1B Natural Black</strong> — our most universally flattering shade. A deep, rich natural black that works beautifully across all skin tones and all occasions.';
    } else if (lower.indexOf('soft') !== -1 || lower.indexOf('brown') !== -1 || lower.indexOf('warm') !== -1 && lower.indexOf('highlight') === -1) {
      rec = '<strong>Dark Brown or Medium Brown</strong> — warm, elevated, and quietly sophisticated. Depth without going full black. A shade that reads as effortlessly luxurious.';
    } else if (lower.indexOf('highlight') !== -1 || lower.indexOf('honey') !== -1) {
      rec = '<strong>Honey Blonde (27)</strong> — a warm, golden-highlighted shade that catches light naturally. Radiant, sun-kissed, and deeply flattering on warm skin tones.';
    } else if (lower.indexOf('burgundy') !== -1 || lower.indexOf('bold') !== -1) {
      rec = '<strong>99J Burgundy</strong> — a rich, deep wine tone that makes a confident and deliberate statement. Our most distinctive shade.';
    } else if (lower.indexOf('blonde') !== -1) {
      rec = '<strong>613 Blonde</strong> — platinum luxury. A high-impact blonde that is bold, striking, and unmistakably premium.';
    } else {
      rec = '<strong>1B Natural Black</strong> — our most popular and universally flattering shade. A considered starting point.';
    }

    this.addBotMessage(
      'Based on your style, ' + rec +
      '<br><br><a href="/knowledge-center/" class="chat-link">Explore the Knowledge Center →</a>',
      ['Tell me about the signature piece', 'Help me understand lengths', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 4 — HD Lace Education (v3 Step 3: Educate)
  flowHDLace: function() {
    this.addBotMessage(
      "HD lace — high-definition lace — is an ultra-thin Swiss material that blends naturally into the scalp, creating a softer, more invisible hairline than standard lace.<br><br>" +
      "Unlike regular lace, true Swiss HD lace works across <strong>all skin tones</strong> without tinting or makeup. The AA WIGS signature piece uses a <strong>13×6 Swiss HD lace</strong> panel — the widest, finest grade available — combined with pre-bleached knots and a pre-plucked hairline.<br><br>" +
      "The result is a hairline that looks as though hair is growing directly from the scalp. From day one, without any additional preparation.<br><br>" +
      '<a href="/hd-lace-guide/" class="chat-link">Full HD Lace Guide →</a><br>' +
      '<a href="/knowledge-center/hd-lace-vs-transparent-lace/" class="chat-link">HD Lace vs Transparent Lace →</a>',
      ['Is this right for beginners?', 'Tell me about the signature piece', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 5 — Wig Care (v3 Step 3: Educate)
  flowCare: function() {
    this.addBotMessage(
      "Virgin human hair responds to care the same way your natural hair does — it lasts longer when treated with intention.<br><br>" +
      "&bull; <strong>Wash every 10–14 wears</strong> with a sulphate-free shampoo<br>" +
      "&bull; <strong>Deep condition monthly</strong> to restore moisture<br>" +
      "&bull; <strong>Minimise heat styling</strong> — air dry where possible; always use a protectant spray<br>" +
      "&bull; <strong>Store correctly</strong> — on a wig stand, or in the included satin bag for travel or longer storage<br>" +
      "&bull; <strong>Never sleep in your wig</strong><br><br>" +
      "With consistent care, an AA WIGS unit lasts <strong>1–3 years</strong>.<br><br>" +
      '<a href="/wig-care/" class="chat-link">Full Care Guide →</a>',
      ['Tell me about the signature piece', 'What makes AA WIGS different?', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 6 — What Makes AA WIGS Different (v3 Philosophy)
  flowDifferent: function() {
    this.addBotMessage(
      "AA WIGS was built on four principles:<br><br>" +
      "<strong>Quality before quantity.</strong> One signature piece, perfected — rather than a large catalogue of inconsistent options.<br><br>" +
      "<strong>Education before promotion.</strong> Every visitor should leave with greater clarity and confidence — whether they purchase or not.<br><br>" +
      "<strong>Trust before transactions.</strong> We would rather help the right person make an informed decision than convince the wrong person to buy.<br><br>" +
      "<strong>Consistency before expansion.</strong> Every detail — from the 13×6 Swiss HD lace to the cream satin packaging interior — is held to the same standard on every order.<br><br>" +
      '<a href="/knowledge-center/aa-wigs-quality-standard/" class="chat-link">The AA WIGS Quality Standard →</a><br>' +
      '<a href="/the-first-circle/" class="chat-link">The First Circle — Community →</a>',
      ['Is this right for beginners?', 'Tell me about the signature piece', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 7 — Why Only One Product (v3 out-of-scope response)
  flowOneProduct: function() {
    this.addBotMessage(
      "AA WIGS focuses exclusively on one signature piece because we believe it is better to perfect one experience than to offer many inconsistent options.<br><br>" +
      "Every element — the 13×6 Swiss HD lace, the 180% density, the virgin human hair, the luxury packaging — reflects years of deliberate refinement of a single vision.<br><br>" +
      "If our collection expands in the future, those on our insider list will be the first to know.<br><br>" +
      '<a href="/the-first-circle/" class="chat-link">Join The First Circle →</a>',
      ['What makes AA WIGS different?', 'Tell me about the signature piece', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 8 — Speak with Team + Lead Capture
  flowSpeak: function() {
    this.resetState();
    this.addBotMessage(
      "Our team is here for you. You can reach us directly at:<br><br>" +
      "<strong>Email:</strong> hello@aawigs.com<br>" +
      '<strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank" class="chat-link">@aawigshair</a><br>' +
      '<strong>Contact form:</strong> <a href="/contact.html" class="chat-link">Contact page →</a><br><br>' +
      "Or share a few details below and we will reach out personally within 24 hours.",
      []
    );
    var self = this;
    setTimeout(function() { self.renderLeadForm(); }, 250);
  },

  renderLeadForm: function() {
    var body = document.getElementById('chatBody');
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.innerHTML =
      '<div class="chat-msg-row">' +
        '<img class="chat-msg-avatar" src="' + this.logoPath + '" alt="" width="32" height="32">' +
        '<div class="chat-bubble chat-bubble-bot chat-lead-bubble">' +
          '<p class="chat-lead-heading">Personal Concierge Request</p>' +
          '<div id="chatLeadSuccess" class="chat-lead-success">' +
            '<p>✦ Thank you. We will be in touch within 24 hours.</p>' +
          '</div>' +
          '<form id="chatLeadForm" class="chat-lead-form" onsubmit="return false;">' +
            '<input type="text" id="leadName" placeholder="First Name *" class="chat-lead-input" autocomplete="given-name">' +
            '<input type="email" id="leadEmail" placeholder="Email Address *" class="chat-lead-input" autocomplete="email">' +
            '<input type="tel" id="leadPhone" placeholder="Phone (optional)" class="chat-lead-input" autocomplete="tel">' +
            '<select id="leadLength" class="chat-lead-select">' +
              '<option value="">Preferred length (optional)...</option>' +
              '<option value="18&quot;">18"</option>' +
              '<option value="20&quot;">20"</option>' +
              '<option value="22&quot;">22"</option>' +
              '<option value="24&quot;">24"</option>' +
              '<option value="26&quot;">26"</option>' +
              '<option value="Not sure yet">Not sure yet</option>' +
            '</select>' +
            '<select id="leadColor" class="chat-lead-select">' +
              '<option value="">Preferred shade (optional)...</option>' +
              '<option value="1B Natural Black">1B Natural Black</option>' +
              '<option value="Dark Brown">Dark Brown</option>' +
              '<option value="Medium Brown">Medium Brown</option>' +
              '<option value="Honey Blonde (27)">Honey Blonde (27)</option>' +
              '<option value="99J Burgundy">99J Burgundy</option>' +
              '<option value="613 Blonde">613 Blonde</option>' +
              '<option value="Not sure yet">Not sure yet</option>' +
            '</select>' +
            '<textarea id="leadMsg" placeholder="Your question or message..." class="chat-lead-textarea"></textarea>' +
            '<label class="chat-lead-gdpr">' +
              '<input type="checkbox" id="leadGdpr"> ' +
              '<span>I agree to receive updates from AA WIGS. Unsubscribe anytime.</span>' +
            '</label>' +
            '<div id="leadErr" class="chat-lead-err"></div>' +
            '<button type="button" id="leadSubmitBtn" class="chat-lead-submit" onclick="AAChat.submitLeadForm()">Send My Details →</button>' +
          '</form>' +
        '</div>' +
      '</div>';
    body.appendChild(div);
    this.scrollToBottom();
  },

  submitLeadForm: function() {
    var nameEl   = document.getElementById('leadName');
    var emailEl  = document.getElementById('leadEmail');
    var phoneEl  = document.getElementById('leadPhone');
    var lengthEl = document.getElementById('leadLength');
    var colorEl  = document.getElementById('leadColor');
    var msgEl    = document.getElementById('leadMsg');
    var gdprEl   = document.getElementById('leadGdpr');
    var errEl    = document.getElementById('leadErr');
    var btnEl    = document.getElementById('leadSubmitBtn');

    if (!nameEl || !emailEl) return;

    var name   = nameEl.value.trim();
    var email  = emailEl.value.trim();
    var phone  = phoneEl ? phoneEl.value.trim() : '';
    var length = lengthEl ? lengthEl.value : '';
    var color  = colorEl ? colorEl.value : '';
    var gdpr   = gdprEl ? gdprEl.checked : false;

    if (!name || !email) {
      errEl.textContent = 'Please enter your name and email.';
      errEl.style.display = 'block';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      errEl.style.display = 'block';
      return;
    }
    if (!gdpr) {
      errEl.textContent = 'Please check the consent box to continue.';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    btnEl.textContent = 'Sending…';
    btnEl.disabled = true;

    var self = this;
    fetch('/api/vip-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: name,
        email: email,
        phone: phone || undefined,
        gdprConsent: true,
        source: 'chatbot-concierge'
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        var form = document.getElementById('chatLeadForm');
        var ok   = document.getElementById('chatLeadSuccess');
        if (form) form.style.display = 'none';
        if (ok)   ok.style.display = 'block';
        self.scrollToBottom();
        setTimeout(function() {
          self.addBotMessage(
            'Thank you. We have received your details and will be in touch personally within 24 hours.<br><br>' +
            'In the meantime, the Knowledge Center is a good place to continue learning at your own pace.<br><br>' +
            '<a href="/knowledge-center/" class="chat-link">Knowledge Center →</a><br>' +
            '<a href="/the-first-circle/" class="chat-link">The First Circle →</a>',
            ['← See all options']
          );
        }, 400);
      } else {
        errEl.textContent = d.error || 'Something went wrong. Please email hello@aawigs.com directly.';
        errEl.style.display = 'block';
        btnEl.textContent = 'Send My Details →';
        btnEl.disabled = false;
      }
    })
    .catch(function() {
      errEl.textContent = 'Network error. Please email hello@aawigs.com directly.';
      errEl.style.display = 'block';
      btnEl.textContent = 'Send My Details →';
      btnEl.disabled = false;
    });
  },

  // ── KEYWORD FALLBACK PATTERNS ─────────────────────────────────────────────
  patterns: [
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'whats up'],
      response: function() {
        return "Hello — welcome to AA WIGS.<br><br>I'm your personal concierge. I'm here to answer your questions, explain our signature piece, and help you determine whether it's the right fit for you.<br><br>What brings you here today?";
      },
      followUps: ['Is this my first luxury wig?', 'Tell me about the signature piece', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['price', 'cost', 'how much', 'pricing', 'dollar', '$'],
      response: function(k) {
        return 'The AA WIGS signature piece ranges from <strong>' + k.product.priceRange + '</strong> depending on length and shade. The most popular combination — 22", 1B Natural Black — is <strong>' + k.product.defaultPrice + '</strong>. Free U.S. shipping is included on every order.<br><br>Our pricing reflects the quality standards and experience we provide.';
      },
      followUps: ['Tell me about the signature piece', 'Help me understand lengths', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['expensive', 'cheap', 'afford', 'budget', 'discount', 'coupon', 'sale', 'promo'],
      response: function() {
        return 'AA WIGS does not offer promotions or discounts.<br><br>Our pricing reflects the quality of the materials, the craftsmanship behind the piece, and the experience we provide — from the Swiss HD lace to the luxury packaging.<br><br>If you have questions about what is included or what to expect, I am happy to walk you through it in detail.';
      },
      followUps: ['Tell me about the signature piece', 'What makes AA WIGS different?', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['length', 'long', 'short', 'inch', 'inches', '18', '20', '22', '24', '26', 'size'],
      response: function(k) {
        return 'The signature piece is available in five lengths: <strong>' + k.product.lengths.join(', ') + '</strong>.<br><br>Our most popular is 22" — bra-strap length with natural versatility. Shorter lengths (18"–20") suit effortless everyday wear; 24"–26" deliver a more dramatic, confident look.<br><br>Would you like help narrowing down the right length for your lifestyle?';
      },
      followUps: ['Help me understand lengths', 'Tell me about the signature piece', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['color', 'colour', 'shade', 'black', 'brown', 'blonde', 'burgundy', 'honey', '1b', '613', '99j', 'natural', 'platinum', 'chocolate'],
      response: function() {
        return 'The signature piece is available in six shades:<br><br><strong>1B Natural Black</strong> — most popular<br><strong>Dark Brown</strong><br><strong>Medium Brown</strong><br><strong>Honey Blonde (27)</strong><br><strong>99J Burgundy</strong><br><strong>613 Blonde</strong><br><br>Would you like help choosing the right shade for your aesthetic?';
      },
      followUps: ['Help me choose a shade', 'Tell me about the signature piece', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'when will', 'tracking', 'track'],
      response: function(k) {
        return 'We offer <strong>free standard shipping</strong> on all U.S. orders.<br><br><strong>Processing:</strong> ' + k.shipping.processing + '<br><strong>Delivery:</strong> ' + k.shipping.delivery + '<br><strong>Tracking:</strong> ' + k.shipping.tracking + '<br><br>We currently ship within the U.S. only.';
      },
      followUps: ['Return policy', 'Tell me about the signature piece', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['return', 'refund', 'exchange', 'send back', 'money back'],
      response: function(k) {
        return 'We accept returns within <strong>' + k.returns.window + '</strong>. To be eligible:<br><br>' + k.returns.conditions.map(function(c) { return '&bull; ' + c; }).join('<br>') + '<br><br>Approved refunds are processed within <strong>' + k.returns.refundTime + '</strong>.<br><br>To begin, email <strong>hello@aawigs.com</strong> with your order number.<br><br><a href="/returns/" class="chat-link">Full Returns Policy →</a>';
      },
      followUps: ['Shipping details', 'Speak with the AA WIGS team', '← See all options']
    },
    {
      keywords: ['glueless', 'glue', 'adhesive', 'tape', 'install', 'put on', 'apply', 'application'],
      response: function() {
        return 'The signature piece is <strong>100% glueless</strong>. An adjustable band and combs provide a secure, comfortable fit — no adhesive required. Place it on, adjust the straps, and go.<br><br>The 13×6 Swiss HD lace creates a natural hairline without any additional preparation.';
      },
      followUps: ['Is this right for beginners?', 'What is HD lace?', '← See all options']
    },
    {
      keywords: ['hd lace', 'lace', 'swiss', 'hairline', 'natural look', 'undetectable', 'invisible', 'melt'],
      response: function() {
        return 'We use <strong>13×6 Swiss HD lace</strong> — an ultra-thin material that blends naturally into the scalp across all skin tones, creating the appearance that hair is growing directly from the scalp. Combined with pre-bleached knots and a pre-plucked hairline, the result is a completely natural install.';
      },
      followUps: ['What is HD lace?', 'Is this right for beginners?', '← See all options']
    },
    {
      keywords: ['care', 'wash', 'maintain', 'shampoo', 'conditioner', 'style', 'heat', 'curl', 'straighten', 'store', 'storage', 'last', 'lifespan', 'how long', 'durable'],
      response: function() {
        return 'With consistent care, an AA WIGS unit lasts <strong>1–3 years</strong>. The most important steps:<br><br>&bull; Wash every 10–14 wears with sulphate-free shampoo<br>&bull; Deep condition monthly<br>&bull; Use heat protectant before styling<br>&bull; Store on a wig stand or in the satin bag between wears<br>&bull; Detangle gently from ends to roots<br><br>A care guide is included with every order.<br><br><a href="/wig-care/" class="chat-link">Full Care Guide →</a>';
      },
      followUps: ['How do I care for it?', 'Tell me about the signature piece', '← See all options']
    },
    {
      keywords: ['package', 'packaging', 'box', 'unbox', 'include', 'come with', "what's in", 'whats in', 'gift'],
      response: function(k) {
        return 'Every order arrives in a <strong>luxury deep burgundy box</strong> with gold foil logo and cream satin lining. Inside:<br><br>&bull; ' + k.packaging.includes.join('<br>&bull; ') + '<br><br>The packaging is designed to reflect the standard of what is inside it.';
      },
      followUps: ['What makes AA WIGS different?', 'Tell me about the signature piece', '← See all options']
    },
    {
      keywords: ['density', '180', 'thick', 'thin', 'full', 'volume'],
      response: function() {
        return 'The signature piece features <strong>180% density</strong> — full and voluminous while remaining completely natural-looking. Not flat, not overdone. A balanced weight that moves naturally and holds its shape.';
      },
      followUps: ['Tell me about the signature piece', 'What makes AA WIGS different?', '← See all options']
    },
    {
      keywords: ['virgin', 'human hair', 'real hair', 'synthetic', 'quality', 'material', 'body wave', 'texture', 'pattern'],
      response: function() {
        return 'The signature piece uses <strong>100% virgin human hair</strong> in a body wave pattern — unprocessed, heat-styleable, and naturally soft. Body wave is our most versatile texture: stunning as a natural wave, equally beautiful straightened or with additional curl.';
      },
      followUps: ['Tell me about the signature piece', 'How do I care for it?', '← See all options']
    },
    {
      keywords: ['beginner', 'first wig', 'first time', 'new to wigs', 'never worn', 'recommend', 'suggestion', 'best for'],
      response: function() {
        return 'For a first luxury wig, most visitors find the <strong>22" in 1B Natural Black</strong> to be the most considered starting point — the most versatile length and our most universally flattering shade.<br><br>The piece is glueless, adjustable, and ready to wear from day one. No salon visit required.<br><br>We always recommend reading through the Knowledge Center first. An informed decision is always the right one.<br><br><a href="/knowledge-center/" class="chat-link">Knowledge Center →</a>';
      },
      followUps: ['Is this my first luxury wig?', 'What is HD lace?', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['review', 'reviews', 'testimonial', 'what do people say', 'customer', 'experience', 'feedback'],
      response: function() {
        return 'To read authentic experiences from AA WIGS clients, visit <strong>The First Circle</strong> — our community space dedicated to honest reflection and shared journeys.<br><br><a href="/the-first-circle/" class="chat-link">The First Circle →</a>';
      },
      followUps: ['What makes AA WIGS different?', 'Tell me about the signature piece', '← See all options']
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'speak', 'customer service', 'support'],
      response: function() {
        return 'You can reach our team at:<br><br><strong>Email:</strong> hello@aawigs.com<br><strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank" class="chat-link">@aawigshair</a><br><strong>Contact form:</strong> <a href="/contact.html" class="chat-link">Contact page</a><br><br>We respond within 24 hours.';
      },
      followUps: ['Speak with the AA WIGS team', '← See all options']
    },
    {
      keywords: ['payment', 'pay', 'checkout', 'stripe', 'credit card', 'debit', 'secure', 'safe'],
      response: function() {
        return 'All payments are processed securely through <strong>Stripe</strong>. Major credit and debit cards, Apple Pay, and Google Pay are accepted. Your payment information is fully encrypted and never stored on our servers.';
      },
      followUps: ['Shipping details', 'Tell me about the signature piece', '← See all options']
    },
    {
      keywords: ['waitlist', 'notify', 'restock', 'back in stock', 'sold out', 'available', 'when available'],
      response: function() {
        return 'If a shade or length is unavailable, joining our list ensures you will be notified as soon as the next release becomes available.<br><br><a href="/waitlist.html" class="chat-link">Join the Waitlist →</a><br><a href="/the-first-circle/" class="chat-link">The First Circle →</a>';
      },
      followUps: ['Tell me about the signature piece', 'Speak with the AA WIGS team', '← See all options']
    },
    {
      keywords: ['pre-plucked', 'preplucked', 'plucked', 'baby hair', 'natural hairline'],
      response: function() {
        return 'Yes — the signature piece arrives <strong>pre-plucked</strong> with a natural hairline. Baby hairs are already customised. No additional preparation is required — place it on, adjust, and go.';
      },
      followUps: ['Is it glueless?', 'What is HD lace?', '← See all options']
    },
    {
      keywords: ['order', 'where is my', 'track my', 'status', 'shipped', 'processing'],
      response: function() {
        return 'Once your order is placed, you will receive a confirmation email. Once shipped (within 1–3 business days), a tracking number is sent to your email. If you have not received an update, email <strong>hello@aawigs.com</strong> with your order number.';
      },
      followUps: ['Shipping details', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'perfect', 'wonderful'],
      response: function() {
        return "You are very welcome. Whatever you decide, I hope the information has been useful. If anything else comes up, I am always here.";
      },
      followUps: ['← See all options']
    },
    {
      keywords: ['international', 'outside us', 'canada', 'uk', 'europe', 'africa', 'nigeria', 'abroad'],
      response: function() {
        return 'We currently ship within the <strong>United States only</strong>. For future updates, including any international shipping announcements, joining our list is the best way to stay informed.<br><br><a href="/the-first-circle/" class="chat-link">The First Circle →</a>';
      },
      followUps: ['Speak with the AA WIGS team', '← See all options']
    },
    {
      keywords: ['different color', 'different length', 'other texture', 'other style', 'something else', 'other products', 'straight', 'curly', 'deep wave'],
      response: function() {
        return 'At the moment, AA WIGS focuses exclusively on one signature piece — the 22\" 13×6 Swiss HD Lace Body Wave — because we believe it is better to perfect one experience than to offer many inconsistent options.<br><br>If our collection expands in the future, members of our insider list will be the first to know.<br><br><a href="/the-first-circle/" class="chat-link">The First Circle →</a>';
      },
      followUps: ['Why does AA WIGS offer one product?', 'Tell me about the signature piece', '← See all options']
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
      text: "I want to make sure I provide you with accurate information. Could you share a little more about what you are looking for? Or I can connect you with the AA WIGS team directly.",
      followUps: ['Tell me about the signature piece', 'What makes AA WIGS different?', 'Speak with the AA WIGS team', '← See all options']
    };
  },

  // ── CORE UI ───────────────────────────────────────────────────────────────
  init: function() {
    this.injectStyles();
    this.injectHTML();
    this.bindEvents();
  },

  injectStyles: function() {
    var style = document.createElement('style');
    style.id = 'aaChatExtraStyles';
    style.textContent = [
      '.chat-link{color:#7C0832;text-decoration:underline;font-weight:500;}',
      '.chat-link:hover{opacity:0.8;}',
      '.chat-lead-bubble{padding:16px 18px!important;min-width:200px;}',
      '.chat-lead-heading{font-size:0.78rem;font-weight:600;color:#7C0832;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;}',
      '.chat-lead-form{display:flex;flex-direction:column;gap:7px;}',
      '.chat-lead-input,.chat-lead-select,.chat-lead-textarea{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid rgba(124,8,50,0.22);border-radius:5px;font-size:0.78rem;font-family:inherit;outline:none;background:#fafafa;color:#333;}',
      '.chat-lead-input:focus,.chat-lead-select:focus,.chat-lead-textarea:focus{border-color:#7C0832;background:#fff;}',
      '.chat-lead-input::placeholder,.chat-lead-textarea::placeholder{color:#bbb;}',
      '.chat-lead-textarea{height:58px;resize:none;}',
      '.chat-lead-gdpr{display:flex;align-items:flex-start;gap:7px;font-size:0.7rem;color:#888;line-height:1.45;cursor:pointer;margin-top:2px;}',
      '.chat-lead-gdpr input{margin-top:2px;flex-shrink:0;accent-color:#7C0832;width:13px;height:13px;}',
      '.chat-lead-err{font-size:0.72rem;color:#c00;display:none;padding:2px 0;}',
      '.chat-lead-submit{background:#7C0832;color:#fff;border:none;border-radius:5px;padding:10px 16px;font-size:0.8rem;font-family:inherit;cursor:pointer;letter-spacing:0.3px;transition:opacity 0.2s;width:100%;text-align:center;}',
      '.chat-lead-submit:hover{opacity:0.88;}',
      '.chat-lead-submit:disabled{opacity:0.5;cursor:default;}',
      '.chat-lead-success{display:none;background:rgba(124,8,50,0.07);border-radius:6px;padding:10px 12px;text-align:center;margin-bottom:4px;}',
      '.chat-lead-success p{font-size:0.82rem;color:#7C0832;margin:0;font-style:italic;}'
    ].join('');
    document.head.appendChild(style);
  },

  injectHTML: function() {
    var widget = document.createElement('div');
    widget.id = 'aaChatWidget';
    widget.innerHTML =
      '<button class="chat-fab" id="chatFab" aria-label="Chat with AA WIGS Concierge">' +
        '<img class="chat-fab-logo" src="' + this.logoPath + '" alt="AA WIGS" width="60" height="60">' +
        '<svg class="chat-fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '<span class="chat-fab-badge">1</span>' +
      '</button>' +

      '<div class="chat-window" id="chatWindow">' +

        '<div class="chat-header">' +
          '<div class="chat-header-left">' +
            '<button class="chat-back-btn" id="chatBackBtn" aria-label="Close chat">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>' +
            '</button>' +
            '<img class="chat-header-logo" src="' + this.logoPath + '" alt="AA WIGS" width="44" height="44">' +
            '<div class="chat-header-text">' +
              '<span class="chat-header-name">AA WIGS Concierge</span>' +
              '<span class="chat-header-status"><span class="chat-status-dot"></span>Your personal wig advisor</span>' +
            '</div>' +
          '</div>' +
          '<button class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +

        '<div class="chat-body" id="chatBody">' +
          '<div class="chat-welcome">' +
            '<img class="chat-welcome-logo" src="' + this.logoPath + '" alt="AA WIGS" width="64" height="64">' +
            '<h3 class="chat-welcome-title">AA WIGS Concierge</h3>' +
            '<p class="chat-welcome-sub">Your personal wig advisor</p>' +
          '</div>' +
        '</div>' +

        '<div class="chat-footer">' +
          '<div class="chat-input-wrap">' +
            '<input type="text" class="chat-input" id="chatInput" placeholder="Ask me anything..." autocomplete="off">' +
            '<button class="chat-send" id="chatSend" aria-label="Send">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="chat-powered">AA WIGS Concierge &middot; Luxury Client Advisor</div>' +
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
      var inp = document.getElementById('chatInput');
      if (inp) inp.focus();
    }, 350);

    if (!this.hasGreeted) {
      this.hasGreeted = true;
      setTimeout(function() {
        var welcome = document.querySelector('.chat-welcome');
        if (welcome) welcome.style.display = 'none';
        self.addBotMessage(
          "Welcome to AA WIGS.<br><br>I'm your personal concierge. I'm here to answer your questions, explain our signature piece, and help you determine whether it's the right fit for you.<br><br>What brings you here today?",
          self.mainMenuReplies
        );
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
    var self = this;

    // ── See all options / restart ──────────────────────────────────────────
    if (lower === '← see all options' || lower === 'see all options' ||
        lower === 'start over' || lower === 'menu' || lower === 'back') {
      this.resetState();
      this.showTyping();
      setTimeout(function() {
        self.hideTyping();
        self.addBotMessage('Of course. How else can I help you?', self.mainMenuReplies);
      }, 380);
      return;
    }

    // ── Active flow: route to flow handler ────────────────────────────────
    if (this.state.flow) {
      this.showTyping();
      setTimeout(function() {
        self.hideTyping();
        self.handleFlowStep(msg);
      }, 420 + Math.random() * 280);
      return;
    }

    // ── Flow triggers (quick replies) ─────────────────────────────────────
    var flowTriggers = {
      'is this my first luxury wig?':          'firsttime',
      'is this my first luxury wig':           'firsttime',
      "yes — it's my first":                   'firsttime',
      "i've worn wigs before":                 'firsttime',
      'is this right for beginners?':          'firsttime',
      'is this good for first-time buyers?':   'firsttime',
      'is this good for first-time buyers':    'firsttime',
      'first time buyers':                     'firsttime',
      'help me understand lengths':            'length',
      'help me choose a length':               'length',
      'help me choose a color':                'color',
      'help me choose a colour':               'color',
      'help me choose a shade':                'color',
      'what is hd lace?':                      'hdlace',
      'what is hd lace':                       'hdlace',
      'learn about hd lace':                   'hdlace',
      'how do i care for it?':                 'care',
      'how do i care for my wig?':             'care',
      'how do i care for my wig':              'care',
      'why does aa wigs offer one product?':   'oneprod',
      'why does aa wigs offer one product':    'oneprod',
      'what makes aa wigs different?':         'different',
      'what makes aa wigs different':          'different',
      'speak with the aa wigs team':           'speak',
      'speak with the team':                   'speak',
      'personal help':                         'speak'
    };

    if (flowTriggers[lower]) {
      this.startFlow(flowTriggers[lower]);
      return;
    }

    // ── Quick actions ──────────────────────────────────────────────────────
    var productUrl = this.knowledge.product.url;
    var quickActions = {
      'tell me about the signature piece': {
        text: 'The AA WIGS signature piece is a <strong>22" 13×6 Swiss HD Lace Body Wave Wig</strong> crafted from 100% virgin human hair at 180% density. Available in six shades and five lengths.<br><br>It is glueless, pre-plucked, and arrives in luxury packaging — ready to wear from the first install.<br><br><a href="' + productUrl + '" class="chat-link">View the Signature Piece →</a><br><a href="/knowledge-center/" class="chat-link">Knowledge Center →</a>',
        followUps: ['What is HD lace?', 'Is this right for beginners?', 'Speak with the AA WIGS team', '← See all options']
      },
      'join the waitlist': {
        text: 'Joining our list ensures you will be notified as soon as the next release becomes available.<br><br><a href="/waitlist.html" class="chat-link">Join the Waitlist →</a>',
        followUps: ['← See all options']
      },
      'contact us': {
        text: 'Reach us at <strong>hello@aawigs.com</strong> or via our <a href="/contact.html" class="chat-link">contact page</a>.',
        followUps: ['Speak with the AA WIGS team', '← See all options']
      }
    };

    if (quickActions[lower]) {
      var action = quickActions[lower];
      this.addBotMessage(action.text, action.followUps);
      return;
    }

    // ── Keyword fallback ───────────────────────────────────────────────────
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

  escapeHtml: function(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  escapeAttr: function(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  AAChat.init();
});
