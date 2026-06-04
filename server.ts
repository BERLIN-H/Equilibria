import 'dotenv/config';
import app from './backend/app';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Desarrollo: Vite como middleware (HMR activo)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Producción: sirve el build estático
    const distPath = path.join(process.cwd(), 'dist', 'public');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Equilibria corriendo en http://localhost:${PORT}`);
  });
}

startServer();
