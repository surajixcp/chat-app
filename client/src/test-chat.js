// Test script to debug chat functionality
// Run this in the browser console when the app is running

// Test socket connection
const testSocketConnection = () => {
    console.log('Testing socket connection...');
    if (window.socket) {
        console.log('Socket found:', window.socket);
        console.log('Socket connected:', window.socket.connected);
        console.log('Socket ID:', window.socket.id);
    } else {
        console.log('Socket not found on window object');
    }
};

// Test message sending
const testMessageSending = (messageText = 'Test message') => {
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
    console.log('Testing user selection...');
    const userElements = document.querySelectorAll('[data-testid="user-item"]');
    console.log('Found user elements:', userElements.length);
    if (userElements.length > 0) {
        userElements[0].click();
        console.log('Clicked first user');
    }
};

// Run all tests
const runChatTests = () => {
    console.log('=== Running Chat Tests ===');
    testSocketConnection();
    setTimeout(() => {
        testUserSelection();
        setTimeout(() => {
            testMessageSending();
        }, 1000);
    }, 1000);
};

// Make functions available globally
window.testSocketConnection = testSocketConnection;
window.testMessageSending = testMessageSending;
window.testUserSelection = testUserSelection;
window.runChatTests = runChatTests;

console.log('Chat test functions loaded. Run runChatTests() to test the chat functionality.');
