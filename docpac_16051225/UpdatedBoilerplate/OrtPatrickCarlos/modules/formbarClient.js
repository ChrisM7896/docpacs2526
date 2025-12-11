const logger = require('logger');
const FORMBAR_CLIENT_SECRET = process.env.FORMBAR_CLIENT_SECRET;
const FORMBAR_REDIRECT_URI = process.env.FORMBAR_REDIRECT_URI;

class FormbarClient {
    constructor(options = {}) {
        this.baseUrl = process.env.FORMBAR_REDIRECT_URI || 'https://api.formbar.com';
        this.clientSecret = process.env.FORMBAR_CLIENT_SECRET;
        this.logger = require('./logger');
        
        if (!this.clientSecret) {
            throw new Error('Formbar client secret is required');
        }
    }
    
    // Private method for all requests
    async _request(endpoint, options = {}) {
        try {
            // 1. Build the full URL
            const url = `${this.baseUrl}${endpoint}`;
            
            // 2. Set up default headers
            const defaultHeaders = {
                'Content-Type': 'application/json',
                // TODO: Verify the correct auth header format for Formbar
                'Authorization': `Bearer ${this.clientSecret}`, // or 'X-API-Key'?
            };
            
            // 3. Merge options with defaults
            const fetchOptions = {
                method: 'GET', // default method
                headers: { ...defaultHeaders, ...options.headers },
                ...options
            };
            
            // 4. Log the request (for debugging)
            this.logger.info(`Making Formbar API request: ${fetchOptions.method} ${url}`);
            
            // 5. Make the HTTP request
            const response = await fetch(url, fetchOptions);
            
            // 6. Handle HTTP errors
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Formbar API error: ${response.status} - ${errorText}`);
                throw new Error(`Formbar API request failed: ${response.status} ${response.statusText}`);
            }
            
            // 7. Parse and return JSON response
            const data = await response.json();
            this.logger.info(`Formbar API request successful: ${endpoint}`);
            return data;
            
        } catch (error) {
            // 8. Log and re-throw errors
            this.logger.error(`Formbar API request failed: ${error.message}`);
            throw error;
        }
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
