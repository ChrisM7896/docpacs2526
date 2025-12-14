// user and password authentication for native login
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
function authenticateUser(username, password, callback) {
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return callback(err);
        }
        if (row) {
            return callback(null, row);
        } else {
            return callback(null, null);
        }
    });
}
module.exports = {
    authenticateUser
};
