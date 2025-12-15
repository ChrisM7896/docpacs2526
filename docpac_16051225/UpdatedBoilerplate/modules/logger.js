fs = require('fs');
function logIt(time, message, level) {
    const logTime = time || new Date().toISOString();
    const logMessage = message || 'No message provided';
    const logLevel = level || 'INFO';
    fs.appendFileSync('server.log', `[${logTime}] [${logLevel}] ${logMessage}\n`);
    console.log(`[${logTime}] [${logLevel}] ${logMessage}`);
}

exports.logIt = logIt;