const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { Pool } = require('pg');
const Stripe = require('stripe');
const multer = require('multer');
const nodemailer = require('nodemailer');

function createMailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendReviewNotification(adminEmail, review) {
  const transport = createMailTransport();
  if (!transport) {
    console.log('[email] SMTP not configured — skipping review notification');
    return;
  }
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const domain = process.env.REPLIT_DEV_DOMAIN || process.env.APP_BASE_URL;
  const adminUrl = domain
    ? `${domain.startsWith('http') ? domain : `https://${domain}`}/admin/#reviews`
    : 'https://yourdomain.com/admin/#reviews';
  const submittedAt = review.created_at ? new Date(review.created_at).toLocaleString() : new Date().toLocaleString();
  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: `New review submitted by ${escapeHtml(review.customer_name)}`,
    html: `
      <h2>New Review Submitted</h2>
      <p><strong>Customer:</strong> ${escapeHtml(review.customer_name)}</p>
      <p><strong>Rating:</strong> ${stars} (${review.rating}/5)</p>
      <p><strong>Review:</strong> ${escapeHtml(review.review_text)}</p>
      <p><strong>Submitted:</strong> ${submittedAt}</p>
      <p><a href="${adminUrl}">Review &amp; moderate in Admin Panel</a></p>
    `
  });
}

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'reviews');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `rev-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const uploadReview = multer({
  storage: reviewStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images only'));
  }
});

const productImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'products');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const uploadProductImg = multer({
  storage: productImgStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images only (JPG, PNG, WebP)'));
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// ─── DATABASE INIT + SEED ─────────────────────────────────────────────────────

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'wigs',
      image_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      visible BOOLEAN DEFAULT TRUE,
      featured BOOLEAN DEFAULT FALSE,
      best_seller BOOLEAN DEFAULT FALSE,
      new_arrival BOOLEAN DEFAULT FALSE,
      on_sale BOOLEAN DEFAULT FALSE,
      compare_at_price NUMERIC(10,2),
      sort_order INTEGER DEFAULT 0,
      subtitle TEXT,
      badge_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      variant_key TEXT UNIQUE NOT NULL,
      color_code TEXT,
      color_name TEXT,
      length INTEGER,
      price NUMERIC(10,2) NOT NULL,
      compare_at_price NUMERIC(10,2),
      stock INTEGER DEFAULT 20,
      reserved INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      sku TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE,
      customer_name TEXT,
      customer_email TEXT,
      product_name TEXT,
      variant_key TEXT,
      variant_description TEXT,
      quantity INTEGER DEFAULT 1,
      amount_total NUMERIC(10,2),
      payment_status TEXT DEFAULT 'pending',
      fulfillment_status TEXT DEFAULT 'unfulfilled',
      tracking_number TEXT,
      tracking_carrier TEXT,
      shipping_name TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_zip TEXT,
      shipping_country TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      variant_key TEXT NOT NULL,
      stripe_session_id TEXT,
      confirmed BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      form_type TEXT DEFAULT 'contact',
      name TEXT,
      email TEXT,
      shade TEXT,
      message TEXT,
      read BOOLEAN DEFAULT FALSE,
      replied BOOLEAN DEFAULT FALSE,
      reply_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT NOT NULL,
      wig_length TEXT,
      wig_texture TEXT,
      verified_purchase BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      approved BOOLEAN DEFAULT FALSE,
      show_on_homepage BOOLEAN DEFAULT FALSE,
      show_on_product BOOLEAN DEFAULT TRUE,
      photo_urls JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL,
      url TEXT NOT NULL,
      alt TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // ── Seed products ──
  const productCount = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(productCount.rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO products (name, slug, description, category, image_url, active, visible)
       VALUES ($1,$2,$3,$4,$5,TRUE,TRUE)`,
      [
        'AA Signature Body Wave',
        '22-swiss-hd-body-wave',
        '100% Virgin Human Hair · 13x6 Swiss HD Lace · 180% Density · Pre-plucked Hairline · Glueless Adjustable Band · Heat Safe up to 392°F',
        'wigs',
        '/assets/og-image.jpg'
      ]
    );
    console.log('[DB] Seeded products table');
  }

  // ── Seed site_settings ──
  const settingsCount = await pool.query('SELECT COUNT(*) FROM site_settings');
  if (parseInt(settingsCount.rows[0].count) === 0) {
    const defaults = [
      ['store_name', 'AA Wigs'],
      ['store_email', 'hello@aawigs.com'],
      ['store_instagram', 'https://instagram.com/aawigshair'],
      ['store_tiktok', ''],
      ['sticky_urgency_text', '🔥 Limited stock available'],
      ['sticky_urgency_active', 'true'],
      ['product_features', JSON.stringify([
        {"title":"100% Virgin Human Hair","subtitle":"Soft, Full & Natural"},
        {"title":"HD Lace","subtitle":"Invisible Melt Finish"},
        {"title":"180% Density","subtitle":"Full Volume Look"},
        {"title":"Pre-Plucked Hairline","subtitle":"Ready to Wear"}
      ])],
      ['product_included_items', JSON.stringify([
        "Luxury magnetic box (burgundy with gold foil logo)",
        "Champagne satin interior lining",
        "Care guide card",
        "Thank-you / confidence card",
        "Protective satin storage bag"
      ])],
      ['care_guide_sections', JSON.stringify([
        {"title":"Washing","intro":"Wash your wig every 7–10 wears, or when product build-up becomes noticeable.","steps":["Gently detangle with a wide-tooth comb before wetting. Start from the ends and work up.","Rinse with lukewarm water — never hot. Hot water damages the cuticle and loosens knots.","Apply a sulfate-free shampoo. Work it through gently — avoid rubbing or twisting the hair.","Rinse thoroughly, then apply a moisturizing conditioner from mid-length to ends.","Leave conditioner for 5–10 minutes, then rinse with cool water to seal the cuticle.","Pat dry with a microfiber towel. Never wring or twist.","Allow to air dry on a wig stand whenever possible."],"tip":"A leave-in conditioner or argan oil on the ends helps maintain softness and shine between washes."},
        {"title":"Detangling","intro":"Gentle detangling prevents shedding and extends the life of your unit.","steps":["Always detangle before washing — wet tangling causes breakage.","Use a wide-tooth comb or detangling brush designed for wigs.","Start at the ends and work your way up to the roots. Never pull from the top down.","Apply a lightweight detangling spray for stubborn knots.","Finger-combing is the gentlest method — use it daily to maintain the body wave pattern."],"tip":"Finger-combing instead of brushing helps reduce shedding and preserves the natural wave pattern."},
        {"title":"Heat Styling","intro":"Our units are heat-safe up to 200°C (392°F), but we recommend using heat sparingly.","steps":["Always apply a heat protectant spray before using any hot tools.","Keep flat iron or curling iron temperatures at or below 180°C (350°F) for regular use.","Avoid applying heat directly to the lace — this can warp or damage the base.","For heatless styles, try flexi rods, braids, or bantu knots overnight.","Limit heat styling to 2–3 times per week maximum."],"tip":"To restore the body wave pattern after straightening, wet the hair and braid it overnight."},
        {"title":"Storage","intro":"Proper storage is essential to maintaining your wig's shape, softness, and longevity.","steps":["Store your wig on a mannequin head or wig stand to maintain its shape.","When traveling, use the satin storage bag included with your order.","Keep your unit away from direct sunlight to prevent color fading.","Wrap or braid loosely before storing to avoid tangling.","Store in a cool, dry place — avoid humid environments."],"tip":"A silk or satin pillowcase reduces friction while sleeping in your unit and helps maintain the style."},
        {"title":"Lace Care","intro":"The lace is the most delicate part of your wig. Handle it with intention.","steps":["When cutting lace, use sharp scissors and follow your natural hairline.","If using adhesive, choose a gentle formula designed for HD lace.","Remove adhesive residue with a lace-safe solvent — never pull or peel aggressively.","Clean the lace area after each wear to keep it clear and re-applicable."],"tip":""}
      ])],
      ['announcement_bar_active', 'true'],
      ['announcement_bar_text', 'FREE U.S. SHIPPING ON ALL ORDERS · LIMITED STOCK AVAILABLE'],
      ['hero_title', 'Where Luxury Meets Confidence'],
      ['hero_subtitle', 'Premium Swiss HD Lace · 180% Density · Free U.S. Shipping'],
      ['shipping_policy', ''],
      ['return_policy', ''],
      ['faq_content', ''],
    ];
    for (const [key, value] of defaults) {
      await pool.query(
        'INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }
    console.log('[DB] Seeded site_settings table');
  }

  // ── Always ensure new keys exist (idempotent migration) ──
  const newKeys = [
    ['product_features', JSON.stringify([
      {"title":"100% Virgin Human Hair","subtitle":"Soft, Full & Natural"},
      {"title":"HD Lace","subtitle":"Invisible Melt Finish"},
      {"title":"180% Density","subtitle":"Full Volume Look"},
      {"title":"Pre-Plucked Hairline","subtitle":"Ready to Wear"}
    ])],
    ['product_included_items', JSON.stringify([
      "Luxury magnetic box (burgundy with gold foil logo)",
      "Champagne satin interior lining",
      "Care guide card",
      "Thank-you / confidence card",
      "Protective satin storage bag"
    ])],
    ['care_guide_sections', JSON.stringify([
      {"title":"Washing","intro":"Wash your wig every 7–10 wears, or when product build-up becomes noticeable.","steps":["Gently detangle with a wide-tooth comb before wetting. Start from the ends and work up.","Rinse with lukewarm water — never hot. Hot water damages the cuticle and loosens knots.","Apply a sulfate-free shampoo. Work it through gently — avoid rubbing or twisting the hair.","Rinse thoroughly, then apply a moisturizing conditioner from mid-length to ends.","Leave conditioner for 5–10 minutes, then rinse with cool water to seal the cuticle.","Pat dry with a microfiber towel. Never wring or twist.","Allow to air dry on a wig stand whenever possible."],"tip":"A leave-in conditioner or argan oil on the ends helps maintain softness and shine between washes."},
      {"title":"Detangling","intro":"Gentle detangling prevents shedding and extends the life of your unit.","steps":["Always detangle before washing — wet tangling causes breakage.","Use a wide-tooth comb or detangling brush designed for wigs.","Start at the ends and work your way up to the roots. Never pull from the top down.","Apply a lightweight detangling spray for stubborn knots.","Finger-combing is the gentlest method — use it daily to maintain the body wave pattern."],"tip":"Finger-combing instead of brushing helps reduce shedding and preserves the natural wave pattern."},
      {"title":"Heat Styling","intro":"Our units are heat-safe up to 200°C (392°F), but we recommend using heat sparingly.","steps":["Always apply a heat protectant spray before using any hot tools.","Keep flat iron or curling iron temperatures at or below 180°C (350°F) for regular use.","Avoid applying heat directly to the lace — this can warp or damage the base.","For heatless styles, try flexi rods, braids, or bantu knots overnight.","Limit heat styling to 2–3 times per week maximum."],"tip":"To restore the body wave pattern after straightening, wet the hair and braid it overnight."},
      {"title":"Storage","intro":"Proper storage is essential to maintaining your wig's shape, softness, and longevity.","steps":["Store your wig on a mannequin head or wig stand to maintain its shape.","When traveling, use the satin storage bag included with your order.","Keep your unit away from direct sunlight to prevent color fading.","Wrap or braid loosely before storing to avoid tangling.","Store in a cool, dry place — avoid humid environments."],"tip":"A silk or satin pillowcase reduces friction while sleeping in your unit and helps maintain the style."},
      {"title":"Lace Care","intro":"The lace is the most delicate part of your wig. Handle it with intention.","steps":["When cutting lace, use sharp scissors and follow your natural hairline.","If using adhesive, choose a gentle formula designed for HD lace.","Remove adhesive residue with a lace-safe solvent — never pull or peel aggressively.","Clean the lace area after each wear to keep it clear and re-applicable."],"tip":""}
    ])]
  ];
  for (const [key, value] of newKeys) {
    await pool.query(
      'INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',
      [key, value]
    );
  }

  // ── Seed inventory ──
  const invCount = await pool.query('SELECT COUNT(*) FROM inventory');
  if (parseInt(invCount.rows[0].count) === 0) {
    const product = await pool.query('SELECT id FROM products WHERE slug=$1', ['22-swiss-hd-body-wave']);
    const productId = product.rows[0]?.id;

    const colors = [
      { code: '1b',  name: '1B Natural Black' },
      { code: '2',   name: '2 Dark Brown'      },
      { code: '4',   name: '4 Medium Brown'    },
      { code: '27',  name: '27 Honey Blonde'   },
      { code: '613', name: '613 Blonde'        },
      { code: '99j', name: '99J Burgundy'      },
    ];
    const lengths = [
      { len: 18, price: 289.00 },
      { len: 20, price: 339.00 },
      { len: 22, price: 379.00 },
      { len: 24, price: 399.00 },
      { len: 26, price: 479.00 },
    ];

    for (const color of colors) {
      for (const { len, price } of lengths) {
        const variantKey = `body-wave-${color.code}-${len}`;
        await pool.query(
          `INSERT INTO inventory (product_id, variant_key, color_code, color_name, length, price, stock, active)
           VALUES ($1,$2,$3,$4,$5,$6,20,TRUE)
           ON CONFLICT (variant_key) DO NOTHING`,
          [productId, variantKey, color.code, color.name, len, price]
        );
      }
    }
    console.log('[DB] Seeded inventory table with 30 variants');
  }
}

app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d'
}));

app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
app.use('/api', express.json());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────

async function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const result = await pool.query(
      'SELECT id FROM admin_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Session expired' });
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Auth check failed' });
  }
}

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ success: false, error: 'Admin password not configured' });
  if (password !== adminPassword) return res.status(401).json({ success: false, error: 'Invalid password' });
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO admin_sessions (token, expires_at) VALUES ($1, $2)',
      [token, expiresAt]
    );
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ success: true, authenticated: true });
});

app.post('/api/admin/logout', requireAdmin, async (req, res) => {
  const token = req.headers['x-admin-token'];
  await pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
  res.json({ success: true });
});

app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  res.json({ success: true, message: 'To permanently change the password, update the ADMIN_PASSWORD environment variable in your Replit Secrets tab.' });
});

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [ordersResult, revenueResult, productsResult, lowStockResult, outOfStockResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM orders'),
      pool.query("SELECT COALESCE(SUM(amount_total), 0) as total FROM orders WHERE payment_status = 'paid'"),
      pool.query('SELECT COUNT(*) as total FROM products WHERE active = TRUE'),
      pool.query(`SELECT COUNT(*) as total FROM inventory WHERE active = TRUE AND stock BETWEEN 1 AND 5`),
      pool.query(`SELECT COUNT(*) as total FROM inventory WHERE active = TRUE AND stock = 0`)
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders: parseInt(ordersResult.rows[0].total),
        totalRevenue: parseFloat(revenueResult.rows[0].total),
        totalProducts: parseInt(productsResult.rows[0].total),
        lowStockVariants: parseInt(lowStockResult.rows[0].total),
        outOfStockVariants: parseInt(outOfStockResult.rows[0].total)
      }
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load stats' });
  }
});

// ─── PRODUCTS CRUD ────────────────────────────────────────────────────────────

app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
        COUNT(DISTINCT i.id) as variant_count,
        SUM(CASE WHEN i.active = TRUE THEN i.stock ELSE 0 END) as total_stock
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error('Products fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const { name, slug, description, category, image_url, active, visible, featured, best_seller, new_arrival, on_sale, compare_at_price, sort_order, subtitle, badge_text } = req.body;
  if (!name || !slug) return res.status(400).json({ success: false, error: 'name and slug required' });
  try {
    const result = await pool.query(
      `INSERT INTO products (name, slug, description, category, image_url, active, visible, featured, best_seller, new_arrival, on_sale, compare_at_price, sort_order, subtitle, badge_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [name, slug, description || null, category || 'wigs', image_url || null,
       active !== false, visible !== false, featured === true, best_seller === true, new_arrival === true, on_sale === true,
       compare_at_price ? parseFloat(compare_at_price) : null, sort_order || 0, subtitle || null, badge_text || null]
    );
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, error: 'Slug already exists' });
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const { name, slug, description, category, image_url, active, visible, featured, best_seller, new_arrival, on_sale, compare_at_price, sort_order, subtitle, badge_text } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, slug=$2, description=$3, category=$4, image_url=$5, active=$6,
       visible=$7, featured=$8, best_seller=$9, new_arrival=$10, on_sale=$11,
       compare_at_price=$12, sort_order=$13, subtitle=$14, badge_text=$15, updated_at=NOW()
       WHERE id=$16 RETURNING *`,
      [name, slug, description, category, image_url, active !== false,
       visible !== false, featured === true, best_seller === true, new_arrival === true, on_sale === true,
       compare_at_price ? parseFloat(compare_at_price) : null, sort_order || 0, subtitle || null, badge_text || null,
       req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

// ─── INVENTORY ADMIN ──────────────────────────────────────────────────────────

app.get('/api/admin/inventory', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.name as product_name,
        COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0)::int AS reserved,
        GREATEST(i.stock - COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0), 0)::int AS available
      FROM inventory i
      LEFT JOIN products p ON p.id = i.product_id
      ORDER BY i.color_name, i.length
    `);
    res.json({ success: true, inventory: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

app.put('/api/admin/inventory/:variantKey', requireAdmin, async (req, res) => {
  const { stock, price, sku, active, color_name, compare_at_price, low_stock_threshold } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (stock !== undefined) { fields.push(`stock=$${idx++}`); values.push(parseInt(stock)); }
    if (price !== undefined) { fields.push(`price=$${idx++}`); values.push(parseFloat(price)); }
    if (sku !== undefined) { fields.push(`sku=$${idx++}`); values.push(sku); }
    if (active !== undefined) { fields.push(`active=$${idx++}`); values.push(active); }
    if (color_name !== undefined) { fields.push(`color_name=$${idx++}`); values.push(color_name); }
    if (compare_at_price !== undefined) { fields.push(`compare_at_price=$${idx++}`); values.push(compare_at_price ? parseFloat(compare_at_price) : null); }
    if (low_stock_threshold !== undefined) { fields.push(`low_stock_threshold=$${idx++}`); values.push(parseInt(low_stock_threshold) || 5); }
    fields.push('updated_at=NOW()');
    values.push(req.params.variantKey);
    const result = await pool.query(
      `UPDATE inventory SET ${fields.join(',')} WHERE variant_key=$${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Variant not found' });
    res.json({ success: true, variant: result.rows[0] });
  } catch (err) {
    console.error('Inventory update error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update inventory' });
  }
});

app.post('/api/admin/inventory/restock-all', requireAdmin, async (req, res) => {
  const { quantity, product_id } = req.body;
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ success: false, error: 'Send { "quantity": 20 }' });
  }
  try {
    let query = 'UPDATE inventory SET stock = $1, updated_at = NOW()';
    const values = [quantity];
    if (product_id) { query += ' WHERE product_id = $2'; values.push(product_id); }
    const result = await pool.query(query, values);
    res.json({ success: true, message: `${result.rowCount} variants restocked to ${quantity}` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Restock failed' });
  }
});

// ─── ORDERS ADMIN ─────────────────────────────────────────────────────────────

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY order_date DESC LIMIT 200'
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

app.post('/api/admin/orders', requireAdmin, async (req, res) => {
  const { customer_name, customer_email, product_name, variant_key, variant_description, quantity, amount_total, payment_status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO orders (customer_name, customer_email, product_name, variant_key, variant_description, quantity, amount_total, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [customer_name, customer_email, product_name, variant_key, variant_description, quantity || 1, amount_total, payment_status || 'paid']
    );
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { payment_status, customer_name, customer_email, fulfillment_status, tracking_number, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET payment_status=$1, customer_name=$2, customer_email=$3,
       fulfillment_status=COALESCE($4, fulfillment_status),
       tracking_number=COALESCE($5, tracking_number),
       notes=COALESCE($6, notes)
       WHERE id=$7 RETURNING *`,
      [payment_status, customer_name, customer_email,
       fulfillment_status || null, tracking_number !== undefined ? tracking_number : null,
       notes !== undefined ? notes : null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// ─── ADMIN: SITE SETTINGS ─────────────────────────────────────────────────────

app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, error: 'Send { settings: { key: value } }' });
  }
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
        [key, String(value)]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// ─── ADMIN: MESSAGES ──────────────────────────────────────────────────────────

app.get('/api/admin/messages', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

// ─── REVIEWS API ─────────────────────────────────────────────────────────────

// Public: get approved reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const { page } = req.query;
    const filter = page === 'homepage'
      ? 'WHERE approved = TRUE AND show_on_homepage = TRUE'
      : page === 'product'
      ? 'WHERE approved = TRUE AND show_on_product = TRUE'
      : 'WHERE approved = TRUE';
    const result = await pool.query(
      `SELECT id, customer_name, rating, review_text, wig_length, wig_texture,
              verified_purchase, featured, photo_urls, created_at
       FROM reviews ${filter}
       ORDER BY featured DESC, created_at DESC`
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

// Public: submit a new review (goes to pending)
app.post('/api/reviews', uploadReview.array('photos', 5), async (req, res) => {
  try {
    const { customer_name, rating, review_text, wig_length, wig_texture } = req.body;
    if (!customer_name || !rating || !review_text) {
      return res.status(400).json({ success: false, error: 'Name, rating, and review are required' });
    }
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be 1–5' });
    }
    const photoUrls = (req.files || []).map(f => `/uploads/reviews/${f.filename}`);
    const insertResult = await pool.query(
      `INSERT INTO reviews (customer_name, rating, review_text, wig_length, wig_texture, photo_urls, approved)
       VALUES ($1,$2,$3,$4,$5,$6,FALSE) RETURNING created_at`,
      [customer_name.trim(), ratingNum, review_text.trim(), wig_length || null, wig_texture || null, JSON.stringify(photoUrls)]
    );
    res.json({ success: true, message: 'Review submitted! It will appear once approved.' });
    try {
      const settingsResult = await pool.query(`SELECT value FROM site_settings WHERE key = 'contact_email'`);
      const adminEmail = settingsResult.rows[0]?.value;
      if (adminEmail) {
        await sendReviewNotification(adminEmail, {
          customer_name: customer_name.trim(),
          rating: ratingNum,
          review_text: review_text.trim(),
          created_at: insertResult.rows[0]?.created_at
        });
      }
    } catch (emailErr) {
      console.error('[email] Failed to send review notification:', emailErr.message);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// Admin: get all reviews
app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reviews ORDER BY approved ASC, created_at DESC`
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

// Admin: create review manually
app.post('/api/admin/reviews', requireAdmin, uploadReview.array('photos', 5), async (req, res) => {
  try {
    const { customer_name, rating, review_text, wig_length, wig_texture,
            verified_purchase, featured, approved, show_on_homepage, show_on_product } = req.body;
    if (!customer_name || !rating || !review_text) {
      return res.status(400).json({ success: false, error: 'Name, rating, and review are required' });
    }
    const photoUrls = (req.files || []).map(f => `/uploads/reviews/${f.filename}`);
    const result = await pool.query(
      `INSERT INTO reviews (customer_name, rating, review_text, wig_length, wig_texture,
                            verified_purchase, featured, approved, show_on_homepage, show_on_product, photo_urls)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [customer_name.trim(), parseInt(rating), review_text.trim(),
       wig_length || null, wig_texture || null,
       verified_purchase === 'true', featured === 'true',
       approved !== 'false', show_on_homepage === 'true', show_on_product !== 'false',
       JSON.stringify(photoUrls)]
    );
    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// Admin: update review
app.put('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const { customer_name, rating, review_text, wig_length, wig_texture,
            verified_purchase, featured, approved, show_on_homepage, show_on_product } = req.body;
    const result = await pool.query(
      `UPDATE reviews SET
        customer_name = COALESCE($1, customer_name),
        rating = COALESCE($2, rating),
        review_text = COALESCE($3, review_text),
        wig_length = $4,
        wig_texture = $5,
        verified_purchase = COALESCE($6, verified_purchase),
        featured = COALESCE($7, featured),
        approved = COALESCE($8, approved),
        show_on_homepage = COALESCE($9, show_on_homepage),
        show_on_product = COALESCE($10, show_on_product)
       WHERE id = $11 RETURNING *`,
      [customer_name || null, rating ? parseInt(rating) : null, review_text || null,
       wig_length || null, wig_texture || null,
       verified_purchase != null ? (verified_purchase === true || verified_purchase === 'true') : null,
       featured != null ? (featured === true || featured === 'true') : null,
       approved != null ? (approved === true || approved === 'true') : null,
       show_on_homepage != null ? (show_on_homepage === true || show_on_homepage === 'true') : null,
       show_on_product != null ? (show_on_product === true || show_on_product === 'true') : null,
       req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// Admin: upload photos to existing review
app.post('/api/admin/reviews/:id/photos', requireAdmin, uploadReview.array('photos', 5), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT photo_urls FROM reviews WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Review not found' });
    const existing = rows[0].photo_urls || [];
    const newUrls = (req.files || []).map(f => `/uploads/reviews/${f.filename}`);
    const merged = [...existing, ...newUrls];
    await pool.query('UPDATE reviews SET photo_urls = $1 WHERE id = $2', [JSON.stringify(merged), req.params.id]);
    res.json({ success: true, photo_urls: merged });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to upload photos' });
  }
});

// Admin: delete a photo from a review
app.delete('/api/admin/reviews/:id/photos', requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    const { rows } = await pool.query('SELECT photo_urls FROM reviews WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Review not found' });
    const filtered = (rows[0].photo_urls || []).filter(u => u !== url);
    await pool.query('UPDATE reviews SET photo_urls = $1 WHERE id = $2', [JSON.stringify(filtered), req.params.id]);
    const filename = path.basename(url);
    const filepath = path.join(__dirname, 'uploads', 'reviews', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ success: true, photo_urls: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete photo' });
  }
});

// Admin: delete review
app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING photo_urls', [req.params.id]);
    if (rows.length > 0) {
      (rows[0].photo_urls || []).forEach(url => {
        const filepath = path.join(__dirname, 'uploads', 'reviews', path.basename(url));
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// ─── PRODUCT IMAGES API ──────────────────────────────────────────────────────

app.get('/api/product-images/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, url, alt, sort_order FROM product_images WHERE slug = $1 ORDER BY sort_order ASC, id ASC',
      [req.params.slug]
    );
    res.json({ success: true, images: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load images' });
  }
});

app.post('/api/admin/product-images/:slug', requireAdmin, uploadProductImg.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });
    const url = `/uploads/products/${req.file.filename}`;
    const alt = req.body.alt || '';
    const { rows: countRows } = await pool.query(
      'SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM product_images WHERE slug = $1',
      [req.params.slug]
    );
    const sort_order = countRows[0].next;
    const { rows } = await pool.query(
      'INSERT INTO product_images (slug, url, alt, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.slug, url, alt, sort_order]
    );
    res.json({ success: true, image: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
});

app.put('/api/admin/product-images/:id', requireAdmin, async (req, res) => {
  try {
    const { alt } = req.body;
    const { rows } = await pool.query(
      'UPDATE product_images SET alt = $1 WHERE id = $2 RETURNING *',
      [alt || '', req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, image: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update image' });
  }
});

app.put('/api/admin/product-images-reorder', requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ success: false, error: 'order must be array' });
    for (const { id, sort_order } of order) {
      await pool.query('UPDATE product_images SET sort_order = $1 WHERE id = $2', [sort_order, id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reorder images' });
  }
});

app.delete('/api/admin/product-images/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM product_images WHERE id = $1 RETURNING url', [req.params.id]);
    if (rows.length > 0) {
      const filepath = path.join(__dirname, 'uploads', 'products', path.basename(rows[0].url));
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
});

// ─── PUBLIC INVENTORY API ─────────────────────────────────────────────────────

app.get('/api/inventory', async (req, res) => {
  try {
    // Stock is decremented immediately when checkout is created and restored on
    // abandonment — so stock IS the available count. No reservation subtraction needed.
    const result = await pool.query(`
      SELECT i.variant_key, i.color_code, i.color_name, i.length, i.stock, i.price,
             i.compare_at_price, i.sku, i.active, i.low_stock_threshold,
        COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW() AND r.confirmed = FALSE
        ), 0)::int AS in_checkout
      FROM inventory i
      ORDER BY i.color_code, i.length
    `);
    const inventory = {};
    for (const row of result.rows) {
      inventory[row.variant_key] = {
        colorCode: row.color_code,
        colorName: row.color_name,
        length: row.length,
        stock: parseInt(row.stock),
        reserved: parseInt(row.in_checkout),
        available: parseInt(row.stock),
        price: row.price,
        compareAtPrice: row.compare_at_price,
        lowStockThreshold: row.low_stock_threshold || 5,
        sku: row.sku,
        active: row.active
      };
    }
    res.json({ success: true, inventory });
  } catch (err) {
    console.error('Inventory fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

app.get('/api/inventory/:variantKey', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, i.stock AS available,
        COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW() AND r.confirmed = FALSE
        ), 0)::int AS in_checkout
      FROM inventory i
      WHERE i.variant_key = $1
    `, [req.params.variantKey]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Variant not found' });
    res.json({ success: true, variant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch variant' });
  }
});

app.post('/api/inventory/decrease', async (req, res) => {
  const { variantKey } = req.body;
  if (!variantKey) return res.status(400).json({ success: false, error: 'variantKey required' });
  try {
    const check = await pool.query('SELECT stock FROM inventory WHERE variant_key = $1', [variantKey]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, error: 'Variant not found' });
    if (check.rows[0].stock <= 0) return res.status(400).json({ success: false, error: 'Out of stock' });
    const result = await pool.query(
      'UPDATE inventory SET stock = stock - 1, updated_at = NOW() WHERE variant_key = $1 AND stock > 0 RETURNING variant_key, stock',
      [variantKey]
    );
    res.json({ success: true, variant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to decrease stock' });
  }
});

// ─── PUBLIC: PRODUCT BY SLUG ──────────────────────────────────────────────────

app.get('/api/products/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE slug = $1 AND active = TRUE LIMIT 1',
      [req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// ─── PUBLIC: SITE SETTINGS ────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// ─── CONTACT & WAITLIST FORMS ─────────────────────────────────────────────────

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!email || !message) return res.status(400).json({ success: false, error: 'Email and message required' });
  try {
    await pool.query(
      'INSERT INTO contact_messages (form_type, name, email, message) VALUES ($1,$2,$3,$4)',
      ['contact', name || '', email, `[${subject || 'General'}] ${message}`]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save message' });
  }
});

app.post('/api/waitlist', async (req, res) => {
  const { email, shade, length } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email required' });
  try {
    await pool.query(
      'INSERT INTO contact_messages (form_type, name, email, shade, message) VALUES ($1,$2,$3,$4,$5)',
      ['waitlist', '', email, shade || '', `Waitlist: ${shade || ''} · ${length || ''}"`]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Waitlist error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save waitlist entry' });
  }
});

// ─── DYNAMIC STRIPE CHECKOUT ──────────────────────────────────────────────────

app.post('/api/checkout', async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(503).json({ success: false, error: 'Stripe not configured' });
  }

  const { variantKey, colorName, length } = req.body;
  console.log(`[CHECKOUT] variantKey="${variantKey}" colorName="${colorName}" length="${length}"`);

  if (!variantKey) {
    return res.status(400).json({ success: false, error: 'Missing variant info' });
  }

  // ── NORMALIZE VARIANT KEY ─────────────────────────────────────────────────
  // If the variantKey doesn't exist in the DB (stale cart data), try to find
  // the correct one by matching color name + length as a fallback.
  let resolvedKey = variantKey;
  try {
    const keyCheck = await pool.query(
      'SELECT variant_key FROM inventory WHERE variant_key = $1 LIMIT 1',
      [variantKey]
    );
    console.log(`[CHECKOUT] DB lookup for "${variantKey}": ${keyCheck.rows.length} rows found`);
    if (keyCheck.rows.length === 0) {
      const colorPrefix = (colorName || '').split(' ')[0];
      const fallback = await pool.query(
        `SELECT variant_key FROM inventory
         WHERE (LOWER(color_name) = LOWER($1) OR color_name ILIKE $2)
         AND length = $3 AND active = TRUE LIMIT 1`,
        [colorName, '%' + colorPrefix + '%', parseInt(length) || 0]
      );
      console.log(`[CHECKOUT] Fallback query (colorName="${colorName}", length=${parseInt(length)||0}): ${fallback.rows.length} rows found`);
      if (fallback.rows.length > 0) {
        resolvedKey = fallback.rows[0].variant_key;
        console.log(`[CHECKOUT] variantKey auto-corrected: "${variantKey}" → "${resolvedKey}"`);
      } else {
        console.error(`[CHECKOUT] FAILED — no match for variantKey="${variantKey}" colorName="${colorName}" length="${length}"`);
        return res.status(404).json({ success: false, error: 'This item is no longer available. Please refresh the page and try again.' });
      }
    }
  } catch (normErr) {
    console.error('[CHECKOUT] Key normalization error:', normErr.message);
  }

  const client = await pool.connect();
  let reservationId = null;

  try {
    // ── ATOMIC RESERVATION ────────────────────────────────────────────────────
    await client.query('BEGIN');

    // Lock this inventory row so concurrent requests must wait
    const lockResult = await client.query(
      'SELECT stock, active, price, color_name, length FROM inventory WHERE variant_key = $1 FOR UPDATE',
      [resolvedKey]
    );

    if (lockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ success: false, error: 'This item is no longer available. Please refresh the page and try again.' });
    }

    const { stock, active, price: dbPrice, color_name: dbColorName, length: dbLength } = lockResult.rows[0];

    if (!active) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ success: false, error: 'This variant is no longer available' });
    }

    // Stock > 0 means physically available (already accounts for in-checkout holds)
    if (parseInt(stock) <= 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(409).json({ success: false, error: 'Sorry, this variant just sold out. Please refresh and try again.' });
    }

    // Decrement stock immediately — this is the authoritative hold.
    // If payment fails/expires, the cleanup job restores +1.
    await client.query(
      'UPDATE inventory SET stock = stock - 1, updated_at = NOW() WHERE variant_key = $1',
      [resolvedKey]
    );

    // Create the reservation (15-minute hold, for tracking + expiry restore)
    const resResult = await client.query(
      'INSERT INTO reservations (variant_key, expires_at, confirmed) VALUES ($1, NOW() + INTERVAL \'15 minutes\', FALSE) RETURNING id',
      [resolvedKey]
    );
    reservationId = resResult.rows[0].id;

    await client.query('COMMIT');
    // ── END ATOMIC RESERVATION ────────────────────────────────────────────────

    const stripe = Stripe(stripeKey);
    const origin = req.headers.origin || `https://${req.headers.host}`;

    let session;
    try {
      // Use DB price — dashboard is the authoritative source, never trust frontend
      const chargeAmount = Math.round(parseFloat(dbPrice) * 100);
      const displayName = dbColorName || colorName || 'Selected Shade';
      const displayLength = dbLength || length || '';

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: chargeAmount,
            product_data: {
              name: `AA Signature Body Wave — ${displayName} · ${displayLength}"`,
              description: '13×6 Swiss HD Lace · 180% Density · Glueless Ready',
              images: [`${origin}/assets/aa-logo.png`],
            },
          },
          quantity: 1,
        }],
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        billing_address_collection: 'required',
        metadata: {
          variant_key: resolvedKey,
          color_name: displayName,
          length: String(displayLength),
          reservation_id: String(reservationId),
          db_price: String(dbPrice),
        },
        success_url: `${origin}/products/22-swiss-hd-body-wave/?order=success`,
        cancel_url:  `${origin}/products/22-swiss-hd-body-wave/?order=cancelled`,
      });
    } catch (stripeErr) {
      // Stripe failed — release the reservation and restore the stock immediately
      await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);
      await pool.query('UPDATE inventory SET stock = stock + 1, updated_at = NOW() WHERE variant_key = $1', [resolvedKey]);
      console.error('Stripe session error:', stripeErr.message);
      return res.status(500).json({ success: false, error: 'Could not create checkout session' });
    }

    // Link the reservation to the Stripe session so the webhook can find it
    await pool.query(
      'UPDATE reservations SET stripe_session_id = $1 WHERE id = $2',
      [session.id, reservationId]
    );

    console.log(`Reservation #${reservationId} created for ${resolvedKey} (session ${session.id})`);
    res.json({ success: true, url: session.url });

  } catch (err) {
    try { await client.query('ROLLBACK'); } catch(_) {}
    // If reservation was created but something else failed, release it
    if (reservationId) {
      await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]).catch(() => {});
    }
    console.error('Checkout error:', err.message);
    res.status(500).json({ success: false, error: 'Could not create checkout session' });
  } finally {
    client.release();
  }
});

app.post('/api/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (endpointSecret) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: 'Webhook failed' });
  }
  await handleStripeEvent(event);
  res.json({ received: true });
});

async function handleStripeEvent(event) {
  const session = event.data.object;
  const sessionId = session.id;
  const metadata = session.metadata || {};

  // ── CHECKOUT EXPIRED: session expired without payment — restore stock ────────
  if (event.type === 'checkout.session.expired') {
    try {
      // Only restore stock for reservations that were NOT confirmed (no payment)
      const del = await pool.query(
        'DELETE FROM reservations WHERE stripe_session_id = $1 AND confirmed = FALSE RETURNING id, variant_key',
        [sessionId]
      );
      if (del.rows.length > 0) {
        const { variant_key, id } = del.rows[0];
        await pool.query('UPDATE inventory SET stock = stock + 1, updated_at = NOW() WHERE variant_key = $1', [variant_key]);
        console.log(`Stock restored (session expired): ${variant_key} — res #${id}`);
      }
    } catch (err) {
      console.error('Reservation release error:', err.message);
    }
    return;
  }

  if (event.type !== 'checkout.session.completed') return;

  // ── CHECKOUT COMPLETED: record sale (stock already decremented at checkout) ─
  const variantKey = metadata.variant_key || null;
  const reservationId = metadata.reservation_id ? parseInt(metadata.reservation_id) : null;
  const customerName = session.customer_details?.name || 'Guest';
  const customerEmail = session.customer_details?.email || null;
  const amountTotal = session.amount_total ? session.amount_total / 100 : null;

  // Extract full shipping address
  const ship = session.shipping_details?.address || session.shipping?.address || null;
  const shipName = session.shipping_details?.name || session.shipping?.name || customerName;
  const shipLine1 = ship?.line1 || '';
  const shipLine2 = ship?.line2 || '';
  const shipCity = ship?.city || '';
  const shipState = ship?.state || '';
  const shipZip = ship?.postal_code || '';
  const shipCountry = ship?.country || '';
  const shipFull = [shipLine1, shipLine2, shipCity, shipState, shipZip, shipCountry]
    .filter(Boolean).join(', ');

  let variantDesc = variantKey || 'Unknown variant';
  if (variantKey) {
    try {
      const inv = await pool.query('SELECT color_name, length FROM inventory WHERE variant_key = $1', [variantKey]);
      if (inv.rows.length > 0) variantDesc = `${inv.rows[0].color_name} · ${inv.rows[0].length}"`;
    } catch(e) {}
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mark confirmed first so cleanup job won't restore stock if it runs now
    await client.query(
      'UPDATE reservations SET confirmed = TRUE WHERE stripe_session_id = $1 OR id = $2',
      [sessionId, reservationId]
    );
    // Then delete — sale is now permanently recorded
    const delRes = await client.query(
      'DELETE FROM reservations WHERE stripe_session_id = $1 OR id = $2 RETURNING id',
      [sessionId, reservationId]
    );
    console.log(`Payment confirmed — sale locked for ${variantKey} (res deleted: ${delRes.rowCount})`);

    // NOTE: stock was already decremented when checkout session was created.
    // Do NOT decrement again here.
    if (variantKey) {
      const cur = await client.query('SELECT stock FROM inventory WHERE variant_key = $1', [variantKey]);
      if (cur.rows.length > 0) console.log(`Stock: ${variantKey} → ${cur.rows[0].stock} remaining`);
    }

    // Record the order
    await client.query(
      `INSERT INTO orders (stripe_session_id, customer_name, customer_email, product_name, variant_key, variant_description, quantity, amount_total, payment_status, shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'paid',$9,$10,$11,$12,$13,$14)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [sessionId, customerName, customerEmail, 'AA Signature Body Wave', variantKey, variantDesc, 1, amountTotal,
       shipName, shipFull, shipCity, shipState, shipZip, shipCountry]
    );

    await client.query('COMMIT');
    console.log('Order recorded:', sessionId, '| Ship to:', shipFull || 'no address');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Order/stock update error:', err.message);
  } finally {
    client.release();
  }
}

// ─── RESERVATION CLEANUP JOB ──────────────────────────────────────────────────
// Runs every 5 minutes. Deletes expired reservations that were NOT confirmed
// (i.e. the customer never completed payment) and restores stock for each.
setInterval(async () => {
  try {
    const result = await pool.query(
      'DELETE FROM reservations WHERE expires_at < NOW() AND confirmed = FALSE RETURNING id, variant_key'
    );
    if (result.rows.length > 0) {
      for (const row of result.rows) {
        await pool.query(
          'UPDATE inventory SET stock = stock + 1, updated_at = NOW() WHERE variant_key = $1',
          [row.variant_key]
        );
      }
      console.log(`Cleanup: restored stock for ${result.rows.length} abandoned checkout(s):`, result.rows.map(r => `${r.variant_key}#${r.id}`).join(', '));
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}, 5 * 60 * 1000);

// ─── ADMIN PAGE PROTECTION ────────────────────────────────────────────────────

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));

// ─── CATCH-ALL ────────────────────────────────────────────────────────────────

app.get(/.*/, (req, res) => {
  const reqPath = req.path;
  if (reqPath.indexOf('.') === -1) {
    const htmlPath = path.join(__dirname, reqPath, 'index.html');
    res.sendFile(htmlPath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, reqPath + '.html'), (err2) => {
          if (err2) res.status(404).sendFile(path.join(__dirname, 'index.html'));
        });
      }
    });
  } else {
    res.status(404).send('Not found');
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`AA Wigs server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[DB] initDatabase failed:', err.message);
    process.exit(1);
  });
