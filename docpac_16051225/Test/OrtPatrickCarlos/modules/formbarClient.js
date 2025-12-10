// Minimal Formbar client stub. Replace with real HTTP requests in production.
async function exchangeCodeForUser(code) {
  // In a real implementation you would POST to the token endpoint and
  // request user info. Here we return a mocked user based on the code.
  return {
    id: `formbar_${code}`,
    username: `formbar_user_${code}`,
    email: `user_${code}@example.com`
  };
}

module.exports = { exchangeCodeForUser };
