// ============================================================
// LAZY ROUTES LOADER - Passenger-safe
// ============================================================
// This function is called ONLY when first API request arrives
// Routes are loaded INSIDE the request handler (lazy)
// NO Prisma, NO database connections at module load time

module.exports = (app) => {
  // All routes loaded here - inside function (lazy)
  // This function is called from server.js middleware when first /api request arrives
  
  app.use('/api/auth', require('./authRoutes'));
  app.use('/api', require('./userRoutes'));
  app.use('/api', require('./settingsRoutes'));
  app.use('/api', require('./statsRoutes'));
  app.use('/api', require('./activityRoutes'));
  app.use('/api', require('./bookRoutes'));
  app.use('/api', require('./treeRoutes'));
  app.use('/api', require('./personRoutes'));
  app.use('/api', require('./searchRoutes'));
  app.use('/api', require('./contactRoutes'));
  app.use('/api', require('./healthRoutes'));
  app.use('/api', require('./roleRoutes'));
  app.use('/api', require('./galleryRoutes'));
  app.use('/api', require('./newsletterRoutes'));
  app.use('/api', require('./diagnosticsRoutes'));
  
  console.log('✅ API routes loaded (lazy)');
};
