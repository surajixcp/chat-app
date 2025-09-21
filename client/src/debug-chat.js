// Comprehensive debugging script for chat application
// Run this in the browser console when the app is running

// Test authentication state
const testAuthState = () => {
    console.log('=== AUTHENTICATION STATE ===');
    console.log('Token in localStorage:', localStorage.getItem('token'));
    console.log('Auth user:', window.authUser);
    console.log('Is loading:', window.isLoading);
};

// Test socket connection
const testSocketConnection = () => {
    console.log('=== SOCKET CONNECTION ===');
    if (window.socket) {
        console.log('Socket found:', window.socket);
        console.log('Socket connected:', window.socket.connected);
        console.log('Socket ID:', window.socket.id);
        console.log('Socket userId:', window.socket.auth?.userId);
    } else {
        console.log('Socket not found on window object');
    }
};

// Test online users
const testOnlineUsers = () => {
    console.log('=== ONLINE USERS ===');
    console.log('Online users array:', window.onlineUsers);
    console.log('Current user ID:', window.authUser?._id);
    console.log('Is current user in online users:', window.onlineUsers?.includes(window.authUser?._id));
};

// Test API endpoints
const testAPIEndpoints = async () => {
    console.log('=== API ENDPOINTS ===');
    const token = localStorage.getItem('token');

    if (!token) {
        console.log('No token found, user not authenticated');
        return;
    }

    try {
        // Test auth check
        const authResponse = await fetch('http://localhost:5000/api/auth/check', {
            headers: {
                'token': token
            }
        });
        const authData = await authResponse.json();
        console.log('Auth check response:', authData);

        // Test users endpoint
        const usersResponse = await fetch('http://localhost:5000/api/messages/users', {
            headers: {
                'token': token
            }
        });
        const usersData = await usersResponse.json();
        console.log('Users response:', usersData);

    } catch (error) {
        console.error('API test error:', error);
    }
};

// Test message sending
const testMessageSending = async (messageText = 'Test message from debug script') => {
    console.log('=== MESSAGE SENDING ===');
    console.log('Testing message sending...');

    const chatInput = document.querySelector('input[placeholder="Send a message"]');
    if (chatInput) {
        chatInput.value = messageText;
        chatInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        console.log('Test message sent:', messageText);
    } else {
        console.log('Chat input not found');
    }
};

// Test user selection
const testUserSelection = () => {
    console.log('=== USER SELECTION ===');
    console.log('Testing user selection...');
    const userElements = document.querySelectorAll('[data-testid="user-item"], .cursor-pointer');
    console.log('Found user elements:', userElements.length);
    if (userElements.length > 0) {
        userElements[0].click();
        console.log('Clicked first user');
    }
};

// Test page routing
const testPageRouting = () => {
    console.log('=== PAGE ROUTING ===');
    console.log('Current path:', window.location.pathname);
    console.log('Should redirect to login if not authenticated');
};

// Run all tests
const runAllTests = async () => {
    console.log('=== RUNNING ALL CHAT TESTS ===');
    testAuthState();
    testSocketConnection();
    testOnlineUsers();
    await testAPIEndpoints();
    testPageRouting();
    console.log('=== TESTS COMPLETED ===');
};

// Make functions available globally
window.testAuthState = testAuthState;
window.testSocketConnection = testSocketConnection;
window.testOnlineUsers = testOnlineUsers;
window.testAPIEndpoints = testAPIEndpoints;
window.testMessageSending = testMessageSending;
window.testUserSelection = testUserSelection;
window.testPageRouting = testPageRouting;
window.runAllTests = runAllTests;

console.log('Chat debug functions loaded. Run runAllTests() to test everything.');
console.log('Available functions:');
console.log('- testAuthState()');
console.log('- testSocketConnection()');
console.log('- testOnlineUsers()');
console.log('- testAPIEndpoints()');
console.log('- testMessageSending()');
console.log('- testUserSelection()');
console.log('- testPageRouting()');
console.log('- runAllTests()');
