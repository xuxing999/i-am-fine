// Vercel serverless function entry point
// This file will be used by Vercel to handle all requests
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create require to import CommonJS modules
const require = createRequire(import.meta.url);
const { createApp } = require('../dist/app.cjs');

let app;

export default async (req, res) => {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
};
