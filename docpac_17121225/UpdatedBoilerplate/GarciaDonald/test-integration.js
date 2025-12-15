console.log('🧪 Testing module integration...');

try {
    console.log('📦 Loading Utilities...');
    const Utilities = require('./shared/utilities');
    console.log('✅ Utilities loaded');

    console.log('📦 Loading UserLayout...');
    const UserLayout = require('./modules/userLayout');
    const userLayout = new UserLayout(console);
    console.log('✅ UserLayout loaded');

    console.log('📦 Loading InstanceManager...');
    const InstanceManager = require('./modules/instanceManager');
    const instanceManager = new InstanceManager(console);
    console.log('✅ InstanceManager loaded');

    console.log('📦 Loading FormbarClient...');
    const FormbarClient = require('./modules/formbarClient');
    const formbarClient = new FormbarClient(process.env.API_KEY || 'test-key', 'http://formbeta.yorktechapps.com/api', console);
    console.log('✅ FormbarClient loaded');

    console.log('🎉 All modules loaded successfully!');
    
    // Quick functionality test
    console.log('\n🔧 Testing basic functionality...');
    console.log('Room ID:', Utilities.generateRoomId());
    console.log('Sanitized string:', Utilities.sanitizeString('<script>alert("test")</script>'));
    
    const testUser = userLayout.formatUserForTemplate({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
    });
    console.log('Formatted user:', testUser.displayName);
    
    const room = instanceManager.createRoom('test-room-123');
    console.log('Created room:', room.name);
    
    const addResult = instanceManager.addUserToRoom('user123', 'test-room-123', {
        username: 'testuser'
    });
    console.log('Added user to room:', addResult.success);
    
    // Test FormbarClient (without making actual API calls)
    console.log('FormbarClient base URL:', formbarClient.baseUrl);
    console.log('FormbarClient has API key:', !!formbarClient.apiKey);
    
    console.log('✅ Basic functionality tests passed!');
    
} catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}