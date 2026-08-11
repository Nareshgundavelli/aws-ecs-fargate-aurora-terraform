// CloudMart - API routes barrel
// Aggregates all route modules for the Express app.

const healthRouter = require('./health');
const productsRouter = require('./products');
const categoriesRouter = require('./categories');
const ordersRouter = require('./orders');
const uploadRouter = require('./upload');

module.exports = (app) => {
  app.use('/health', healthRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/upload', uploadRouter);
};
