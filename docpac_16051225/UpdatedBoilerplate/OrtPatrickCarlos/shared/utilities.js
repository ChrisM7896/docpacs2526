const express = require('express');
const router = express.Router();
const logger = require('../modules/logger');
const path = require('path');
const fs = require('fs');

// Utility function to read JSON files
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading JSON file at ${filePath}: ${error.message}`);
        return null;
    }
}
// Utility function to write JSON files
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(data, null, 2), 'utf-8');
        logger.info(`Successfully wrote to JSON file at ${filePath}`);
    } catch (error) {
        logger.error(`Error writing JSON file at ${filePath}: ${error.message}`);
    }
}
// String sanitization utility
function sanitizeString(input) {
    return input.replace(/[<>&'"]/g, function (char) {
        const charMap = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charMap[char] || char;
    });
}
// Room ID or Token generator
function generateToken(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
// Validation Helper
function isValidPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Alphanumeric and underscores, 3-20 characters
    return usernameRegex.test(username);
}

module.exports = {
    readJSONFile,
    writeJSONFile,
    sanitizeString,
    generateToken,
    isValidPassword,
    isValidUsername
};