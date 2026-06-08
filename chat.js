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
      name: 'AA Signature Body Wave',
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
      box: 'Luxury magnetic burgundy box with gold foil logo',
      interior: 'Champagne satin lining',
      includes: ['Care guide card', 'Confidence card', 'Protective satin storage bag']
    }
  },

  logoPath: '/assets/aa-logo.png',

  mainMenuReplies: [
    'Help me choose a length',
    'Help me choose a color',
    'Is this good for first-time buyers?',
    'Learn about HD lace',
    'How do I care for my wig?',
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
      case 'length':    this.flowLength(input);    break;
      case 'color':     this.flowColor(input);     break;
      case 'firsttime': this.flowFirstTime(input); break;
      case 'hdlace':    this.flowHDLace();         break;
      case 'care':      this.flowCare();           break;
      case 'different': this.flowDifferent();      break;
      case 'speak':     this.flowSpeak();          break;
      default:          this.resetState();
    }
  },

  // Flow 1 — Length Help
  flowLength: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'What look are you going for?',
        ['Natural everyday look', 'Elegant and versatile', 'Glamorous and bold', 'Statement luxury look']
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var rec = '';

    if (lower.indexOf('natural') !== -1 || lower.indexOf('everyday') !== -1) {
      rec = '<strong>18" or 20"</strong> — a shorter, effortless length ideal for daily wear. Full body wave movement without the extra weight. Practical, polished, and easy to manage.';
    } else if (lower.indexOf('elegant') !== -1 || lower.indexOf('versatile') !== -1) {
      rec = '<strong>22"</strong> — our most popular length and our top recommendation for most lifestyles. Bra-strap length with maximum versatility and stunning natural movement.';
    } else if (lower.indexOf('glamorous') !== -1 || lower.indexOf('bold') !== -1) {
      rec = '<strong>24"</strong> — mid-back length with a dramatic cascade and beautiful body wave movement. A statement that is striking without being overpowering.';
    } else if (lower.indexOf('statement') !== -1 || lower.indexOf('luxury') !== -1) {
      rec = '<strong>26"</strong> — our longest, most striking option. Lower-back length with full glamour and a truly powerful presence.';
    } else {
      rec = '<strong>22"</strong> — our most popular and versatile length. A beautiful starting point for most lifestyles.';
    }

    this.addBotMessage(
      'For your style, we recommend ' + rec +
      '<br><br>Explore further:<br>' +
      '<a href="/wig-length-guide/" class="chat-link">Full Length Guide →</a><br>' +
      '<a href="/best-wig-length-for-beginners/" class="chat-link">Best Length For Beginners →</a>',
      ['Shop The Crown', 'Help me choose a color', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 2 — Color Help
  flowColor: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'What style feels most like you?',
        ['Classic and natural', 'Soft brown luxury', 'Warm highlighted look', 'Bold burgundy statement', 'Blonde luxury look']
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var rec = '';

    if (lower.indexOf('classic') !== -1 || lower.indexOf('natural') !== -1) {
      rec = '<strong>1B Natural Black</strong> — our bestseller and most universally flattering shade. A rich, deep natural black that works beautifully on all skin tones. The most versatile colour we offer.';
    } else if (lower.indexOf('soft') !== -1 || lower.indexOf('brown') !== -1) {
      rec = '<strong>Dark Brown or Medium Brown</strong> — warm, elevated, and deeply luxurious. Ideal for those who want depth without going full black. A quiet sophistication.';
    } else if (lower.indexOf('warm') !== -1 || lower.indexOf('highlight') !== -1 || lower.indexOf('honey') !== -1) {
      rec = '<strong>Honey Blonde (27)</strong> — a warm, golden-highlighted shade that catches light beautifully. Radiant and sun-kissed, with a natural-looking dimension.';
    } else if (lower.indexOf('burgundy') !== -1 || lower.indexOf('bold') !== -1 || lower.indexOf('statement') !== -1) {
      rec = '<strong>99J Burgundy</strong> — a rich, deep wine-toned shade that makes a confident and unforgettable statement. Our most distinctive colour.';
    } else if (lower.indexOf('blonde') !== -1) {
      rec = '<strong>613 Blonde</strong> — platinum luxury. A bright, high-impact blonde that is bold, striking, and completely premium.';
    } else {
      rec = '<strong>1B Natural Black</strong> — our most popular and universally flattering shade. Always a beautiful starting point.';
    }

    this.addBotMessage(
      'Based on your style, we suggest ' + rec +
      '<br><br><a href="/knowledge-center/" class="chat-link">Explore the Knowledge Center →</a>',
      ['Shop The Crown', 'Help me choose a length', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 3 — First-Time Buyer
  flowFirstTime: function(input) {
    if (this.state.step === 0) {
      this.state.step = 1;
      this.addBotMessage(
        'Is this your first premium wig?',
        ["Yes — it's my first", "I've worn wigs before"]
      );
      return;
    }

    var lower = (input || '').toLowerCase();
    var isFirst = lower.indexOf('yes') !== -1 || lower.indexOf('first') !== -1;

    if (isFirst) {
      this.addBotMessage(
        "We're glad you're here.<br><br>" +
        "For a first AA WIGS unit, we recommend starting with a <strong>22\" 1B Natural Black Body Wave</strong>. " +
        "It gives a luxury look while still feeling natural, versatile, and easy to style — no salon required.<br><br>" +
        "It is 100% glueless with an adjustable band and combs, so you can install it confidently at home in minutes.<br><br>" +
        "We suggest reading these first:<br>" +
        '<a href="/hd-lace-guide/" class="chat-link">Understanding HD Lace →</a><br>' +
        '<a href="/body-wave-guide/" class="chat-link">Why Body Wave →</a><br>' +
        '<a href="/wig-length-guide/" class="chat-link">Choosing Your Length →</a><br>' +
        '<a href="/wig-care/" class="chat-link">Wig Care Basics →</a>',
        ['Shop The Crown', 'Help me choose a length', 'Speak with the AA WIGS team', '← See all options']
      );
    } else {
      this.addBotMessage(
        "Welcome back. You already know the difference quality makes.<br><br>" +
        "The AA WIGS Signature Body Wave offers <strong>13×6 Swiss HD lace, 180% density, 100% virgin human hair</strong> — and a glueless, adjustable fit that makes every install effortless.<br><br>" +
        "Available in 6 colours and 5 lengths — 30 unique combinations.<br><br>" +
        '<a href="/products/22-swiss-hd-body-wave/" class="chat-link">View the Collection →</a><br>' +
        '<a href="/body-wave-guide/" class="chat-link">Why Body Wave →</a>',
        ['Help me choose a length', 'Help me choose a color', 'Speak with the AA WIGS team', '← See all options']
      );
    }
    this.resetState();
  },

  // Flow 4 — HD Lace
  flowHDLace: function() {
    this.addBotMessage(
      "HD lace — high-definition lace — is an ultra-thin Swiss material that blends more naturally into the skin, helping create a softer, more invisible hairline.<br><br>" +
      "Unlike standard lace, it works across <strong>all skin tones</strong> without additional tinting or makeup. The AA WIGS signature unit uses a <strong>13×6 Swiss HD lace</strong> panel — the widest, finest grade available — combined with pre-bleached knots and a pre-plucked hairline.<br><br>" +
      "The result: a completely natural-looking install from the very first wear.<br><br>" +
      '<a href="/hd-lace-guide/" class="chat-link">Full HD Lace Guide →</a><br>' +
      '<a href="/hd-lace-vs-transparent-lace/" class="chat-link">HD Lace vs Transparent Lace →</a>',
      ['Shop The Crown', 'Is this good for first-time buyers?', 'What makes AA WIGS different?', '← See all options']
    );
    this.resetState();
  },

  // Flow 5 — Wig Care
  flowCare: function() {
    this.addBotMessage(
      "Luxury hair lasts longer when it is washed gently, stored properly, and protected from dryness and excess heat.<br><br>" +
      "&bull; <strong>Wash every 10–14 days</strong> with a sulphate-free shampoo<br>" +
      "&bull; <strong>Deep condition monthly</strong> to restore moisture and suppleness<br>" +
      "&bull; <strong>Minimise heat styling</strong> — air dry when possible; use protectant spray when you do<br>" +
      "&bull; <strong>Store correctly</strong> — on a wig stand overnight, or in the included satin bag for longer storage<br>" +
      "&bull; <strong>Never sleep in your wig</strong><br><br>" +
      "With proper care, an AA WIGS unit lasts <strong>1–3 years</strong>.<br><br>" +
      '<a href="/wig-care/" class="chat-link">Full Care Guide →</a><br>' +
      '<a href="/how-to-store-a-human-hair-wig/" class="chat-link">How To Store Your Wig →</a><br>' +
      '<a href="/how-long-does-a-body-wave-wig-last/" class="chat-link">How Long Does It Last? →</a>',
      ['Shop The Crown', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 6 — What Makes AA WIGS Different
  flowDifferent: function() {
    this.addBotMessage(
      "AA WIGS focuses on premium Body Wave wigs only. Every detail is intentional:<br><br>" +
      "&bull; <strong>13×6 Swiss HD lace</strong> — the finest grade for an undetectable install on all skin tones<br>" +
      "&bull; <strong>180% density</strong> — full, voluminous, and completely natural-looking<br>" +
      "&bull; <strong>100% virgin human hair</strong> — unprocessed, heat-styleable, long-lasting<br>" +
      "&bull; <strong>Glueless-ready construction</strong> — adjustable band and combs; no adhesive needed<br>" +
      "&bull; <strong>Luxury burgundy packaging</strong> — magnetic box, gold foil logo, champagne satin lining<br>" +
      "&bull; <strong>6 colours × 5 lengths</strong> — 30 thoughtfully chosen combinations<br><br>" +
      "A brand experience built entirely around confidence.<br><br>" +
      '<a href="/body-wave-guide/" class="chat-link">The Body Wave Standard →</a><br>' +
      '<a href="/luxury-packaging/" class="chat-link">The AA WIGS Experience →</a><br>' +
      '<a href="/knowledge-center/" class="chat-link">Knowledge Center →</a>',
      ['Shop The Crown', 'Is this good for first-time buyers?', 'Speak with the AA WIGS team', '← See all options']
    );
    this.resetState();
  },

  // Flow 7 — Speak with Team + Lead Capture
  flowSpeak: function() {
    this.resetState();
    this.addBotMessage(
      "Our team is here for you. You can reach us at:<br><br>" +
      "<strong>Email:</strong> hello@aawigs.com<br>" +
      '<strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank" class="chat-link">@aawigshair</a><br>' +
      '<strong>Contact form:</strong> <a href="/contact.html" class="chat-link">Contact page →</a><br><br>' +
      "Or share a few details below — we will reach out personally within 24 hours.",
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
              '<option value="">Preferred length...</option>' +
              '<option value="18&quot;">18"</option>' +
              '<option value="20&quot;">20"</option>' +
              '<option value="22&quot;">22"</option>' +
              '<option value="24&quot;">24"</option>' +
              '<option value="26&quot;">26"</option>' +
              '<option value="Not sure yet">Not sure yet</option>' +
            '</select>' +
            '<select id="leadColor" class="chat-lead-select">' +
              '<option value="">Preferred colour...</option>' +
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
            'We have received your details and will be in touch soon.<br><br>' +
            'In the meantime, explore the AA WIGS Knowledge Center whenever you are ready.<br><br>' +
            '<a href="/knowledge-center/" class="chat-link">Knowledge Center →</a><br>' +
            '<a href="/products/22-swiss-hd-body-wave/" class="chat-link">View the Signature Collection →</a>',
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
        return "Hello — welcome to AA WIGS. I'm your personal wig concierge. How can I help you choose your perfect crown today?";
      },
      followUps: ['Help me choose a length', 'Help me choose a color', 'Is this good for first-time buyers?']
    },
    {
      keywords: ['price', 'cost', 'how much', 'pricing', 'expensive', 'cheap', 'afford', 'dollar', '$'],
      response: function(k) {
        return 'The AA Signature Body Wave ranges from <strong>' + k.product.priceRange + '</strong> depending on length and colour. The most popular option — 22", 1B Natural Black — is <strong>' + k.product.defaultPrice + '</strong>. Free U.S. shipping is included on every order.';
      },
      followUps: ['Help me choose a length', 'Help me choose a color', 'Shop The Crown']
    },
    {
      keywords: ['length', 'long', 'short', 'inch', 'inches', '18', '20', '22', '24', '26', 'size'],
      response: function(k) {
        return 'We offer five lengths: <strong>' + k.product.lengths.join(', ') + '</strong>.<br><br>Our most popular is 22" — bra-strap length with maximum versatility. Shorter lengths (18"–20") suit everyday wear; 24"–26" deliver a more dramatic, glamorous look.';
      },
      followUps: ['Help me choose a length', 'Best length for beginners?', 'Shop The Crown']
    },
    {
      keywords: ['color', 'colour', 'shade', 'black', 'brown', 'blonde', 'burgundy', 'honey', '1b', '613', '99j', 'natural', 'platinum', 'chocolate'],
      response: function() {
        return 'We offer six shades:<br><br><strong>1B Natural Black</strong> — bestseller<br><strong>Dark Brown</strong><br><strong>Medium Brown</strong><br><strong>Honey Blonde (27)</strong><br><strong>99J Burgundy</strong><br><strong>613 Blonde</strong><br><br>Would you like help choosing the right shade for your style?';
      },
      followUps: ['Help me choose a color', 'Shop The Crown', 'Join the waitlist']
    },
    {
      keywords: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'long to get', 'when will', 'tracking', 'track'],
      response: function(k) {
        return 'We offer <strong>free standard shipping</strong> on all U.S. orders.<br><br><strong>Processing:</strong> ' + k.shipping.processing + '<br><strong>Delivery:</strong> ' + k.shipping.delivery + '<br><strong>Tracking:</strong> ' + k.shipping.tracking + '<br><br>We currently ship within the U.S. only.';
      },
      followUps: ['International shipping?', 'Return policy', 'Shop The Crown']
    },
    {
      keywords: ['return', 'refund', 'exchange', 'send back', 'money back', 'not satisfied', 'wrong'],
      response: function(k) {
        return 'We accept returns within <strong>' + k.returns.window + '</strong>. Requirements:<br><br>' + k.returns.conditions.map(function(c) { return '&bull; ' + c; }).join('<br>') + '<br><br>Approved refunds are processed within <strong>' + k.returns.refundTime + '</strong>. Email <strong>hello@aawigs.com</strong> to begin.';
      },
      followUps: ['Speak with the AA WIGS team', 'Shipping details', 'Shop The Crown']
    },
    {
      keywords: ['glueless', 'glue', 'adhesive', 'tape', 'install', 'put on', 'wear', 'apply', 'application'],
      response: function() {
        return 'Our wig is <strong>100% glueless</strong>. An adjustable band and combs provide a secure, comfortable fit — no adhesive required. Place it on, adjust the straps, and go. The 13×6 Swiss HD lace creates a seamless, natural hairline.';
      },
      followUps: ['Is this good for first-time buyers?', 'Learn about HD lace', 'Shop The Crown']
    },
    {
      keywords: ['hd lace', 'lace', 'swiss', 'hairline', 'natural look', 'undetectable', 'invisible', 'melt'],
      response: function() {
        return 'We use <strong>13×6 Swiss HD lace</strong> — an ultra-thin, sheer material that blends into any skin tone and creates the illusion that hair is growing directly from the scalp. Combined with pre-bleached knots and a pre-plucked hairline, the result is completely undetectable.';
      },
      followUps: ['Learn about HD lace', 'Is it pre-plucked?', 'Shop The Crown']
    },
    {
      keywords: ['care', 'wash', 'maintain', 'shampoo', 'conditioner', 'style', 'heat', 'curl', 'straighten', 'store', 'storage', 'last', 'lifespan', 'how long', 'durable'],
      response: function() {
        return 'With proper care, our wigs last <strong>1–3 years</strong>. Key steps:<br><br>&bull; Wash every 10–14 wears with sulphate-free shampoo<br>&bull; Deep condition monthly<br>&bull; Use heat protectant before styling (safe to 392°F)<br>&bull; Store on a wig stand or in the satin bag between wears<br>&bull; Detangle gently from ends to roots<br><br>A care guide is included with every order.';
      },
      followUps: ['How do I care for my wig?', 'What comes in the box?', 'Shop The Crown']
    },
    {
      keywords: ['package', 'packaging', 'box', 'unbox', 'include', 'come with', "what's in", 'whats in', 'gift'],
      response: function(k) {
        return 'Every order arrives in a <strong>luxury magnetic burgundy box</strong> with gold foil logo and champagne satin lining. Inside:<br><br>&bull; ' + k.packaging.includes.join('<br>&bull; ') + '<br><br>Many customers say it feels like opening a luxury gift.';
      },
      followUps: ['What makes AA WIGS different?', 'Shipping details', 'Shop The Crown']
    },
    {
      keywords: ['density', '180', 'thick', 'thin', 'full', 'volume', 'natural density'],
      response: function() {
        return 'Our wigs feature <strong>180% density</strong> — full and voluminous while still looking completely natural. This is the ideal balance: not flat, not overdone. Effortless confidence from day one.';
      },
      followUps: ['What makes AA WIGS different?', 'Help me choose a length', 'Shop The Crown']
    },
    {
      keywords: ['hair type', 'virgin', 'human hair', 'real hair', 'synthetic', 'quality', 'material', 'body wave', 'texture', 'pattern'],
      response: function() {
        return 'Our wigs use <strong>100% virgin human hair</strong> in a body wave pattern — never chemically processed, heat-styleable, and soft-textured. Body wave is our most versatile texture: stunning worn as a natural wave, straightened, or styled with more curl.';
      },
      followUps: ['Body wave vs straight?', 'How long does it last?', 'Shop The Crown']
    },
    {
      keywords: ['beginner', 'first wig', 'first time', 'new to wigs', 'never worn', 'recommend', 'suggestion', 'best', 'popular'],
      response: function(k) {
        return 'For first-time buyers, we recommend:<br><br><strong>Length:</strong> 22" — the most versatile starting point<br><strong>Colour:</strong> 1B Natural Black — our bestseller<br><strong>Price:</strong> ' + k.product.defaultPrice + '<br><br>Glueless, adjustable, and ready to wear from day one — no salon visit needed.';
      },
      followUps: ['Is this good for first-time buyers?', 'Learn about HD lace', 'Shop The Crown']
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'speak', 'customer service', 'support', 'help me'],
      response: function() {
        return 'You can reach our team at:<br><br><strong>Email:</strong> hello@aawigs.com<br><strong>Instagram:</strong> <a href="https://instagram.com/aawigshair" target="_blank" class="chat-link">@aawigshair</a><br><strong>Contact form:</strong> <a href="/contact.html" class="chat-link">Contact page</a><br><br>We respond within 24 hours. For a faster reply, DM us on Instagram.';
      },
      followUps: ['Speak with the AA WIGS team', 'Return policy', 'Shop The Crown']
    },
    {
      keywords: ['payment', 'pay', 'checkout', 'stripe', 'credit card', 'debit', 'secure', 'safe'],
      response: function() {
        return 'We use <strong>Stripe</strong> for all payments — one of the most trusted processors globally. All major credit and debit cards, Apple Pay, and Google Pay are accepted. Your payment information is fully encrypted.';
      },
      followUps: ['Shipping details', 'Return policy', 'Shop The Crown']
    },
    {
      keywords: ['waitlist', 'notify', 'restock', 'back in stock', 'sold out', 'available', 'when available'],
      response: function() {
        return 'Some shades sell out quickly. If your preferred shade is unavailable, <a href="/waitlist.html" class="chat-link">join our waitlist</a> and we will notify you by email the moment it is back. Takes just a few seconds.';
      },
      followUps: ['Help me choose a color', 'Shop The Crown']
    },
    {
      keywords: ['pre-plucked', 'preplucked', 'plucked', 'baby hair', 'natural hairline'],
      response: function() {
        return 'Yes — our wig comes <strong>pre-plucked</strong> with a natural hairline right out of the box. Baby hairs are already customised. No plucking, no additional preparation — place it on, adjust, and go.';
      },
      followUps: ['Is it glueless?', 'Learn about HD lace', 'Shop The Crown']
    },
    {
      keywords: ['order', 'where is my', 'track my', 'status', 'shipped', 'processing'],
      response: function() {
        return 'Once your order is placed, you will receive a confirmation email. Once shipped (within 1–3 business days), a tracking number is sent via email. No update yet? Email <strong>hello@aawigs.com</strong> with your order number.';
      },
      followUps: ['Shipping details', 'Speak with the AA WIGS team']
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'awesome', 'perfect', 'wonderful'],
      response: function() {
        return "You are very welcome. We hope to be part of your confidence journey. If anything else comes up, I am always here.";
      },
      followUps: ['Shop The Crown', '← See all options']
    },
    {
      keywords: ['international', 'outside us', 'canada', 'uk', 'europe', 'africa', 'asia', 'nigeria', 'abroad'],
      response: function() {
        return 'We currently ship within the <strong>United States only</strong>. International shipping is coming. <a href="/waitlist.html" class="chat-link">Join our waitlist</a> to be notified when it launches.';
      },
      followUps: ['U.S. shipping details', '← See all options']
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
      text: "I am happy to help. Ask me about lengths, colours, HD lace, care — or let me connect you with our team personally.",
      followUps: ['Help me choose a length', 'Help me choose a color', 'Speak with the AA WIGS team', '← See all options']
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
          '<div class="chat-powered">AA WIGS Concierge &middot; Luxury Wig Advisor</div>' +
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
          "Welcome to AA WIGS. I'm here to help you choose your perfect crown with confidence.",
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
        self.addBotMessage('How else can I help you today?', self.mainMenuReplies);
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

    // ── Flow triggers (initial quick replies) ─────────────────────────────
    var flowTriggers = {
      'help me choose a length': 'length',
      'help me choose a color': 'color',
      'help me choose a colour': 'color',
      'is this good for first-time buyers?': 'firsttime',
      'is this good for first-time buyers': 'firsttime',
      "yes — it's my first": 'firsttime',
      "i've worn wigs before": 'firsttime',
      'first time buyers': 'firsttime',
      'learn about hd lace': 'hdlace',
      'how do i care for my wig?': 'care',
      'how do i care for my wig': 'care',
      'what makes aa wigs different?': 'different',
      'what makes aa wigs different': 'different',
      'speak with the aa wigs team': 'speak',
      'speak with the team': 'speak',
      'personal help': 'speak'
    };

    if (flowTriggers[lower]) {
      this.startFlow(flowTriggers[lower]);
      return;
    }

    // ── Quick actions ──────────────────────────────────────────────────────
    var productUrl = this.knowledge.product.url;
    var quickActions = {
      'shop now':       { text: 'Explore the full collection — 6 colours, 5 lengths, all in 13×6 Swiss HD lace.<br><br><a href="' + productUrl + '" class="chat-link">Shop The Signature Body Wave →</a>', followUps: ['← See all options'] },
      'shop the crown': { text: 'Explore the full collection — 6 colours, 5 lengths, all in 13×6 Swiss HD lace.<br><br><a href="' + productUrl + '" class="chat-link">Shop The Signature Body Wave →</a>', followUps: ['← See all options'] },
      'shop':           { text: '<a href="' + productUrl + '" class="chat-link">Shop The Signature Body Wave →</a>', followUps: ['← See all options'] },
      'buy now':        { text: '<a href="' + productUrl + '" class="chat-link">Shop The Signature Body Wave →</a>', followUps: [] },
      'join the waitlist': { text: 'Join our waitlist to be notified when your preferred shade is available.<br><br><a href="/waitlist.html" class="chat-link">Join the Waitlist →</a>', followUps: ['← See all options'] },
      'full care guide':   { text: '<a href="/care.html" class="chat-link">View the Full Care Guide →</a>', followUps: ['← See all options'] },
      'contact us':        { text: 'Reach us at <strong>hello@aawigs.com</strong> or via our <a href="/contact.html" class="chat-link">contact page</a>.', followUps: ['Speak with the AA WIGS team', '← See all options'] }
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
