// Simple in-memory instance/room manager for demo purposes
const instances = new Map();

function createRoom(roomId) {
  if (!instances.has(roomId)) instances.set(roomId, { players: new Set(), createdAt: Date.now() });
  return instances.get(roomId);
}

function addUserToRoom(roomId, userId) {
  const room = createRoom(roomId);
  room.players.add(userId);
}

function removeUserFromRoom(roomId, userId) {
  const room = instances.get(roomId);
  if (!room) return;
  room.players.delete(userId);
  if (room.players.size === 0) instances.delete(roomId);
}

function getRoom(roomId) {
  return instances.get(roomId) || null;
}

module.exports = { createRoom, addUserToRoom, removeUserFromRoom, getRoom };
