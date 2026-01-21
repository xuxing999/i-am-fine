// Vercel serverless function entry point
// This file will be used by Vercel to handle all requests
const { createApp } = require('../dist/app.cjs');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
};
