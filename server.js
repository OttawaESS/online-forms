import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// API routes
const apiRoutes = [
  'submit',
  'submit-equipment',
  'admin',
  'login',
  'logout',
  'pdf',
  'bookings'
];

apiRoutes.forEach(route => {
  app.all(`/api/${route}`, async (req, res) => {
    try {
      const module = await import(`./api/${route}.js`);
      if (module.default) {
        await module.default(req, res);
      } else {
        res.status(404).send('API route not found');
      }
    } catch (error) {
      console.error(`Error in /api/${route}:`, error);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});