const querystring = require('querystring');
const formbarClient = require('../formbarClient');
const db = require('../db');

function buildAuthUrl() {
  const base = process.env.FORMBAR_AUTH_URL || 'https://formbeta.com/';
  const params = {
    response_type: 'code',
    client_id: process.env.FORMBAR_CLIENT_ID,
    redirect_uri: process.env.FORMBAR_REDIRECT_URI,
    scope: 'profile'
  };
  return `${base}?${querystring.stringify(params)}`;
}

async function handleCallback(code) {
  // Exchange code for user info via formbarClient (stubbed)
  const userInfo = await formbarClient.exchangeCodeForUser(code);
  // userInfo should include id and username/email
  if (!userInfo || !userInfo.id) throw new Error('Invalid formbar response');

  // Link or create local user
  let user = await db.getAsync('SELECT id, username, formbarId FROM users WHERE formbarId = ?', userInfo.id);
  if (!user) {
    const res = await db.runAsync('INSERT INTO users (username, formbarId) VALUES (?, ?)', userInfo.username || userInfo.email || `fb_${userInfo.id}`, userInfo.id);
    const id = res.lastID || null;
    user = { id, username: userInfo.username || userInfo.email };
  }
  return user;
}

module.exports = { buildAuthUrl, handleCallback };
