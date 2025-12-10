const crypto = require('crypto');

function sanitizeString(str) {
  if (!str) return '';
  return String(str).replace(/[<>"'`]/g, '');
}

function genRoomId(prefix = 'room') {
  return prefix + '_' + crypto.randomBytes(4).toString('hex');
}

module.exports = { sanitizeString, genRoomId };
