const express = require('express');
const app = express();
const port = 3000;
const db = require('./database'); 

app.use(express.json()); 

// GET /api/flavors: Returns an array of flavors.
app.get('/api/flavors', (req, res) => {
  db.all('SELECT * FROM flavors', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/flavors/:id: Returns a single flavor.
app.get('/api/flavors/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM flavors WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Flavor not found' });
    }
    res.json(row);
  });
});

// POST /api/flavors: Has the flavor to create as the payload, and returns the created flavor.
app.post('/api/flavors', (req, res) => {
  const { name, is_favorite } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run('INSERT INTO flavors (name, is_favorite) VALUES (?, ?)', [name, is_favorite || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.get('SELECT * FROM flavors WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// DELETE /api/flavors/:id: Returns nothing.
app.delete('/api/flavors/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM flavors WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Flavor not found' });
    }
    res.status(204).send(); 
  });
});

// PUT /api/flavors/:id: Has the updated flavor as the payload, and returns the updated flavor.
app.put('/api/flavors/:id', (req, res) => {
  const id = req.params.id;
  const { name, is_favorite } = req.body;

  if (!name || typeof is_favorite === 'undefined') {
    return res.status(400).json({ error: 'Name and is_favorite are required' });
  }

  db.run(
    'UPDATE flavors SET name = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, is_favorite, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Flavor not found' });
      }
      db.get('SELECT * FROM flavors WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// Have the express server listen.
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});