// Main function - gets all layout data for a page
function getLayoutData(user, pageTitle = '') {
    return {
        user: formatUserForTemplate(user),
        isLoggedIn: isUserLoggedIn(user),
        displayName: getDisplayName(user),
        navigation: getNavigationLinks(user),
        pageTitle: pageTitle
    };
}

// Helper functions
function formatUserForTemplate(user) {
    // Convert user object for safe template use

}

function isUserLoggedIn(user) {
    // Handle null/undefined
    if (!user) {
        return false;
    }
    
    // Check if user has a valid ID
    if (!user.id || typeof user.id !== 'number') {
        return false;
    }
    
    return true;
}


function getDisplayName(user) {
    // Return formatted display name
}

function getNavigationLinks(user) {
    // Return array of nav links based on login status
}

module.exports = {
    getLayoutData,
    formatUserForTemplate,
    isUserLoggedIn,
    getDisplayName,
    getNavigationLinks
};
