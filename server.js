const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
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
      pool.query(`SELECT COUNT(*) as total FROM inventory i WHERE active = TRUE
        AND GREATEST(i.stock - COALESCE((SELECT COUNT(*) FROM reservations r WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()),0),0) BETWEEN 1 AND 5`),
      pool.query(`SELECT COUNT(*) as total FROM inventory i WHERE active = TRUE
        AND GREATEST(i.stock - COALESCE((SELECT COUNT(*) FROM reservations r WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()),0),0) = 0`)
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

// ─── PUBLIC INVENTORY API ─────────────────────────────────────────────────────

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.variant_key, i.color_code, i.color_name, i.length, i.stock, i.price,
             i.compare_at_price, i.sku, i.active, i.low_stock_threshold,
        COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0)::int AS reserved,
        GREATEST(i.stock - COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0), 0)::int AS available
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
        reserved: parseInt(row.reserved),
        available: parseInt(row.available),
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
      SELECT i.*,
        COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0)::int AS reserved,
        GREATEST(i.stock - COALESCE((
          SELECT COUNT(*) FROM reservations r
          WHERE r.variant_key = i.variant_key AND r.expires_at > NOW()
        ), 0), 0)::int AS available
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
    if (keyCheck.rows.length === 0) {
      const colorPrefix = (colorName || '').split(' ')[0];
      const fallback = await pool.query(
        `SELECT variant_key FROM inventory
         WHERE (LOWER(color_name) = LOWER($1) OR color_name ILIKE $2)
         AND length = $3 AND active = TRUE LIMIT 1`,
        [colorName, '%' + colorPrefix + '%', parseInt(length) || 0]
      );
      if (fallback.rows.length > 0) {
        resolvedKey = fallback.rows[0].variant_key;
        console.log(`variantKey auto-corrected: "${variantKey}" → "${resolvedKey}"`);
      } else {
        return res.status(404).json({ success: false, error: 'This item is no longer available. Please refresh the page and try again.' });
      }
    }
  } catch (normErr) {
    console.error('Key normalization error:', normErr.message);
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
      return res.status(400).json({ success: false, error: 'This variant is no longer available' });
    }

    // Count active (non-expired) reservations for this variant
    const resCount = await client.query(
      'SELECT COUNT(*) AS cnt FROM reservations WHERE variant_key = $1 AND expires_at > NOW()',
      [resolvedKey]
    );
    const reserved = parseInt(resCount.rows[0].cnt);
    const available = parseInt(stock) - reserved;

    if (available <= 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Sorry, this variant just sold out. Please refresh and try again.' });
    }

    // Create the reservation (15-minute hold)
    const resResult = await client.query(
      'INSERT INTO reservations (variant_key, expires_at) VALUES ($1, NOW() + INTERVAL \'15 minutes\') RETURNING id',
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
      // Stripe failed — release the reservation immediately
      await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);
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

  // ── CHECKOUT EXPIRED: release the reservation ──────────────────────────────
  if (event.type === 'checkout.session.expired') {
    try {
      const del = await pool.query(
        'DELETE FROM reservations WHERE stripe_session_id = $1 RETURNING id, variant_key',
        [sessionId]
      );
      if (del.rows.length > 0) {
        console.log(`Reservation released (session expired): ${del.rows[0].variant_key} — res #${del.rows[0].id}`);
      }
    } catch (err) {
      console.error('Reservation release error:', err.message);
    }
    return;
  }

  if (event.type !== 'checkout.session.completed') return;

  // ── CHECKOUT COMPLETED: confirm sale atomically ────────────────────────────
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

    // Delete the reservation (whether found or not, the sale still records)
    const delRes = await client.query(
      'DELETE FROM reservations WHERE stripe_session_id = $1 OR id = $2 RETURNING id',
      [sessionId, reservationId]
    );
    if (delRes.rows.length > 0) {
      console.log(`Reservation #${delRes.rows[0].id} confirmed — converting to sale`);
    }

    // Atomically decrement stock (never below 0)
    if (variantKey) {
      const stockResult = await client.query(
        'UPDATE inventory SET stock = GREATEST(stock - 1, 0), updated_at = NOW() WHERE variant_key = $1 RETURNING variant_key, stock',
        [variantKey]
      );
      if (stockResult.rows.length > 0) {
        console.log(`Stock: ${variantKey} → ${stockResult.rows[0].stock} remaining`);
      }
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
// Runs every 5 minutes to release any reservations that expired without payment
setInterval(async () => {
  try {
    const result = await pool.query(
      'DELETE FROM reservations WHERE expires_at < NOW() RETURNING id, variant_key'
    );
    if (result.rows.length > 0) {
      console.log(`Cleanup: released ${result.rows.length} expired reservation(s):`, result.rows.map(r => `${r.variant_key}#${r.id}`).join(', '));
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AA Wigs server running on port ${PORT}`);
});
