module.exports = function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();

  // If this is an API request (starts with /api or accepts json), return 401
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Otherwise redirect to login page
  return res.redirect('/login');
};
