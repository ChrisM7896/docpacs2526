function getLayoutData(user, pageTitle = '') {
  const loggedIn = !!user;
  return {
    user: user ? { id: user.id, username: user.username } : null,
    loggedIn,
    pageTitle,
    nav: loggedIn ? [{ href: '/profile', text: 'Profile' }, { href: '/logout', text: 'Logout' }] : [{ href: '/login', text: 'Login' }]
  };
}

module.exports = { getLayoutData };
