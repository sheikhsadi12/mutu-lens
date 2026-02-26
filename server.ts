import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('mutulens.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS extractions (
    id TEXT PRIMARY KEY,
    image_data TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    latency INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/extractions', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM extractions ORDER BY created_at DESC');
      const extractions = stmt.all();
      res.json(extractions);
    } catch (error) {
      console.error('Error fetching extractions:', error);
      res.status(500).json({ error: 'Failed to fetch extractions' });
    }
  });

  app.post('/api/extractions', (req, res) => {
    try {
      const { id, image_data, extracted_text, latency } = req.body;
      const stmt = db.prepare('INSERT INTO extractions (id, image_data, extracted_text, latency) VALUES (?, ?, ?, ?)');
      stmt.run(id, image_data, extracted_text, latency);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error saving extraction:', error);
      res.status(500).json({ error: 'Failed to save extraction' });
    }
  });

  app.delete('/api/extractions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('DELETE FROM extractions WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting extraction:', error);
      res.status(500).json({ error: 'Failed to delete extraction' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
