import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import type { ViteDevServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import wrisHandler from './api/wris.js';
// @ts-ignore
import bhuvanHandler from './api/bhuvan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint for instant platform readiness checks
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount unified India WRIS multi-dataset proxy (same logic as Vercel)
  app.all('/api/wris', wrisHandler);
  // Mount ISRO Bhuvan API gateway & connection test endpoint
  app.all('/api/bhuvan', bhuvanHandler);

  let viteServer: ViteDevServer | null = null;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    if (viteServer) {
      viteServer.close();
    }
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
