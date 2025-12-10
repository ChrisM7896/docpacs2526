module.exports = function socketAuth(socket, next) {
  const session = socket.request && socket.request.session;
  if (session && session.user) return next();
  const err = new Error('Unauthorized');
  err.data = { message: 'User not authenticated' };
  return next(err);
};
