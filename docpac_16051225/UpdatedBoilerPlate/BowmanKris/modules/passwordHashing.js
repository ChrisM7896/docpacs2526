//import required modules
const bcrypt = require('bcrypt');

const salt = bcrypt.genSaltSync(10);

function passwordHashing(password) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}

module.exports = passwordHashing;