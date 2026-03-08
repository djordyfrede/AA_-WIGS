const express = require('express');
const path = require('path');
const { Pool } = require('pg');

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

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT variant_key, color_code, color_name, length, stock FROM inventory ORDER BY color_code, length'
    );
    const inventory = {};
    for (const row of result.rows) {
      inventory[row.variant_key] = {
        colorCode: row.color_code,
        colorName: row.color_name,
        length: row.length,
        stock: row.stock
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
    const result = await pool.query(
      'SELECT variant_key, color_code, color_name, length, stock FROM inventory WHERE variant_key = $1',
      [req.params.variantKey]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Variant not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      variant: {
        key: row.variant_key,
        colorCode: row.color_code,
        colorName: row.color_name,
        length: row.length,
        stock: row.stock
      }
    });
  } catch (err) {
    console.error('Variant fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch variant' });
  }
});

app.post('/api/inventory/restock', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid body. Send { "variant_key": quantity }' });
  }

  try {
    const results = [];
    for (const [key, quantity] of Object.entries(updates)) {
      if (typeof quantity !== 'number' || quantity < 0) {
        results.push({ key, error: 'Invalid quantity' });
        continue;
      }
      const result = await pool.query(
        'UPDATE inventory SET stock = $1, updated_at = NOW() WHERE variant_key = $2 RETURNING variant_key, stock',
        [quantity, key]
      );
      if (result.rows.length === 0) {
        results.push({ key, error: 'Variant not found' });
      } else {
        results.push({ key, stock: result.rows[0].stock });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    console.error('Restock error:', err.message);
    res.status(500).json({ success: false, error: 'Restock failed' });
  }
});

app.post('/api/inventory/restock-all', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { quantity } = req.body;
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ success: false, error: 'Send { "quantity": 20 }' });
  }

  try {
    const result = await pool.query(
      'UPDATE inventory SET stock = $1, updated_at = NOW()',
      [quantity]
    );
    res.json({ success: true, message: `All ${result.rowCount} variants restocked to ${quantity}` });
  } catch (err) {
    console.error('Restock-all error:', err.message);
    res.status(500).json({ success: false, error: 'Restock failed' });
  }
});

app.post('/api/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.log('Stripe webhook: No STRIPE_WEBHOOK_SECRET set, processing without verification');
    try {
      const event = JSON.parse(req.body);
      await handleStripeEvent(event);
    } catch (err) {
      console.error('Webhook parse error:', err.message);
      return res.status(400).json({ error: 'Invalid payload' });
    }
    return res.json({ received: true });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    await handleStripeEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

async function handleStripeEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment completed:', session.id);

    const url = session.url || '';
    const metadata = session.metadata || {};

    let variantKey = metadata.variant_key;

    if (!variantKey && session.line_items) {
      console.log('No variant_key in metadata, checking line items');
    }

    if (variantKey) {
      try {
        const result = await pool.query(
          'UPDATE inventory SET stock = GREATEST(stock - 1, 0), updated_at = NOW() WHERE variant_key = $1 RETURNING variant_key, stock',
          [variantKey]
        );
        if (result.rows.length > 0) {
          console.log(`Stock decreased: ${variantKey} -> ${result.rows[0].stock} remaining`);
        } else {
          console.log(`Variant not found: ${variantKey}`);
        }
      } catch (err) {
        console.error('Stock decrease error:', err.message);
      }
    } else {
      console.log('No variant_key found in session metadata. Add variant_key to Stripe payment link metadata for automatic stock tracking.');
    }
  }
}

app.post('/api/inventory/decrease', async (req, res) => {
  const { variantKey } = req.body;
  if (!variantKey) {
    return res.status(400).json({ success: false, error: 'variantKey required' });
  }

  try {
    const check = await pool.query(
      'SELECT stock FROM inventory WHERE variant_key = $1',
      [variantKey]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Variant not found' });
    }
    if (check.rows[0].stock <= 0) {
      return res.status(400).json({ success: false, error: 'Out of stock' });
    }

    const result = await pool.query(
      'UPDATE inventory SET stock = stock - 1, updated_at = NOW() WHERE variant_key = $1 AND stock > 0 RETURNING variant_key, stock',
      [variantKey]
    );
    res.json({ success: true, variant: result.rows[0] });
  } catch (err) {
    console.error('Decrease error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to decrease stock' });
  }
});

app.get('*', (req, res) => {
  const reqPath = req.path;
  if (reqPath.indexOf('.') === -1) {
    const htmlPath = path.join(__dirname, reqPath, 'index.html');
    res.sendFile(htmlPath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, reqPath + '.html'), (err2) => {
          if (err2) {
            res.status(404).sendFile(path.join(__dirname, 'index.html'));
          }
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
