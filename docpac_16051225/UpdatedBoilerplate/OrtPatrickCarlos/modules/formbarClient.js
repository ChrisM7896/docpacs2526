const logger = require('logger');
const FORMBAR_CLIENT_SECRET = process.env.FORMBAR_CLIENT_SECRET;
const FORMBAR_REDIRECT_URI = process.env.FORMBAR_REDIRECT_URI;

class FormbarClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || process.env.FORMBAR_BASE_URL || 'https://api.formbar.com';
        this.clientSecret = options.clientSecret || process.env.FORMBAR_CLIENT_SECRET;
        this.logger = require('./logger');
        
        if (!this.clientSecret) {
            throw new Error('Formbar client secret is required');
        }
    }
    
    // Private method for all requests
    async _request(endpoint, options = {}) {
        
        // Your HTTP logic here
    }
    
    // Public API methods
    async getUser(userId) { return await this._request(`/users/${userId}`); }
    async getClass(classId) { return await this._request(`/classes/${classId}`); }
}

// Export a default instance AND the class
const defaultClient = new FormbarClient();

module.exports = {
    FormbarClient,
    default: defaultClient,
    // Convenience exports
    getUser: (userId) => defaultClient.getUser(userId),
    getClass: (classId) => defaultClient.getClass(classId)
};
