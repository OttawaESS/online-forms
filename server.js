import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const routeModulePaths = new Map([
  ['/admin', './api/admin.js'],
  ['/api/admin', './api/admin.js'],
  ['/api/bookings', './api/bookings.js'],
  ['/api/equipment-availability', './api/equipment-availability.js'],
  ['/api/login', './api/login.js'],
  ['/api/logout', './api/logout.js'],
  ['/api/payments', './api/payments.js'],
  ['/api/pdf', './api/pdf.js'],
  ['/api/submit', './api/submit.js'],
  ['/api/submit-equipment', './api/submit-equipment.js'],
  ['/login', './api/login.js'],
  ['/logout', './api/logout.js'],
]);

const loadedHandlers = new Map();

async function getHandler(modulePath) {
  if (!loadedHandlers.has(modulePath)) {
    const mod = await import(modulePath);
    loadedHandlers.set(modulePath, mod.default);
  }

  return loadedHandlers.get(modulePath);
}

async function registerApiRoute(routePath, modulePath) {
  app.all(routePath, async (req, res, next) => {
    try {
      const handler = await getHandler(modulePath);
      if (typeof handler !== 'function') {
        res.statusCode = 500;
        return res.end(`Route handler not found for ${routePath}`);
      }

      return handler(req, res);
    } catch (error) {
      return next(error);
    }
  });
}

async function start() {
  for (const [routePath, modulePath] of routeModulePaths.entries()) {
    await registerApiRoute(routePath, modulePath);
  }

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }

    res.statusCode = 500;
    res.end('Internal Server Error');
  });

  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start local server:', error);
  process.exit(1);
});